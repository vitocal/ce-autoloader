# REVIEW.md

*A friendly, honest review of ce-autoloader — where it shines, where it has sharp edges, and where it could take us.*

> This is a snapshot written after reading the current source (`src/index.ts`, 683 lines), the build config, the
> catalogs, the MFE example and the test setup. It's meant to stay useful: update it when the code changes,
> not when the mood does.

---

## 1. The big idea, in plain words

**The problem.** A typical modern page downloads a lot of JavaScript.
The decision about "what code does this page get?" is made at build time by a bundler, far away from the HTML where the actual answer lives. Lazy loading exists for javascript resources, but it's usually bolted on per route, and it drags a whole toolchain of js behind it.

**The idea here.** Ce-autoloader does lazy load of custom-elements. <Any-component> that *is* on the HTML is downloaded — and we can configure when with directive `loading` like visible,click using nothing but the browser's own standards: Custom Elements, dynamic `import()`, `IntersectionObserver`, and import maps.

One sentence: **`<script type="module">` plus a catalog map, and the DOM becomes the dependency graph.**

### How it works today

| Piece | What it does |
| --- | --- |
| **Catalog** | A single map of `tag name → URL` or `tag name → () => import(...)`. It's also the ownership boundary: `nord-*`, `decide-*`, `explore-*` are team or library namespaces. |
| **Discovery** | A `MutationObserver` watches the DOM and scans with `querySelectorAll(':not(:defined)')`. A 100 ms debounce keeps it civil. When the host application imports `shadow-observer` (optional peer dep), the observer is upgraded to `ShadowObserver`, which forwards into new programmatic shadow roots (open and closed). |
| **Directives** | The `loading` attribute: `eager` (now), `visible` (in viewport), `click` (first interaction), `manual` (you call `registry.upgrade(root, "manual")`). Any other value is a *custom* directive: it is never auto-discovered (only `options.directives` is), you trigger it with `registry.upgrade(root, "your-directive")`, and an unhandled one hits a `console.error` branch instead of loading. |
| **States as CSS** | Every element gets a `ce` attribute — `loading`, `defined`, `error`. Skeletons, spinners and fade-ins become plain CSS. No JS required. |
| **Define queue** | When `deferDefine: true` (off by default; required by, and required for, `transition: true`), `customElements.define` is replaced by a queue (`customElements.queue`) with `customElements.dequeue()` / `customElements.flush()`, so definitions can be batched instead of firing one by one. Only tags that resolve to a catalog entry are deferred — everything else is forwarded to the original `define`. Independently, when the queue is off the registry installs an idempotent `define` (`polyfill_safe_ce_define`) with a **broad first-wins guard** (any already-defined name is a no-op), so a module — or a design system's shared base elements — cannot double-register a catalog tag. |
| **Transitions** | Definitions can be wrapped in a `ViewTransition` (`types: ['ce']`, `view-transition-name`, `view-transition-class`) so a placeholder can morph into a real component. |
| **Telemetry** | `performance.mark` / `measure` for every `load:<tag>` and `define:<tag>`, visible natively in the DevTools Performance panel. No vendor SDK. |
| **Errors** | A failed load or definition calls `hooks.error` and paints the element `ce="error"` (the watcher then skips that tag on later mutations). With a `fallback`, a fallback instance is appended carrying the message and stack on its `.error` / `.stack`; existing light DOM is left in place. A tag that resolves to no catalog entry stays `:not(:defined)` (never painted) unless `devErrors: true`. |

### Numbers we verified

- **3,467 bytes gzipped** for the main bundle (`gzip -c dist/ce-autoloader.js`, measured 2026-10-12) — the "3kb, no dependencies" claim holds. (10,125 bytes raw.)
- **Three source files** (`src/index.ts`, `src/types.ts`, `src/lifecycle.ts`), 866 lines of readable TypeScript, zero runtime dependencies in the shipped entry.
- The React / Vue / Svelte / Lit / Stencil / vanilla claim is **real**: it's verified by the demo catalogs, not marketing.

