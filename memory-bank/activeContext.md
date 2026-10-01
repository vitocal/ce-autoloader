# Active context

_2026-09-30 · branch `option-deferDefine` @ `dad19a4`, plus uncommitted work on the failure path._

## Right now

**Failures are attributed by the catalog: a real failure is painted (`devErrors`, default on), a tag with no
catalog entry never is. `retry()` is gone.**

- A tag with no catalog entry was being styled as `ce="error"` — the css page's `<el-notloaded>`, kept there to
  showcase `:not(:defined)`, hit exactly that. It is not a failure: the loader never owned the tag and a third
  party may define it later. `!this.getLoader(name)` is the boundary, and it outranks the option.
- `handleComponentLoadError` records the tag in `#errors` (the watcher then skips it), calls `hooks.error`, then
  paints `ce="error"` + `error`/`stack` + `fallback` — for a catalog tag, unless `devErrors: false`. The `retries`
  attribute and `LoadError.retries` went with the counter.
- Two stale states fell out of the new tests: with the failure surface off, a failed element kept `ce="loading"`,
  and a failed `define()` left a false `ce="defined"`. `define()` now only claims `defined` when it really did,
  and the unpainted failure path drops the attribute instead of leaving a lie behind.
- Demos: the docs site relies on the default again (no explicit option), the CSS page documents the boundary, and
  the fallback component lost its dead Retry button.
- Verified: 26/26 tests (new: "should leave a tag that is not in the catalog alone", "should keep the DOM clean
  when devErrors is off"), the css page live (`<el-notloaded>` untouched with `devErrors` on by default, while a
  synthetic throwing catalog loader there does get `ce="error"` + `error`/`stack`), and the docs site (`vi-error`
  painted with no option set anywhere). Bundle: 3,337 B gzip.
- **Gap found, not fixed:** a component that throws in its constructor / `connectedCallback` never reaches the
  loader. `customElements.define()` runs the upgrade synchronously and the platform *reports* the exception to
  `window` instead of propagating it — verified in a browser: `define()` returned normally and two `error` events
  fired. The loader catches what it drives (a loader that throws, a module that will not import, a `define()` that
  blows up), not what the platform runs behind its back. See `roadmap.md` Tier 1.

Stage 1 of the define-patch plan is implemented and verified (**24/24 tests at the time, harness error panel empty**):

- `deferDefine` switch (default on), idempotent `define()`, `polyfill_swallow_alreadyDefined` deleted.
- `loadAndDefine` only wraps what it is about to define; define-phase failures now reach `ce="error"`.
- `transition.ready` rejections handled — skipped transitions used to leak unhandled rejections.
- `pages/examples/animations/css.html` rewritten (it was dead — four separate bugs) and `docs/` rebuilt.
- **The `loading` state on that page was invisible** (reported, fixed 2026-09-30): Nord's design system CSS ships
  `:not(:defined) { visibility: hidden }` and this page loads it into the `ds` layer, which hid the placeholder
  _and_ the shimmer for the whole load. Fixed with `visibility: visible` on the page's own rules, `opacity: 1` in
  the `loading` state (its transition never ran before), and a second demo tag — section 2's `<nord-button>` was
  the same tag as section 1, so it upgraded for free and never showed a state at all.
- Uncommitted: `src/index.ts`, `test/*`, `pages/**`, `README.md`, `REVIEW.md`, `memory-bank/**`, and 341
  regenerated files under `docs/**`.

## Next

1. **Stage 2**: transient capture instead of the global queue. Deletes `queue`/`dequeue`/`flush`,
   `DEFERRED_REGISTRIES`, the `types.d.ts` augmentation and README's queue section → `roadmap.md`.
2. Rest of Tier 0: completion signals (`ce:load` / `ce:error`, `whenLoaded(tag)`), then whether the define patch
   should be opt-in by default.
3. Then Tier 1: pin + `integrity`, docs truth pass, runnable benchmark, cross-browser matrix.

## Decisions and open questions

- **`deferDefine` defaults to _on_.** The requirement was that catalog components morph even when they define
  themselves; strict opt-in would break that for most real catalogs. Flipping it is one line
  (`this.options.deferDefine === true`), and the test `self-registering catalog components morph (default)`
  guards the behaviour either way.
- Two bugs found while writing the tests are fixed but worth remembering: define errors were swallowed by
  `Promise.allSettled`, and skipped transitions leaked rejections.
- **`devErrors` defaults to _on_, and the catalog is the boundary.** An error in one of our own components has to
  be visible on the page, so the default paints it and `false` is the production-hygiene switch. The non-catalog
  case is not a toggle at all — `getLoader()` decides. (The first attempt had the default off and no boundary;
  that hid real failures, which is worse than a wrong-looking placeholder.)
- Two checkers disagree about a pre-existing error: `tsc --noEmit -p tsconfig.json` reports TS2345 at
  `definitions.push(...)` in `loadAndDefine` (identical on `dad19a4`), while `npm run build`'s dts step reports
  nothing. The `tsc` answer is the honest one; it needs the ternary's two array types spelled out.
- Still open: several registries share one queue; `prefers-reduced-motion` per element; the `shadow-observer`
  decision; license; the `scrollMargin` / `rootMargin` bug.
- Lesson that cost real time: **demo pages rot silently.** The animation page was broken for months. Run them.
- Lesson from the same page: **a state can be correct and still invisible.** `ce="loading"` was set, the shimmer
  animation was running (`CSSAnimation`, `translate: 57%`), and the element had zero paint because a stylesheet
  in a lower layer said `visibility: hidden`. When a state "doesn't work", check `checkVisibility()` /
  computed `visibility` before suspecting the loader. The sibling `a-b_testing.html` already had
  `visibility: visible` for this reason — the two pages disagreed and nobody noticed.
