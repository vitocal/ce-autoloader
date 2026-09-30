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
- **Order matters:** `integration.test.js` must register before `observability.test.js`, and `mocha.run()` runs
  after both module scripts have executed.

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
- **Transitions are effectively untested**: no test asserts that `runScopedViewTransition` awaits definitions or
  that `view-transition-name`/`-class` are applied then cleared, even though that was a Tier 0 fix.
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
gzip -c dist/ce-autoloader.js | wc -c    # byte-budget check (~3286 bytes)
```
