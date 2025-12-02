// import { Batcher } from "./utils";

/**
 * A module can be a URL or a function that returns a Promise<CustomElementConstructor>
 */
export type CEAutoLoaderModule = string | ((name?: string) => Promise<CustomElementConstructor>)
export type CEAutoLoaderCatalog = Record<string, CEAutoLoaderModule>;

export type CEAutoLoaderDirectives = "eager" | "idle" | "lazy" | "interaction" | string
export type CEAutoLoaderOptions = {
  /* The component catalog */
  catalog: CEAutoLoaderCatalog;
  /* The root element to search for custom elements */
  root?: HTMLElement;
  /** Watch for new custom elements in the page? */
  live?: boolean;
  /** Fallback to components with errors? */
  fallback?: true | CustomElementConstructor;
  /** Directives are triggers to when the component should be loaded */
  directives?: CEAutoLoaderDirectives[];
}

/**
 * customElements.define is monkey patched to be lazy and ordered rendering.
 * Useful for deferring component definition until they are needed.
 *
 * For example, you can load components into memory, and in a single animation frame
 * define all of them, and animate them in.
 */
globalThis.DEFINE = customElements.define.bind(customElements);
customElements.waiting = {};
customElements.define = function (name, ctor, options) {
  customElements.waiting[name] = { ctor, options };
};


declare global {
  interface CustomElementRegistry {
    _define?: typeof CustomElementRegistry.prototype.define;
    waiting: Record<string, { ctor: CustomElementConstructor, options?: ElementDefinitionOptions }>;
  }
  var DEFINE: typeof CustomElementRegistry.prototype.define;
}

function isCustomElement(element: Element) {
  return element instanceof HTMLElement && element.tagName.includes("-")
}

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * CSS selector to match custom elements
 */
function matchCustomElement(root: Element, modifier?: CEAutoLoaderDirectives) {
  const selector = (modifier ? `*[on~=${modifier}]` : '') + ':not(:defined)'
  return [...new Set([root, ...root.querySelectorAll(selector)])]
    .filter((el) => isCustomElement(el)) as HTMLElement[]
}

