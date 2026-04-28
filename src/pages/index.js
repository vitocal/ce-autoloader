/** We import it before the registry, so it's
 * loaded before the first discover.
 */
import ErrorFallback from "/src/components/error-fallback.js";

import CERegistry from "/src/index.js";
import catalog from "/src/components/catalog.js";

globalThis.registry = new CERegistry({
  catalog: catalog,
  root: document.body,
  live: true,
  fallback: ErrorFallback,
  defaultDirective: "visible",
  transition: true,
});
