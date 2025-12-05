// import { Batcher } from "./utils";

/**
 * A module can be a URL or a function that returns a Promise<CustomElementConstructor>
 */
export type CEAutoLoaderModule = string | ((name?: string) => Promise<CustomElementConstructor>)
export type CEAutoLoaderCatalog = Record<string, CEAutoLoaderModule>;

export type CEAutoLoaderDirectives = "eager" | "visible" | "interaction" | string
export type CEAutoLoaderOptions = {
	/* The component catalog */
	catalog: CEAutoLoaderCatalog;
	/* The root element to search for custom elements */
	root?: HTMLElement;
	/** Watch for new custom elements in the page? */
	live?: boolean;
	/** Fallback for components with errors */
	fallback?: CustomElementConstructor;
	/** Directives are triggers to when the component should be loaded */
	directives?: CEAutoLoaderDirectives[];
	/** Overwrite the default directive */
	defaultDirective?: CEAutoLoaderDirectives;
	/** Interval to flush batches */
	// batchInterval?: number;
}

class CEError extends Error {
	details: any;

	constructor(message: string, details: any) {
		super(`CEAutoLoader: ${message}`);
		this.details = details;
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
function matchCustomElement(root: Element) {
	const selector = ':not(:defined)'
	return [...new Set([root, ...root.querySelectorAll(selector)])]
		.filter((el) => isCustomElement(el)) as HTMLElement[]
}

class CEAutoLoader {
	options: CEAutoLoaderOptions;
	_catalog: CEAutoLoaderCatalog = {};

	// Namespaced components(prefix-*) are stored separatedly from the registry
	_namespaces: Record<string, CEAutoLoaderModule> = {};

	// Mutation and Interaction Observers
	#observers: Record<string, MutationObserver | IntersectionObserver> = {};
	#initialized: boolean = false;

	// Batches of fns to be called in a single animation frame
	// batches: Array<() => Promise<void>> = [];
	// batchLoop?: NodeJS.Timeout = undefined;

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
			directives: ["eager", "visible", "interaction"],
			defaultDirective: "eager",
			...options
		};
		this.catalog = options.catalog;

		if (!globalThis.DEFINE) {
			monkeyPatchDefine();
		}
	}




