import CERegistry from "../src/index.ts";
import catalog from "./components/catalog.js";

import ErrorFallback from "./components/error-fallback.js";

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
