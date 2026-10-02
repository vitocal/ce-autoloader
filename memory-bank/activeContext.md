# Active context

_2026-10-01 · branch `option-deferDefine` @ `7098efc`, plus **staged (uncommitted)** work across `src/`, the types
split, the tests and the demo wiring._

## Right now

**The defaults went lean: nothing is deferred, nothing animates — but every registry still patches
`customElements.define`, to make it *idempotent* (`polyfill_safe_define`), not to queue. The failure model was
reworked, and `devErrors` now means the opposite of what the README says.**

- Defaults: `deferDefine: false`, `devErrors: false`, and `transition` derived from the **raw** `options.deferDefine`
  — so `new CEAutoLoader({ catalog })` takes the safe-define path. `transition: true` without `deferDefine: true`
  now **throws `SyntaxError`**.
- Failures: `#errors` is gone; the tag is painted `ce="error"` and the fallback is **appended** (no more
  `innerHTML = ""`); the message moved off the element's attributes onto the fallback instance's `.error` / `.stack`.
  `devErrors` now *extends* painting to non-catalog tags instead of suppressing it (verified live).
- Types split into `src/types.ts` (a real module exporting `CEError`); `src/types.d.ts` deleted. `tsc --noEmit` is
  **clean** — issue #12 fixed.
- Demos: the docs site and the CSS page pin `transition: false, deferDefine: false`.
- Verified: **24/24 tests**; bundle **9.54 kB raw / 3,319 B gzip**.
- ⚠️ **`dom_watcher` is inverted** — verified in a browser: a dynamically added catalog tag no longer upgrades, so
  the live/`MutationObserver` path is dead. The one test that covers it passes on a race (the initial `discover()`
  scan catches the element).

## Next

1. **Fix `dom_watcher`** (inverted guard, above) — the live/observer path is the product, not a nice-to-have.
2. **Doc truth pass** — README + `types.ts` still say `devErrors` *suppresses* painting and that `deferDefine: false`
   patches nothing; both are now wrong.
3. **Decide the failure model on purpose** — "catalog always paints, `devErrors` adds unknown tags" (what the tests
   encode today) vs the older "catalog is the boundary, `devErrors` suppresses".
4. **Define-patch Stage 2** — transient capture instead of the global queue (see `progress.md`).
5. Tier 1: pin + `integrity`, runnable benchmark, cross-browser matrix. Full list in `REVIEW.md`.

## Decisions and lessons

- **Lean defaults, explicit opt-in.** Deferring and animating are choices now; the vanilla behaviour is
  "import → idempotent define → mark `.ce`". `transition: true` *requires* `deferDefine: true`, because a transition
  the queue cannot deliver is a broken promise (self-registering catalogs would pop, not morph).
- **`deferDefine: false` is no longer "touch nothing".** The default path installs `polyfill_safe_define` — an
  idempotent `define` — so a self-registering module and the loader cannot collide over the same tag.
- **Failures belong to the element, not to attributes.** `.error` / `.stack` live on the fallback instance (its
  `observedAttributes` are gone); the origin keeps only `ce="error"`. Appending (instead of clearing) means
  server-rendered or slotted light DOM survives a failure — issue #3 falls out for free.
- **`devErrors` re-read as "also paint failures I don't own."** Catalog failures always paint; a non-catalog tag
  paints only with `devErrors: true`, which is genuinely useful while debugging a typo'd tag name.
- **A correct state is not a painted state.** `ce="loading"` set, the shimmer running, the element invisible — a
  stylesheet in a lower cascade layer said `visibility: hidden`. Check `checkVisibility()` before blaming the loader.
- **Demo pages rot silently.** The animation page was dead for months. Run them.