	watch() {
		const observer = new MutationObserver(debounce(this.watcher.bind(this), 100));

		observer.observe(this.options.root || document.body, {
			childList: true,
			subtree: true,
			characterData: true
		});

		this.#observers['mutation'] = observer;

		return;
	}
	async watcher(mutations: MutationRecord[]) {
		console.log("mutated", mutations)
		for (const mutation of mutations) {

			if (mutation.type === 'childList') {
				for (const node of mutation.addedNodes) {
					if (node.nodeType != 1) { continue; }

					// Check the node itself
					// or any children that are custom elements
					if (node instanceof HTMLElement &&
						(isCustomElement(node) ||
							matchCustomElement(node as Element).length > 0)) {
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
		if (!directive) {
			return elements.filter((el) => !el.hasAttribute("on"));
		}

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
	 * Clean up observers to avoid memory leak
	 */
	clean() {
		Object.entries(this.#observers)
			.map(([_, obs]) => obs.disconnect())

		this.#observers = {}
	}





	/**
	 * discover custom elements in the page and upgrade them.
	 */
	async discover() {

		// Watch for new elements
		if (!this.#initialized && this.options.live) {
			this.watch();
		}

		// Load elements that matches directives
		for (const directive of this.options.directives ?? []) {
			this.upgrade(directive)
		}

		// Load everyone else right away
		const result = await this.upgrade();
		console.log("finished discover", result)

		this.#initialized = true;

		return result;
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

		const ce_elements = matchCustomElement(this.options.root || document.body)
		const filtered = this.filterByDirective(ce_elements, directive)
		const elements = filtered;

		// console.log("CEAutoLoader: Registering", elements, "with directive", directive)
		// Directives apply special conditions to when the component is loaded
		if (directive === "visible" || this.options.defaultDirective === "visible") {

			// Create observer if it doesn't exist
			if (!this.#observers['intersection']) {
				this.#observers['intersection'] = new IntersectionObserver((entries) => {
					entries
						.filter((entry) => !customElements.get(entry.target.tagName.toLowerCase()))
						.filter((entry) => (entry.isIntersecting))
						.map((entry) => this.loadAndDefine([entry.target as HTMLElement], "visible"));
				});
			}

			// TODO: Must check if elements are already observed
			debugger;
			console.log("observing intersection of", elements)
			elements.map((el) => this.#observers['intersection'].observe(el))

			return elements;

		} else if (directive === "interaction" || this.options.defaultDirective === "interaction") {
			return elements.map((el) => {
				return el.addEventListener("pointerdown", () => {
					this.loadAndDefine([el], "interaction")
				}, { once: true });
			})
		} else if (directive === "eager" || this.options.defaultDirective === "eager") {
			return await this.loadAndDefine(elements, "eager")
		} else {
			// Load right away everyone else (eager)
			return await this.loadAndDefine(elements, "default")
		}
	}




	/*
	* Load and define components
	*/
	async loadAndDefine(comps: HTMLElement[], source: string) {

		const _registerAll = async () => {
			console.log(`registering from ${source}`, comps.map((el) => el.tagName.toLowerCase()));

			const load_result = await Promise.allSettled(comps.map((el) => this.load(el)))
			const load_success = load_result.filter((result) => result.status === "fulfilled")
			const load_fail = load_result.filter((result) => result.status === "rejected")

			// Fallback for failed loads
			if (this.options.fallback) {
				await Promise.allSettled(load_fail.map((result) => {
					const origin = result.reason.details;

					// We must clone, because browsers don't allow to define the same class with the same name
					let fallback_cloned = class ClonedFallback extends this.options.fallback!{ }

					origin.el.setAttribute('error', result.reason.message);
					origin.el.setAttribute('stack', result.reason.stack);
					this.define({ name: origin.name, el: origin.el, module: fallback_cloned })
				}))
			}

			await Promise.allSettled([
				...load_success.map((result) => this.define(result.value)),
				this.flushDefine()
			])

			return load_result;
		}

		return await _registerAll()
	}

	/**
	 * Load a single component
	 */
	async load(el: Element) {
		const name = el.tagName.toLowerCase()

		let asset = this._catalog[name] || this.getNamespace(name)
		if (!asset) {
			throw new CEError(`Component ${name} not found in catalog`, { name, el })
		}

		let module;
		try {
			performance.mark(`load:${name}:start`);

			// TODO: Remove this
			await new Promise((resolve) => setTimeout(resolve, 1000));

			el.setAttribute('ce-loading', "");
			if (typeof asset === "string") {
				module = await import(/* @vite-ignore */ asset);
			} else if (typeof asset === "function") {
				module = await asset(name);
			} else {
				throw new CEError(`Loader of ${name} is invalid! Should be a url or a function`, { name, el, module })
			}
		} finally {
			el.removeAttribute('ce-loading');
			performance.mark(`load:${name}:end`);
			performance.measure(`load:${name}`, `load:${name}:start`, `load:${name}:end`);
		}


		return { name, module, asset, el }
	}


	/**
	 * Define a single component
	 */
	async define({ name, el, module }) {
		// Maybe it's already defined...
		if (customElements.get(name)) {
			return;
		}

		if (customElements.waiting[name]) {
			module = customElements.waiting[name]['ctor']
		} else {
			if (!module) {
				throw new CEError(`Component ${name} wasn't registered! This is a bug!!!`, { name, el, module })
			}

			module = module?.prototype instanceof HTMLElement ? module : module?.default;
		}

		try {
			performance.mark(`define:${name}:start`);

			el.setAttribute('ce-defined', '');
			DEFINE(name, module, {});
		} finally {
			performance.mark(`define:${name}:end`);
			performance.measure(`define:${name}`, `define:${name}:start`, `define:${name}:end`);
		}

		return { name, module }
	}

	/**
	 * Matches a component name to a namespace (if exists)
	 */
	getNamespace(name: string): CEAutoLoaderModule | null {
		const [prefix, _comp_name] = name.split('-');
		return this._namespaces[prefix];
	}

	/**
	 * Define components in the waiting queue
	 */
	flushDefine() {
		console.log("flushDefine()", Object.keys(customElements.waiting))
		// Some components definitions can be still in waiting (they' have called customElements.define but they're not in DOM)
		// Let's define them now
		if (Object.keys(customElements.waiting).length > 0) {
			Object.entries(customElements.waiting)
				.filter(([name]) => !customElements.get(name))
				.map(([name, { ctor, options }]) => DEFINE(name, ctor, options))
		}
	}

}

/**
 * customElements.define is patched to only register it.
 * It needs another call `DEFINE` to actually define the component.
 *
 * It's used for deferring component.define() calls, and hence, a render until.
 * ce-autoloader uses this to control the lifecycle of the components load -> ready,
 * It'll batches many components.define() calls together, and animate them in a single pass.
 *
 * Otherwise, the define() calls will be executed one by one, and the animation will be
 * triggered one by one.
 *
 * Note that it's global, so it will affect all components in the app that are defined after ce-autoloader.
 * They'll be still available at `customElements.waiting` and you can define anytime with `flushDefine()`
 *
 */
function monkeyPatchDefine() {
	globalThis._DEFINE = customElements.define.bind(customElements);
	globalThis.DEFINE = (name, ctor, options) => {
		globalThis._DEFINE(name, ctor, options);
		customElements.registered[name] = { ctor, options };
		delete customElements.waiting[name];
	}

	customElements.waiting = {};
	customElements.registered = {};
	customElements.define = function (name, ctor, options?) {
		customElements.waiting[name] = { ctor, options };
	};
}


declare global {
	interface CustomElementRegistry {
		waiting: Record<string, { ctor: CustomElementConstructor, options?: ElementDefinitionOptions }>;
		registered: Record<string, { ctor: CustomElementConstructor, options?: ElementDefinitionOptions }>
	}
	var _DEFINE: typeof CustomElementRegistry.prototype.define;
	var DEFINE: typeof CustomElementRegistry.prototype.define;
}

export default CEAutoLoader
