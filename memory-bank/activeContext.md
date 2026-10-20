# Active context

_2026-10-20 · branch `defined-ready` @ `9503625` plus working-tree changes to `src/index.ts`, `src/types.ts`, `README.md` and
`test/importmap.test.js` (multiple import maps), and the earlier working-tree changes across `index.html`, `public/styles.css`,
`vite.docs.js`, `package.json` (Tailwind) and `pages/components/` (the Hairline UI demo), and this bank._

## Right now

- ✅ **CI runs the suite on every commit (2026-10-20).** `.github/workflows/test.yml` — `ubuntu-latest`, Node 22, `npm ci`
  with `setup-node`'s `cache: npm` (`package-lock.json` is tracked now; it was gitignored), `~/.cache/ms-playwright` cached
  on `hashFiles('package-lock.json')`, `npx playwright install --with-deps chromium firefox webkit`, then `npm run test`
  with `TEST_STRICT=1`, because a browser that fails to launch is reported as *skipped* and a skip passes. Adding it
  surfaced a **red HEAD**: `load()` unwrapped a `hooks.load` module namespace *before* `hooks.loaded` ran, so
  `loaded[0].module.default` was `undefined` (test, README and `types.ts` all said otherwise). `load()` and `preload()`
  keep the namespace now and `define()` is the only unwrap → **68 × 3 green**, `tsc --noEmit` clean.

**The three load-time hooks exist: `hooks.load` (decides: skip / as-usual / hand back the module), `hooks.loaded`
(a notification) and `hooks.define` (a gate: `false` disables the definition). Each runs exactly once per component —
per _element_, so two elements sharing a tag are two calls — and `preload()` runs them too, with `el` `undefined`.**

