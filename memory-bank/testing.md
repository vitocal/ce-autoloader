# Testing Strategy — ce-autoloader

## How tests run today

`npm test` → `npm run test:headless` → `node scripts/run-integration-tests.js`:

1. Spawns `npm run dev` (Vite dev server from `vite.docs.js`, port **5173**) and waits 3 s.
2. Launches headless Puppeteer (`puppeteer.launch({ headless: true })`).
3. Forwards page console messages and page errors to the terminal.
4. Navigates to `http://localhost:5173/test/integration.html`.
5. Waits (30 s timeout) for `window.__MOCHA_DONE__ === true`, which `test/integration.html` sets in
   `mocha.run().on('end')`.
6. Scrapes `#mocha-stats` and `.test.fail` from the DOM, prints passes/failures/duration and any failure stacks,
   then `process.exit(1)` on any failure.

There is **no CI** — the script is run manually.

## The harness page: `test/integration.html`

- Loads Mocha from `https://unpkg.com/mocha/mocha.css` / `mocha.js` (**network required**).
- `mocha.setup('bdd')`, then imports both suites as `<script type="module">`.
- Fixtures container `#fixtures` (grid, 320 px tall, bordered) and an `#errors` panel fed by
  `window.onerror` / `unhandledrejection`.
- Global CSS pushes `:not(:defined)` into a dashed, translucent placeholder — this same technique is the
  documented skeleton-screen pattern.
- **Order matters:** `integration.test.js` → `observability.test.js` → `transitions.test.js`, and `mocha.run()`
  runs after all the module scripts have executed. The transitions suite goes **last** because it patches the
  global `customElements.define` queue.

## Suites

### `test/integration.test.js` (suite: `CEAutoLoader`)

Uses Chai `expect` and `uhtml` (`html`) imported from `https://esm.sh/uhtml`. Defines `BaseComp` (sets
`data-upgraded="true"` and renders `Hello World`) and an `error-fallback` component. The catalog defines
`test-component`, `nested-component` (renders a nested `<test-component>`), `dynamic-component`,
`manual-component`, `interaction-component`, `visible-component`, `error-component` (throws).

Cases:

- start-up upgrade of elements already in the DOM
- nested component upgrade
- dynamically added components (MutationObserver path)
- directive sub-suite (`live: false` is used so listeners are attached **synchronously** before dispatch):
  `manual` (via `registry.upgrade(fixtures, "manual")`), `click` (dispatch a `MouseEvent`), `visible`
- Errors sub-suite: `ce="error"` + `error` attribute content, and the `fallback: ErrorFallback` rendering path
  (waits `requestIdleCallback` + 100 ms for the fallback to render)

Conventions worth preserving:

- `beforeEach` empties `#fixtures` and calls `registry?.clean()`; `after()` cleans the last registry so its
  observers/LoadingLocks do not leak into the _next suite_ (this was a real bug fixed by commit `d898c37`).
- Custom elements cannot be un-registered, so tests use distinct tag names and tolerant assertions.
- Comment style: when a test needs `live: false`, the reason is explained inline.

### `test/observability.test.js` (suite: `Observability`)

- Registers an `AutoLoader` for a `perf-test` tag whose loader sleeps 100 ms.
- Asserts `performance.getEntriesByName("load:perf-test")` has ≥ 1 measure, `entryType === "measure"`, and
  `duration >= 100`.

### `test/transitions.test.js` (suite: `Transitions`)

Covers the **deferred define queue** that `transition: true` installs (`polyfill_defer_define`), in two blocks:

- **`blue:` (base cases — behaviour that must keep working)**
  - a catalog component is upgraded through the queue (`data-upgraded`, `ce="defined"`) and a scoped transition
    is started for it
  - the transition runs with `types: ["ce"]`, applies `view-transition-name` / `view-transition-class` on the
    element, fires the `viewTransition.ready` / `finished` hooks, and clears the inline styles afterwards
  - catalog components stay queued until `dequeue()` / `flush()`
  - wildcard catalog names (`nord-*`) are deferred too
