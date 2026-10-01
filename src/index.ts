/**
 * A Loader can be a URL or any function that returns a `Promise<CustomElementConstructor>`
 */
export type Loader = string | ((name: string, el?: HTMLElement) => Promise<CustomElementConstructor>);

/**
 * A catalog maps between tag names and a custom element.
 */
export type Catalog = Record<string, Loader>;

export type LoadResult = {
  name: string;
  el?: HTMLElement;
  loader?: Loader;
  module?: CustomElementConstructor;
};

export type LoadError = {
  name: string;
  el: HTMLElement;
  error: CEError;
};

export type Directives = "eager" | "visible" | "click" | "manual";
export type Options = {
  /* The component catalog */
  catalog?: Catalog;
  /* The root element to search for custom elements */
  root?: HTMLElement;
  /** Watch for new custom elements in the page? */
  live?: boolean;

  /** Use the page import-map as a catalog */
  useImportMapsCatalog?: boolean;

  /** Fallback for components with errors */
  fallback?: CustomElementConstructor;

  /**
   * Report a failure on the element itself: `ce="error"`, the `error` / `stack`
   * attributes and the `fallback` element.
   *
   * On by default — a component of ours that fails to load or define should be
   * visible on the page. Set it to `false` to keep production markup clean. A tag
   * that is *not* in the catalog is never painted either way: the loader never owned
   * it and a third party may define it later. `hooks.error` is called in all cases.
   */
  devErrors?: boolean;

  /** Directives are triggers to when the component should be loaded */
  directives?: Directives[];
  /** Overwrite the default directive */
  defaultDirective?: Directives;

  /** Intersection Observer customization */
  intersectionOptions?: IntersectionObserverInit;

  /** Use View Transitions API to animate the component upgrade */
  transition?: boolean;

  /**
   * Polyfill customElements.define to support deferring until later
   *
   * Defaults to `true` whenever transitions are enabled and supported.
   */
  deferDefine?: boolean;

  /** Lifecycle hooks of each component */
  hooks?: {
    viewTransition: {
      ready?: (transition: ViewTransition) => Promise<void>;
      finished?: (transition: ViewTransition) => Promise<void>;
    };
    error?: (error: LoadError) => Promise<void>;
  };
};

/**
 * Error thrown by CEAutoLoader
 */
class CEError extends Error {
  details: any;

  constructor(message: string, details: any) {
    super(`CEAutoLoader: ${message}`);
    this.details = details;
  }
}

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

/**
 * CSS selector to match custom elements
 */
function matchCustomElement(root: Element) {
  const selector = ":not(:defined)";
  return [...new Set([root, ...root.querySelectorAll(selector)])]
    .filter((el) => isCustomElement(el)) as HTMLElement[];
}

const isFulfilled = <T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> => result.status === "fulfilled";
const isRejected = <T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult => result.status === "rejected";

const SUPPORTS_SCOPED_VT = "startViewTransition" in Element.prototype;

var ORIGINAL_DEFINE: typeof customElements.define = (ORIGINAL_DEFINE || customElements.define.bind(customElements))

/**
 * Multiple registries can co-exist on the same page.
 * Since the polyfill is global, it's necessary to consult all registries.
 */
const DEFERRED_REGISTRIES: CEAutoLoader[] = [];

/**
 * CEAutoLoader automatically loads and defines custom elements from a catalog.
 */
class CEAutoLoader {
  options: Options;
  catalog: Catalog;

  // Resolvers matched against tags at runtime.
  _resolvers: Record<string, Loader> = {};

  // Mutation and Interaction Observers
  #observers: Record<string, MutationObserver | IntersectionObserver> = {};
  #initialized: boolean = false;

  // Active view transition
  activeTransition?: ViewTransition;

  // Lock components while loading to avoid retriggers
  loading_locks: Record<string, HTMLElement> = {}

  // Components that failed to load: the watcher skips them, so a failure is
  // reported once instead of on every mutation.
  #errors: Record<string, LoadError> = {};

