import CERegistry from "../src/index.ts";
import catalog from "./components/catalog.js";

import ErrorFallback from "./components/error-fallback.js";
import { mountLifecycleTimeline } from "./components/ce-timeline.js";

/**
 * Stretch the demo panels' fetch so the `loading` state is watchable.
 * Only the `ce-reveal` loader reads it (pages/components/catalog.js).
 */
(globalThis as any).CE_DEMO_DELAY = 1200;

document.addEventListener('DOMContentLoaded', () => {
  // Watch first: the registry paints `loading` on the first intersection, which
  // is a task later, so the timeline never misses the opening state.
  mountLifecycleTimeline({ container: "#ce-timeline" });

  globalThis.registry = new CERegistry({
    catalog: catalog,
    fallback: ErrorFallback,
    deferDefine: true,
    transition: false,
    hooks: {
      error: (e) => {
        console.error(e.error.message);
        performance.mark('error')
      }
    }
  });

})

