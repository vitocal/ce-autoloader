# Project Brief — ce-autoloader

## What it is

A ~3 KB (3,286 bytes gzipped) dependency-free **web component lazy loader / registry**. You declare a
catalog of `tag-name → URL | () => import(...)`; ce-autoloader watches the DOM and downloads + defines each
custom element only when the page asks for it (viewport, click, eager, or manually).

- npm package: `ce-autoloader` **v0.1.2**, license **GPL-3.0**, **ESM-only**.
- Implementation: **one source file**, `src/index.ts` (675 lines), zero runtime dependencies in the shipped entry.
- Repo: https://github.com/vitocal/ce-autoloader — live docs/demo: https://vitocal.github.io/ce-autoloader/

## Core requirements / scope

1. **Lazy by default** — code for a component that is not on the page must never be fetched.
2. **The catalog is the seam** — one map decides what a tag resolves to. Wildcards (`nord-*`) map a whole
   namespace to a single resolver function.
3. **Declarative control** through the `loading` attribute: `eager`, `visible` (default), `click`, `manual`.
   Any other value is a *custom directive* upgraded via `registry.upgrade(root, "<value>")`.
4. **Standards only** — Custom Elements + `:defined`, dynamic `import()`, `MutationObserver`,
   `IntersectionObserver`, import maps, User Timing API, View Transitions API. No vendor runtime.
5. **Framework-agnostic for real** — React, Vue, Svelte, Lit, Stencil, Preact, plain vanilla, Three.js,
   `model-viewer`, `globe.gl` all load through the same catalog in the docs page.
6. **Observable lifecycle** — `ce="loading|defined|error"` attribute for CSS states, plus
   `performance.mark/measure` entries `load:<tag>` and `define:<tag>` visible in the DevTools Performance panel.
7. **Graceful failure** — `error`/`stack`/`retries` attributes, optional `fallback` component,
   `registry.retry(el)`.
8. **No build step for consumers** — works from one `<script type="module">`; the catalog can even be sourced
   from the page's own `<script type="importmap">` (`useImportMapsCatalog` / `?autoload` canary).

## Non-goals

- No bundler, no module federation, no orchestration runtime, no framework.
- Not an SSR/prerender solution — authors reserve space, the library only defers definition.
- Not a theming layer or design system (authors still own Shadow DOM CSS discipline).

## Success criteria

- Byte budget stays ~3 KB gzipped, no dependencies in `dist/`.
- Docs site stays fast (Core Web Vitals claims must remain reproducible — see Tier 1 backlog).
- API/docs stay in sync with the source (drift is a known historical problem).
- **Eventually obsolete:** if the WICG "Lazy Custom Element Definitions" proposal (`WICG/webcomponents#782`)
  lands, adopt it natively and keep this as a compatibility layer.

## Key documents

- `README.md` — user-facing install/API/directive/transition docs.
- `REVIEW.md` — friendly-but-honest review + the **tiered TODO backlog (Tier 0/1/2)** that drives current work.
- `memory-bank/review-roadmap.md` — condensed working copy of that backlog.
- `pages/examples/mfe-store/` — the micro-frontend proof (per-team catalogs, no shared runtime).