- **`green:` (regression — the bug this suite exists for)**
  - a **non-catalog** component is defined immediately instead of queued
  - a non-catalog component rendered on the page upgrades (`whenDefined` resolves; before the fix it hung and
    the test timed out)
  - a pending catalog definition does not hold back a third-party definition

Suite mechanics worth knowing:

- `SUPPORTS_SCOPED_VT` is computed in the test file the same way `src/index.ts` does. On browsers without
  element-scoped view transitions the suite installs a minimal `Element.prototype.startViewTransition` stand-in
  so the `transition: true` path is still exercised (on Chromium it is a no-op).
- `instrumentScopedViewTransitions()` wraps `Element.startViewTransition`, recording the parent, the `types`,
  and the `ready`/`finished` outcomes, so assertions never depend on animation timing.
- **Every test owns its own tag name.** Custom elements can never be un-defined: re-using a tag from a previous
  test upgrades elements **synchronously** and never touches the loader or its transition (this cost a full
  debugging round — the tag was already defined, so no `startViewTransition` was ever called).
- `beforeEach` / `afterEach` restore the pristine `customElements.define` and delete `queue` / `dequeue` /
  `flush`, so every test installs a queue bound to its own catalog (the queue is global, not per instance).
  `afterEach` also waits one idle frame first, so in-flight `loadAndDefine` chains never call a removed
  `customElements.flush()`.
- `ready` fires *after* the update callback, so it can land after `whenDefined` resolves — wait for it
  (`waitFor`) instead of asserting immediately.
- The elements must be attached to `#fixtures`: `runScopedViewTransition` starts the transition on
  `el.parentElement` and needs a rendered parent.

## How to add a test (follow this pattern)

1. Add a catalog entry in the relevant suite with a **unique tag name** (elements stay defined for the page's
   lifetime).
2. Append the element to `#fixtures` _before_ constructing the registry when you are testing initial discovery.
3. Use `live: false` whenever you need synchronous listener/observer setup, and say why in a comment.
4. Await something real: `customElements.whenDefined(tag)`, `registry.upgrade(...)`, or
   `new Promise(requestIdleCallback)` — not arbitrary sleeps (except when the assertion is about timing).
5. Assert on observable contract: `data-upgraded`, `ce` attribute, rendered text, or performance entries.
6. Always `registry.clean()` in `after()`.

## Known test constraints / gaps (mirrors REVIEW.md Tier 1)

- **Chromium-only.** Puppeteer drives Chrome; there is no WebKit/Firefox matrix even though
  `SUPPORTS_SCOPED_VT` distinguishes the two code paths. Testing the _plain-define fallback_ path today means
  overriding `Element.prototype.startViewTransition` or disabling transitions explicitly.
- **Network-dependent.** `uhtml` from `esm.sh`, Mocha from `unpkg`, and the docs catalog's CDN entries all require
  connectivity; there is no lockfile of test assets.
- **No unit tests for pure helpers** (`debounceMutations`, `isCustomElement`, `isModule`, `matchCustomElement`,
  wildcard resolution) — they are only exercised indirectly.
- **Transitions are now covered** by `test/transitions.test.js` (queue batching, the `ce` transition type,
  styles applied/cleared, hooks). Still untested: the *plain-define fallback* path (browsers without
  element-scoped view transitions), and multi-component batches — two components in one batch start two
  transitions on the same parent, the browser skips the later one, and `transition.ready` rejects with
  `AbortError: Transition was skipped`, which currently leaks as an unhandled rejection
  (`progress.md` known issue #15).
- **No stress fixture** (the 1–2k element discovery-cost scenario) yet.
- The 3 s `setTimeout` for server readiness in `run-integration-tests.js` is a race; a health-check poll would be
  more robust. The script can also leave a Vite process running if it dies early.
- `analyze_report.cjs` is a Lighthouse JSON summarizer used manually against `lighthouse-report.json`
  (gitignored) — not part of `npm test`.

## Manual verification commands

```bash
npm run build                    # library build must stay clean (dts rollup included)
npm test                         # Puppeteer + Mocha suite
npm run dev                      # then open http://localhost:5173/ and /test/integration.html
gzip -c dist/ce-autoloader.js | wc -c    # byte-budget check (3,258 bytes / 3.25 kB gzip after the queue fix)
```
