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
  /** Load components on demand, as soon as possible? */
  autoload?: boolean;
  /** Directives are triggers to when the component should be loaded */
  directives?: AtlasDirectives[];
}


function isCustomElement(element: Element) {
  return element instanceof HTMLElement && element.tagName.includes("-")
}

function findCustomElement(root: HTMLElement, modifier?: string) {
  const selector = (modifier ? `*[on=${modifier}]` : '') + ':not(:defined)'
  return Array.from([root, ...root.querySelectorAll(selector)])
}

async function loadCustomElement(name: string, atlas: AtlasRegistry) {
  const loader = atlas[name]
  if (typeof loader === "string") {
    // todo: Should we treat relative and absolute path differently?
    const module = await import(/* @vite-ignore */ loader)
    const component = module.default
    if (component?.prototype instanceof HTMLElement && !customElements.get(name)) {
      console.warn(`ATLAS: Component ${name} was not registered in the file. Registering now...`)
      customElements.define(name, component);
    } else {
      throw new Error(`ATLAS: Component ${name} is not a valid custom element!`)
    }
    return component;
  } else if (typeof loader === "function") {
    // todo: should have tests
    return await loader(name)
  } else {
    throw new Error(`ATLAS: Loader of ${name} is invalid! Should be a url or a function`)
  }
}

/*
 * Upgrade informed elements in `comps`, with their resource in atlas
 */
async function hydrateWebComponent(comps: Element[], atlas: AtlasRegistry) {
  // Upgrade everyone in parallel
  return await Promise.allSettled(
    comps.map(async (el) => {
      // try {
      const name = el.tagName.toLowerCase()

      // Already registered, so just skip-it
      if (customElements.get(name) || !isCustomElement(el)) {
        return
      }

      if (name in atlas) {
        return await loadCustomElement(name, atlas);
      } else {
        console.warn(`Component not found: ${name}`)
      }
      // } catch (e) {
      //   console.error(
      //     `Failed to load component ${el.tagName.toLowerCase()}:`,
      //     e
      //   )
      // }
    })
  )
}

export default class Atlas {
  #options: AtlasOptions;
  #observer?: MutationObserver;

  constructor(options: AtlasOptions) {
    console.log("Atlas started with options:", options);
    if (!options.library) {
      throw new Error("Atlas needs a library to start")
    }

    this.#options = {
      autoload: true,
      live: true,
      root: document.body,
      directives: ["idle", "visible", "interaction"],
      ...options
    };

    if (this.#options.live) {
      this.observe();
    }

    for (const directive of this.#options.directives ?? []) {
      this.upgrade(directive)
    }

    if (this.#options.autoload) {
      this.upgrade()
    }
  }

  /**
   * Call this method to upgrade elements.
   *
   * @param directive - Filter by elements that matches the given directive (eg: `on="visible"`),
   * If directive is null, will upgrade all elements in the `this.#options.root`!
   *
   * To manually upgrade elements, use the `on="manual"` attribute, but it
   * can be any string really. Then call `atlas.upgrade("manual")` to upgrade all elements with that attribute.
   */
  upgrade(directive?: AtlasDirectives) {
    const elements =
      findCustomElement(this.#options.root || document.body, directive)
        .filter((el) => (el.getAttribute("on") == directive))

    // Directives apply special conditions to when the component is loaded
    if (directive === "idle") {
      return requestIdleCallback(() => hydrateWebComponent(elements, this.#options.library))
    } else if (directive === "visible") {
      return elements.map((el) => {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            hydrateWebComponent([el], this.#options.library)
            observer.unobserve(el)
          }
        })
        observer.observe(el)
        return observer
      })
    } else if (directive === "interaction") {
      return elements.map((el) => {
        return el.addEventListener("pointerdown", () => {
          hydrateWebComponent([el], this.#options.library)
        }, { once: true });
      })
    } else {
      // Load right away everyone else (no-directive)
      return hydrateWebComponent(elements, this.#options.library)
    }
  }

  observe() {
    this.#observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
              return
            }
            // Check the node itself
            if (isCustomElement(node)) {
              hydrateWebComponent([node], this.#options.library);
            }
            // Check children
            const children = findCustomElement(node);
            if (children.length > 0) {
              hydrateWebComponent(children, this.#options.library);
            }
          });
        }
      }
    });

    this.#observer.observe(this.#options.root || document.body, {
      childList: true,
      subtree: true
    });
  }
}
