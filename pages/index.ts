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
    deferDefine: false,
    transition: false,
    hooks: {
      error: (e) => {
        console.error(e.error.message);
        performance.mark('error')
      }
    }
  });

})

