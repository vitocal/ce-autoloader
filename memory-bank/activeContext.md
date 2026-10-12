# Active context

_2026-10-12 · branch `option-deferDefine` @ `f3b0c57`, plus working-tree changes across `src/index.ts`, the tests, the
docs, the import map (`importmap.src.json` → `importmap.json`) and this bank (the types split and the demo wiring
landed earlier)._

## Right now

**The defaults went lean: nothing is deferred, nothing animates — but every registry still patches
`customElements.define`, to make it _idempotent_ (`polyfill_safe_ce_define`), not to queue. The failure model was
reworked — and as of this pass the README and `types.ts` match it.**

- ✅ **README review pass (2026-10-12)** — the README's garbled `deferDefine` comment is fixed (the "…its own tag still morphs…"
  fragment had lost its subject; it now matches `src/types.ts`), along with a stray-space slip in the transition paragraph,
  "Chromium-only" → **Chromium 147+**, and the byte figures in `REVIEW.md` and `techContext.md` (both said ~3,3xx B; the real
  number was 3,378 B gzip / 9,833 B raw). `REVIEW.md`'s "anything unknown falls through to an immediate load" is wrong — an
  unhandled directive hits the `console.error` branch and loads nothing (and `ce_elements` *is* in scope there — declared at
  `index.ts:367`, before the only call at 368 — so the bank's "undefined" reading was wrong). The `Options` block now carries
  `useImportMapsCatalog` and `shadowObserver`, the import-map paragraph is rewritten, and the "Smart Scheduling" / Use Cases copy
  is trued up. Still open, logged in `REVIEW.md` Tier 1: the README never discloses the global `customElements.define` patch, has
  no CDN / `?autoload` quickstart, says "3kb gzipped" (really 3,467 B), and the "Documentation" link points at the demo root.
- ✅ **`?autoload` fixed — issue #19 (2026-10-12).** The flag was inverted: `useImportMapsCatalog: true` took
  `this.catalog = options.catalog`, so with no `catalog` the registry held `undefined` and `getWildcardResolver` threw
  `TypeError: Cannot read properties of undefined (reading '<prefix>-*')` — `?autoload` never loaded a thing (the *default* path
  was the one that read the import map). **Settled semantics (2026-10-12):** the flag is literal — `true` reads the page's
  `<script type="importmap">` and merges it *under* `catalog` (`false`, the default, ignores the map entirely), and only the
  **first** import map in the document is read (`querySelector`). `getWildcardResolver` is null-safe. Covered by
  `test/importmap.test.js` (7 tests: load from the map, ignore by default, dashed-names-only, merge + catalog wins, first-map-wins,
  late map ignored, no map at all) and `npm test` **44 × 3 green**; `tsc --noEmit` clean. `dist/` rebuilt →
  **10,125 B raw / 3,467 B gzip**.

- ✅ **`<web-vitals>` on the docs home page (2026-10-12)** — the FAQ's stale Lighthouse screenshot is now a live
  Core Web Vitals panel (`pages/components/web-vitals.js`, catalog entry `"web-vitals"`, `loading="eager"`). Every
  number comes from `web-vitals@6.2.3` — pinned in `importmap.src.json`, SRI-checked, installed as a devDep (Vite's
  dev server cannot resolve a bare import that only exists in the import map), and excluded from `optimizeDeps` so the
  browser resolves it. **`reportAllChanges: true` is load-bearing**: without it the library withholds LCP and CLS until
  the page is hidden or the user interacts, and a panel nobody has touched sits empty. The headline is CrUX's
  pass/fail, computed only over the metrics the engine can actually observe — `layout-shift` is Chromium-only, so
  Firefox and Safari report CLS as `n/a` instead of "measuring…" forever. TBT and Speed Index were built and then
  **dropped on request**; with them went the Lighthouse score, which is *defined* as a weighted mean over all five
  metrics and would have been a lie over three. Verified on Chromium/Firefox/WebKit, in dev and against a production
  build; the 37 library tests still pass.

- Defaults: `deferDefine: false`, `devErrors: false`, and `transition` derived from the **raw** `options.deferDefine`
  — so `new CEAutoLoader({ catalog })` takes the safe-define path. `transition: true` without `deferDefine: true`
  now **throws `SyntaxError`**.
- Failures: `#errors` is gone; the tag is painted `ce="error"` and the fallback is **appended** (no more
  `innerHTML = ""`); the message moved off the element's attributes onto the fallback instance's `.error` / `.stack`.
  `devErrors` now _extends_ painting to non-catalog tags instead of suppressing it (verified live).
- Types split into `src/types.ts` (a real module exporting `CEError`); `src/types.d.ts` deleted. `tsc --noEmit` is
  **clean** — issue #12 fixed.
- Demos: the docs site and the CSS page pin `transition: false, deferDefine: false`.
- ✅ **`dom_watcher` fixed** — the guard now reads `=== 'error'` (was `!=`), so mutations are skipped only on targets
  that already failed. Verified in a browser: a catalog tag appended after the observer is installed upgrades
  (`ce="defined"`).
- ✅ **`loadAndDefine` reporting fixed (#15/#16)** — a load failure is reported **once** (the step-5 re-run of the same
  list is gone) and a define failure is reported from the actual define `allSettled` results in **both** paths. Verified
  in a browser: a failing load and a failing `define()` each call `hooks.error` once, and a define failure now paints
  `ce="error"` (it used to be swallowed, leaving `ce="loading"`).
- ✅ **Transition cleanup fixed** — `transition.finished` was handled _after_ `await transition.updateCallbackDone`, so a
  failing update skipped it: `view-transition-name` / `-class` leaked and `finished` rejected unhandled. The handler is
  attached before the await now.
- ✅ **Docs trued up** — README (`transition` / `deferDefine` / `devErrors`, the error-state prose, "Deferred
  Definitions", "Failure reporting", browser support), the `src/types.ts` option comments, and the stale claims in
  `REVIEW.md`.
- ✅ **Duplicate fallback fixed (#18)** — a failed `visible` component stays `:not(:defined)`, so the shared IntersectionObserver kept re-delivering it; `load()` then overwrote `ce="error"` with `ce="loading"`, defeating `handleComponentLoadError`'s guard and appending a **new** fallback on every re-intersection. The demo's `<vi-error>` grew one `<error-fallback>` per scroll pass (reproduced live: 1 → 6). `when_visible` now skips `ce="error"` targets, mirroring `dom_watcher`. Regression test added.
- ✅ **`intersectionOptions` default corrected (#8)** — the issue claimed `scrollMargin` "is ignored — the real option is `rootMargin`". Refuted: `scrollMargin` is a valid `IntersectionObserverInit` member and *is* honored (Chrome 120+/FF 141+/Safari 26+), but it is Baseline-newly-available (Sept 2025, **87.94%** global) and silently ignored on the rest, so the 20% preload margin was a no-op there. The default is now `rootMargin: "20%"` (Baseline since 2019). `intersectionOptions` is still forwarded verbatim, so callers may pass `scrollMargin` for nested scrollers. Regression tests added (default + custom pass-through, capturing the observer through an `IntersectionObserver` spy).
- ✅ **Shadow-observer integration fixed (#1)** — `getMutationObserver()` had a `return` inside `finally` that always won, so `shadow-observer` was awaited and discarded. Replaced with synchronous `globalThis[Symbol.for('shadow-observer')]` detection: the host app imports the module (optional peer dep), the library detects it. `shadow: 1` (OPEN only) → `shadow: 3` (OPEN | CLOSED). `dom_watcher` ShadowRoot guard fixed to not throw on ShadowRoot targets. New `shadowObserver` option (`'auto' | true | false`) for explicit control. BLUE/GREEN tests confirm: without shadow-observer, components inside shadow roots are ignored; with it, both open and closed shadow roots are reached.
- ✅ **A swallowed constructor collision is reported now (2026-10-12)** — `polyfill_safe_ce_define` guards on the tag
  *name*, so a foreign constructor that wins the race is silent: the platform's `NotSupportedError` never fires and the
  tag is painted `ce="defined"`. `define()`'s "already defined" branch calls `hooks.error` when
  `customElements.get(name) !== module`. Hook only — no `ce="error"`, no fallback: the element is live, so painting it
  broken would be a lie. The check lives in `define()`, not the polyfill, because `define()` is the only place holding
  the constructor to compare. Regression test in `test/integration.test.js`.
- ✅ **Docs/code name drift fixed** — the polyfill is `polyfill_safe_ce_define`; `README.md`, `REVIEW.md` and this bank
  called it `polyfill_safe_define`. The method is public API (`dist/index.d.ts`), so the docs moved, not the code.
- ✅ **Puppeteer → Playwright (2026-10-12)** — `scripts/run-integration-tests.js` now drives the same in-browser Mocha
  harness through Playwright, one pass per browser: `chromium`, `webkit` (Safari engine) and `firefox` by default, plus
  the branded `chrome` / `msedge` channels via `--browser=all`. A browser that is not installed is *skipped* with an
  install hint; `--strict` turns a skip into a failure. Every run probes the API floor (custom elements, ES modules,
  import maps, `IntersectionObserver`, `requestIdleCallback`, element-scoped view transitions) **before** the suites
  run — `transitions.test.js` polyfills `startViewTransition`, so a later probe would report the polyfill, not the
  engine. `test/integration.html` now shims `requestIdleCallback`: Safari has never enabled it (see `techContext.md`).
- ✅ **`importmap.json` is jspm-generated now (2026-10-12)** — issue #10. `importmap.src.json` holds the pinned CDN
  URLs; `npm run importmap` (`@jspm/generator`) writes `importmap.json` = `{ imports, integrity }` (16 imports, **41
  integrity entries**). `scripts/vite-plugin-importmap.js` replaces `importmap-vite-plugin` — the old plugin could only
  carry `imports`, and the page needs the `integrity` manifest inside the same `<script type="importmap">`. Verified:
  build + dev both inject the map, and Chromium loads `model-viewer`, `globe.gl`, `nord-*` and `syntax-highlight`
  through the SRI-checked esm.sh URLs with **no request failures**; 37 tests still pass on all three engines.
  Not SRI-checked: the three prefix mappings and the two local files (see `techContext.md`).
- Verified: **37 tests pass, 0 fail on Chromium 156, WebKit 27.2 and Firefox 157** (branded Chrome 155 too);
  `tsc --noEmit` clean. `shadow-observer` is installed now, so the 6 shadow tests run — the old "31 pass / 6 cannot
  load" figure is stale. Bundle figure unchanged: `dist/` was not rebuilt after this change.

## Next

1. ~~**Decide the failure model on purpose.**~~ **Settled 2026-10-12** — the model is *"components in the catalog get the
   error treatment / fallback; `devErrors: true` expands that to every component on the page"*.
   `src/index.ts:510` (`if (!getLoader(name) && !devErrors) return`) **is** that sentence, so the tests and docs were
   already right — the item was only ever a question in this file. See "Decisions" below.
2. ~~**Define-patch Stage 2** (transient capture).~~ **Rejected** — the patch stays; see `progress.md`.
3. Tier 1: ~~pin + `integrity`~~ — **done 2026-10-12** (jspm-generated `importmap.json`); runnable benchmark.
   ~~cross-browser matrix~~ — **done 2026-10-12** (Playwright). Full list in `REVIEW.md`.

## Decisions and lessons

- **Lean defaults, explicit opt-in.** Deferring and animating are choices now; the vanilla behaviour is
  "import → idempotent define → mark `.ce`". `transition: true` _requires_ `deferDefine: true`, because a transition
  the queue cannot deliver is a broken promise (self-registering catalogs would pop, not morph).
- **`deferDefine: false` is no longer "touch nothing".** The default path installs `polyfill_safe_ce_define` — an
  idempotent, **first-wins** `define` (`get(name) → return`) — so a self-registering module and the loader cannot
  collide over the same tag. This is what makes the `nord-*` design system composable: shared base elements
  (`nord-button`, `nord-card`, …) self-register inside their own `await import(...)`, for two modules at once, _before_
  the resolver's `if (!customElements.get(x))` guard can run — and the platform throws `NotSupportedError` on a
  same-name re-define, in code we don't control. The guard is deliberately **broad** (any already-defined name), not
  `=== ctor`, because a shared tag can arrive as two different class objects (an inlined base vs a bundled shell).
  Accepted cost: it also swallows the genuinely-different-constructor case the platform makes loud — deliberate.
- **Define-patch Stage 2 (transient capture) is rejected.** Enabling/disabling the patch per batch makes the global
  patch _flicker_ instead of removing it: N enable/disable cycles, reentrancy across registries, and no clean "restore
  the original" when another script patched first. The settled shape is one persistent, opt-in patch (`deferDefine`)
  plus an always-on `polyfill_safe_ce_define`.
- **Failures belong to the element, not to attributes.** `.error` / `.stack` live on the fallback instance (its
  `observedAttributes` are gone); the origin keeps only `ce="error"`. Appending (instead of clearing) means
  server-rendered or slotted light DOM survives a failure — issue #3 falls out for free.
- **`devErrors` re-read as "also paint failures I don't own."** Catalog failures always paint; a non-catalog tag
  paints only with `devErrors: true`, which is genuinely useful while debugging a typo'd tag name.
- **A correct state is not a painted state.** `ce="loading"` set, the shimmer running, the element invisible — a
  stylesheet in a lower cascade layer said `visibility: hidden`. Check `checkVisibility()` before blaming the loader.
- **An `await` between a promise and its handler is a leak.** `transition.finished.then(...)` sat after
  `await transition.updateCallbackDone`; when the update threw, the handler was never attached — styles leaked and
  `finished` rejected unhandled. Attach cleanup handlers **before** any await that can reject.
- **Demo pages rot silently.** The animation page was dead for months. Run them.
- **A swallowed collision must still be audible.** `polyfill_safe_ce_define` guards on the tag *name*, so a foreign
  constructor that got there first wins silently and the tag is then painted `ce="defined"` — the platform's
  `NotSupportedError` never fires. `define()` reports that case through `hooks.error` when
  `customElements.get(name) !== module`. Hook only, never `ce="error"`: the element works, so painting it broken would be
  a lie. The name-level check exists in *both* `define()` and the polyfill, so patching only the polyfill would have
  recovered nothing → `progress.md`.
- **The failure model is the one the code already had.** "Catalog always paints, `devErrors` adds unknown tags" was
  decided by writing `if (!getLoader(name) && !devErrors) return`, and the tests and README followed it. Recording a
  *settled* thing as an open question in this file is how a later session re-litigates it.
- **Internet Explorer is out of scope, on two independent grounds.** Playwright has no IE support and never will
  (`microsoft/playwright#594`, closed 2020: *"no plans to support IE10/IE11"*), and the loader needs ES modules, dynamic
  `import()`, custom elements v1 and import maps — none of which IE has. The requested "IE" was **Edge**, which is a
  Chromium channel and therefore fully supported.
- **"Safari" in the matrix means WebKit, not the Safari app.** Playwright ships the Safari *engine*; it cannot drive
  system Safari. It also ships only the *current* build of each engine, so a pinned old browser means pinning an old
  Playwright release (`microsoft/playwright#14435`) — there is no version-pinning flag. That is why the "older browser"
  story is a CI matrix of Playwright versions, not a config option.
- **The browser floor is import maps: Chrome/Edge 89, Firefox 108, Safari 16.4.** Every other required API ships
  earlier, and the two expensive features (`deferDefine` → `requestIdleCallback`, `transition` → element-scoped view
  transitions) are opt-in and feature-detected. `requestIdleCallback` is the odd one out: Safari has never enabled it,
  so it is *not* part of the floor but *is* a gap on the `deferDefine` path.
- **A capability probe must run before the suites.** `transitions.test.js` installs a `startViewTransition` stand-in
  when the engine lacks it, so probing after Mocha finishes reports the polyfill as native support — a false green on
  exactly the capability most likely to be missing.
