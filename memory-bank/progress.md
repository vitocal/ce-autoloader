# Progress — ce-autoloader

_Status snapshot: 2026-09-30, branch `tier0-fixes` @ `d898c37`, package v0.1.2._

## What works

- **Core loader**: catalog resolution (string URL + function loader), wildcard resolvers (`nord-*`), lazy
  `import()`, per-tag loading locks, definition batching, `clean()`.
- **Discovery**: initial scan of `:not(:defined)` custom elements, MutationObserver-driven live discovery with a
  100 ms debounce, subtree watching.
- **Directives**: `eager`, `visible` (IntersectionObserver, 20% scroll margin), `click`, `manual` (plus custom
  directive values via `upgrade(root, value)`).
- **Lifecycle states**: `ce="loading" | "defined" | "error"` for CSS styling; the `:not(:defined)` skeleton
  pattern is demonstrated in `index.html` and `test/integration.html`.
- **Transitions**: element-scoped `startViewTransition` with `types: ["ce"]`, per-element
  `view-transition-name` / `view-transition-class`, `ready` / `finished` hooks, capability guard + plain-define
  fallback.
- **Deferred define queue (safe)**: with transitions on, `customElements.define` is queued so definitions can be
  batched (`customElements.queue` / `dequeue()` / `flush()`). Only tags that resolve through `getLoader()` are
  deferred — across **every** registry that installed the queue — and everything else (third-party scripts,
  modules registering extra tags) is forwarded to the original `define` immediately. `dequeue()` is idempotent,
  and `clean()` opts a registry out. Verified end-to-end by `test/transitions.test.js`.
- **Observability**: `performance.mark/measure` for `load:<tag>` and `define:<tag>` with error detail; covered by
  `test/observability.test.js`.
- **Error handling**: `ce="error"` + `error`/`stack`/`retries` attributes, `fallback` component rendering,
  `hooks.error`, `retry(el)`.
- **Import-map catalog**: `useImportMapsCatalog` (and the `?autoload` URL canary) builds the catalog from the
  page's own `<script type="importmap">`.
