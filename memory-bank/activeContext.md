# Active context

_2026-10-01 · branch `option-deferDefine` @ `7098efc`, plus **staged (uncommitted)** work across `src/`, the types
split, the tests and the demo wiring._

## Right now

**The defaults went lean: nothing is deferred, nothing animates — but every registry still patches
`customElements.define`, to make it *idempotent* (`polyfill_safe_define`), not to queue. The failure model was
reworked — and as of this pass the README and `types.ts` finally match it.**

- Defaults: `deferDefine: false`, `devErrors: false`, and `transition` derived from the **raw** `options.deferDefine`
  — so `new CEAutoLoader({ catalog })` takes the safe-define path. `transition: true` without `deferDefine: true`
  now **throws `SyntaxError`**.
- Failures: `#errors` is gone; the tag is painted `ce="error"` and the fallback is **appended** (no more
  `innerHTML = ""`); the message moved off the element's attributes onto the fallback instance's `.error` / `.stack`.
  `devErrors` now *extends* painting to non-catalog tags instead of suppressing it (verified live).
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
- ✅ **Transition cleanup fixed** — `transition.finished` was handled *after* `await transition.updateCallbackDone`, so a
  failing update skipped it: `view-transition-name` / `-class` leaked and `finished` rejected unhandled. The handler is
  attached before the await now.
- ✅ **Docs trued up** — README (`transition` / `deferDefine` / `devErrors`, the error-state prose, "Deferred
  Definitions", "Failure reporting", browser support), the `src/types.ts` option comments, and the stale claims in
  `REVIEW.md`.
- Verified: **27/27 tests**; bundle **9.66 kB raw / 3,320 B gzip**.

## Next

1. **Decide the failure model on purpose** — "catalog always paints, `devErrors` adds unknown tags" (what the tests and
   docs encode now) vs the older "catalog is the boundary, `devErrors` suppresses".
2. ~~**Define-patch Stage 2** (transient capture).~~ **Rejected** — the patch stays; see `progress.md`.
3. Tier 1: pin + `integrity`, runnable benchmark, cross-browser matrix. Full list in `REVIEW.md`.

## Decisions and lessons

- **Lean defaults, explicit opt-in.** Deferring and animating are choices now; the vanilla behaviour is
  "import → idempotent define → mark `.ce`". `transition: true` *requires* `deferDefine: true`, because a transition
  the queue cannot deliver is a broken promise (self-registering catalogs would pop, not morph).
- **`deferDefine: false` is no longer "touch nothing".** The default path installs `polyfill_safe_define` — an
  idempotent, **first-wins** `define` (`get(name) → return`) — so a self-registering module and the loader cannot
  collide over the same tag. This is what makes the `nord-*` design system composable: shared base elements
  (`nord-button`, `nord-card`, …) self-register inside their own `await import(...)`, for two modules at once, *before*
  the resolver's `if (!customElements.get(x))` guard can run — and the platform throws `NotSupportedError` on a
  same-name re-define, in code we don't control. The guard is deliberately **broad** (any already-defined name), not
  `=== ctor`, because a shared tag can arrive as two different class objects (an inlined base vs a bundled shell).
  Accepted cost: it also swallows the genuinely-different-constructor case the platform makes loud — deliberate.
- **Define-patch Stage 2 (transient capture) is rejected.** Enabling/disabling the patch per batch makes the global
  patch *flicker* instead of removing it: N enable/disable cycles, reentrancy across registries, and no clean "restore
  the original" when another script patched first. The settled shape is one persistent, opt-in patch (`deferDefine`)
  plus an always-on `polyfill_safe_define`.
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