That combination — tiny, standards-only, framework-agnostic — is the heart of the project's appeal.

---

## 2. PROS & CONS

### 🐣 For a novice web developer

**Pros**
- **HTML-first, no build step.** `<model-viewer src="...">` and one `<script>` tag. No JSX, no state library, no node toolchain, no CI. Drag it to GitHub Pages and it works.
- **Gentle failure.** A broken component doesn't white-screen the page; you get `ce="error"` and a red border instead. That is genuinely better than a bundle that explodes at parse time.
- **Free skeleton screens.** `my-component:not(:defined) { min-height: 200px; background: #eee }` and you're done.
- Learnable in an afternoon: a catalog is just a map of tags to URLs.

**Cons**
- **The one sharp edge to know about:** the library rewrites `customElements.define` for the whole page. If you later paste in a third-party `<script>` that registers itself, that element will sit there quietly without upgrading — no error, no warning. So the rule for beginners is: *either put components in the catalog, or ask the author to make it catalog-friendly.*
- **It hides concepts that bite later.** Observers, `:defined`, the upgrade lifecycle, import maps and shadow DOM all show up the first time something goes wrong.
- **Thin help ecosystem.** There are no StackOverflow answers for this yet; a tricky bug means reading the source.
- **Layout shift is the default.** `loading="visible"` means components pop in — reserve space or you'll tank CLS.
- **Pre-1.0 (0.1.2) and GPL-3.0.** Small APIs still move, and copying it into a closed-source project has legal strings attached.

### 🧪 For hobbyists

**Pros**
- **Most creative output per unit of yak-shaving.** The docs page itself mixes React, Vue, Svelte, Three.js, `model-viewer`, a QR generator, markdown and a confetti button — each about three lines of HTML.
- **Retrofitting interactivity onto a static or markdown blog with no build** is the killer use case, and it's already supported (`useImportMapsCatalog`, plus a `?autoload` query-param canary that boots a registry straight from the page's import map).
- **Deploy anywhere.** No prod `node_modules`, no CI, no hosting lock-in.

**Cons**
- **Two places to keep in sync** (the catalog and the page). Wildcards help, but a typo only shows up at runtime.
- **Theming is still your job.** Shadow DOM boundaries don't care that the loader is cute; you still need CSS custom-property discipline.
- **No prerender.** An empty `<my-chart>` is invisible to scrapers unless you put fallback markup inside it — and rendering a `fallback` replaces that markup.
- **Import maps + CDN ES modules is a second unfamiliar skill** stacked on top of web components.
- Safe while solo; risky the day a friend's widget or an analytics tag joins the page.

### 🎓 For academia

**Pros**
- **A genuinely excellent teaching artifact.** One dependency-free file demonstrating MutationObserver, IntersectionObserver, custom element upgrades, dynamic import, User Timing, View Transitions and import maps. That's a course reading, not a toy.
- **Auditable in principle:** no transitive dependencies, and the byte-size claim can be reproduced with one command.
- **Real research angles:** progressive-enhancement cost models vs island frameworks, byte/energy savings on constrained networks, and the "no mandatory bundler" hypothesis.
- **Best of all: it's a working polyfill of an open standards gap** (see §5). A reference implementation with measurements is exactly what moves a proposal forward.
- GPL-3.0 fits academia's values well: citation over enclosure.

**Cons**
- **The headline performance claim isn't reproducible yet.** "Core Web Vitals match or exceed Next.js" is backed by a screenshot, not a harness. There's one spec file (`test/observability.test.js`) and a Playwright runner that drives the suites on Chromium + WebKit + Firefox (+ branded Chrome/Edge channels); still no CI and no committed raw data.
- ~~**The artifact itself isn't deterministic:** `importmap.json` pins everything to `@latest`.~~ Fixed (2026-10-12): `importmap.json` is generated by `npm run importmap` (`@jspm/generator`) — versions pinned, and an `integrity` manifest for every CDN URL the docs pages resolve through it.
- **The animated path is Chromium-only**, so "smooth upgrade" results can't be reproduced on Firefox or Safari.
- **Claim inflation weakens the strong parts.** "Universal alternative for next/nuxtjs" invites a fight you don't need to have; the incremental-adoption story is more defensible and more interesting.

