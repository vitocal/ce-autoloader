import CERegistry from "/src/index.ts";
import catalog from "@/components/catalog.js";

import ErrorFallback from "@/components/error-fallback.js";

globalThis.registry = new CERegistry({
  catalog: catalog,
  fallback: ErrorFallback,
  deferDefine: true,
  transition: true,
});
