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
  beforeImport?: (name: string, proceed: () => Promise<void>) => Promise<void>;
  /** Directives are triggers to when the component should be loaded */
  directives?: CEAutoLoaderDirectives[];
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
  const selector = (modifier ? `*[loading~=${modifier}]` : '') + ':not(:defined)'
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
    return elements.filter((el) => (el.getAttribute("loading") == directive))
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

    // const _register = (el: HTMLElement) => {
    //   return document.startViewTransition(async () => {
    //     await this.registerLeaf(el)
    //     // await customElements.whenDefined(el.tagName.toLowerCase())
    //     console.log(`View transition ${el.tagName.toLowerCase()} finished`);
    //   })
    // }

    // Upgrade everyone in parallel
    // return await Promise.allSettled(comps.map(_register))

    const _registerAll = async () => {
      const result = await Promise.allSettled(comps.map((el) => this.registerLeaf(el)))
      console.log('result', comps.map((el) => el.tagName.toLowerCase()), result);
      return result;
    }

    // Or a single transition
    if (this.#transition) {
      return await this.#transition(comps, _registerAll)
    } else {
      return await _registerAll()
    }
    // return await document.startViewTransition(async () => {
    //   await Promise.allSettled(comps.map(el => this.registerLeaf(el)))
    // })

  }

  async registerLeaf(el: Element) {
    const name = el.tagName.toLowerCase()

    // Already registered, so just skip-it
    if (customElements.get(name)) {
      console.log(`CEAutoLoader: Already registered ${name}`)
      return customElements.get(name) as CustomElementConstructor;
    }

    try {
      return await this.load(name);
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

  /**
   * Load the component from the library
   */
  async load(name: string) {
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
        return await this.loadModule(name, asset)
      } else if (typeof asset === "function") {
        return await asset(name)
      } else {
        throw new Error(`ce-autoloader: Loader of ${name} is invalid! Should be a url or a function`)
      }
    } finally {
      performance.mark(`${metric}:end`);
      performance.measure(metric, `${metric}:start`, `${metric}:end`);
    }

  }

  /**
   * Load a js module from **asset** using "import()"
   */
  async loadModule(name: string, asset: string): Promise<CustomElementConstructor> {

    // add debug metrics, does the load happens before the whenDefined?
    performance.mark(`whenDefined:${name}:start`);

    customElements.whenDefined(name).then(() => {
      performance.mark(`whenDefined:${name}:end`);
      performance.measure(`whenDefined:${name}`, `whenDefined:${name}:start`, `whenDefined:${name}:end`);
    });

    // todo: Should we treat relative and absolute path differently?
    // let module = await import(/* @vite-ignore */ asset);
    let module_file = await fetch(asset).then(r => r.text());
    let blob = URL.createObjectURL(new Blob([module_file], { type: 'text/javascript' }));

    let import_module = async () => {
      // let module = await import(/* @vite-ignore */ blob);
      const s = document.createElement("script");
      s.type = "module";
      s.textContent = module_file;
      document.head.append(s);

      // if (!customElements.get(name)) {
      //   console.warn(`ce-autoloader: Component ${name} was not auto-registered in the file. Registering now...`)
      //   customElements.define(name, module.default);
      // }

      return true
    }

    if (this.options.beforeImport) {
      return this.options.beforeImport(name, import_module)
    } else {
      let module = await import_module();
      return module.default || module;
    }
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
