import type { Catalog, Loader, Options, Directives, LoadError, LoadResult } from './types';
export type { Catalog, Loader, Options, Directives, LoadError, LoadResult }
import { CEError } from './types'
import { beginLoading, getLifecycle, hasFailed, markDefined, markFailed, markLoaded } from './lifecycle';

/** Helpers */
function isCustomElement(element: Element) {
  return element instanceof HTMLElement && element.tagName.includes("-");
}

function isModule(m: any): m is { default: any } {
  return m?.[Symbol.toStringTag] === "Module";
}

function debounceMutations(fn: (mutations: MutationRecord[], observer: MutationObserver) => void, delay = 300) {
  let timer: ReturnType<typeof setTimeout>;
  let accumulated: MutationRecord[] = [];

  return function (this: any, mutations: MutationRecord[], observer: MutationObserver) {
    accumulated.push(...mutations);
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.call(this, accumulated, observer);
      accumulated = [];
    }, delay);
  };
}

const isFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> => result.status === "fulfilled";
const isRejected = <T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult => result.status === "rejected";

/** Performance mark helper */
const measure = (type: string, name: string) => {
  const id = `${type}:${name}`, start = `${id}:start`, end = `${id}:end`;
  performance.mark(start);
  return {
    end: (opts?: any) => {
      performance.mark(end);
      return performance.measure(id, {
        start, end,
        detail: { type, name, ...opts }
      });
    }
  };
};


/**
 * "An element the registry has never painted."
 *
 * The per-*element* form of the question, and the only correct one. It used to be
 * `:not(:defined)`, which is a per-*tag* condition — see
 * `CERegistry.matchCustomElement` for what that cost.
 *
 * `getLifecycle(el) === null` and `:not([ce])` are the same question; the selector
 * form just lets the browser do the filtering.
 */
const UNHANDLED = ":not([ce])";

/**
 * CEAutoLoader manages loading web components in the page asynchronously.
 *
 * Every custom web component (aka `<c-name ></c-name>`) on a `document` is
 * consulted in the `catalog` and and loaded via `dynamic import(file)`.
 *
 * Every element it touches is painted with a `ce` attribute, walking one state
 * per step so a stylesheet can hook any of them:
 *
 * | `ce`        | meaning                                                        |
 * | ----------- | -------------------------------------------------------------- |
 * | `loading`   | the module is being fetched                                    |
 * | `loaded`    | the module is in memory, the element has not upgraded yet      |
 * | `defined`   | `customElements.define()` ran — the element is upgraded        |
 * | `error`     | loading or defining failed (terminal)                          |
 *
 * Once registered, the CustomElement generally style it's own DOM node.
 *
 * @usage
 *
 * ```jsx
 * let registry = new CEautoLoader({catalog: {
 *  "json-viewer": () => import ("https://esm.sh/@alenaksu/json-viewer")
 * });
 * ```
 *
 * - A catalog is an object of the format {"web-component-name": `https://url`}
 * - A ES Module CustomElement should be exported as default from the file. *
 * @usage
 *
 * ```js
* export default class hi-helloworld extends HTMLElement {
  connectedCallback() {
      this.render()
  }

  render() {
      this.innerHTML = `Hi, <span>Hello</span>`;
  }
}
  ```
 *
 */
class CEAutoLoader {
  options: Options;
  catalog: Catalog;

  // Mutation and Interaction Observers
  #observers: Record<string, MutationObserver | IntersectionObserver> = {};
  #initialized: boolean = false;

  // Active view transition
  activeTransition?: ViewTransition;

  // Elements with a load in flight, so a re-intersection cannot start a second
  // one. Keyed by the element itself: two elements that share a tag name are two
  // independent loads, and a tag-name key would block the second one.
  loading_locks = new Set<HTMLElement>()

  constructor(options: Options = { catalog: {} }) {
    this.options = {
      live: true,
      root: document.body,
      directives: ["eager", "visible", "click"],
      defaultDirective: "visible",
      deferDefine: false,
      transition: options.deferDefine && SUPPORTS_SCOPED_VT &&
        !window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,
      useImportMapsCatalog: false,
      devErrors: false,
      shadowObserver: 'auto',
      intersectionOptions: {
        rootMargin: "20%",
      },
      ...options,
    };

    // Use the page's import map
    const importMapScript = document.querySelector('script[type="importmap"]');
    const map = JSON.parse(importMapScript?.textContent || '{}') as ImportMap;
    const importMapCatalog = Object.fromEntries(
      Object.entries(map?.imports || {}).filter(([name, _target]) => name.includes('-'))
    ) as Catalog;

    this.catalog = this.options.useImportMapsCatalog
      ? { ...importMapCatalog, ...this.options.catalog }
      : { ...this.options.catalog };

    if (this.options.deferDefine) {
      this.polyfill_defer_define();
    } else if (this.options.transition) {
      throw new SyntaxError("CEAutoLoader: Transition option without `deferDefine: true` is not supported")
    } else {
      this.polyfill_safe_ce_define();
    }

    this.discover();
  }