- ✅ **`hooks.load` / `hooks.loaded` / `hooks.define` (2026-10-20).** One call each, per component, on the walk:
  `load(name, el)` before the fetch, `loaded({name, el, module, loader})` between `ce="loaded"` and the definition,
  `define({name, el, module})` before the registration. Two decisions and one notification:
  - **A skip is not a failure.** `load` returning `false` leaves the element with **no `ce` state**, so it stays
    `:not([ce])` — the registry still owes it a state, and a later `upgrade()` asks the hook again (locked in by
    `should ask again on the next upgrade when it skipped`). It records **no `load:<tag>` measure**, because nothing
    loaded, and `load()` returns `null`, which `loadAndDefine` filters before it defines anything. `hooks.error` is
    never called and `ce="error"` is never painted.
  - **The hook's module is the module.** `load` returning an ES module is used _in place of_ `loadModule()` — the
    catalog loader is never called. Only a real namespace object (`Symbol.toStringTag === "Module"`) is unwrapped to
    its `default`, the same rule a catalog loader's `import()` result follows; the fixture that proves it
    (`test/hooks.fixture.js`) is a real module for that reason.
  - **`loaded` gets the module raw, `define` gets the constructor.** `loaded` fires before the unwrap and its return
    value is ignored (`false` from `loaded` disables nothing — only `define`'s `false` does). `define` fires on the
    unwrapped constructor, and its `false` returns _before_ the `define:<tag>` measure: nothing is defined, nothing is
    reported, and the element stops at `ce="loaded"`.
  - The lock (`loading_locks`) is taken **before** the hook now, so a re-entrant `upgrade()` while an async hook is in
    flight cannot ask twice. `preload()` runs the same three hooks (`el` `undefined`) and **awaits** `define()`, so its
    promise means "preloaded and defined" — which is what the README always claimed.
  - `test/hooks.test.js` (11 tests) + `npm test` **68 × 3 green** (Chromium 156, WebKit 27.2, Firefox 157);
    `tsc --noEmit` clean.

- ✅ **Every import map, read on demand (2026-10-20).** `useImportMapsCatalog` used to snapshot _one_ map
  (`document.querySelector`) in the constructor. `catalog` is an accessor now: every `<script type="importmap">` is read in
  document order, folded _under_ an explicit `catalog`, and re-read on every access — so a map the page appends later is
  honoured on the next lookup, and a specifier two maps both define keeps its first mapping, which is how the platform merges
  them. `import.meta.resolve` was researched as the "don't parse the map" alternative and **rejected**: it resolves _one_
  specifier, only against the maps the _engine_ accepted — Firefox 157 merges none and ignores a map added after module
  evaluation, so the same page resolves in Chromium/WebKit and throws in Firefox — and nothing enumerates the entries, so
  `catalog` could not be built from it at all. The script _text_ is the source of truth. Reading it through `document.scripts`
  (a live collection, ~0.5 µs) instead of `querySelectorAll` (~27 µs Chromium / ~53 µs WebKit on an 8k-element DOM) is what
  makes a per-lookup read affordable. Covered by `test/importmap.test.js` (7 tests — the two that failed now assert _all_ maps
  and a map added after construction) + `npm test` **57 × 3 green**; `tsc --noEmit` clean; `dist/` rebuilt →
  **11,050 B raw / 3,770 B gzip**.
- ✅ **`earnings-chart` added (2026-10-13).** The fourth Hairline component, through the same pipeline
  (`pages/components/hairline/earnings-chart.tsx` = the upstream source + an r2wc wrapper; catalog entry;
  a `<earnings-chart>` on the landing page with two periods of JSON in the `periods` attribute). It brought
  three things the first three didn't need, and each is a rule now:
  - **`@theme inline`, not `@theme`.** The page declares `--color-primary` and `--color-accent` itself, so a
    theme variable of the same name either loses the cascade or references itself — and the chart's
    `bg-primary` bar has to be _this page's_ green. `inline` puts the value in the utility, where no layer can
    reach it. `--radius-lg` is pinned there for the same reason: the page's is 1.25rem, Tailwind's `rounded-lg`
    is 8px, and the plot uses it.
  - **The raw tokens have to exist too.** The chart writes `shadow-[0_0_0_1px_var(--border)]`, so `--border`
    (and `--primary`) are defined as _variables_ on the components' tags, not only as Tailwind colours.
  - **The components got their own layer.** The first version put their base rules (the `code`/`button` resets,
    the `.grid` reset, the host `display`) _unlayered_, which beat the utilities: `font: inherit` on a button
    won over `text-[12px]`, and the period chips rendered at 16px. They now sit in a `hairline` layer declared
    between the page's layers and `utilities` — above `code`/Nord's typeset, below the classes. Verified in a
    browser: chips 12.5px, Stop 12px, `bg-accent` hover is the subtle grey (not the page's terracotta — it never
    was, before `inline`), the plot's radius is 8px, the highlighted bar is the page's primary green.
- ⚠️ **The commit `ed0a8c3` lost `pages/components/hairline/demo.ts`** (and the `<script>` tag that loads it),
  so the committed `#hairline-ui` section streams nothing: the command outputs sit on "running" with an empty
  log, `on-stop="ceCommandStop"` resolves to nothing, and the morph never cycles. Restored 2026-10-13 — the
  module is untracked in that commit, so a `git add pages/components/hairline` is what was missing.
- ✅ **The first three Hairline UI components on the landing page (2026-10-13; `earnings-chart` is above).** `text-morph`, `number-roll` and
  `command-output` are the upstream React sources, kept as they ship, wrapped with `r2wc`
  (`pages/components/hairline/`) and registered in the catalog — so the demo _is_ the feature it demonstrates:
  `command-output` pulls the other two in as dependencies, and nothing is fetched until the tag scrolls into
  view. Two deviations from upstream, both in the generator that wrote the files: `lucide-react` is replaced by
  an inlined `icons.tsx` (no React icon package in this repo), and `useSyncExternalStore` loses React's third
  argument (preact/compat takes two — in its types _and_ at runtime). The Stop button is the interesting bit:
  r2wc resolves a _function_ prop by looking the attribute's **value** up on `window`, so
  `on-stop="ceCommandStop"` in the HTML plus a named global in `pages/components/hairline/demo.ts` are the whole
  wiring. Everything else is attributes — `status`, `lines` as JSON, `started-at`, `exit-code`, `ended-at` —
  which is what a server-rendered page would write.
- ✅ **Tailwind v4 in the docs build (2026-10-13).** `@tailwindcss/vite` plus a `hairline.css` that imports
  `theme.css`/`utilities.css` **without preflight** (this page has its own reset and typeset) and maps the
  shadcn-style tokens the components read (`--background`, `--muted`, `--border`, `--ring`, …) onto the page
  palette via `@theme`. **The layer order is the page's job**: `styles.css` now declares
  `properties, theme, normalize, ds, shared, page, components, scoped, utilities, hotfix` — `theme` early, or
  Tailwind's `--radius-*`/`--shadow-*` would beat the page's own; `utilities` late, or the page's `code` rule (a
  dark pill) would beat the components'. One collision is left over: `.grid` — shared.css's is a _column_ grid
  the "Get started" steps depend on, Tailwind's is `display: grid` — so `hotfix` re-states the page's version
  and `hairline.css` puts the components' back to the row default, which the fold animation needs. Verified in a
  browser on dev _and_ on a build: both logs stream, success folds, Stop cancels, the morph cycles, the timer
  gains its tenths; `npm test` 57 × 3 green, `tsc --noEmit` clean (the pre-existing `pages/index.ts` catalog
  error aside).
