# Active context

_2026-09-30 · branch `option-deferDefine` @ `dad19a4`, plus uncommitted work on the failure path._

## Right now

**Failures are attributed by the catalog: a catalog component that fails is painted (`devErrors`, default on), a tag
with no catalog entry never is. `retry()` is gone.**

- `handleComponentLoadError`: record the tag in `#errors` (the watcher then skips it) → `hooks.error` → **return if
  `getLoader(name)` is empty** → paint `ce="error"` + `error`/`stack` + `fallback`, unless `devErrors: false`.
  The `getLoader()` boundary outranks the option; the CSS page's `<el-notloaded>` is what forced it.
- Two stale states the new tests flushed out: with painting off a failure kept `ce="loading"`, and a failed
  `define()` claimed `ce="defined"`. Both are gone.
- Demos: the docs site relies on the default (no explicit option), the CSS page documents the boundary, and
  `error-fallback` lost its dead Retry button.
- Verified: **26/26 tests**; the CSS page live (`<el-notloaded>` untouched, a synthetic throwing catalog loader
  painted); the docs site (`vi-error` painted with no option set anywhere). Bundle **3,337 B gzip**.

## Next

1. **Define-patch Stage 2** — transient capture instead of the global queue (see `progress.md`).
2. Tier 0 leftovers: completion signals (`ce:load` / `ce:error`, `whenLoaded(tag)`); the first-render-throw gap
   (issue #13).
3. Tier 1: pin + `integrity`, docs truth pass, runnable benchmark, cross-browser matrix. Full lists in `REVIEW.md`.

## Decisions and lessons

- **`deferDefine` on by default** — catalogs self-register (18 of 20 demo components), and strict opt-in loses the
  morph for them. Flipping it is one line in the constructor's defaults.
- **`devErrors` on by default, with the catalog as the boundary** — an error in one of our own components has to be
  visible; `false` is the production-hygiene switch. The non-catalog case is not a toggle at all. (A first attempt
  defaulted it off with no boundary, which hid real failures — worse than a wrong-looking placeholder.)
- Two checkers disagree on a pre-existing error: `tsc --noEmit` reports TS2345 at `definitions.push(...)`, the
  `npm run build` dts step reports nothing. The `tsc` answer is the honest one.
- **A correct state is not a painted state.** `ce="loading"` was set, the shimmer running, and the element invisible
  — a stylesheet in a lower layer said `visibility: hidden`. Check `checkVisibility()` before blaming the loader.
- **Demo pages rot silently.** The animation page was dead for months. Run them.
