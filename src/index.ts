/**
 * A module can be a URL or a function that returns a Promise<CustomElementConstructor>
 */
export type CEAutoLoaderModule = string | ((name?: string) => Promise<CustomElementConstructor>)
export type CEAutoLoaderCatalog = Record<string, CEAutoLoaderModule>;

export type CEAutoLoaderLoadResult = {
	name: string;
	el: HTMLElement;
	loader?: CEAutoLoaderModule;
	module?: CustomElementConstructor;
}

export type CEAutoLoaderDirectives = "eager" | "visible" | "click" | string
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

	/** Use View Transitions API to animate the component upgrade */
	transition?: boolean;
}

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
	return element instanceof HTMLElement && element.tagName.includes("-")
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
	const selector = ':not(:defined)'
	return [...new Set([root, ...root.querySelectorAll(selector)])]
		.filter((el) => isCustomElement(el)) as HTMLElement[]
}

class CEAutoLoader {
	options: CEAutoLoaderOptions;
	catalog: CEAutoLoaderCatalog = {};

	// Resolvers matched against tags at runtime.
	_resolvers: Record<string, CEAutoLoaderModule> = {};

	// Mutation and Interaction Observers
	#observers: Record<string, MutationObserver | IntersectionObserver> = {};
	#initialized: boolean = false;

	// Active view transition
	activeTransition?: ViewTransition;

	constructor(options: CEAutoLoaderOptions) {
		if (!options.catalog) {
			throw new Error("CEAutoLoader needs a catalog to start")
		}

		this.options = {
			live: true,
			root: document.body,
			directives: ["eager", "visible", "click"],
			defaultDirective: "visible",
			transition: true,
			...options
		};
		this.catalog = options.catalog;

		if (!globalThis.DEFINE) {
			monkeyPatchDefine();
		}
	}



