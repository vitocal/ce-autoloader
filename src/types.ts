/**
 * Error thrown by CEAutoLoader
 */
export class CEError extends Error {
    details: any;

    constructor(message: string, details: any) {
        super(`CEAutoLoader: ${message}`);
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

    /** Use the page import-map as a catalog */
    useImportMapsCatalog?: boolean;

    /** Fallback for components with errors */
    fallback?: CustomElementConstructor;

    /**
     * Surface errors to the UI (disabled by default, useful in development mode)
     *  - Missing element in the catalog
     *  - Invalid imports
     *  - Exceptions on CustomElement constructor
     */
    devErrors?: boolean;

    /** Directives are triggers to when the component should be loaded */
    directives?: Directives[];
    /** Overwrite the default directive */
    defaultDirective?: Directives;

    /** Intersection Observer customization */
    intersectionOptions?: IntersectionObserverInit;

    /** Use View Transitions API to animate the component upgrade */
    transition?: boolean;

    /**
     * Polyfill customElements.define to support deferring until later
     *
     * Defaults to `true` whenever transitions are enabled and supported.
     */
    deferDefine?: boolean;

    /** Lifecycle hooks of each component */
    hooks?: {
        viewTransition: {
            ready?: (transition: ViewTransition) => Promise<void>;
            finished?: (transition: ViewTransition) => Promise<void>;
        };
        error?: (error: LoadError) => Promise<void>;
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
