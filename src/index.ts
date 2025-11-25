/**
 * A module can be a URL or a function that returns a Promise<CustomElementConstructor>
 */
export type AtlasModule = string | ((name?: string) => Promise<CustomElementConstructor>)
export type AtlasRegistry = Record<string, AtlasModule>;
export type AtlasDirectives = "idle" | "visible" | "interaction" | string
export type AtlasOptions = {
  /* The component manifest */
  library: AtlasRegistry;
  /* The root element to search for custom elements */
  root?: HTMLElement;
  /** Watch for new custom elements in the page? */
  live?: boolean;
  /** Load components on start? */
  autoload?: boolean;
  /** Directives are triggers to when the component should be loaded */
  directives?: AtlasDirectives[];
}


function isCustomElement(element: Element) {
  return element instanceof HTMLElement && element.tagName.includes("-")
}

/**
 * CSS selector to match custom elements
 */
function matchCustomElement(root: Element, modifier?: string) {
  const selector = (modifier ? `*[on=${modifier}]` : '') + ':not(:defined)'
  return [...new Set([root, ...root.querySelectorAll(selector)])]
    .filter((el) => isCustomElement(el)) as HTMLElement[]

}

export default class Atlas {
  options: AtlasOptions;
  _library: AtlasRegistry = {};

  // Namespaced components(prefix-*) are stored separatedly from the library
  _namespaces: Record<string, AtlasModule> = {};

  // Mutation and Interaction Observers
  #observers: Array<MutationObserver | IntersectionObserver> = [];

  get library() {
    return this._library;
  }
  set library(value: AtlasRegistry) {
    this._library = value;
    this._namespaces = Object.fromEntries(
      Object.entries(this._library)
        .filter(([key]) => key.endsWith('-*'))
        .map(([key, value]) => [key.split('-')[0], value])
    )
  }


  constructor(options: AtlasOptions) {
    console.log("Atlas started with options:", options);
    if (!options.library) {
      throw new Error("Atlas needs a library to start")
    }

    this.options = {
      autoload: true,
      live: true,
      root: document.body,
      directives: ["idle", "visible", "interaction"],
      ...options
    };
    this.library = options.library;

    if (this.options.live) {
      this.#observers.push(this.watch());
    }

    for (const directive of this.options.directives ?? []) {
      const observers = this.upgrade(directive)
      if (Array.isArray(observers) &&
        observers[0] instanceof IntersectionObserver) {
        this.#observers = [...this.#observers, ...observers]
      }
    }

    if (this.options.autoload) {
      this.upgrade()
    }
  }

  /**
   * Clean up observers to dont memory leak
   */
  clean() {
    this.#observers?.forEach((observer) => observer.disconnect())
    this.#observers = []
  }


  /**
   * Upgrade the custom elements in the root
   *
   * @param directive - Filter by elements that matches the given directive (eg: `on="visible"`),
   * If directive is null, will upgrade all elements in the `this.#options.root`!
   *
   * To manually upgrade elements, use the `on="manual"` attribute, but it
   * can be any string really. Then call `atlas.upgrade("manual")` to upgrade all elements with that attribute.
   */
  async upgrade(directive?: AtlasDirectives) {
    const elements =
      matchCustomElement(this.options.root || document.body, directive)
        .filter((el) => (el.getAttribute("on") == directive))

    console.log("Upgrading", elements.length, "elements with directive", directive)
    // Directives apply special conditions to when the component is loaded
    if (directive === "idle") {
      requestIdleCallback(() => this.hydrateComponents(elements))
      return [];
    } else if (directive === "visible") {
      return elements.map((el) => {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            this.hydrateComponents([el])
            observer.disconnect()
          }
        })
        observer.observe(el)
        return observer
      })
    } else if (directive === "interaction") {
      return elements.map((el) => {
        return el.addEventListener("pointerdown", () => {
          this.hydrateComponents([el])
        }, { once: true });
      })
    } else {
      // Load right away everyone else (no-directive)
      return this.hydrateComponents(elements)
    }
  }

  watch() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType != 1) { return; }

            // Check the node itself
            if (node instanceof HTMLElement && isCustomElement(node)) {
              this.hydrateComponents([node]);
            } else {
              // Check children
              const children =
                matchCustomElement(node as Element)
              if (children.length > 0) {
                this.hydrateComponents(children);
              }
            }
          });
        }
      }
    });

    observer.observe(this.options.root || document.body, {
      childList: true,
      subtree: true
    });

    return observer
  }



  /*
  * Upgrade informed elements in `comps`, with their resource in atlas
  */
  hydrateComponents(comps: HTMLElement[]) {
    // Upgrade everyone in parallel
    return Promise.allSettled(
      comps.map((el) => this.hydrateLeaf(el))
    )
  }

  async hydrateLeaf(el: Element) {
    const name = el.tagName.toLowerCase()
    console.log("Hydrating", el)

    // Already registered, so just skip-it
    if (customElements.get(name)) {
      console.log(`Already registered ${name}`)
      return customElements.get(name) as CustomElementConstructor;
    }

    return await this.load(name);
  }

  /**
   * Load the component from the library
   */
  async load(name: string) {
    let asset = this._library[name] || this.getNamespace(name)
    if (!asset) {
      throw new Error(`Component not found: ${name}`)
    }

    if (typeof asset === "string") {
      return await this.loadModule(name, asset)
    } else if (typeof asset === "function") {
      return await asset(name)
    } else {
      throw new Error(`ATLAS: Loader of ${name} is invalid! Should be a url or a function`)
    }
  }

  /**
   * Load a js module from **asset** using "import()"
   */
  async loadModule(name: string, asset: string): Promise<CustomElementConstructor> {
    // todo: Should we treat relative and absolute path differently?
    const module = await import(/* @vite-ignore */ asset)
    if (!customElements.get(name)) {
      console.warn(`ATLAS: Component ${name} was not auto-registered in the file. Registering now...`)
      customElements.define(name, module.default);
    } else if (!HTMLElement.isPrototypeOf(module.default)) {
      throw new Error(`ATLAS: Component ${name} was not exported correctly! Expected a custom element constructor, got ${typeof module.default}`)
    }
    return module.default;
  }


  /**
   * Matches a component name to a namespace (if exists)
   */
  getNamespace(name: string): AtlasModule | null {
    const [prefix, _comp_name] = name.split('-');
    return this._namespaces[prefix];
  }

}