class DevFallback extends HTMLElement {
  error: string = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.error = this.getAttribute("error") || "";
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: red;
          font-family: monospace;
          color: white;
          padding: 8px;
        }
      </style>
      ${this.error}
    `;
  }
}

class CEAutoLoader {
  options: CEAutoLoaderOptions;
  _catalog: CEAutoLoaderCatalog = {};

  // Namespaced components(prefix-*) are stored separatedly from the registry
  _namespaces: Record<string, CEAutoLoaderModule> = {};

  // Mutation and Interaction Observers
  #observers: Array<MutationObserver | IntersectionObserver> = [];
  #initialized: boolean = false;

  // Batches of fns to be called in a single animation frame
  batches: Array<() => Promise<void>> = [];
  batchLoop?: NodeJS.Timeout = undefined;

  /**
   * Maybe those are not needed,
   * because the catalog can be changed at runtime
   * and will be reflected.
   *
   * just a public catalog.
   * should refactor _namespaces thought
   */
  public get catalog() {
    return this._catalog;
  }
  public set catalog(value: CEAutoLoaderCatalog) {
    this._catalog = value;
    this._namespaces = Object.fromEntries(
      Object.entries(this._catalog)
        .filter(([key]) => key.endsWith('-*'))
        .map(([key, value]) => [key.split('-')[0], value])
    )
  }


  constructor(options: CEAutoLoaderOptions) {
    console.log("CEAutoLoader started with options:", options);
    if (!options.catalog) {
      throw new Error("CEAutoLoader needs a catalog to start")
    }

    this.options = {
      live: true,
      root: document.body,
      directives: ["idle", "lazy", "interaction"],
      // directives: ["interaction"],
      ...options
    };
    this.catalog = options.catalog;

  }

  /**
   * Clean up observers to avoid memory leak
   */
  clean() {
    this.#observers?.forEach((observer) => observer.disconnect())
    this.#observers = []
  }

  /**
   * discover custom elements in the page and upgrade them.
   */
  async discover() {

    this.batches = [];

    // Load all elements that matches the directives
    for (const directive of this.options.directives ?? []) {
      const observers = this.upgrade(directive)
      if (Array.isArray(observers) &&
        observers[0] instanceof IntersectionObserver) {
        this.#observers = [...this.#observers, ...observers]
      }
    }
    // Watch for new elements (and calls discover again)
    if (!this.#initialized && this.options.live) {
      this.#observers.push(this.watch());
    }

    // Load everyone else right away
    const result = await this.upgrade();

    // Run a final flush, and clear batches
    if (this.batches.length > 0) {
      this.batchedDefine(this.batches);
      clearInterval(this.batchLoop);
      this.batchLoop = undefined;
    }

    this.#initialized = true;

    return result;
  }


  watch() {
    const observer = new MutationObserver(debounce(this.watcher.bind(this), 100));

    observer.observe(this.options.root || document.body, {
      childList: true,
      subtree: true
    });

    return observer
  }
  async watcher(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType != 1) { continue; }

          console.log("mutated", node)

          // Check the node itself
          // or any children that are custom elements
          if (node instanceof HTMLElement && isCustomElement(node) ||
            matchCustomElement(node as Element).length > 0) {
            await this.discover();
          }
        };
      }
    }
  }

  /**
   * Some filters to avoid duplicates
   */
  private filterByDirective(elements: HTMLElement[], directive?: CEAutoLoaderDirectives) {
    return elements.filter((el) => (el.getAttribute("on") == directive))
  }
  private uniqueByTag(elements: HTMLElement[]) {
    const seen = new Set();
    const uniqueByTag = [];

    for (const el of elements) {
      const tag = el.tagName;
      if (!seen.has(tag)) {
        seen.add(tag);
        uniqueByTag.push(el);
      }
    }

    return uniqueByTag
  }


  /**
   * Upgrade the custom elements in the root
   *
   * @param directive - Filter by elements that matches the given directive (eg: `on="visible"`),
   * If directive is null, will upgrade all elements in the `this.#options.root`!
   *
   * To manually upgrade elements, use the `on="manual"` attribute, but it
   * can be any string really. Then call `registry.upgrade("manual")` to upgrade all elements with that attribute.
   */
  async upgrade(directive?: CEAutoLoaderDirectives) {
    const ce_elements = matchCustomElement(this.options.root || document.body, directive)
    const filtered = this.filterByDirective(ce_elements, directive)
    const elements = filtered;
    // const elements = this.uniqueByTag(filtered);

    // console.log("CEAutoLoader: Registering", elements, "with directive", directive)
    // Directives apply special conditions to when the component is loaded
    if (directive === "idle") {
      requestIdleCallback(() => this.registerComponents(elements))
      return [];
    } else if (directive === "lazy") {
      return elements.map((el) => {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            this.registerComponents([el])
            observer.disconnect()
          }
        })
        observer.observe(el)
        return observer
      })
    } else if (directive === "interaction") {
      return elements.map((el) => {
        return el.addEventListener("pointerdown", () => {
          this.registerComponents([el])
        }, { once: true });
      })
    } else {
      // Load right away everyone else (eager)
      return await this.registerComponents(elements)
    }
  }




  /*
  * Register all elements in `comps`, that are in the catalog
  */
  async registerComponents(comps: HTMLElement[]) {

    const _registerAll = async () => {
      console.log("registering", comps.map((el) => el.tagName.toLowerCase()));

      // flush batches every 100ms
      if (!this.batchLoop) {
        this.batchLoop = setInterval(() => {
          this.batchedDefine(this.batches);
        }, 500);
      }

      const result = await Promise.allSettled(comps.map((el) => this.registerLeaf(el)))

      // clearInterval(interval);
      // await this.batchedDefine(this.batches);
      // this.batches = [];

      return result;
    }

    return await _registerAll()
  }

  async registerLeaf(el: Element) {
    const name = el.tagName.toLowerCase()

    try {
      return await this.loader_run({ name, el });
    } catch (error) {
      console.error(`ce-autoloader: Error loading ${name}`, error)

      // A fallback component is defined to show the error
      if (this.options.fallback) {
        el.setAttribute("error", `${error}`);
        customElements.define(name, this.options.fallback !== true ? this.options.fallback : DevFallback);
      }

      throw error
    }
  }

  // Run load pipeline
  async loader_run(ctx = {}) {
    const pipeline = [
      this.find.bind(this),
      this.beforeLoad.bind(this),
      this.load.bind(this),
      this.afterLoad.bind(this),
      this.define.bind(this),
      this.finished.bind(this),
    ]

    let i = 0;
    async function next(_ctx) {
      const fn = pipeline[i++];
      if (!fn) return Promise.resolve(_ctx);
      try {
        const _next = next;
        const result = await fn(_ctx, _next);
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return next(ctx)
  }

  /**
   * Find the module to load
   */
  async find({ name, el }: { name: string, el: Element }, next) {
    let asset = this._catalog[name] || this.getNamespace(name)
    if (!asset) {
      throw new Error(`Component not found: ${name}`)
    }

    // try {
    // await new Promise(resolve => setTimeout(resolve, 1000));
    return next({ name, el, asset })
    // } finally {
    //   performance.mark(`${metric}:end`);
    //   performance.measure(metric, `${metric}:start`, `${metric}:end`);
    // }

  }

  /**
   * Called before load, after findModule
   * Use for loading indicators
   */
  async beforeLoad({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
    performance.mark(`load:${name}:start`);
    return await next({ name, el, asset });
  }

  /**
   * Load the module
   */
  async load({ name, el, asset }: { name: string, el: Element, asset: string | Function }, next): Promise<CustomElementConstructor> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (typeof asset === "string") {
      let module = await import(/** @vite-ignore */ asset);
      return next({ name, el, asset, module })
    } else if (typeof asset === "function") {
      const module = await asset(name);
      return next({ name, el, asset, module });
    } else {
      throw new Error(`ce-autoloader: Loader of ${name} is invalid! Should be a url or a function`)
    }
  }

  /**
   * Called after load, before component definition.
   * Use for transition effects, since the next() call will change the DOM with the component
   */
  async afterLoad({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
    performance.mark(`load:${name}:end`);
    performance.measure(`load:${name}`, `load:${name}:start`, `load:${name}:end`);

    performance.mark(`define:${name}:start`);
    return await next({ name, el, asset });
  }

  /*
   * Define a single component
   * It will be rendered on DOM after this.
   */
  async define({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
    console.log("im in define", name)
    if (customElements.get(name)) {
      console.log(`ce-autoloader: Component ${name} already defined`)
      return await next({ name, el, asset });
    }

    const { ctor, options } = customElements.waiting[name];
    DEFINE(name, ctor, options);

    return await next({ name, asset });
  }

  /**
   * Use for metrics
   */
  async finished({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
    performance.mark(`define:${name}:end`);
    performance.measure(`define:${name}`, `define:${name}:start`, `define:${name}:end`);

    return await next({ name, el, asset });
  }

  /**
   * Group multiple ad-hoc define(name, component) calls into a single batched one.
   * We transition everyone in a single pass.
   */
  async batchedDefine(jobs: Array<() => Promise<void>>) {
    if (jobs.length === 0) return;

    console.log("flushing", this.batches.length);

    const transition = document.startViewTransition(async () => {
      console.log("startViewTransition");
      console.trace();
      return Promise.allSettled(jobs.map((job) => job()))
    })

    try {
      await transition.ready;
      performance.mark(`viewTransition:start`);
      await transition.finished
      performance.mark(`viewTransition:end`);
      performance.measure(`viewTransition`, `viewTransition:start`, `viewTransition:end`);
    } catch (error) {
      console.error("View transition failed:", error)
    }

    this.batches = []
  }


  /**
   * Matches a component name to a namespace (if exists)
   */
  getNamespace(name: string): CEAutoLoaderModule | null {
    const [prefix, _comp_name] = name.split('-');
    return this._namespaces[prefix];
  }

}

export default CEAutoLoader