### 🧠 For an expert / product team

**Pros**
- **Incremental adoption on server-rendered apps** (Rails, Django, Phoenix, WordPress) where a SPA rewrite is off the table. This is a big, underserved market.
- **Micro-frontends without a runtime.** The `mfe-store` example is the impressive artifact here: each team owns a prefix and a catalog, there's no shared build, no Module Federation, no orchestration runtime, no version-negotiation protocol. **The catalog is the seam.**
- **Framework-agnostic for real**, verified against React, Vue, Svelte, Lit, Stencil and vanilla in the same page.
- **Native telemetry over a vendor SDK**, plus a 3.3 KB budget line you can actually defend.
- **Composes with Declarative Shadow DOM and server-rendered HTML**, which is where the platform is heading anyway.

**Cons**
1. **The global `customElements.define` patch is the biggest adoption risk — and it is permanent on every path, by design.** `deferDefine` is off by default, but the default path still runs `polyfill_safe_ce_define`: an idempotent, **first-wins** `define` (`get(name) → return`), on 100% of loads. The *queue* is the sharp edge: while it is installed, `customElements.get()` reports `undefined` for classes that are already defined (which breaks the common `if (!customElements.get(x)) define(x, y)` guard — the Nord resolver in `pages/components/catalog.js` relies on exactly that), `whenDefined()` never settles, and nothing drains the queue automatically. **Why the patch is kept, not removed:** the `nord-*` design system ships shared base elements (`nord-button`, `nord-card`, …) that self-register at import time; two such modules on one page both try to define the shared tag inside their own `await import(...)`, *before* the resolver's `if (!customElements.get(x))` guard can run, and the platform throws `NotSupportedError` on a same-name (or same-ctor) re-define — in code we don't control. First-wins is the right policy when the loader's job is composing other people's components. The guard is deliberately **broad** (any already-defined name), not `=== ctor`, because a shared tag can arrive as two different class objects; the accepted cost is that it *also* swallows the genuinely-different-constructor case the platform makes loud on purpose — a deliberate divergence from spec, documented here on purpose. **Transient capture (Stage 2) is rejected (2026-10-01):** it does not remove the patch, it makes it flicker (enable/disable per batch, reentrancy across registries, no clean un-patch when another script patched first). One persistent, opt-in patch is easier to reason about than many short ones.
2. ~~**A real awaiting bug.** In `runScopedViewTransition`, `await elements.forEach(async …)` awaits `undefined`.~~ Fixed: it uses `Promise.allSettled(components.map(...))` now, so definitions are awaited and their failures reach `handleComponentLoadError` (2026-09-30).
3. **Element-scoped view transitions are Chromium-only.** Today that includes Chrome/Edge 147+, while Firefox and Safari report no support. `transition` is off by default and gated on `Element.prototype.startViewTransition`, so those browsers never take the path, and an explicit `transition: true` without `deferDefine: true` now throws a `SyntaxError` at construction instead of failing silently (2026-10).
4. **Packaging needs a pass.** `main` and `exports.require` point at `./dist/ce-autoloader.umd.cjs`, which the build never emits (it's ESM-only), so `require('ce-autoloader')` fails. `shadow-observer` is declared as an *optional* peer dependency (`peerDependenciesMeta`) and is no longer imported by the library — the host app imports it to enable shadow root discovery, and the library detects it via `globalThis[Symbol.for('shadow-observer')]`.
5. **Observer cost on big pages.** Every debounced mutation batch re-runs `querySelectorAll(':not(:defined)')` from the root, with `characterData: true` (unnecessary for element discovery) and a non-standard `shadow: 1` hint. Fine for demos, worth measuring on a 2,000-element CMS page.
6. **Rendering a `fallback` used to destroy user content.** Fixed (2026-10): the fallback is *appended*, so slotted / server-rendered light DOM survives, and the message and stack now live on the fallback instance's `.error` / `.stack` properties instead of DOM attributes — no markup echo surface. The `retry()` helper, which cleared content unconditionally, was removed (2026-09-30).
7. **No versioning or integrity *for catalog entries*.** A string catalog is "where the code lives" with no hash and no pin: the library cannot add `integrity` to an arbitrary URL it is handed. The platform already has the answer — import-map `integrity` (Chrome 127+, Firefox 138+, Safari 18+, ≈88% global) — so the *docs site* now demonstrates it: `importmap.json` is pinned and carries a jspm-generated integrity manifest, and the demos resolve their bare specifiers through it. Resolving a catalog through bare specifiers (the `useImportMapsCatalog` path) inherits that for free; a plain URL string still does not.
8. **GPL-3.0 is the quiet adoption blocker.** Corporate legal usually just says no, and the "framework alternative" audience checks the license before the API. Either go permissive (MIT/Apache-2.0 + CLA), or keep GPL and make copyleft an explicit, proud part of the pitch.
9. **Docs are hand-maintained, so they drift.** The "Documentation" link just points back at the demo, and the README's `Options`/API snippets have lagged behind `src/index.ts` before (a stale `upgrade(tag)` signature, plus `autoDiscover` and `hover` options that don't exist). Generating the API reference from the source would remove the whole class of drift.
10. **No imperative completion API.** The `ce` attribute is great for styling, but there's no `ce:load` / `ce:error` event and no `registry.whenLoaded(tag)`, so imperative consumers must poll or observe attributes.