- ✅ **`ce="ready"` removed — `defined` is written in the upgrade frame and is terminal (2026-10-12).** The two-state
  handoff was a footgun, not a feature: `defined` was written synchronously and then _superseded_ about two frames
  later, so every rule matching `[ce="defined"]` stopped matching mid-flight. A keyframe animation was torn down; a
  transition was **reverted** (the height example below measured `64 → 67 → 64 → 64px`, the box ending up clipped).
  **Settled shape:** `markDefined` is the last write of the success walk — `src/index.ts` `define()` no longer calls
  `markReadyAfterPaint`, and `src/lifecycle.ts` lost `markReady`, `markReadyAfterPaint`, `afterPaint`,
  `PAINT_FALLBACK_MS` and the shared paint queue (188 → 123 lines). `LifecycleState` is
  `loading | loaded | defined | error`. One rule per reveal now, on `[ce="defined"]` alone — **the union selector is
  gone from every stylesheet, both prototypes and the README.** `dist/` **10,591 B raw / 3,650 B gzip** (−354 B /
  −119 B). Breaking for the public styling contract: an external sheet written as `[ce="defined"], [ce="ready"]` still
  works (the `ready` arm simply never matches), but one that matched `[ce="ready"]` _alone_ now matches nothing.
  **`pages/examples/animations/css.html` is unaffected** — and that is the point. It does not use the registry:
  `runLifecycleSimulation()` writes `ce="loading"` and `ce="defined"` by hand and never wrote `ready`, so its
  `demo-*[ce="defined"]` rules never stopped matching. A page that fakes the walk cannot be broken by a change to the
  walk — and equally cannot catch one. The two prototypes _were_ converted onto the real registry this session, which
  is why they surfaced both the `visible` bug and this one. `npm test` **56 × 3 green** (one net test fewer:
  two `ready` tests out, "should leave defined as the last state of the success walk" in), `tsc --noEmit` clean.

