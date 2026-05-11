/** We import it before the registry, so it's
 * loaded before the first discover.
 */

import CERegistry from "/src/index.js";
import catalog from "@/components/catalog.js";

import ErrorFallback from "@/components/error-fallback.js";

globalThis.registry = new CERegistry({
  catalog: catalog,
  root: document.body,
  live: true,
  fallback: ErrorFallback,
  defaultDirective: "visible",
  transition: true,
});
