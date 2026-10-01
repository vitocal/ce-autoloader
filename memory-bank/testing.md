# Testing

## Run it

`npm test` → `scripts/run-integration-tests.js`: spawns `npm run dev`, then headless Puppeteer loads
`http://localhost:5173/test/integration.html` (Mocha + Chai; `uhtml` comes from esm.sh, Mocha from unpkg — network
required) and the script exits non-zero on failures, after waiting (30 s) for `window.__MOCHA_DONE__`.

**While iterating, use the Chrome DevTools MCP instead**: start the dev server, open the same URL, then read
`window.__MOCHA_STATS__` and `#mocha-report .test`. You get the same report plus a live console, `customElements`,
`document.getAnimations()` and the demo pages in the same session. `npm test` stays the "CI" entry point.

## Suites

| Suite | What it pins |
| --- | --- |
| `integration.test.js` | start-up upgrade, nested components, `MutationObserver` discovery, the four directives, errors + `fallback` |
| `observability.test.js` | `load:<tag>` exists, is a measure, and its duration ≥ the loader's sleep |
| `transitions.test.js` | the deferred queue: batching, `types: ["ce"]`, styles applied then cleared, hooks; `deferDefine: false` (no patch, no wasted transition, ctor-returning loaders still morph, non-catalog defines untouched, define-error path); self-registering components morph by default |

## Traps (each of these cost real debugging time)

- **Custom elements can never be un-defined.** Give every test its own tag: a re-used tag upgrades synchronously
  and the loader — and its transition — never runs.
- **Declare the transition on the element, not on the state you leave.** The browser reads `transition` from the
  *new* computed style, so a rule that stops matching (`:not(:defined)`) cannot animate the change. Verified with
  `document.getAnimations()`: `[]` versus `["opacity"]`.
- **The viewport is part of the setup.** `visible` (the default) needs the element in view, and the mocha report
  grows during the run — so `#fixtures` is declared before `#mocha`, and tests about something else (errors,
  fallbacks) set `loading="eager"`.
- **Wait for the state.** A failure raised *while defining* surfaces from inside the transition's `update`
  callback, i.e. a frame after a single `requestIdleCallback`; use the `waitFor` helper.
- **The queue is global.** `beforeEach` / `afterEach` restore `customElements.define` and delete
  `queue` / `dequeue` / `flush`, otherwise a later registry queues into an earlier catalog. `afterEach` waits one
  idle frame first, so in-flight `loadAndDefine` chains never call a removed `customElements.flush()`.
- **A correct state is not a painted state.** `ce="loading"` can be set, the shimmer `CSSAnimation` running, and
  the element still invisible — a stylesheet in any *lower* layer saying `visibility: hidden` beats nothing you
  wrote, and `:not(:defined)` matches for the whole of the load. Assert paint with
  `el.checkVisibility({ checkVisibilityCSS: true })`; and remember that pseudo-element animations only show up in
  `el.getAnimations({ subtree: true })` — plain `el.getAnimations()` returns `[]` for them, which reads as "the
  animation isn't running" when it is.
- Elements must live inside `#fixtures`: `runScopedViewTransition` starts the transition on `el.parentElement`.

## Gaps

Chromium only (no WebKit/Firefox matrix, even though `SUPPORTS_SCOPED_VT` splits the code paths) · no unit tests for
the pure helpers · multi-component batches and the plain-define fallback are unverified · the 3 s server-readiness
sleep in the script is a race.

```bash
npm run build                            # must stay clean (types included)
npm test                                 # 24 tests, non-zero exit on failure
npm run dev                              # harness at /test/integration.html
gzip -c dist/ce-autoloader.js | wc -c    # budget check: 3,391 B
```