### Quick summary

| Audience | Biggest win | Biggest risk |
| --- | --- | --- |
| Novice | Ship HTML, no toolchain, survivable errors | Silent non-upgrades from the global define patch |
| Hobbyist | Islands on a static blog with zero build | Two sources of truth; no prerender; theming still yours |
| Academia | One-file, standards-rich teaching artifact plus a standards gap to write about | Unreproducible performance claims |
| Expert / teams | Incremental islands and micro-frontends with no runtime or bundler coupling | Global DOM patch, Chromium-only transitions, GPL, packaging gaps |

---

## 3. TODO — the most urgent things

### Tier 0 — correctness (small diffs, big payoff)

- [X] ~~**Fix the await in `runScopedViewTransition`** (`src/index.ts:441`): `forEach` returns `undefined`. Use `for...of` or `Promise.all(elements.map(...))` so definitions are actually awaited and errors surface.~~
- [X] ~~**Guard element-scoped view transitions.** Check `Element.prototype.startViewTransition` and fall back to a plain `define()` (with a try/catch); re-check `prefers-reduced-motion` per element, not just once in the constructor.~~
- [ ] **Make the define-queue safe.** The patch is opt-in (`deferDefine`, off by default) and documented; still open is auto-draining the queue when a non-catalog definition arrives.
  - [X] ~~**Stage 1 done** (`src/index.ts`): `customElements.define` forwards to the original `define` whenever the tag is not in a catalog (`getLoader()`), so third-party registrations are never swallowed. Every registry that installs the queue is consulted (`DEFERRED_REGISTRIES`), `dequeue()` is idempotent, `clean()` opts a registry out, and the patch is now an explicit switch — `deferDefine` (off by default; `false` runs the idempotent `polyfill_safe_ce_define` instead, and the swallow polyfill is gone). Define-phase failures are reported as `ce="error"` instead of being swallowed by `Promise.allSettled`, and a failing transition no longer leaks an unhandled rejection. Covered by `test/transitions.test.js`.~~
  - [x] ~~**Stage 2 — transient capture: rejected (2026-10-01).** It does not remove the `define` patch, it makes it *flicker* (enable/disable per batch, cross-registry reentrancy, no clean un-patch when another script patched first). The patch stays: the queue behind `deferDefine`, and `polyfill_safe_ce_define` always — a deliberate safeguard for design systems (`nord-*`) whose shared base elements self-register more than once.~~ See `memory-bank/progress.md`.
