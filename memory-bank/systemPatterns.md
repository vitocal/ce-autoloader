# System Patterns — ce-autoloader

## Architecture in one line

`CEAutoLoader` owns a **catalog** and an **observer set**. When a tag becomes eligible (per its directive), the
loader resolves it to a module, imports it, and defines the element — batching definitions per animation frame and
optionally wrapping them in a view transition.

## Main class: `CEAutoLoader` (default export, `src/index.ts`)

`new CERegistry({ catalog, root, live, directives, defaultDirective, fallback, intersectionOptions,
transition, useImportMapsCatalog, hooks })`

| Member | Purpose |
| --- | --- |
| `options` | Merged defaults: `live: true`, `root: document.body`, `directives: ["eager","visible","click"]`, `defaultDirective: "visible"`, `transition: SUPPORTS_SCOPED_VT && !prefers-reduced-motion`, `intersectionOptions: { scrollMargin: "20%" }` |
| `catalog` | `Record<string, Loader>`; when `options.catalog` is falsy the catalog is read from the page's `<script type="importmap">` (`map.imports`) and throws `"Catalog is empty…"` if it has no keys |
| `_resolvers` | (legacy/unused field) runtime resolver map |
| `activeTransition` | Current `ViewTransition`, if any |
| `loading_locks` | `Record<tagName, HTMLElement>` — prevents re-triggering a tag while its module is in flight |
| `#errors` | `Record<tagName, LoadError>` — also used to *skip* mutations for tags that already failed |
| `#observers` | `{ mutation?: MutationObserver, intersection?: IntersectionObserver }` |
| `#initialized` | Guards one-time MutationObserver setup |

### Lifecycle / critical path

1. **constructor** → merges options, resolves catalog, installs the define polyfill
   (`polyfill_defer_define()` when `transition && SUPPORTS_SCOPED_VT`, else
   `polyfill_swallow_alreadyDefined()` and `transition = false`), then `discover()`.
2. **discover(root)** → if `live && !#initialized`: `watchDOMMutations()`; then `upgrade(root, directive)` for
   each configured directive, then `upgrade(root)` for elements with no `loading` attribute. Sets `#initialized`.
3. **upgrade(root, directive)** → `matchCustomElement(root)` (`:not(:defined)` + tag contains `-`), filtered by
   `filterByLoadingAttribute(directive)`, then dispatched by `applyLoadingDirective`:
   - `visible` → lazy-create a single shared `IntersectionObserver` (draining pending entries via `takeRecords()`
     when it already exists) and `observe` each element
   - `click` → `addEventListener("click", when_clicked, { once: true })`
   - `manual` / `eager` → `loadAndDefine(elements)` immediately
   - anything else → `console.error("Invalid directive for upgrade()", …)` (that branch references an undefined
     `ce_elements` identifier)
4. **loadAndDefine(elements)** → `Promise.allSettled(elements.map(load))` → `handleComponentLoadError` for each
   rejection → then `runScopedViewTransition(success, define)` if transitions are on, else
   `Promise.allSettled(success.map(define))` → finally `customElements.flush()` when transitions are on.
5. **load(el)** → resolve loader (`catalog[name]` or wildcard prefix `nord-*`), set `ce="loading"`, register the
   loading lock, `loadModule()`, then `performance.mark/measure` `load:<tag>` (inside `finally`, so it runs on
   error too).
6. **loadModule(name, loader)** → string → `import(/* @vite-ignore */ url)`; function → `loader(name, el)`.
7. **define({name, el, module})** → unwraps ES module namespace (`.default`); with transitions enabled it queues
   via `customElements.define(name, module, {})` + `customElements.dequeue(name)`, otherwise it defines directly;
   sets `ce="defined"`, emits `define:<tag>` timing.
8. **handleComponentLoadError(rejection)** → sets `ce="error"`, `error`, `stack`, `retries` attributes; renders
   `options.fallback` if given, otherwise calls `options.hooks.error`.
