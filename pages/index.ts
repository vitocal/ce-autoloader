import CERegistry from "../src/index.ts";
import catalog from "./components/catalog.js";

import ErrorFallback from "./components/error-fallback.js";

/**
 * Stretch the demo panels' fetch so the `loading` state is watchable.
 * Only the `ce-reveal` loader reads it (pages/components/catalog.js).
 */
(globalThis as any).CE_DEMO_DELAY = 1200;

document.addEventListener('DOMContentLoaded', () => {
  globalThis.registry = new CERegistry({
    catalog: catalog,
    fallback: ErrorFallback,
    deferDefine: true,
    transition: false,
    hooks: {
      load: async (name, el) => {
        return import("./components/vi-example.js");
      },
      error: (e) => {
        console.error(e.error.message);
        performance.mark('error')
      }
    }
  });

})

