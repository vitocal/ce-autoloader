# REVIEW.md

*A friendly, honest review of ce-autoloader — where it shines, where it has sharp edges, and where it could take us.*

> This is a snapshot written after reading the current source (`src/index.ts`, 683 lines), the build config, the
> catalogs, the MFE example and the test setup. It's meant to stay useful: update it when the code changes,
> not when the mood does.

---

## 1. The big idea, in plain words

**The problem.** A typical modern page downloads a lot of JavaScript *before* anyone knows whether it's needed.
The decision about "what code does this page get?" is made at build time by a bundler, far away from the HTML
where the actual answer lives. Lazy loading exists, but it's usually bolted on case by case, and it drags a whole
toolchain behind it.

**The idea here.** Flip the default. A component that isn't on the page isn't downloaded. A component that *is*
on the page is downloaded when the page says so — `loading="visible"`, `loading="click"`, `loading="eager"` — using
nothing but the browser's own standards: Custom Elements, dynamic `import()`, `IntersectionObserver`, and (optionally)
import maps.

One sentence: **`<script type="module">` plus a catalog map, and the DOM becomes the dependency graph.**

### How it works today

| Piece | What it does |
| --- | --- |
| **Catalog** | A single map of `tag name → URL` or `tag name → () => import(...)`. It's also the ownership boundary: `nord-*`, `decide-*`, `explore-*` are team or library namespaces. |
| **Discovery** | A `MutationObserver` watches the DOM (via `shadow-observer` to reach into shadow roots, with a native fallback) and scans with `querySelectorAll(':not(:defined)')`. A 100 ms debounce keeps it civil. |
| **Directives** | The `loading` attribute: `eager` (now), `visible` (in viewport), `click` (first interaction), `manual` (you call `registry.upgrade(root, "manual")`). Anything unknown currently falls through to an immediate load. |
| **States as CSS** | Every element gets a `ce` attribute — `loading`, `defined`, `error`. Skeletons, spinners and fade-ins become plain CSS. No JS required. |
| **Define queue** | While transitions are enabled, `customElements.define` is replaced by a queue (`customElements.queue`) with `customElements.dequeue()` / `customElements.flush()`, so definitions can be batched instead of firing one by one. |
| **Transitions** | Definitions can be wrapped in a `ViewTransition` (`types: ['ce']`, `view-transition-name`, `view-transition-class`) so a placeholder can morph into a real component. |
| **Telemetry** | `performance.mark` / `measure` for every `load:<tag>` and `define:<tag>`, visible natively in the DevTools Performance panel. No vendor SDK. |
| **Errors** | Failed loads set `ce="error"` plus `error` / `stack` / `retries` attributes, can render a fallback component, and can be retried with `registry.retry(el)`. |

### Numbers we verified

- **3,286 bytes gzipped** for the main bundle (`gzip -c dist/ce-autoloader.js`) — the "3kb, no dependencies" claim holds.
- **One source file**, 683 lines of readable TypeScript, zero runtime dependencies in the shipped entry.
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
- **No prerender.** An empty `<my-chart>` is invisible to scrapers unless you put fallback markup inside it — and `registry.retry()` currently clears that markup.
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
- **The headline performance claim isn't reproducible yet.** "Core Web Vitals match or exceed Next.js" is backed by a screenshot, not a harness. There's one spec file (`test/observability.test.js`) and a Puppeteer script; no CI, no browser matrix, no committed raw data.
- **The artifact itself isn't deterministic:** `importmap.json` pins everything to `@latest`.
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
1. **The global `customElements.define` patch is the biggest adoption risk.** It rewrites a DOM standard document-wide, `customElements.get()` then reports `undefined` for classes that are already defined (which breaks the common `if (!customElements.get(x)) define(x, y)` guard — the Nord resolver in `pages/components/catalog.js` relies on exactly that), `whenDefined()` never settles, and nothing drains the queue automatically. Make it opt-in and self-draining.
2. **A real awaiting bug.** In `runScopedViewTransition`, `await elements.forEach(async …)` awaits `undefined` — `forEach` never returns a promise. Transitions therefore run fire-and-forget, `loadAndDefine` resolves too early, and `define:` timings race `load:` timings. `for...of` or `Promise.all(map(...))` fixes it.
3. **Element-scoped view transitions are Chromium-only.** Today that includes Chrome/Edge 147+, while Firefox and Safari report no support (≈65% of global usage, from the caniuse data checked for this review). The default is accidentally protected by an `"startViewTransition" in document.body` check — but the README advises setting `transition: true`, and *then* Firefox and Safari throw inside the awaited path and components never define at all. Check `Element.prototype.startViewTransition` and fall back to a plain define.
4. **Packaging needs a pass.** `main` and `exports.require` point at `./dist/ce-autoloader.umd.cjs`, which the build never emits (it's ESM-only), so `require('ce-autoloader')` fails. `shadow-observer` is declared a *peer* dependency but ends up bundled into `dist/`; there's no `sideEffects: false`, and the `?autoload` canary sits at module top level, so plain side-effect imports behave surprisingly.
5. **Observer cost on big pages.** Every debounced mutation batch re-runs `querySelectorAll(':not(:defined)')` from the root, with `characterData: true` (unnecessary for element discovery) and a non-standard `shadow: 1` hint. Fine for demos, worth measuring on a 2,000-element CMS page.
6. **The error path touches user content.** `retry()` clears `innerHTML` (which destroys slotted light DOM and server-rendered fallbacks), and error text plus stack traces are written into DOM attributes — a leak and injection surface if any template echoes attributes.
7. **No versioning or integrity by default.** String catalogs are "where the code lives" with no hash and no pin — and `importmap.json` says `@latest` everywhere. The platform already has the answer: import-map `integrity` is widely supported now (Chrome 127+, Firefox 138+, Safari 18+, ≈88% global). Resolving catalog entries through bare specifiers would give you SRI for free.
8. **GPL-3.0 is the quiet adoption blocker.** Corporate legal usually just says no, and the "framework alternative" audience checks the license before the API. Either go permissive (MIT/Apache-2.0 + CLA), or keep GPL and make copyleft an explicit, proud part of the pitch.
9. **Docs are hand-maintained, so they drift.** The "Documentation" link just points back at the demo, and the README's `Options`/API snippets have lagged behind `src/index.ts` before (a stale `upgrade(tag)` signature, plus `autoDiscover` and `hover` options that don't exist). Generating the API reference from the source would remove the whole class of drift.
10. **No imperative completion API.** The `ce` attribute is great for styling, but there's no `ce:load` / `ce:error` event and no `registry.whenLoaded(tag)`, so imperative consumers must poll or observe attributes.