- ✅ **`visible` dropped same-tag siblings — fixed (2026-10-12).** Found while wiring the landing page's lifecycle demo.
  With **two or more elements of one tag**, only those in the _first_ IntersectionObserver callback were painted.
  `when_visible` filtered `!customElements.get(entry.target.tagName.toLowerCase())` and
  `!this.loading_locks[el.tagName]`. The IO hands a batch over in as many callbacks as it likes, so a slow first batch
  is all it takes: the rest are dropped by the **tag-name** lock while that batch is in flight, then permanently by
  `customElements.get(tagName)`, which flips true the moment _any_ element with that tag is defined. Reproduced on the
  docs page — 7 × `<ce-reveal>`, IO callbacks at 1044 ms (4 panels), 1086 ms (1), 1220 ms (2) → **4 painted, 3 upgraded
  but unpainted** (`innerHTML` rendered, `ce` never written). **Settled fix:** the predicate is
  `getLifecycle(el) === null` — `ce` is the per-element "the registry has handled this" flag and the only correct one;
  a tag already defined but _absent from the catalog_ is someone else's and is left alone (it also covers `ce="error"`,
  so #18's guard is intact). `loading_locks` became a `Set<HTMLElement>`, because a tag-name key is a per-_tag_ lock,
  which is not what it was ever meant to be. `npm test` **57 × 3 green**, `tsc --noEmit` clean, `dist/` →
  **10,725 B raw / 3,683 B gzip**. A/B on the docs page: `hooks.error` count identical before and after (1), so the fix
  adds no console noise — the flaky `nord-*` diagnostics are #20, untouched.
  **The other entry point was fixed the same way (2026-10-12).** `matchCustomElement` — the module-level helper behind
  both `upgrade()` and the dom-watcher — was still `:not(:defined)`: the same per-_tag_ mistake, so a sibling of an
  already-defined tag was skipped there too. Both now share one predicate, `owesState(el)` (no `ce`, then "the tag is
  undefined, or we have a loader for it"), and the selector became `:not([ce])`, which matches
  `getLifecycle(el) === null` exactly. Pinned by `test/integration.test.js` → "upgrade() re-entry"; A/B with the old
  selector **fails on all three engines**, so the test really does catch it.
- ✅ **The landing page grew a real lifecycle demo (2026-10-12).** `#lifecycle` used to _describe_ the state machine and
  fake it (`pages/examples/animations/css.html` still does: `runLifecycleSimulation()` writes `ce="loading"`/`"defined"`
  by hand). The new block is a catalog component — `<ce-reveal>` (`pages/components/ce-reveal.js`, loader in
  `catalog.js` with a `CE_DEMO_DELAY` fetch of 1200 ms) — so the walk is the registry's own. Five reveals (clip-path
  wipe, mask sweep, blinds, iris, grid dissolve), each declared once on `[ce="defined"]`. Verified live 400 ms into a
  2.4 s reveal: `inset(0px 98.4% 0 0 round 12px)` with `ce-demo-wipe:running` — still animating, because nothing
  supersedes `defined` any more. The reveal CSS lives in `public/styles.css` (`@layer components`), with the three
  `@property` registrations at the top level because a registration is global. Replay is a reload: a defined tag cannot
  un-define itself.
  **The timeline came out again (2026-10-12).** `pages/components/ce-timeline.js` and its ~100 lines of CSS are deleted,
  along with the `data-ce-watch` markers, the `#ce-timeline` container and the `mountLifecycleTimeline` call — it
  answered a question nobody was asking and read as clutter.
  **The hero got the mask sweep (2026-10-12).** `hero-example[ce="defined"]` in `public/styles.css` reuses the demo's
  `ce-demo-sweep` keyframes and `--ce-wipe` at a `--ce-hero-dur` of 1.2 s — a real catalog component revealing on the
  contract, not a demo box. Verified live: `--ce-wipe` interpolates `-20% → … → 120%` across ~30 distinct frames with
  `ce-demo-sweep:running`, and the mask is opaque at rest (`linear-gradient(100deg, #000 120%, …)`), so a cancelled
  sweep degrades to "already revealed". Screenshots at start and settle show the code panel diagonally clipped, then
  fully revealed.
  **The two prototypes use the library now too** — `01-defaults.html` and `02-clip-masks.html` dropped their
  `setState()` stand-in (the first documented itself as _"a stand-in for CEAutoLoader"_) for a real `catalog` +
  `new CERegistry(...)`, so all 11 demo elements walk through `src/lifecycle.ts`. Both are same-tag-heavy
  (`demo-card` ×3, `demo-item` ×3, `demo-panel` ×5), which makes them a live regression test for the `visible` fix.
  `01-defaults.html`'s `@starting-style` host is `display: none` until defined, so it reserves no space and can never
  intersect — it needs `loading="eager"`, or `visible` deadlocks it. Verified: both walk `loading → loaded →
defined`, 02's five reveals are still `running` 400 ms in, and neither page logs a console error.
  **A sixth example: the height change (2026-10-12).** `ce-reveal[variant="grow"]` reserves `height: 4rem` and
  animates to `height: auto` when the component lands — the layout-shift case the lifecycle exists for. It works only
  because `public/styles.css` sets `interpolate-size: allow-keywords` on `:root`; a `numeric-only` control in the same
  probe snaps `112px → 207px` instead of interpolating. Measured on the docs page: `64 → 109 → 140 → 160 → 173 → 181 →
186 → 190 → 192 → 194 → 196px` across the 2.4s — 17 distinct heights, so it is a real transition and not a jump.
  `ce-reveal` grew an optional `body` attribute (the box has to be taller than the slot it reserves, or there is
  nothing to grow into); `01-defaults.html` grew a matching §5 with its own `demo-grow` (`40 → 70 → 99 → 116 → 122 →
124px`, `--ce-dur: 380ms`). This is the example that made the `ready` handoff untenable: while it existed, a
  `[ce="defined"]`-only height rule _started_ the grow and then fell back to the reserved slot the instant `ready`
  landed — measured `64 → 67 → 64 → 64px`, so the box ended up clipped at 4rem with its content never revealed. The
  union ran `64 → 67 → 95 → 124 → 152 → 180 → 252px`. A keyframe animation that is cancelled degrades to "already
  revealed"; a _transition_ that is reverted degrades to "still collapsed".