	/**
	 * Watch for new elements in the DOM
	 */
	private watchDOMMutations() {
		const observer = new MutationObserver(debounceMutations(this.watcher.bind(this), 100));

		observer.observe(this.options.root || document.body, {
			childList: true,
			subtree: true,
			characterData: true
		});

		this.#observers['mutation'] = observer;

		return;
	}
	private async watcher(mutations: MutationRecord[]) {
		// await this.discover();
		for (const mutation of mutations.filter((m) => m.type === 'childList')) {
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

	/**
	 * Some filters to avoid duplicates
	 */
	private filterByDirective(elements: HTMLElement[], directive?: CEAutoLoaderDirectives) {
		if (!directive) {
			return elements.filter((el) => !el.hasAttribute("loading"));
		}

		return elements.filter((el) => (el.getAttribute("loading") == directive))
	}

	private uniqueByTag(elements: HTMLElement[]) {
		const seen = new Set();
		const unique = [];

		for (const el of elements) {
			const tag = el.tagName;
			if (!seen.has(tag)) {
				seen.add(tag);
				unique.push(el);
			}
		}

		return unique
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
	 * Discover the custom elements in the `root` and upgrade them lazily
	 */
	async discover() {

		if (!this.#initialized && this.options.live) {
			this.watchDOMMutations();
		}

		// Load elements that matches directives
		for (const directive of this.options.directives ?? []) {
			this.upgrade(directive)
		}

		// Load everyone else right away
		const result = await this.upgrade();

		this.#initialized = true;

		return result;
	}

	/**
	 * Upgrade the custom elements using the given `directive`.
	 *
	 * @param directive - Filter by elements that matches the given directive (eg: `loading="visible"`),
	 * If directive is null, will upgrade all elements in the `this.#options.root`.
	 *
	 * To manually upgrade elements, use the `loading="manual"` attribute, but it
	 * can be any string really. Then call `registry.upgrade("manual")` to upgrade all elements with that attribute.
	 */
	async upgrade(directive?: CEAutoLoaderDirectives) {

		const ce_elements = matchCustomElement(this.options.root || document.body)
		const elements = this.filterByDirective(ce_elements, directive)

		const visible = (elements: HTMLElement[]) => {
			// Create observer if it doesn't exist
			if (!this.#observers['intersection']) {
				this.#observers['intersection'] = new IntersectionObserver((entries) => {
					let html_elements = entries
						.filter((entry) => (entry.isIntersecting))
						.filter((entry) => !customElements.get(entry.target.tagName.toLowerCase()))
						.map((entry) => entry.target as HTMLElement)

					if (html_elements.length > 0) {
						this.loadAndDefine(html_elements, "visible")
					}
				});
			}

			return elements.map((el) => this.#observers['intersection'].observe(el))
		}

		const interaction = (elements: HTMLElement[]) => {
			return elements.map((el) => {
				return el.addEventListener("click", async () => {
					await this.loadAndDefine([el], "click")
				}, { once: true });
			})
		}

		// Directives apply special conditions to when the component is loaded
		if (directive === "visible") {
			return visible(elements);
		} else if (directive === "click") {
			return interaction(elements);
		} else if (directive === "eager") {
			return await this.loadAndDefine(elements, "eager")
		} else if (directive === undefined || directive === null) {
			// Use defaultDirective if it's not specified
			if (this.options.defaultDirective === 'visible') {
				return visible(elements)
			} else if (this.options.defaultDirective === "click") {
				return interaction(elements)
			} else if (this.options.defaultDirective === 'eager') {
				return await this.loadAndDefine(elements, "eager")
			}
		} else {
			return await this.loadAndDefine(elements, directive)
		}
	}




	/*
	* Load and define components
	*/
	async loadAndDefine(comps: HTMLElement[], source: string) {

		let elements = comps.filter((el) => {
			const on = el.getAttribute("loading")
			return (on === source || on === null)
		})

		if (elements.length === 0) {
			return [];
		}

		const load_result = await Promise.allSettled(elements.map((el) => this.load(el)))

		const load_success = load_result.filter((result) => result.status === "fulfilled")
		const load_fail = load_result.filter((result) => result.status === "rejected")

		// Fallback for failed loads
		if (this.options.fallback) {
			await Promise.allSettled(load_fail.map((result) => {
				const origin = result.reason.details;
				console.error(result.reason.message);

				// We must clone, because browsers don't allow to define the same class twice
				let fallback_cloned = class ClonedFallback extends this.options.fallback!{ }

				origin.el.setAttribute('error', result.reason.message);
				origin.el.setAttribute('stack', result.reason.stack);
				this.define({ name: origin.name, el: origin.el, module: fallback_cloned })
			}))
		}

		const defineComponents = async (source?: string) => {
			await Promise.allSettled([
				...load_success.map(async (result) => this.define(result.value)),
			])
		}

		if (this.options.transition && document.startViewTransition) {
			const transitions = load_success.map((result) => result.value)
				.map((result) => {
					const { el } = result;
					const transitionName = el.getAttribute('view-transition-name');
					const transitionClass = el.getAttribute('view-transition-class');

					if (transitionName) {
						el.style.viewTransitionName = transitionName;
					}
					if (transitionClass) {
						el.style.viewTransitionClass = transitionClass;
					}

					return result;
				})

			if (this.activeTransition) {
				await this.activeTransition.finished;
			}

			// const transition_name = transitions.map((result) => result.el.getAttribute('view-transition-name')).join('-');
			const transition_name = "wherever";
			performance.mark(`transition-${transition_name}:start`);
			this.activeTransition = document.startViewTransition(async () => await defineComponents(source));
			await this.activeTransition.updateCallbackDone;
			performance.mark(`transition-${transition_name}:end`);
			performance.measure("transition", `transition-${transition_name}:start`, `transition-${transition_name}:end`)

			transitions.map((result) => result.el)
				.map((el) => {
					el.style.viewTransitionName = "";
					el.style.viewTransitionClass = "";
				})
		} else {
			await defineComponents(source);
		}

		return load_result;
	}

	/**
	 * Load a single component
	 */
	async load(el: HTMLElement): Promise<CEAutoLoaderLoadResult> {
		const name = el.tagName.toLowerCase()

		let loader = this.catalog[name] || this.getWildcardResolver(name)
		if (!loader) {
			throw new CEError(`Component ${name} not found in catalog`, { name, el })
		}

		let module;
		let before_imports = { ...customElements.waiting };

		try {
			performance.mark(`load:${name}:start`);

			el.setAttribute('ce', "loading");

			if (typeof loader === "string") {
				module = await import(/* @vite-ignore */ loader);
			} else if (typeof loader === "function") {
				module = await loader(name);
			} else {
				throw new CEError(`Loader of ${name} is invalid! Should be a url or a function`, { name, el, module })
			}
		} catch (error: any) {
			throw new CEError(`${name} - ${error.message}`, { name, el, module, error });
		} finally {
			performance.mark(`load:${name}:end`);
			performance.measure(`load:${name}`, `load:${name}:start`, `load:${name}:end`);
		}

		// Support for components defining it's dependencies upfront
		let after_imports = customElements.waiting;
		let diff_imports = Object.keys(after_imports)
			.filter((key) => !Object.keys(before_imports).includes(key))
			.filter((key) => key !== name);

		for (const element of diff_imports) {
			DEFINE(element, customElements.waiting[element]['ctor'], {})
		}

		return { name, module, loader, el }
	}


	/**
	 * Define a single component
	 */
	async define({ name, el, module }: CEAutoLoaderLoadResult) {
		/**
		 * The loader may return a `HTMLCustomElement`,
		 * or it may define the element itself (customElements.define).
		 */
		if (customElements.waiting[name]) {
			module = customElements.waiting[name]['ctor']
		} else {
			if (!module) {
				throw new CEError(`Component ${name} wasn't defined! This is a bug!!!`, { name, el, module })
			}
		}

		try {
			performance.mark(`define:${name}:start`);

			DEFINE(name, module, {});
		} catch (error: any) {
			throw new CEError(`${name} - ${error.message}`, { name, el, module, error });
		} finally {
			el.setAttribute("ce", "defined");

			performance.mark(`define:${name}:end`);
			performance.measure(`define:${name}`, `define:${name}:start`, `define:${name}:end`);
		}

		return { name, module, el }
	}

	/**
	 * Matches a component name to a wildcard resolver (if exists)
	 * e.g. "nord-button" -> "nord-*"
	 */
	private getWildcardResolver(name: string): CEAutoLoaderModule | null {
		const [prefix, _comp_name] = name.split('-');
		return this.catalog[`${prefix}-*`];
	}

	/**
	 * Define components in the waiting queue.
	 */
	public flushDefineQueue() {
		requestAnimationFrame(() => {
			if (Object.keys(customElements.waiting).length > 0) {
				Object.entries(customElements.waiting)
					.filter(([name]) => !customElements.get(name))
					.map(([name, { ctor, options }]) => DEFINE(name, ctor, options))
			}
		})
	}

}

/**
 * The original customElements.define is patched to allow queueing.
 * It needs another call `DEFINE` to actually define the component.
 *
 * This allows ce-autoloader to schedule the definitions of components, making animations smoother
 * Otherwise, the define() calls will be executed one by one, and the animation will be janky.
 *
 * Note that it's global, so it will affect all components in the app that are defined after ce-autoloader.
 * They'll be still available at `customElements.waiting` and you can define anytime with `flushDefineQueue()`
 */
function monkeyPatchDefine() {
	globalThis._DEFINE = customElements.define.bind(customElements);
	globalThis.DEFINE = (name, ctor, options) => {
		if (customElements.get(name)) return;

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