### Quick summary

| Audience | Biggest win | Biggest risk |
| --- | --- | --- |
| Novice | Ship HTML, no toolchain, survivable errors | Silent non-upgrades from the global define patch |
| Hobbyist | Islands on a static blog with zero build | Two sources of truth; no prerender; theming still yours |
| Academia | One-file, standards-rich teaching artifact plus a standards gap to write about | Unreproducible performance claims and unpinned versions |
| Expert / teams | Incremental islands and micro-frontends with no runtime or bundler coupling | Global DOM patch, Chromium-only transitions, GPL, packaging gaps |

---

## 3. TODO — the most urgent things

### Tier 0 — correctness (small diffs, big payoff)

- [X] ~~**Fix the await in `runScopedViewTransition`** (`src/index.ts:441`): `forEach` returns `undefined`. Use `for...of` or `Promise.all(elements.map(...))` so definitions are actually awaited and errors surface.~~
- [X] ~~**Guard element-scoped view transitions.** Check `Element.prototype.startViewTransition` and fall back to a plain `define()` (with a try/catch); re-check `prefers-reduced-motion` per element, not just once in the constructor.~~
- [ ] **Make the define-queue safe.** Make the `customElements.define` patch opt-in, auto-drain the queue when a non-catalog definition arrives, and document what it means for third-party scripts.
- [ ] **Stop destroying light DOM in `retry()`** (`src/index.ts:626–636`). Snapshot once, or remove only what the fallback injected.
- [ ] ~~**Fix packaging.** Either emit a real CJS/UMD entry or remove `main`/`exports.require` and declare ESM-only; add `"sideEffects": false` and a `./package.json` export; decide whether `shadow-observer` is a dependency or externalized.~~
- [ ] **Add completion signals**: `ce:load` / `ce:error` CustomEvents and `registry.whenLoaded(tag)`.

### Tier 1 — credibility

- [ ] **Docs truth pass**: directive list (including what `hover` really does today), queue semantics, real view-transition browser support, and a working "Documentation" link.
- [ ] **Pin versions and add integrity.** Replace `@latest` in `importmap.json`, add `integrity` for CDN entries, and document "import map + integrity" as the recommended production setup.
- [ ] **Make performance claims reproducible.** Replace the Core Web Vitals screenshot with a harness that anyone can run, plus the raw numbers and methodology.
- [ ] **Cross-browser test matrix**: Chromium + WebKit + Firefox for the four directives, the error path, retry, and shadow-root discovery (Mocha + Puppeteer is already in place; WebKit/Firefox are one config away).
- [ ] **A stress fixture** (1–2k elements) to measure discovery cost, then scope the rescan to the mutated subtree if needed.
- [ ] **Trim the observer cost**: drop `characterData`, and stop skipping by the mutation *target's* tag name (one failed `<my-chart>` currently suppresses discovery for that tag across the page).
- [ ] **Keep error text out of attributes** (or clearly document the trade-off) — stack traces in markup can be cached and echoed.

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
| **IntersectionObserver** | Baseline | The `visible` directive, with a 20% scroll margin. |
| **Speculation Rules API** | Chromium, widely available | Complementary: prefetch/prerender whole pages, while ce-autoloader handles components within a page. |
| **Custom Elements Manifest** | Emerging convention | `package.json` already declares `"customElements": "custom-elements.json"`. A manifest-driven catalog would make the registry self-describing. |
| **WICG/webcomponents #782 — "Lazy Custom Element Definitions"** | **Open since Jan 2019, still labeled "needs a concrete proposal"** | This *is* ce-autoloader, proposed as `customElements.defineLazy(tag, () => import(...))` with an element-definition-loading event. The issue even notes that a polyfill "will have to patch `attachShadow`" — which is exactly what `shadow-observer` does. A working implementation plus numbers is precisely what the issue is waiting for. |
| **MountObserver** (WICG/webcomponents discussion) | Active proposal + polyfill | A more ambitious neighbour: CSS-selector matching, `whereElementIntersectsWith`, `whereConnectionHas` (network-aware), `whenDefined`, mount/dismount events, code-split handlers, WeakRef memory management, even `<script type="cede">` declarative definitions. Read it as both validation and competition — and design so you can delegate to it later. |

