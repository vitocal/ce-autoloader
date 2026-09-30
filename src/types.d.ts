import CEAutoLoader from ".";

declare global {
  interface Window {
    Buffer: any;
    registry?: CEAutoLoader;
  }

  interface CSSStyleDeclaration {
    viewTransitionClass: string;
  }

  interface HTMLElement {
    startViewTransition(options: ViewTransitionUpdateCallback | StartViewTransitionOptions): ViewTransition
  }

  interface CustomElementRegistry {
    queue: Record<string, { ctor: CustomElementConstructor; options?: ElementDefinitionOptions }>;
    flush(): void;
    dequeue(name: string): void;
  }
}

declare module "globe.gl" {
  const Globe: any;
  export default Globe;
}