- ✅ **README review pass (2026-10-12)** — the README's garbled `deferDefine` comment is fixed (the "…its own tag still morphs…"
  fragment had lost its subject; it now matches `src/types.ts`), along with a stray-space slip in the transition paragraph,
  "Chromium-only" → **Chromium 147+**, and the byte figures in `REVIEW.md` and `techContext.md` (both said ~3,3xx B; the real
  number was 3,378 B gzip / 9,833 B raw). `REVIEW.md`'s "anything unknown falls through to an immediate load" is wrong — an
  unhandled directive hits the `console.error` branch and loads nothing (and `ce_elements` _is_ in scope there — declared at
  `index.ts:367`, before the only call at 368 — so the bank's "undefined" reading was wrong). The `Options` block now carries
  `useImportMapsCatalog` and `shadowObserver`, the import-map paragraph is rewritten, and the "Smart Scheduling" / Use Cases copy
  is trued up. Still open, logged in `REVIEW.md` Tier 1: the README never discloses the global `customElements.define` patch, has
  no CDN / `?autoload` quickstart, says "3kb gzipped" (really 3,467 B), and the "Documentation" link points at the demo root.
- ✅ **`?autoload` fixed — issue #19 (2026-10-12).** The flag was inverted: `useImportMapsCatalog: true` took
  `this.catalog = options.catalog`, so with no `catalog` the registry held `undefined` and `getWildcardResolver` threw
  `TypeError: Cannot read properties of undefined (reading '<prefix>-*')` — `?autoload` never loaded a thing (the _default_ path
  was the one that read the import map). **Settled semantics (2026-10-12):** the flag is literal — `true` reads the page's
  `<script type="importmap">` and merges it _under_ `catalog` (`false`, the default, ignores the map entirely).
  `getWildcardResolver` is null-safe. Covered by
  `test/importmap.test.js` (7 tests: load from the map, ignore by default, dashed-names-only, merge + catalog wins, no map at
  all) and `npm test` **44 × 3 green**; `tsc --noEmit` clean. `dist/` rebuilt → **10,125 B raw / 3,467 B gzip**.
  ~~Only the _first_ import map in the document is read (`querySelector`), and a map added after construction is ignored~~ —
  **superseded 2026-10-20**: every map is read, on every access (see "Right now").
- ✅ **`ce` lifecycle extracted into `src/lifecycle.ts` (2026-10-12).** An architecture review — hot spot: `src/index.ts`, changed
  in 35 of the last 60 commits — picked the one concept the class never had a module for: the `ce` state machine, which is both
  the public styling contract _and_ the "already reported" flag. **Settled design:** the module owns the vocabulary and
  _enforces_ the invariant — `markLoading(el)` refuses to move a failed element back to `loading`, so the flag cannot be erased
  (that overwrite is exactly what caused #18). Mechanism only: the registry still decides _whether_ a failure is ours to paint and
  still appends the fallback. An **internal seam** — not re-exported, so `dist/index.d.ts` is unchanged. `loadAndDefine` filters
  failed elements once at the top; the three read sites (`dom_watcher`, `when_visible`, `handleComponentLoadError`) call
  `hasFailed` instead of comparing strings. New suite `test/lifecycle.test.js` (7 tests, the invariant included); the 15 existing
  `getAttribute("ce")` assertions were **not touched** and still pass. Suite count 44 → **51 × 3 green**, `tsc --noEmit` clean.
  Also removed while in there: `_resolvers` (dead), an unused destructure, and 40 lines of commented-out `runViewTransition`
  (713 → 676 lines). `GLOSSARY.md` created.
- ✅ **View transitions demoted to alpha in the docs (2026-10-12).** `Element.startViewTransition` (element-scoped, which
  `transition: true` requires) is Chromium 147+ with no Firefox or Safari, so the docs stop promoting it: `index.html` lost the
  `::view-transition-*` CSS, five `view-transition-name` attributes, the demo link, the promo paragraph and the commented-out
  iframe/callout; the README's `### View Transitions` section is now a **"alpha — not recommended for production"** caveat, and
  the `transition` option comment says EXPERIMENTAL. The CSS-animation path (`ce` states + plain CSS) is the supported one. The
  `pages/demos/view-transition.html` page still exists, now reached from the CSS reference with the same caveat.

- ✅ **`<web-vitals>` on the docs home page (2026-10-12)** — the FAQ's stale Lighthouse screenshot is now a live
  Core Web Vitals panel (`pages/components/web-vitals.js`, catalog entry `"web-vitals"`, `loading="eager"`). Every
  number comes from `web-vitals@6.2.3` — pinned in `importmap.src.json`, SRI-checked, installed as a devDep (Vite's
  dev server cannot resolve a bare import that only exists in the import map), and excluded from `optimizeDeps` so the
  browser resolves it. **`reportAllChanges: true` is load-bearing**: without it the library withholds LCP and CLS until
  the page is hidden or the user interacts, and a panel nobody has touched sits empty. The headline is CrUX's
  pass/fail, computed only over the metrics the engine can actually observe — `layout-shift` is Chromium-only, so
  Firefox and Safari report CLS as `n/a` instead of "measuring…" forever. TBT and Speed Index were built and then
  **dropped on request**; with them went the Lighthouse score, which is _defined_ as a weighted mean over all five
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
- ✅ **`intersectionOptions` default corrected (#8)** — the issue claimed `scrollMargin` "is ignored — the real option is `rootMargin`". Refuted: `scrollMargin` is a valid `IntersectionObserverInit` member and _is_ honored (Chrome 120+/FF 141+/Safari 26+), but it is Baseline-newly-available (Sept 2025, **87.94%** global) and silently ignored on the rest, so the 20% preload margin was a no-op there. The default is now `rootMargin: "20%"` (Baseline since 2019). `intersectionOptions` is still forwarded verbatim, so callers may pass `scrollMargin` for nested scrollers. Regression tests added (default + custom pass-through, capturing the observer through an `IntersectionObserver` spy).
- ✅ **Shadow-observer integration fixed (#1)** — `getMutationObserver()` had a `return` inside `finally` that always won, so `shadow-observer` was awaited and discarded. Replaced with synchronous `globalThis[Symbol.for('shadow-observer')]` detection: the host app imports the module (optional peer dep), the library detects it. `shadow: 1` (OPEN only) → `shadow: 3` (OPEN | CLOSED). `dom_watcher` ShadowRoot guard fixed to not throw on ShadowRoot targets. New `shadowObserver` option (`'auto' | true | false`) for explicit control. BLUE/GREEN tests confirm: without shadow-observer, components inside shadow roots are ignored; with it, both open and closed shadow roots are reached.
- ✅ **A swallowed constructor collision is reported now (2026-10-12)** — `polyfill_safe_ce_define` guards on the tag
  _name_, so a foreign constructor that wins the race is silent: the platform's `NotSupportedError` never fires and the
  tag is painted `ce="defined"`. `define()`'s "already defined" branch calls `hooks.error` when
  `customElements.get(name) !== module`. Hook only — no `ce="error"`, no fallback: the element is live, so painting it
  broken would be a lie. The check lives in `define()`, not the polyfill, because `define()` is the only place holding
  the constructor to compare. Regression test in `test/integration.test.js`.
- ✅ **Docs/code name drift fixed** — the polyfill is `polyfill_safe_ce_define`; `README.md`, `REVIEW.md` and this bank
  called it `polyfill_safe_define`. The method is public API (`dist/index.d.ts`), so the docs moved, not the code.
- ✅ **Puppeteer → Playwright (2026-10-12)** — `scripts/run-integration-tests.js` now drives the same in-browser Mocha
  harness through Playwright, one pass per browser: `chromium`, `webkit` (Safari engine) and `firefox` by default, plus
  the branded `chrome` / `msedge` channels via `--browser=all`. A browser that is not installed is _skipped_ with an
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

1. ~~**Decide the failure model on purpose.**~~ **Settled 2026-10-12** — the model is _"components in the catalog get the
   error treatment / fallback; `devErrors: true` expands that to every component on the page"_.
   `src/index.ts:510` (`if (!getLoader(name) && !devErrors) return`) **is** that sentence, so the tests and docs were
   already right — the item was only ever a question in this file. See "Decisions" below.
2. ~~**Define-patch Stage 2** (transient capture).~~ **Rejected** — the patch stays; see `progress.md`.
3. Tier 1: ~~pin + `integrity`~~ — **done 2026-10-12** (jspm-generated `importmap.json`); runnable benchmark.
   ~~cross-browser matrix~~ — **done 2026-10-12** (Playwright). Full list in `REVIEW.md`.

## Decisions and lessons

- **`import.meta.resolve()` is a resolver, not a reader — it cannot stand in for parsing an import map.** It answers "where
  would this specifier go?" synchronously, and it inherits `scopes` and `integrity` for free, which makes it tempting. But it
  cannot _enumerate_ a map, and it only consults the maps the **engine** accepted. Measured 2026-10-20 (Chromium 156, WebKit
  27.2, Firefox 157): a second import map resolves in Chromium/WebKit and throws in Firefox ("Multiple import maps are not
  allowed."), and a map appended after module evaluation behaves the same way. `registry.catalog` is exactly the enumeration
  that resolve cannot do, and the tests demand both maps — so the text wins. (`import.meta.resolve` would still be the right
  tool for resolving a _known_ bare specifier, which this loader never needs: an import-map entry is already a URL.)
- **A snapshot of a mutable document is a bug waiting for its second import map.** The old read happened once, in the
  constructor, through `querySelector` — "one map, and it's the first one". Both halves were assumptions the platform had
  already dropped (multiple maps: Chromium 133+, Safari 18.4+; a later map merges into subsequent resolutions). `catalog` is an
  accessor now, so "the catalog is the app's entries plus the page's import maps" is true at every read, not only at
  construction. A `MutationObserver` could not have fixed it: import maps live in `<head>`, the registry watches `root`
  (`document.body`), and a debounced batch would be a frame late for a synchronous `getLoader()`.
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
- **A swallowed collision must still be audible.** `polyfill_safe_ce_define` guards on the tag _name_, so a foreign
  constructor that got there first wins silently and the tag is then painted `ce="defined"` — the platform's
  `NotSupportedError` never fires. `define()` reports that case through `hooks.error` when
  `customElements.get(name) !== module`. Hook only, never `ce="error"`: the element works, so painting it broken would be
  a lie. The name-level check exists in _both_ `define()` and the polyfill, so patching only the polyfill would have
  recovered nothing → `progress.md`.
- **The failure model is the one the code already had.** "Catalog always paints, `devErrors` adds unknown tags" was
  decided by writing `if (!getLoader(name) && !devErrors) return`, and the tests and README followed it. Recording a
  _settled_ thing as an open question in this file is how a later session re-litigates it.
- **Internet Explorer is out of scope, on two independent grounds.** Playwright has no IE support and never will
  (`microsoft/playwright#594`, closed 2020: _"no plans to support IE10/IE11"_), and the loader needs ES modules, dynamic
  `import()`, custom elements v1 and import maps — none of which IE has. The requested "IE" was **Edge**, which is a
  Chromium channel and therefore fully supported.
- **"Safari" in the matrix means WebKit, not the Safari app.** Playwright ships the Safari _engine_; it cannot drive
  system Safari. It also ships only the _current_ build of each engine, so a pinned old browser means pinning an old
  Playwright release (`microsoft/playwright#14435`) — there is no version-pinning flag. That is why the "older browser"
  story is a CI matrix of Playwright versions, not a config option.
- **The browser floor is import maps: Chrome/Edge 89, Firefox 108, Safari 16.4.** Every other required API ships
  earlier, and the two expensive features (`deferDefine` → `requestIdleCallback`, `transition` → element-scoped view
  transitions) are opt-in and feature-detected. `requestIdleCallback` is the odd one out: Safari has never enabled it,
  so it is _not_ part of the floor but _is_ a gap on the `deferDefine` path.
- **A capability probe must run before the suites.** `transitions.test.js` installs a `startViewTransition` stand-in
  when the engine lacks it, so probing after Mocha finishes reports the polyfill as native support — a false green on
  exactly the capability most likely to be missing.