  constructor(options: Options = { catalog: {} }) {
    this.options = {
      live: true,
      root: document.body,
      directives: ["eager", "visible", "click"],
      defaultDirective: "visible",
      transition: SUPPORTS_SCOPED_VT &&
        !window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,
      useImportMapsCatalog: false,
      devErrors: true,
      intersectionOptions: {
        scrollMargin: "20%",
      },
      ...options,
    };

    if (!this.options.catalog) {
      const importMapScript = document.querySelector('script[type="importmap"]');
      const map = JSON.parse(importMapScript?.textContent || '{}');

      if (Object.keys(map.imports).length == 0) {
        throw new Error("CEAutoloader: Catalog is empty, please fill the importmap or pass the catalog option.");
      }

      this.catalog = map.imports;
    } else {
      this.catalog = options.catalog;
    }

    if (this.options.transition && SUPPORTS_SCOPED_VT) {
      // `deferDefine: false` opts out of patching the global registry entirely.
      if (this.options.deferDefine !== false) this.polyfill_defer_define();
    } else {
      this.options.transition = false;
    }

    this.discover();
  }

  private async getMutationObserver() {
    try {
      return (await import('shadow-observer')).ShadowObserver;
    } catch (error) {
      return Promise.resolve(MutationObserver);
    } finally {
      return Promise.resolve(MutationObserver);
    }
  }