  /**
   * Returns the MutationObserver constructor to use.
   *
   * Detects `shadow-observer` via `globalThis[Symbol.for('shadow-observer')]` — the
   * module sets this symbol on load, so importing it is the host app's choice.
   * When available, ShadowObserver extends MutationObserver to forward `observe`
   * into new programmatic shadow roots (open and closed).
   */
  private getMutationObserver(): typeof MutationObserver {
    if (this.options.shadowObserver === false) return MutationObserver;

    const ShadowObserverImpl = (globalThis as any)[Symbol.for('shadow-observer')];
    if (ShadowObserverImpl) return ShadowObserverImpl;

    if (this.options.shadowObserver === true) {
      console.warn("CEAutoLoader: shadowObserver is true but shadow-observer is not loaded. Falling back to native MutationObserver.");
    }
    return MutationObserver;
  }

  /**
   * Watch for new elements in the DOM
   */
  private watchDOMMutations() {
    const ObserverCtor = this.getMutationObserver();
    const observer = new ObserverCtor(debounceMutations(this.dom_watcher.bind(this), 100));

    observer.observe(this.options.root || document.body, {
      childList: true,
      subtree: true,
      shadow: 3,  // OPEN | CLOSED — forward into both open and closed shadow roots
    } as MutationObserverInit & { shadow: number });

    this.#observers["mutation"] = observer;

    return;
  }
  private async dom_watcher(mutations: MutationRecord[]) {
    for (const mutation of mutations.filter((m) => m.type === "childList")) {
      let target = mutation.target;

      // Skip mutations on elements that failed to load.
      // ShadowRoot is not an Element, so the instanceof check fails gracefully
      // and mutations from inside shadow roots are still processed.
      if (target instanceof Element && hasFailed(target)) {
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType != 1) {
          continue;
        }

        // Check the node itself
        // or any children that are custom elements
        if (node instanceof HTMLElement && (isCustomElement(node) || this.matchCustomElement(node).length > 0)) {
          await this.discover(node);
        }
      }
    }
  }

  /**
   * Clean up observers to avoid memory leak
   */
  clean() {
    Object.entries(this.#observers).map(([_, obs]) => obs.disconnect());

    this.#observers = {};

    // Stop taking part in the (global) deferred define queue
    const index = DEFERRED_REGISTRIES.indexOf(this);
    if (index > -1) DEFERRED_REGISTRIES.splice(index, 1);
  }

  /**
   * Preload those specific custom-elements, right now!
   */
  public async preload(components: string[]): Promise<void> {
    for (const comp_name of components) {
      const loader = this.getLoader(comp_name)
      const module = await this.loadModule(comp_name, loader);
      this.define({ name: comp_name, el: undefined, module: module })
    }
  }

  /**
 * Returns an filter fn that filter elements that has the matching loading=`directive` value
 */
  private filterByLoadingAttribute(directive?: Directives) {
    if (directive) {
      return (el) => (el.getAttribute("loading") === directive);
    } else {
      return (el) => (!el.hasAttribute("loading"));
    }
  }

  /**
  * Matches a component name to a wildcard resolver (if exists)
  * e.g. "nord-button" -> "nord-*"
  */
  private getWildcardResolver(name: string): Loader | null {
    const [prefix] = name.split("-");
    return this.catalog?.[`${prefix}-*`] ?? null;
  }

  /** Get the appropriate loader matching name */
  public getLoader(name: string): Loader {
    return this.catalog?.[name] || this.getWildcardResolver(name);
  }

  /** Load a module asynchronously */
  private async loadModule(name: string, loader: Loader) {
    let module = null
    if (typeof loader === "string") {
      module = await import(/* @vite-ignore */ loader);
    } else if (typeof loader === "function") {
      module = await loader(name, undefined);
    } else {
      throw new CEError(`Loader of ${name} is invalid! Should be a url or a function`, { name, module });
    }

    return module
  }


  /**
   * Discover custom-elements in the `root` and upgrade them lazily
   */
  public async discover(root = this.options.root) {
    if (!this.#initialized && this.options.live) {
      this.watchDOMMutations();
    }

    // Load elements that matches directives
    for (const directive of this.options.directives) {
      this.upgrade(root, directive);
    }

    // Load everyone else using the default directive
    const result = this.upgrade(root);

    this.#initialized = true;
    return result;
  }

  /**
   * Does the registry still owe this element a `ce` state?
   *
   * `ce` is the per-element "already handled" flag, and the only correct one
   * here. `customElements.get(tagName)` flips to true the moment *any* element
   * with that tag name is defined — so a sibling sharing the tag is dropped and
   * never painted at all, while the tag it shares sits defined and interactive.
   * (An IntersectionObserver hands over the batch in as many callbacks as it
   * likes, and `upgrade()` can be called again over a subtree, so a slow first
   * batch is all it takes.)
   *
   * This also covers `ce="error"`, which is terminal: a failed element is never
   * re-loaded, so a re-entry into the viewport cannot append a second fallback.
   *
   * A tag that is already defined but absent from the catalog is someone else's
   * registration, and is left alone.
   */
  private owesState(el: HTMLElement): boolean {
    if (getLifecycle(el) !== null) return false;
    if (!customElements.get(el.tagName.toLowerCase())) return true;

    return !!this.getLoader(el.tagName.toLowerCase());
  }

  /**
   * Every custom element under `root` — `root` included — that the registry still
   * owes a `ce` state to.
   *
   * This asks the same question as {@link owesState}, one element at a time. It
   * used to be a `:not(:defined)` selector, which is a per-*tag* condition: the
   * moment any element with that tag name was defined — by a sibling's load, by a
   * `deferDefine` batch, or by a third party — every other element sharing the tag
   * stopped matching, and a sibling the registry had never handled was skipped for
   * good. `:not([ce])` is the per-element form, and matches
   * `getLifecycle(el) === null` exactly.
   */
  private matchCustomElement(root: Element): HTMLElement[] {
    return [...new Set([root, ...root.querySelectorAll(UNHANDLED)])]
      .filter((el): el is HTMLElement => isCustomElement(el))
      .filter((el) => this.owesState(el));
  }

  /**
   * Upgrade all custom-elements that has the `loading=directive` attribute.
   *
   * @param directive - If no directive is passed, will upgrade elements that DOESNT have a loading attribute
   *
   * @see {@link loadAndDefine}
   */
  public upgrade(root: HTMLElement = this.options.root, directive?: Directives) {

    const when_visible: IntersectionObserverCallback = (entries, _observer) => {
      let html_elements = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => entry.target as HTMLElement)
        .filter((el) => this.owesState(el))
        .filter((el) => !this.loading_locks.has(el))

      if (html_elements.length > 0) {
        this.loadAndDefine(html_elements);
      }
    };

    const visible = (elements: HTMLElement[]) => {
      // Create observer if it doesn't exist
      if (!this.#observers["intersection"]) {
        this.#observers["intersection"] = new IntersectionObserver(when_visible, this.options.intersectionOptions);
      } else {
        // If the observer already exists, we need to check if there are any pending entries
        let mutations = this.#observers["intersection"].takeRecords() as IntersectionObserverEntry[];
        if (mutations.length > 0) {
          when_visible(mutations, this.#observers["intersection"] as IntersectionObserver);
        }
      }

      return elements.map((el) => {
        (this.#observers["intersection"] as IntersectionObserver).unobserve(el);
        this.#observers["intersection"].observe(el);
      });
    };

    const when_clicked = async (ev: PointerEvent) => {
      ev.stopImmediatePropagation();

      const target = ev.currentTarget as HTMLElement;
      await this.loadAndDefine([target]);
    }

    const interaction = (elements: HTMLElement[]) => {
      return elements.map((el) => el.addEventListener("click", when_clicked, { once: true }));
    };

    // Directives are special conditions when the component should be loaded
    const applyLoadingDirective = (elements: HTMLElement[], directive: Directives) => {
      if (directive === "visible") {
        return visible(elements);
      } else if (directive === "click") {
        return interaction(elements);
      } else if (directive === "manual" || directive === "eager") {
        this.loadAndDefine(elements);
        return elements;
      } else {
        console.error("Invalid directive for upgrade()", directive, ce_elements);
      }
    }

    const ce_elements = this.matchCustomElement(root);
    applyLoadingDirective(
      ce_elements.filter(this.filterByLoadingAttribute(directive)),
      directive || this.options.defaultDirective
    );
  }



  /**
   * Load and define components
   *
   */
  private async loadAndDefine(elements: HTMLElement[]) {
    // A failed element is terminal: never fetch it again, never report it twice.
    elements = elements.filter((el) => !hasFailed(el));

    if (elements.length === 0) {
      return [];
    }

    // 1. Load the appropriate modules
    const loaded = await Promise.allSettled(elements.map((e) => this.load(e)))

    // 2. handle load errors on per-case component basis
    loaded.filter(isRejected).map((r) => this.handleComponentLoadError(r));

    // 3. Then, define the components on a single frame
    const success = loaded.filter(isFulfilled).map((r) => r.value)

    const defined = this.options.transition
      ? await this.runScopedViewTransition(success, (r) => this.define(r))
      : await Promise.allSettled(success.map((r) => this.define(r)));

    // Defining can fail too (a loader that neither defined the tag nor returned a
    // constructor): report it on the element like a load failure.
    defined.filter(isRejected).map((r) => this.handleComponentLoadError(r));

    // Flush any component that was defined outside of autoloader bounds
    // or is already on the queue
    if (this.options.deferDefine) {
      requestIdleCallback ? requestIdleCallback(() => customElements.flush())
        : requestAnimationFrame(() => customElements.flush())
    }

    return []
  }


  /**
   * Load a single component
   */
  async load(el: HTMLElement): Promise<LoadResult> {
    const name = el.tagName.toLowerCase();

    let loader = this.getLoader(name);
    if (!loader) {
      throw new CEError(`${name} not found in catalog`, { name, el, module: null });
    }

    let module;
    // let before_imports = { ...customElements.waiting };
    let load_error = null;
    let perf = measure('load', name);

    try {
      this.loading_locks.add(el);
      // A failed element is terminal; `loadAndDefine` filters those out first.
      beginLoading(el);

      module = await this.loadModule(name, loader);

      // The module is in memory, the upgrade has not happened. With
      // `deferDefine` this is the window the queue holds open, and the last
      // moment at which the batch is known to be complete-but-unapplied.
      markLoaded(el);
    } catch (error: any) {
      load_error = error;
      throw new CEError(`${name} - ${error.message}`, { name, el, module, cause: error });
    } finally {
      this.loading_locks.delete(el);

      perf.end({ error: load_error });
    }

    return { name, module, loader, el };
  }

  /**
   * Define a single component
   */
  async define({ name, el, module }: LoadResult) {
    /**
     * The loader may return a `HTMLCustomElement`,
     * or it may define the element itself via customElements.define.
     */
    if (isModule(module)) {
      module = module.default;
    }

    let define_error = null;
    let perf = measure('define', name);

    try {
      if (customElements.get(name)) {
        // Already defined: either the module registered the tag itself, or another defined() first.
        const already_defined = customElements.get(name);

        // Someone else registered it previously, warn-it since it's also on the catalog.
        if (el && module && already_defined !== module) {
          this.options.hooks?.error?.({
            name, el,
            error: new CEError(`${name} - already defined by another constructor.`,
              { name, el, module, defined: already_defined },),
          });
        }

      } else if (this.options.deferDefine) {
        if (!customElements.queue[name]) {
          if (!module) throw new CEError(`${name} - the loader neither defined the element nor returned a constructor`, { name, el, module });
          else ORIGINAL_DEFINE(name, module, {})
        } else {
          customElements.dequeue(name);
        }
      } else {
        if (!module) {
          throw new CEError(`${name} - the loader neither defined the element nor returned a constructor`, { name, el, module });
        }
        customElements.define(name, module, {});
      }

      // `define()` is synchronous, so the element is upgraded before this line.
      // `defined` therefore lands on the frame the element upgraded, and stays:
      // nothing supersedes it, so a rule matching it keeps matching.
      markDefined(el);

    } catch (error: any) {
      define_error = error;
      if (error instanceof CEError) throw error;
      throw new CEError(`${name} - ${error.message}`, { name, el, module, error });
    } finally {
      perf.end({ error: define_error });
    }

    return { name, module, el };
  }

  /**
   * Handle components that failed to load
   */
  private handleComponentLoadError(rejection: PromiseRejectedResult) {
    const { message, stack, details } = rejection.reason || {};
    const origin = details?.el as HTMLElement;

    if (!origin) {
      return console.error("CEAutoLoader:", rejection.reason);
    }

    const name = origin.tagName.toLowerCase();
    const error: LoadError = { name: name, el: origin, error: rejection.reason, };

    if (this.options.hooks?.error) {
      this.options.hooks.error(error);
    }

    // A tag not in catalog was never ours to load, so it's not a failure:
    if (!this.getLoader(name) && !this.options.devErrors) return;
    if (hasFailed(origin)) return;

    markFailed(origin);
    if (this.options.fallback) {
      const fallback_instance = new this.options.fallback!();

      /** @ts-ignore */
      fallback_instance.error = message;
      /** @ts-ignore */
      fallback_instance.stack = stack;

      origin.appendChild(fallback_instance);
    }
  }

  /**
   * Perform a scoped element transition
   */
  private async runScopedViewTransition(components: LoadResult[], update_fn: (LoadResult) => Promise<any>) {
    components.map(({ el }) => {
      const transitionName = el.getAttribute("view-transition-name") || el.tagName;
      const transitionClass = el.getAttribute("view-transition-class") || 'ce';

      if (transitionName) el.style.viewTransitionName = transitionName;
      if (transitionClass) el.style.viewTransitionClass = transitionClass;
    });

    return await Promise.allSettled(
      components.map(async ({ el, name, module }) => {
        const transition = el.parentElement.startViewTransition({
          types: ['ce'],
          update: async () => {
            await update_fn({ el, name, module })
          }
        });

        this.activeTransition = transition;

        const when_ready = this.options.hooks?.viewTransition?.ready;
        // The browser skips a transition when another one is already running on
        // the element, which rejects `ready`: it must never become an unhandled
        // rejection (and the hook is only for transitions that really started).
        transition.ready.then(
          () => {
            if (when_ready) when_ready(transition);
          },
          () => { },
        );

        // Cleanup is attached *before* awaiting anything that can reject: a
        // failing update rejects both `updateCallbackDone` and `finished`, so the
        // styles must be cleared (and `finished` never left as an unhandled
        // rejection) even though the await below will throw.
        transition.finished.then(
          () => {
            el.style.viewTransitionName = ""
            el.style.viewTransitionClass = ""

            this.options.hooks?.viewTransition?.finished(transition)
            this.activeTransition = null;
          },
          () => {
            el.style.viewTransitionName = ""
            el.style.viewTransitionClass = ""
            this.activeTransition = null;
          },
        )

        await transition.updateCallbackDone;
      })
    );
  }


  /***************************
   * Polyfills
   **************************/


  /**
   * Polyfill `customElements.define` to defer component definition.
   *
   * > Only elements that belong to this `catalog` are deferred: they are defined
   * > later by `customElements.dequeue(name)` or `customElements.flush()`, so a
   * > whole batch can land on the same frame — inside a single view transition.
   *
   * > Anything else is forwarded to the original `define` right away. Third-party
   * > scripts (or a catalog module registering extra tags) must keep working while
   * > the queue is installed: queueing them would leave those elements defined
   * > nowhere — never upgraded, `customElements.get()` `undefined` and
   * > `customElements.whenDefined()` never settling.
   *
   * Call {@link customElements.flush} or {@link customElements.dequeue} to finally define.
   */
  public polyfill_defer_define() {
    if (!DEFERRED_REGISTRIES.includes(this)) {
      DEFERRED_REGISTRIES.push(this);
    }

    if (customElements.dequeue) return;

    const define = ORIGINAL_DEFINE;

    customElements.queue = {};
    customElements.dequeue = function (name) {
      if (customElements.get(name)) return

      const queued = customElements.queue[name];
      if (!queued) return;

      define(name, queued.ctor, queued.options);
      delete customElements.queue[name];
    }
    customElements.flush = function () {
      Object.keys(customElements.queue).map(customElements.dequeue)
    }
    customElements.define = function (name, ctor, options?) {
      // Not managed by ce-autoloader, don't queue it!
      if (!DEFERRED_REGISTRIES.some((registry) => registry.getLoader(name))) {
        return define(name, ctor, options);
      }

      customElements.queue[name] = { "ctor": ctor, "options": options };
    }

  }

  /** make customElements.define() idempotent) */
  public polyfill_safe_ce_define() {
    const define = ORIGINAL_DEFINE;
    customElements.define = function (name, ctor, options?) {
      if (customElements.get(name)) return;

      define(name, ctor, options);
    }
  }
}

/** Required globals for polyfill and transition */
const SUPPORTS_SCOPED_VT = "startViewTransition" in Element.prototype;
var ORIGINAL_DEFINE: typeof customElements.define = (ORIGINAL_DEFINE || customElements.define.bind(customElements))

/**
 * Multiple registries can co-exist on the same page.
*/
const DEFERRED_REGISTRIES: CEAutoLoader[] = [];


/** CDN IMPORT OPTIONS */
if (new URL(import.meta.url).searchParams.has('autoload')) {
  /** @ts-ignore */
  window.registry = new CEAutoLoader({ useImportMapsCatalog: true });
}

export default CEAutoLoader;