9. **runScopedViewTransition** → sets `view-transition-name` (default = tagName) and `view-transition-class`
   (default = `ce`) inline styles, then `el.parentElement.startViewTransition({ types: ["ce"], update })` per
   component, tracking `activeTransition`, resolving `hooks.viewTransition.ready/finished` and clearing the
   inline styles when finished.

### Public API

- `discover(root?)` — set up observers + upgrade everything matching directives.
- `upgrade(root?, directive?)` — upgrade a subtree for a directive (or for elements without `loading`).
- `preload(componentNames[])` — fetch + define tags right now (the module is awaited, `define` is not awaited).
- `retry(el)` — only for `ce="error"` elements; clears `ce`/`error`/`stack`/`retries`, **clears `innerHTML`**
  (known light-DOM-destroying bug), then `loadAndDefine([el])`.
- `clean()` — disconnect all observers (used by tests between suites).
- `getLoader(name)` — public catalog lookup incl. wildcard.
- `polyfill_swallow_alreadyDefined()` / `polyfill_defer_define()` — public, idempotent-ish polyfill installers.

## Key design decisions / patterns

- **Directive dispatch table** (`applyLoadingDirective`) keeps "when to load" orthogonal from "how to load".
- **One shared IntersectionObserver** for all visible elements (created lazily, reused). Note: `upgrade()` builds
  the `visible`/`interaction`/`applyLoadingDirective` closures on every call.
- **Debounced mutations**: `debounceMutations(fn, 100)` accumulates `MutationRecord`s so a burst of DOM writes
  triggers one discovery pass. `characterData` is not observed; a non-standard `shadow: 1` hint is passed
  (native `MutationObserver` ignores unknown options).
- **Loading locks by tag name** — a whole tag is locked while one instance loads; cleared in `finally`.
- **Failure memoization** — `#errors` blocks re-discovery for a tag that already failed, unless `retry()` is used.
- **`ce` attribute as a state machine** — `loading` → `defined` | `error`; all styling hooks are CSS-selectable,
  so skeletons/spinners/fades need no JS.
- **Native telemetry** — `performance.mark`/`measure` with `detail: { name, type, error }`, emitted from
  `finally` blocks so failures are still timed.
- **Idempotent polyfill capture** — `var ORIGINAL_DEFINE = ORIGINAL_DEFINE || customElements.define.bind(customElements)`
  keeps a pristine `define` so repeated evaluation cannot double-wrap the registry. Both polyfills close over
  `ORIGINAL_DEFINE`, never over the patched one.
- **Define-queue pattern** (`polyfill_defer_define`) — replaces `customElements.define` with a queue
  (`customElements.queue` + `dequeue(name)` + `flush()`), letting definitions be batched inside a transition's
  `update` callback. This is the highest-risk part of the library (it patches a DOM standard document-wide).
- **Capability detection** — `SUPPORTS_SCOPED_VT = "startViewTransition" in Element.prototype` is evaluated once
  at module scope.

## Relationship map

- `src/index.ts` (library) ← consumed by `pages/index.js` (docs registry) ← `pages/components/catalog.js`
  (docs catalog) and `index.html` (docs landing page).
- `pages/utils.ts` provides `loadCSSLayer`, `setupImportMap()` (injects `virtual:importmap` as a real
  `<script type="importmap">`) and `adoptStylesheet`.
- `pages/examples/mfe-store/` = micro-frontend demo: `explore` (JSX/Preact team), `decide` (Vue team),
  `checkout` (Svelte team), each with its own catalog/database/router, composed by `components/router.ts`.
- `importmap.json` + `importmap-vite-plugin` supply the bare specifiers used by the docs page and are also the
  runtime catalog source when `useImportMapsCatalog` is set.
- `dist/` = published artifact (`ce-autoloader.js`, `index.d.ts`, `dist.d.ts`); `docs/` = committed GitHub Pages
  build of the demo site.
