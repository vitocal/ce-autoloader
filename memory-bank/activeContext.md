# Active context

_2026-09-30 · branch `option-deferDefine` @ `4835697`, plus uncommitted Stage 1 work._

## Right now

Stage 1 of the define-patch plan is implemented and verified (**24/24 tests, harness error panel empty**):

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
2. Rest of Tier 0: non-destructive `retry()`, completion signals (`ce:load` / `ce:error`, `whenLoaded(tag)`).
3. Then Tier 1: pin + `integrity`, docs truth pass, runnable benchmark, cross-browser matrix.

## Decisions and open questions

- **`deferDefine` defaults to _on_.** The requirement was that catalog components morph even when they define
  themselves; strict opt-in would break that for most real catalogs. Flipping it is one line
  (`this.options.deferDefine === true`), and the test `self-registering catalog components morph (default)`
  guards the behaviour either way.
- Two bugs found while writing the tests are fixed but worth remembering: define errors were swallowed by
  `Promise.allSettled`, and skipped transitions leaked rejections.
- Still open: several registries share one queue; `prefers-reduced-motion` per element; the `shadow-observer`
  decision; license; the `scrollMargin` / `rootMargin` bug.
- Lesson that cost real time: **demo pages rot silently.** The animation page was broken for months. Run them.
- Lesson from the same page: **a state can be correct and still invisible.** `ce="loading"` was set, the shimmer
  animation was running (`CSSAnimation`, `translate: 57%`), and the element had zero paint because a stylesheet
  in a lower layer said `visibility: hidden`. When a state "doesn't work", check `checkVisibility()` /
  computed `visibility` before suspecting the loader. The sibling `a-b_testing.html` already had
  `visibility: visible` for this reason — the two pages disagreed and nobody noticed.
