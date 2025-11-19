export type AtlasModule = string | ((name?: string) => Promise<HTMLElement>)
export type AtlasRegistry = Record<string,AtlasModule>;
export type AtlasOptions = {
    /* The component manifest */
    library: AtlasRegistry;
    /* The root element to search for custom elements */
    root?: HTMLElement;
    /** Watch for mutations? */
    observe?: boolean;
    /** Autoload components on demand */
    autoload?: boolean;
}


function isCustomElement(element: HTMLElement) {
  return element instanceof HTMLElement && element.tagName.includes("-")
}

function findCustomElement(root: HTMLElement, modifer?: string) {
  return Array.from([
    root,
    ...root.querySelectorAll(":not(:defined)")
  ])
}

async function loadCustomElement(name: string, atlas: AtlasRegistry) {
    const loader = atlas[name]
    console.time(name)
    if(typeof loader === "string"){
        await import(loader)
    } else if(typeof loader === "function"){
        await loader(name)
    }
    console.timeLog(name)
}

/*
 * Detect all custom elements not yet upgraded on the `root`
 * And load their associated files
 */
async function hydrateWebComponent(comps: Element[], atlas: AtlasRegistry) {
  // Upgrade everyone in parallel
  await Promise.allSettled(
    comps.map(async (el) => {
      try {
        const name = el.tagName.toLowerCase()

        // Already registered, so just skip-it
        if (customElements.get(name) || !isCustomElement(el)) {
          return
        }

        if (name in atlas) {
            await loadCustomElement(name, atlas);
        } else {
          console.warn(`Component not found: ${name}`)
        }
      } catch (e) {
        console.error(
          `Failed to load component ${el.tagName.toLowerCase()}:`,
          e
        )
      }
    })
  )
}

export default class Atlas {
    #options: AtlasOptions;

    constructor(options: AtlasOptions) {
        console.log("Atlas started with options:", options);
        if(!options.library){
            console.error("Atlas needs a library to start")
            return
        }

        this.#options = { autoload: true, observe: true, root: document.body, ...options};
        if(this.#options.autoload){
            this.hydrate()
        }
    }

    hydrate(){
        const elements = findCustomElement(this.#options.root || document.body)
        hydrateWebComponent(elements, this.#options.library)
    }
}
