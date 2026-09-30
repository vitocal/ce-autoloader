# Project brief

**ce-autoloader** — a lazy loader + registry for web components. A tag that is on the page is fetched when the
page says so; a tag that is absent costs nothing. ~3.4 kB gzip, no runtime dependencies, one source file
(`src/index.ts`, ~700 lines).

- npm `ce-autoloader` 0.1.2 · GPL-3.0 · ESM-only
- Repo <https://github.com/vitocal/ce-autoloader> · demo <https://vitocal.github.io/ce-autoloader/>

## Scope

1. **Lazy by default** — no component code unless the component is used.
2. **The catalog is the only seam** — `tag → URL | (name, el) => Promise<ctor>`, plus wildcards (`nord-*`).
3. **Declarative timing** — `loading="eager|visible|click|manual"`; any other value is a custom directive for
   `registry.upgrade(root, value)`.
4. **Standards only** — custom elements, dynamic `import()`, `MutationObserver`, `IntersectionObserver`, import
   maps, User Timing API, View Transitions API.
5. **States as CSS** — `ce="loading|defined|error"` on the element; skeletons, spinners and fades are plain CSS.
6. **Native telemetry** — `load:<tag>` / `define:<tag>` performance measures. Failures add `error` / `stack` /
   `retries` attributes and can render a `fallback` element.
7. **No build step for consumers** — one `<script type="module">`; the catalog can also be the page's import map.

## Non-goals

Bundler, SSR/prerender, design system, framework, orchestration runtime.

## Eventual obsolescence

This library is a polyfill for a standard proposal: `customElements.defineLazy(tag, loader)` plus an
`element-definition-loading` event. It has been open since Jan 2019 and is still labelled "needs concrete
proposal". The proposal itself suggests polyfilling with a `MutationObserver` that patches `attachShadow` to
reach shadow roots — which is what this repo does (see `roadmap.md` for how well).

Refs: [WICG/webcomponents#782](https://github.com/WICG/webcomponents/issues/782) ·
[custom-elements-manifest](https://github.com/webcomponents/custom-elements-manifest)
