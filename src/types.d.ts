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
    waiting: Record<string, { ctor: CustomElementConstructor; options?: ElementDefinitionOptions }>;
    registered: Record<string, { ctor: CustomElementConstructor; options?: ElementDefinitionOptions }>;
  }

  var _DEFINE: typeof CustomElementRegistry.prototype.define;
  var DEFINE: typeof CustomElementRegistry.prototype.define;
}


declare module "qrcode-pix" {
  interface QrCodePixParams {
    version: string;
    key: string;
    name: string;
    city: string;
    transactionId: string;
    message?: string;
    value: number;
    [key: string]: any;
  }

  interface QrCodePixResult {
    payload: () => string;
    base64: () => Promise<string>;
  }

  export function QrCodePix(params: QrCodePixParams): QrCodePixResult;
}

declare module "globe.gl" {
  const Globe: any;
  export default Globe;
}

