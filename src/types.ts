/**
 * Error thrown by CEAutoLoader
 */
export class CEError extends Error {
    details: any;

    constructor(message: string, details: any) {
        super(message);
        this.details = details;
    }
}

/**
 * A Loader can be a URL or any function that returns a `Promise<CustomElementConstructor>`
 */
export type Loader = string | ((name: string, el?: HTMLElement) => Promise<CustomElementConstructor>);

/**
 * A catalog maps between `tag-names` and a `loader`.
 *
 * The `loader` is a URL string pointing to a .js file or an function.
 *
 * It's an object, so it can be stored as a json easily, and you can add
 * new components at runtime (for example a/b tests)
 *
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

    /**
     * Read the page's `<script type="importmap">` elements as a catalog source: an
     * entry whose name contains a `-` (e.g. `"nord-qrcode": "https://…"`) is a
     * component.
     *
     * Every map in the document is read, in document order, merged the way the
     * platform merges them — the first map to map a specifier keeps it — and re-read
     * on every lookup, so a map the page appends later is honoured too. An explicit
     * `catalog` entry wins a collision.
     */
    useImportMapsCatalog?: boolean;

    /** Fallback for components with errors */
    fallback?: CustomElementConstructor;

    /**
     * Also paint failures on tags that are *not* in the catalog — useful while
     * debugging a typo'd tag name.
     *
     * A catalog component that fails is always painted, and `hooks.error` is
     * always called. Disabled by default.
     */
    devErrors?: boolean;

    /** Directives are triggers to when the component should be loaded */
    directives?: Directives[];
    /** Overwrite the default directive */
    defaultDirective?: Directives;

    /** Intersection Observer customization. Default: { rootMargin: "20%" } */
    intersectionOptions?: IntersectionObserverInit;

    /**
     * Use the View Transitions API to morph the placeholder into the component.
     *
     * Requires `deferDefine: true` and element-scoped view transition support
     * (Chromium). Disabled by default.
     */
    transition?: boolean;

    /**
     * Shadow root observation. `'auto'` (default) uses `shadow-observer` if the host
     * application imported it (detected via `globalThis[Symbol.for('shadow-observer')]`),
     * native `MutationObserver` otherwise.
     *
     * `true` forces shadow observation (warns if shadow-observer is not loaded).
     * `false` forces native `MutationObserver`.
     */
    shadowObserver?: boolean | 'auto';

    /**
     * Queue `customElements.define` for catalog tags during a load, so a
     * component that registers its own tag still morphs inside the view
     * transition.
     *
     * Disabled by default; `transition: true` requires it.
     */
    deferDefine?: boolean;

    /** Lifecycle hooks of each component */
    hooks?: {
        viewTransition?: {
            ready?: (transition: ViewTransition) => Promise<void>;
            finished?: (transition: ViewTransition) => Promise<void>;
        };
        error?: (error: LoadError) => void;
    };
};

declare global {
    export interface CSSStyleDeclaration {
        viewTransitionClass: string;
    }

    export interface HTMLElement {
        startViewTransition(options: ViewTransitionUpdateCallback | StartViewTransitionOptions): ViewTransition
    }

    export interface CustomElementRegistry {
        queue: Record<string, { ctor: CustomElementConstructor; options?: ElementDefinitionOptions }>;
        flush(): void;
        dequeue(name: string): void;
    }

    export interface ImportMap {
        /**
         * Addresses mappings for top-level imports
         */
        imports?: Record<string, string>;

        /**
         * Allows overriding imports inside specific paths/modules
         */
        scopes?: Record<string, Record<string, string>>;

        /**
         * Metadata providing subresource integrity hashes for modules (optional)
         */
        integrity?: Record<string, string>;
    }
}