**The gap in one line:** the platform standardised *defining* custom elements but never standardised *deferring* them. That gap is the entire reason this project exists — and it's also the reason it should keep talking to standards folks.

---

## 6. A philosophy: the web, twenty years from now

Let's be honest about the itch. Twenty years ago you could right-click any page, choose *View Source*, and learn how it was made. A single `<script>` tag did something visible. The web was legible, and that legibility is what made it democratic — anyone could learn by reading, and anyone could publish by writing a file.

We traded that away for capability. Frameworks gave us ergonomics, bundlers gave us tooling, and the cost was that "make a small interactive thing" now requires a package manager, a build pipeline, a CI job and a licence audit. The knowledge became guarded by toolchains instead of by the platform.

The interesting thing is that the *platform caught up*. Custom elements, shadow DOM, ES modules, dynamic import, import maps, declarative shadow DOM, view transitions, container queries, `:has()`, CSS nesting and cascade layers — most of what frameworks gave us is now just... the web. What hasn't caught up is our **habits**, and our **distribution**.

So here's a plausible, desirable 20-year picture:

**1. Code gets smaller because the platform absorbs the layers.**
The framework's job in 2045 is the small, opinionated part — ergonomics for authors — and the platform handles rendering, composition, packaging and scheduling. A "page bundle" becomes the exception that needs justification, not the default. Build steps shrink to transforms (types, minification), never to graph management.

**2. A component becomes an addressable thing — like a page.**
Today, reusing someone's component means installing a package inside someone else's build system, inside a framework version, inside a bundler config. Tomorrow it should mean one line: `<price-tag currency="EUR">`, backed by a URL. The **catalog is the contract**, and publishing a component is as ordinary as publishing a page. That is the quiet radicalism of this project: it treats distribution as an HTML problem instead of a package-manager problem.

**3. Small pieces, many owners, composed by anyone.**
When composition doesn't require a build, a design system, a chart, a map, a 3D viewer and a payment form can come from five different people in five different languages and still sit side by side. Ownership maps to namespaces (`team-*`). No runtime needs to negotiate versions because nothing shares a runtime. This is what federated frontends always promised and rarely delivered — delivered by making the boundary boring.

**4. Integrity and trust become the interesting problems.**
Once distribution is decoupled from bundling, the real questions are: *is this code the code I approved?* and *what does this component cost my users?* Import-map `integrity`, version pinning and byte budgets become the vocabulary of a healthy page — and they're far healthier questions than "which bundler version do you have?".

**5. Simplicity becomes a shared, re-earned virtue rather than nostalgia.**
The point is not to go back. It's to notice that the browser now ships everything we needed, and to stop paying rent on the past. A person with a text editor and a free afternoon should be able to publish something interactive, accessible and fast — and should be able to *read* how other people did it. That's not a technical goal so much as a democratic one: **low floors, high ceilings, and open doors.**

**6. And the honest risks.**
Decentralised distribution can re-centralise on whichever CDN is fastest and cheapest. "No build" can become "no type safety, no tests" if we're lazy about it. Standards proposals can move slowly enough that people reinvent them badly nine times. And a loader is not a substitute for designing for accessibility, privacy or energy use — those are values, not features. The healthy version of this future is not "no tooling"; it's **tooling that is optional, legible, and owned by the people who use it.**

**Where ce-autoloader fits.**
It's a small, concrete bet on that future: that the DOM is a good enough dependency graph, that the platform is allowed to win, that a component can be a URL, and that a page should only pay for what it uses. Three kilobytes of that bet is a bargain — especially if it eventually gets deleted because the browser learned to do it natively.

---

*Written after reading the source at commit `daf6857` (v0.1.2). Keep this document honest: if something here stops being true, fix the document or fix the code — never leave the reader guessing.*
