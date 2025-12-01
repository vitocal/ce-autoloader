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
  /** Transition function to animate loading components */
  transition?: (comps: HTMLElement[]) => Promise<void>;
  beforeDefine?: (name: string, next: () => Promise<void>) => Promise<void>;
  /** Directives are triggers to when the component should be loaded */
  directives?: CEAutoLoaderDirectives[];
}

globalThis.DEFINE = customElements.define.bind(customElements);
customElements.waiting = {};
customElements.define = function (name, ctor, options) {
  console.log("[CE] define called:", name, this);
  customElements.waiting[name] = { ctor, options };
};


declare global {
  interface CustomElementRegistry {
    _define?: typeof CustomElementRegistry.prototype.define;
  }
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

  // Transition/Animations
  #transition?: ((comps: HTMLElement[], registerAll: () => Promise<PromiseSettledResult<CustomElementConstructor>[]>) => void) = undefined;

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
      // directives: ["idle", "lazy", "interaction"],
      directives: ["interaction"],
      ...options
    };
    this.catalog = options.catalog;

    this.#transition = options.transition;

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
    const elements = this.uniqueByTag(filtered);

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
      const result = await Promise.allSettled(comps.map((el) => this.registerLeaf(el)))
      console.log('result', comps.map((el) => el.tagName.toLowerCase()), result);
      return result;
    }

    return await _registerAll()
  }

  async registerLeaf(el: Element) {
    const name = el.tagName.toLowerCase()

    // Already registered, so just skip-it
    if (customElements.get(name)) {
      console.log(`CEAutoLoader: Already registered ${name}`)
      return customElements.get(name) as CustomElementConstructor;
    }

    try {
      return await this.loader_run({ name });
      // return await this.findModule(name);
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
  async find({ name }: { name: string }, next) {
    let asset = this._catalog[name] || this.getNamespace(name)
    if (!asset) {
      throw new Error(`Component not found: ${name}`)
    }

    const metric = `load:${name}`;

    // console.log("ce-autoloader: Loading module", name, asset)
    performance.mark(`${metric}:start`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (typeof asset === "string") {
        return next({ name, asset })
        // return await this.loadModule(name, asset)
      } else if (typeof asset === "function") {
        // return await asset(name)
        throw new Error('ce-autoloader: Not implemented');
      } else {
        throw new Error(`ce-autoloader: Loader of ${name} is invalid! Should be a url or a function`)
      }
    } finally {
      performance.mark(`${metric}:end`);
      performance.measure(metric, `${metric}:start`, `${metric}:end`);
    }

  }

  /**
   * Called before load, after findModule
   * Use for loading indicators
   */
  async beforeLoad({ name, asset }: { name: string, asset: string }, next) {
    return await next({ name, asset });
  }

  /**
   * Load the module
   */
  async load({ name, asset }: { name: string, asset: string }, next): Promise<CustomElementConstructor> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    let module = await import(/** @vite-ignore */ asset);
    return next({ name, asset, module })
  }

  /**
   * Called after load, before component definition.
   * Use for transition effects, since the next() call will change the DOM with the component
   */
  async afterLoad({ name, asset }: { name: string, asset: string }, next) {
    return await next({ name, asset });
  }

  /**
   * Use for metrics
   */
  async finished({ name, asset }: { name: string, asset: string }, next) {
    return await next({ name, asset });
  }

  /*
   * Define a single component
   * It will be rendered on DOM after this.
   */
  async define({ name, asset }: { name: string, asset: string }, next) {
    if (customElements.get(name)) {
      console.log(`ce-autoloader: Component ${name} already defined`)
      return next({ name, asset });
    }

    const { ctor, options } = customElements.waiting[name];
    DEFINE(name, ctor, options);

    return await next({ name, asset });
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