- [X] ~~**Stop destroying light DOM in `retry()`** (`src/index.ts:626–636`). Snapshot once, or remove only what the fallback injected.~~ Removed instead of fixed (2026-09-30): retrying is the app's business, and the method wiped content that the loader never injected. The `fallback` path now *appends* instead (2026-10), so it no longer clobbers light DOM.
- [X] ~~**Keep error text out of attributes**~~ Done (2026-10): the message and stack are set as `.error` / `.stack` properties on the `fallback` instance, not written to the element's attributes.
- [ ] ~~**Fix packaging.** Either emit a real CJS/UMD entry or remove `main`/`exports.require` and declare ESM-only; add `"sideEffects": false` and a `./package.json` export; decide whether `shadow-observer` is a dependency or externalized.~~
- [x] ~~**Fix `?autoload` / `useImportMapsCatalog` (issue #19).**~~ **Done 2026-10-12** — `useImportMapsCatalog: true` reads the page's `<script type="importmap">` and merges it *under* `catalog` (an explicit entry wins a collision); `false` ignores the map. Only the first import map in the document is read, and `getWildcardResolver` is null-safe. Covered by `test/importmap.test.js` (7 tests) and `npm test` 44 × 3 green.
- [ ] **Add completion signals**: `ce:load` / `ce:error` CustomEvents and `registry.whenLoaded(tag)`.

### Tier 1 — credibility

- [ ] **Docs truth pass** (mostly done 2026-10-12): the directive list, queue semantics, view-transition support (Chromium 147+), the garbled `deferDefine` comment, the byte figures, the `Options` block (`useImportMapsCatalog` + `shadowObserver` + `preload()`/`clean()`) and the "Smart Scheduling" / Use Cases copy are fixed. **Still missing:** the README never discloses the global `customElements.define` patch, has no CDN / `?autoload` quickstart, says "3kb gzipped" (really 3,467 B), and the "Documentation" link still points at the demo root.
- [x] ~~**Pin versions and add integrity.** Replace `@latest` in `importmap.json`, add `integrity` for CDN entries, and document "import map + integrity" as the recommended production setup.~~ **Done 2026-10-12** — `importmap.src.json` holds the pinned CDN URLs, `npm run importmap` (`@jspm/generator`) writes `importmap.json` = `{ imports, integrity }`, and `scripts/vite-plugin-importmap.js` injects the whole map into every docs page. Prefix mappings (`@nordhealth/components/`, `lit/`, `lit-html/`) and the two local files are not SRI-checked — a prefix cannot be enumerated and local files are bundled, not fetched.
- [ ] **Make performance claims reproducible.** Replace the Core Web Vitals screenshot with a harness that anyone can run, plus the raw numbers and methodology.
- [x] **Cross-browser test matrix**: Chromium + WebKit + Firefox for the four directives, the error path, and shadow-root discovery. **Done 2026-10-12** — `scripts/run-integration-tests.js` drives `test/integration.html` through Playwright, one pass per browser, and probes the API floor per engine. Branded `chrome` / `msedge` channels are opt-in (`--browser=all`); IE is out of scope (Playwright has no IE support, and the loader needs ES modules, custom elements v1 and import maps).
- [ ] **A stress fixture** (1–2k elements) to measure discovery cost, then scope the rescan to the mutated subtree if needed.

### Tier 2 — direction

- [ ] **Write the standards proposal** (see §5) using this implementation as the reference and evidence.
- [ ] **Make a license decision** — permissive for adoption, or GPL as an explicit values position. Either way, add a contribution and support policy.
- [ ] **Lean into the differentiators** nobody else combines: declarative directives, the `ce` CSS state machine, native telemetry, per-team catalogs, and no-build import-map catalogs.

---

## 4. Future directions

**Near term — earn the trust.**
Correctness first, then honesty in the docs and reproducibility in the benchmarks. Everything else in this document is easier once those two are true.

**Medium term — become the obvious island layer for non-JS backends.**
The strongest position is *incremental adoption*: add islands to Rails, Django, Phoenix, Laravel, WordPress or a static site without a rewrite. Concretely that means:
- **Connection-aware loading.** `saveData` and `effectiveType` so a phone on 3G gets a lighter component — or none at all. This is the platform feature nobody uses, and it's a natural fit for a loader.
- **Component dependency hints.** Let a catalog entry declare its related modules so `<my-chart>` can imply `rel="modulepreload"` for its d3 chunk.
- **Budgets.** A page-level weight cap ("this route may not exceed 150 KB of components") — the thing bundlers do and runtimes never do.
- **Integrity + pinning as a first-class feature**, so "no bundler" doesn't mean "no supply chain".

**Long term — hand it back to the platform.**

The ambition should be for ce-autoloader to become *unnecessary*. If the lazy custom element proposal lands, adopt it natively and keep this library as the compatibility layer for older browsers — progressive enhancement applied to your own tool. A library that plans for its own obsolescence is the most trustworthy kind.

---

## 5. Web standards and proposals nearby

| Standard / proposal | Status (as checked for this review) | How it relates to ce-autoloader |
| --- | --- | --- |
| **Custom Elements + `:defined`** | Baseline, everywhere | The foundation. `:not(:defined)` is how discovery works and how skeletons are styled. |
| **Dynamic `import()` + ES modules** | Baseline | The mechanism: a string in the catalog becomes a network fetch exactly when needed. |
| **Import maps** | Baseline in modern browsers | Already supported as a catalog source (`useImportMapsCatalog`), which is a lovely "no-JS-config" trick. |
| **Import map `integrity`** | Chrome 127+, Firefox 138+, Safari 18+ (≈88% global) | The missing half: SRI for lazily loaded components, with no build step. High-leverage and cheap to adopt. |
| **Declarative Shadow DOM** | Baseline in modern browsers | Lets server-rendered markup carry its own shadow content — the natural partner for islands. |
| **View Transitions (document)** | Broadly supported | Used for morphing placeholders into components. |
| **Element-scoped view transitions** | Chromium 147+; Firefox and Safari report no support (≈65% global) | The animated default relies on this. It needs a capability check and a graceful plain-define path. |
| **`view-transition-class`, transition `types`** | Chrome 125+, Safari 18.2+, Firefox 144+ (≈88%) | Already exposed per element through `view-transition-class` attributes. Wider support than element-scoped transitions. |
| **User Timing API** | Baseline | Used for telemetry; shows up natively in the Performance panel. |
| **IntersectionObserver** | Baseline | The `visible` directive, with a 20% root margin. |
| **Speculation Rules API** | Chromium, widely available | Complementary: prefetch/prerender whole pages, while ce-autoloader handles components within a page. |
| **Custom Elements Manifest** | Emerging convention | `package.json` already declares `"customElements": "custom-elements.json"`. A manifest-driven catalog would make the registry self-describing. |
| **WICG/webcomponents #782 — "Lazy Custom Element Definitions"** | **Open since Jan 2019, still labeled "needs a concrete proposal"** | This *is* ce-autoloader, proposed as `customElements.defineLazy(tag, () => import(...))` with an element-definition-loading event. The issue even notes that a polyfill "will have to patch `attachShadow`" — which is exactly what `shadow-observer` does. A working implementation plus numbers is precisely what the issue is waiting for. |
| **MountObserver** (WICG/webcomponents discussion) | Active proposal + polyfill | A more ambitious neighbour: CSS-selector matching, `whereElementIntersectsWith`, `whereConnectionHas` (network-aware), `whenDefined`, mount/dismount events, code-split handlers, WeakRef memory management, even `<script type="cede">` declarative definitions. Read it as both validation and competition — and design so you can delegate to it later. |

---