# Product Context — ce-autoloader

## Why it exists

Modern pages download JavaScript *before* anyone knows whether it is needed. The decision "what code does this
page get?" is made at build time by a bundler, far away from the HTML where the answer actually lives. Lazy
loading exists, but it is usually bolted on case by case and drags a whole toolchain behind it.

**The idea:** flip the default. `<script type="module">` plus a catalog map, and **the DOM becomes the
dependency graph**. A tag on the page is fetched when the page says so; a tag that is absent costs nothing.

One sentence: *treat distribution as an HTML problem instead of a package-manager problem.*

## Problems it solves

| Problem | How ce-autoloader answers it |
| --- | --- |
| JS bloat from build-time bundling | Runtime, per-tag loading driven by markup |
| SPA rewrite required to add interactivity | Islands dropped into existing server-rendered HTML |
| Micro-frontends needing Module Federation / orchestration | Per-team prefix + per-team catalog; no shared runtime, no version negotiation |
| Framework lock-in | Anything that exports a custom element works |
| Opaque load performance | `ce` attribute states + native User Timing marks, no vendor SDK |
| Fragile all-or-nothing bundles | Per-component failure isolation, fallback components, retry |

## Target audiences (from REVIEW.md)

- **Novice web dev** — HTML-first, no toolchain, survivable errors. Risk: the global `customElements.define`
  patch silently swallows third-party registrations.
- **Hobbyist** — retrofitting interactivity onto a static/markdown blog with no build. Risk: two sources of
  truth (catalog + page), no prerender, theming still yours.
- **Academia** — one dependency-free file demonstrating MutationObserver, IntersectionObserver, custom element
  upgrades, dynamic import, User Timing, View Transitions and import maps; plus a real standards gap to write
  about. Risk: unpinned versions and unreproducible performance claims.
- **Expert / product teams** — incremental islands on Rails/Django/Phoenix/WordPress, and micro-frontends
  without a runtime. Risk: global DOM patch, Chromium-only element-scoped transitions, GPL-3.0, packaging gaps.

## How it should feel

- **Legible:** you can read the whole library in one sitting, and read a page's dependency graph in its HTML.
- **Forgiving:** a broken component shows `ce="error"` (or a fallback) instead of white-screening the page.
- **Boring at the boundary:** each catalog entry is one line; adding a library never means touching a build config.
- **Honest:** if the platform can do it natively later, the library should shrink, not grow.

## UX / DX goals

- 3 KB budget you can defend; no transitive dependencies.
- Skeleton screens and spinners become plain CSS via `:not(:defined)` and `[ce="…"]`.
- Zero configuration path: drop in the script, or boot straight from the page's import map (`?autoload`).
- Progressive enhancement of the library itself: if element-scoped view transitions are unavailable, components
  must still define (plain `define()` fallback).

## Adopted / adjacent standards (context for design decisions)

Custom Elements + `:defined` (baseline), dynamic `import()` + ESM (baseline), import maps (baseline),
import-map `integrity` (Chrome 127+/Firefox 138+/Safari 18+ — **not yet adopted**), Declarative Shadow DOM
(baseline), document-scoped View Transitions (broad), **element-scoped View Transitions (Chromium-only ≈65%)**,
`view-transition-class` / transition `types` (≈88%), User Timing (baseline), IntersectionObserver (baseline),
Speculation Rules (Chromium), Custom Elements Manifest (emerging), `WICG/webcomponents#782` lazy custom element
definitions (**open since Jan 2019**) and the `MountObserver` proposal (active neighbour/competition).
