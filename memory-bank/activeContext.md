# Active context

_2026-09-30 · branch `option-deferDefine` @ `4835697`, plus uncommitted Stage 1 work._

## Right now

Stage 1 of the define-patch plan is implemented and verified (**24/24 tests, harness error panel empty**):

- `deferDefine` switch (default on), idempotent `define()`, `polyfill_swallow_alreadyDefined` deleted.
- `loadAndDefine` only wraps what it is about to define; define-phase failures now reach `ce="error"`.
- `transition.ready` rejections handled — skipped transitions used to leak unhandled rejections.
- `pages/examples/animations/css.html` rewritten (it was dead — four separate bugs) and `docs/` rebuilt.
- Uncommitted: `src/index.ts`, `test/*`, `pages/**`, `README.md`, `REVIEW.md`, `memory-bank/**`, and 340
  regenerated files under `docs/**`.

## Next

1. Commit (ask first — the `docs/` diff is large).
2. **Stage 2**: transient capture instead of the global queue. Deletes `queue`/`dequeue`/`flush`,
   `DEFERRED_REGISTRIES`, the `types.d.ts` augmentation and README's queue section → `roadmap.md`.
3. Rest of Tier 0: non-destructive `retry()`, completion signals (`ce:load` / `ce:error`, `whenLoaded(tag)`).
4. Then Tier 1: pin + `integrity`, docs truth pass, runnable benchmark, cross-browser matrix.

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
