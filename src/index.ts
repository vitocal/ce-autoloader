// import { Batcher } from "./utils";

/**
 * A module can be a URL or a function that returns a Promise<CustomElementConstructor>
 */
export type CEAutoLoaderModule = string | ((name?: string) => Promise<CustomElementConstructor>)
export type CEAutoLoaderCatalog = Record<string, CEAutoLoaderModule>;

export type CEAutoLoaderDirectives = "eager" | "lazy" | "interaction" | string
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
	/** Overwrite the default directive */
	defaultDirective?: CEAutoLoaderDirectives;
	/** Interval to flush batches */
	batchInterval?: number;
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
			directives: ["eager", "lazy", "interaction"],
			defaultDirective: "eager",
			batchInterval: 500,
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

		return observer
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
		this.#observers?.forEach((observer) => observer.disconnect())
		this.#observers = []
	}





	/**
	 * discover custom elements in the page and upgrade them.
	 */
	async discover() {

		this.batches = [];

		// Watch for new elements
		if (!this.#initialized && this.options.live) {
			this.#observers.push(this.watch());
		}

		// Load elements that matches directives
		for (const directive of this.options.directives ?? []) {
			const observers = this.upgrade(directive)
			if (Array.isArray(observers) &&
				observers[0] instanceof IntersectionObserver) {
				this.#observers = [...this.#observers, ...observers]
			}
		}

		// Load everyone else right away
		const result = await this.upgrade();

		// Run batched define() calls
		if (this.batches.length > 0) {
			this.batchedDefine(this.batches);
			clearInterval(this.batchLoop);
			this.batchLoop = undefined;
		}

		this.flushDefine();
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
		if (directive === "lazy" || this.options.defaultDirective === "lazy") {
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
		} else if (directive === "interaction" || this.options.defaultDirective === "interaction") {
			return elements.map((el) => {
				return el.addEventListener("pointerdown", () => {
					this.registerComponents([el])
				}, { once: true });
			})
		} else if (directive === "eager" || this.options.defaultDirective === "eager") {
			return await this.registerComponents(elements)
		} else {
			// Load right away everyone else (eager)
			debugger;
			return await this.registerComponents(elements)
		}
	}




	/*
	* Register all elements in `comps`, that are in the catalog
	*/
	async registerComponents(comps: HTMLElement[]) {

		const _registerAll = async () => {
			console.log("registering", comps.map((el) => el.tagName.toLowerCase()));

			// flush component animations every 500ms
			if (!this.batchLoop) {
				this.batchLoop = setInterval(async () => {
					console.log("flushing batches interval", this.batches.length);
					await this.batchedDefine(this.batches);
					requestAnimationFrame(() => this.flushDefine())
					clearInterval(this.batchLoop)
					this.batchLoop = undefined
				}, this.options.batchInterval);
			}

			const result = await Promise.allSettled(comps.map((el) => this.registerLeaf(el)))

			// await this.batchedDefine(this.batches);
			// requestAnimationFrame(() => this.flushDefine())

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
			el.removeAttribute("loading");
			if (this.options.fallback) {
				el.setAttribute("error", `${error}`);

				if (customElements.get(name)) {
					console.log("Fallback already defined", name);
				} else {
					DEFINE(name, this.options.fallback !== true ? this.options.fallback : DevFallback);
					await Promise.resolve(requestAnimationFrame)
				}
			}

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
			try {
				const _next = next;
				return await fn(_ctx, _next);
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

		return next({ name, el, asset })
	}

	/**
	 * Called before load, after findModule
	 * Use for loading indicators
	 */
	async beforeLoad({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
		return next({ name, el, asset });
	}

	/**
	 * Load the module
	 */
	async load({ name, el, asset }: { name: string, el: Element, asset: string | Function }, next): Promise<CustomElementConstructor> {
		// await new Promise(resolve => setTimeout(resolve, 60 * 1000));
		performance.mark(`load:${name}:start`);

		let module;
		if (typeof asset === "string") {
			module = await import(/* @vite-ignore */ asset);
		} else if (typeof asset === "function") {
			module = await asset(name);
		} else {
			throw new Error(`ce-autoloader: Loader of ${name} is invalid! Should be a url or a function`)
		}

		performance.mark(`load:${name}:end`);
		performance.measure(`load:${name}`, `load:${name}:start`, `load:${name}:end`);

		return next({ name, el, asset, module });
	}

	/**
	 * Called after load, before component definition.
	 * Use for transition effects, since the next() call will change the DOM with the component
	 */
	async afterLoad({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
		this.batches.push(async () => {
			return await next({ name, asset });
		});
	}

	/*
	 * Define a single component
	 * It will be rendered on DOM after this.
	 */
	async define({ name, el, asset }: { name: string, el: Element, asset: string }, next) {
		performance.mark(`define:${name}:start`);
		if (customElements.get(name)) {
			performance.mark(`define:${name}:end`);
			performance.measure(`define:${name}`, `define:${name}:start`, `define:${name}:end`);
			return next({ name, el, asset });
		}

		const { ctor, options } = customElements.waiting[name];
		DEFINE(name, ctor, options);

		performance.mark(`define:${name}:end`);
		performance.measure(`define:${name}`, `define:${name}:start`, `define:${name}:end`);

		return next({ name, asset });
	}

	/**
	 * Use for metrics
	 */
	async finished({ name, el, asset }: { name: string, el: Element, asset: string }, next) {

		return next({ name, el, asset });
	}

	/**
	 * Group multiple ad-hoc define(name, component) calls into a single batched one.
	 * We transition everyone in a single pass.
	 */
	async batchedDefine(jobs: Array<() => Promise<void>>) {
		if (jobs.length === 0) return;

		console.log("flushing", this.batches.length);

		const transition = document.startViewTransition(async () => {
			// run all jobs that mutate DOM in a single pass
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

	/**
	 * Define components in the waiting queue
	 */
	flushDefine() {
		console.log("defines in waiting", Object.keys(customElements.waiting))
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
		delete customElements.waiting[name];
	}

	customElements.waiting = {};
	customElements.define = function (name, ctor, options?) {
		customElements.waiting[name] = { ctor, options };
	};
}


declare global {
	interface CustomElementRegistry {
		waiting: Record<string, { ctor: CustomElementConstructor, options?: ElementDefinitionOptions }>;
	}
	var _DEFINE: typeof CustomElementRegistry.prototype.define;
	var DEFINE: typeof CustomElementRegistry.prototype.define;
}

export default CEAutoLoader