  /**
   * Watch for new elements in the DOM
   */
  private async watchDOMMutations() {
    let _MutationObserver = await this.getMutationObserver();
    const observer = new _MutationObserver(debounceMutations(this.watcher.bind(this), 100));

    observer.observe(this.options.root || document.body, {
      childList: true,
      subtree: true,
      shadow: 1
    });

    this.#observers["mutation"] = observer;

    return;
  }
  private async watcher(mutations: MutationRecord[]) {
    for (const mutation of mutations.filter((m) => m.type === "childList")) {
      // Ignore mutations on elements that failed to load
      const target = mutation.target;
      if (target instanceof ShadowRoot) {
        continue;
      }

      const name = (target as HTMLElement).tagName.toLowerCase();
      if (this.#errors[name]) {
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (node.nodeType != 1) {
          continue;
        }

        // Check the node itself
        // or any children that are custom elements
        if (node instanceof HTMLElement && (isCustomElement(node) || matchCustomElement(node as Element).length > 0)) {
          await this.discover(node);
        }
      }
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
  async preload(components: string[]): Promise<void> {
    for (const comp_name of components) {
      const loader = this.getLoader(comp_name)
      const module = await this.loadModule(comp_name, loader);
      this.define({ name: comp_name, el: undefined, module: module })
    }
  }

  /**
   * Discover the custom elements in the `root` and upgrade them lazily
   */
  async discover(root = this.options.root) {
    if (!this.#initialized && this.options.live) {
      await this.watchDOMMutations();
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
   * Upgrade all custom elements that has the loading=`directive`.
   *
   * @param directive - the behaviour of the loading, when the loading should happen.
   * If no directive is null, will upgrade all elements that doesnt have a loading attribute
   *
   * Or call directly `loadAndDefine([HTMLElement1, HTMLElement2])
   */
  upgrade(root: HTMLElement = this.options.root, directive?: Directives) {

    const when_visible: IntersectionObserverCallback = (entries, _observer) => {
      let html_elements = entries
        .filter((entry) => entry.isIntersecting)
        .filter((entry) => !customElements.get(entry.target.tagName.toLowerCase()))
        .map((entry) => entry.target as HTMLElement)
        .filter((el) => !this.loading_locks[el.tagName]);

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

    const ce_elements = matchCustomElement(root);
    applyLoadingDirective(
      ce_elements.filter(this.filterByLoadingAttribute(directive)),
      directive || this.options.defaultDirective
    );
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

    const error: LoadError = {
      name: name,
      el: origin,
      error: rejection.reason,
    };

    this.#errors[name] = error;

    // Before anything touches the DOM: with `devErrors` off the hook is the only
    // signal a failure produces.
    if (this.options.hooks?.error) {
      this.options.hooks.error(error);
    }

    // A tag with no catalog entry was never ours to load, so this is not a failure:
    // it may be defined later by a third party, and painting it as an error would be
    // wrong. Leaving it `:not(:defined)` is the honest state.
    if (!this.getLoader(name)) return;

    // Nothing is painted, but the load is over: drop the `loading` state this failure
    // set (a failing `define()` leaves a `defined` behind for the same reason), so the
    // element is a plain `:not(:defined)` placeholder again.
    if (!this.options.devErrors) {
      origin.removeAttribute("ce");
      return;
    }

    origin.setAttribute("ce", "error");
    origin.setAttribute("error", message);
    origin.setAttribute("stack", stack);

    if (this.options.fallback) {
      // Instantiate and append fallback instead of defining the tag
      const fallback_instance = new this.options.fallback!();
      fallback_instance.setAttribute("error", message);
      fallback_instance.setAttribute("stack", stack);

      origin.innerHTML = "";
      origin.appendChild(fallback_instance);
    }
  }

  /**
   * Perform a view transition of `components`
   */
  // private async runViewTransition(components: LoadResult[], defineFunction: () => Promise<void>) {
  //   const elements = components.map(({ el }) => {
  //     const transitionName = el.getAttribute("view-transition-name") || el.tagName;
  //     const transitionClass = el.getAttribute("view-transition-class") || 'ce';

  //     if (transitionName) {
  //       el.style.viewTransitionName = transitionName;
  //     }
  //     if (transitionClass) {
  //       el.style.viewTransitionClass = transitionClass;
  //     }

  //     return el;
  //   });

  //   if (this.activeTransition) {
  //     await this.activeTransition.finished;
  //   }

  //   this.activeTransition = document.startViewTransition({ types: ['ce'], update: async () => await defineFunction() });
  //   if (this.options.hooks?.viewTransition?.ready) {
  //     this.activeTransition.ready.then(() => this.options.hooks.viewTransition.ready(this.activeTransition));
  //   }

  //   await this.activeTransition.updateCallbackDone;

  //   this.activeTransition.finished.then(() => {
  //     elements.map((el) => {
  //       el.style.viewTransitionName = "";
  //       el.style.viewTransitionClass = "";
  //     });
  //     this.options.hooks?.viewTransition?.finished(this.activeTransition)
  //   })

  // }

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

        await transition.updateCallbackDone;

        transition.finished.then(() => {
          el.style.viewTransitionName = ""
          el.style.viewTransitionClass = ""

          this.options.hooks?.viewTransition?.finished(transition)
          this.activeTransition = null;
        })
      })
    );
  }

  /**
   * Load and define components
   *
   */
  private async loadAndDefine(elements: HTMLElement[]) {
    if (elements.length === 0) {
      return [];
    }

    // 1. Load the appropriate modules
    const results = await Promise.allSettled(elements.map((e) => this.load(e)))

    // 2. Then, handle errors on per-case component basis
    results.filter(isRejected).map((r) => this.handleComponentLoadError(r));

    // 3. Then, define the components on a single frame
    const success = results.filter(isFulfilled).map((r) => r.value)

    // Only components we are about to define can morph: a loader that defined its
    // own tag (possible while the defer queue is not installed) has already
    // upgraded its element, so a transition for it would animate nothing.
    const to_morph = success.filter((r) => !customElements.get(r.name));
    const already_defined = success.filter((r) => customElements.get(r.name));

    const definitions =
      this.options.transition && to_morph.length
        ? await this.runScopedViewTransition(to_morph, (r) => this.define(r))
        : await Promise.allSettled(to_morph.map((r) => this.define(r)));

    definitions.push(...(await Promise.allSettled(already_defined.map((r) => this.define(r)))));

    // Defining can fail too (a loader that neither defined the tag nor returned a
    // constructor): report it on the element like a load failure.
    definitions.filter(isRejected).map((r) => this.handleComponentLoadError(r));

    // 4. Flush any component that was defined outside of autoloader bounds
    if (this.options.transition && customElements.flush) customElements.flush();

    return []
  }

  /** Get the appropriate loader matching name */
  public getLoader(name: string): Loader {
    return this.catalog?.[name] || this.getWildcardResolver(name);
  }

  /** Load the module */
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
   * Load a single component
   */
  async load(el: HTMLElement): Promise<LoadResult> {
    const name = el.tagName.toLowerCase();

    let loader = this.getLoader(name);
    if (!loader) {
      throw new CEError(`Component ${name} not found in catalog`, { name, el });
    }

    let module;
    // let before_imports = { ...customElements.waiting };
    let load_error = null;

    try {
      performance.mark(`load:${name}:start`);

      this.loading_locks[el.tagName] = el;
      el.setAttribute("ce", "loading");

      module = await this.loadModule(name, loader);
    } catch (error: any) {
      load_error = error;
      throw new CEError(`${name} - ${error.message}`, { name, el, module, cause: error });
    } finally {
      delete this.loading_locks[el.tagName];

      performance.mark(`load:${name}:end`);
      performance.measure(`load:${name}`, {
        detail: { name: name, type: "load", error: load_error },
        start: `load:${name}:start`,
        end: `load:${name}:end`,
      });
    }

    // Components that defines others components
    // let diff_imports = Object.keys(customElements.waiting)
    //   .filter((key) => !Object.keys(before_imports).includes(key))
    //   .filter((key) => key !== name);

    // for (const element of diff_imports) {
    //   DEFINE(element, customElements.waiting[element]["ctor"], {});
    // }

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
    try {
      performance.mark(`define:${name}:start`);

      if (customElements.get(name)) {
        // Already defined: either the module registered the tag itself, or another
        // script got there first. Nothing to define (and nothing to morph).
      } else if (customElements.dequeue && customElements.queue) {
        // Definitions are being deferred, so the batch can land inside the view
        // transition: queue this one and dequeue it right after.
        if (!customElements.queue[name]) {
          if (!module) {
            throw new CEError(`${name} - the loader neither defined the element nor returned a constructor`, { name, el, module });
          }
          customElements.define(name, module, {})
        }
        customElements.dequeue(name);
      } else {
        if (!module) {
          throw new CEError(`${name} - the loader neither defined the element nor returned a constructor`, { name, el, module });
        }
        customElements.define(name, module, {});
      }

    } catch (error: any) {
      define_error = error;
      // Already a CEError: don't wrap it twice.
      if (error instanceof CEError) throw error;
      throw new CEError(`${name} - ${error.message}`, { name, el, module, error });
    } finally {
      // Only claim the state that really happened: a failing `define()` must not leave
      // the element looking upgraded.
      if (!define_error) el?.setAttribute("ce", "defined");

      performance.mark(`define:${name}:end`);
      performance.measure(`define:${name}`, {
        detail: { name: name, type: "define", error: define_error },
        start: `define:${name}:start`,
        end: `define:${name}:end`,
      });
    }

    return { name, module, el };
  }

  /**
   * Matches a component name to a wildcard resolver (if exists)
   * e.g. "nord-button" -> "nord-*"
   */
  private getWildcardResolver(name: string): Loader | null {
    const [prefix, _comp_name] = name.split("-");
    return this.catalog[`${prefix}-*`];
  }

  /**
   * Polyfills for custom element
   */


  /**
   * Polyfill `customElements.define` to defer component definition.
   *
   * Only elements that belong to this `catalog` are deferred: they are defined
   * later by `customElements.dequeue(name)` or `customElements.flush()`, so a
   * whole batch can land on the same frame — inside a single view transition.
   *
   * Anything else is forwarded to the original `define` right away. Third-party
   * scripts (or a catalog module registering extra tags) must keep working while
   * the queue is installed: queueing them would leave those elements defined
   * nowhere — never upgraded, `customElements.get()` `undefined` and
   * `customElements.whenDefined()` never settling.
   *
   * Call `customElements.flush()` or `customElements.dequeue(name)` to finally define.
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
}

if (new URL(import.meta.url).searchParams.has('autoload')) {
  window.registry = new CEAutoLoader({ useImportMapsCatalog: true });
}

export default CEAutoLoader;