- **Packaging**: ESM-only, `exports`/`main`/`module` → `dist/ce-autoloader.js`, types `dist/dist.d.ts`,
  `sideEffects: false`, `shadow-observer` external. `npm run build` verified clean on 2026-09-30 (after the
  define-queue fix): Vite reports `9.46 kB` raw / `gzip: 3.25 kB`, and `gzip -c dist/ce-autoloader.js` is
  **3,258 bytes** — the "3 KB" claim holds (REVIEW.md's 3,286-byte figure is slightly stale).
- **Docs/demo site**: Vite MPA build into `docs/` (GitHub Pages) — React/Vue/Svelte/Lit/Stencil/Preact/vanilla
  components, Three.js cube, `globe.gl`, `model-viewer`, confetti, QR code, observable plots, live performance
  plot, framework comparison demos.
- **MFE store example**: `pages/examples/mfe-store/` with three independent "teams" (explore/decide/checkout),
  own catalogs + routers, composed without a shared runtime.
- **Test harness**: `npm test` boots Vite dev + headless Puppeteer + Mocha and exits non-zero on failure.

## What is left to build

### Tier 0 — correctness (in progress on `tier0-fixes`)

- [x] Await fix in `runScopedViewTransition`
- [x] Element-scoped view transition guard + plain-define fallback
- [x] Packaging (ESM-only, `sideEffects: false`, external `shadow-observer`)
- [ ] Define-queue safety — **partially done**: non-catalog forwarding + multi-registry `getLoader()`
      consultation + idempotent `dequeue()` + `clean()` opt-out (tested). **Open:** opt-in patch.
- [ ] Non-destructive `retry()` (stop clearing `innerHTML`)
- [ ] Completion signals: `ce:load` / `ce:error` events + `registry.whenLoaded(tag)`

### Tier 1 — credibility

- [ ] Docs truth pass (directive list, queue semantics, real VT browser support, working "Documentation" link)
- [ ] Pin versions + add import-map `integrity` (drop `@latest`)
- [ ] Reproducible performance harness (replace the Core Web Vitals screenshot)
- [ ] Cross-browser test matrix (Chromium + WebKit + Firefox)
- [ ] Stress fixture (~1–2k elements) to measure discovery cost; scope rescans to mutated subtrees
- [ ] Trim observer cost (stop per-tag suppression via the mutation target's tag name)
- [ ] Keep error text/stack out of DOM attributes (or document the trade-off)

### Tier 2 — direction

- [ ] Write the standards proposal (`WICG/webcomponents#782`) using this implementation as evidence
- [ ] License decision (permissive vs GPL) + contribution/support policy
- [ ] Lean into differentiators: declarative directives, `ce` CSS state machine, native telemetry, per-team
      catalogs, no-build import-map catalogs

### Future directions already sketched in `REVIEW.md`

Connection-aware loading (`saveData`, `effectiveType`), component dependency hints (`modulepreload`), page/route
byte budgets, integrity + pinning as first-class features, and eventual delegation to a native
`customElements.defineLazy` / `MountObserver`.

## Known issues

| # | Issue | Where | Status |
| --- | --- | --- | --- |
| 1 | `getMutationObserver()` always returns native `MutationObserver` because the `finally` block returns, overriding the `try` — `ShadowObserver` is never used, so shadow-root discovery is effectively dead | `src/index.ts` → `getMutationObserver` | **Unfixed (observed)** |
| 2 | Global `customElements.define` patch: `customElements.get()` still returns `undefined` for classes it queued, `whenDefined()` only settles after `dequeue()`, and the patch is not opt-in. **Fixed here:** non-catalog definitions are forwarded to the original `define` (no more silent non-upgrades), the deferral decision consults `getLoader()` across `DEFERRED_REGISTRIES`, `dequeue()` is idempotent, `clean()` opts out | `polyfill_defer_define` / `polyfill_swallow_alreadyDefined` | Partially fixed (opt-in still open) |
| 3 | `retry()` clears `innerHTML`, destroying slotted light DOM and server-rendered fallbacks | `retry()` | Tier 0 open |
| 4 | Mutation watcher skips by the mutation *target's* tag name, so one failed `<x-foo>` can suppress discovery for the `x-foo` tag elsewhere on the page | `watcher()` + `#errors` | Tier 1 |
| 5 | `REVIEW.md` reported `characterData: true`; the current source observes only `childList` + `subtree` (plus a non-standard `shadow: 1` that native observers ignore), and a full-root `querySelectorAll` runs on every batch | `watchDOMMutations()` | Tier 1 |
| 6 | Error message + stack trace are written into DOM attributes (leak/injection surface if any template echoes them) | `handleComponentLoadError` | Tier 1 |
| 7 | No `ce:load`/`ce:error` events and no completion promise — consumers must poll or observe attributes | whole library | Tier 0 open |
| 8 | `prefers-reduced-motion` is checked once in the constructor, not per element | constructor | Open |
| 9 | Invalid-directive branch logs an undefined identifier (`ce_elements`) | `applyLoadingDirective` | Minor typo |
| 10 | `importmap.json` pins every CDN entry to `@latest`; no `integrity` | `importmap.json` | Tier 1 |
| 11 | `custom-elements.json` is declared in `package.json` but never generated; `@custom-elements-manifest/analyzer` is unused | packaging | Open |
| 12 | Stencil Vite plugin is imported but never registered in `vite.docs.js` | `vite.docs.js` | Dead import |
| 13 | No CI; performance claims rest on a screenshot; the test suite requires network (`esm.sh`, `unpkg`) | repo/infra | Tier 1 |
| 14 | GPL-3.0 blocks some corporate adoption | `LICENSE` | Tier 2 (deliberate) |
| 15 | A skipped view transition rejects `transition.ready` (`AbortError: Transition was skipped`) and the library attaches no rejection handler → unhandled promise rejection (observed as a Puppeteer `pageerror` + entry in the harness `#errors` panel). Happens whenever two components in one batch transition on the same parent | `runScopedViewTransition` | Open (fix suggested in `activeContext.md`) |

## Evolution of decisions

- **v0.1.x is pre-1.0** — the API may still move, and the docs have lagged behind `src/index.ts` before (a stale
  `upgrade(tag)` signature plus nonexistent `autoDiscover` / `hover` options in older READMEs).
- The transition strategy moved from **document-scoped** `document.startViewTransition` (the commented-out
  `runViewTransition` is kept in source as history) to **element-scoped** `parentElement.startViewTransition`.
  That narrowed support to Chromium, which is exactly why the `SUPPORTS_SCOPED_VT` guard became a Tier 0 fix.
- The define polyfill was refactored to be **idempotent** (`ORIGINAL_DEFINE` capture) and to *defer* definitions
  (queue) instead of only swallowing "already defined" errors — a prerequisite for batching definitions inside a
  transition's `update` callback.
- Micro-frontend support (per-team catalogs, no shared runtime) was validated by the `mfe-store` example and is
  treated as the strongest "expert/team" differentiator.
- `REVIEW.md` itself is a deliberate artifact: an honest, updateable review whose tiered TODO list is the working
  backlog. Keep its checkboxes in sync with reality.
