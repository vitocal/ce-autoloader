# Project brief

**ce-autoloader** — a lazy loader + registry for web components. A tag on the page is fetched when the page says so;
a tag that is absent costs nothing. ~3.3 kB gzip, no runtime dependencies, one source file (`src/index.ts`).

npm `ce-autoloader` 0.1.2 · GPL-3.0 · ESM-only · demo <https://vitocal.github.io/ce-autoloader/>

## Scope

1. **Lazy by default** — no component code unless the component is used.
2. **The catalog is the only seam** — `tag → URL | (name, el) => Promise<ctor>`, plus wildcards (`nord-*`).
3. **Declarative timing** — `loading="eager|visible|click|manual"`; any other value is a custom directive for
   `registry.upgrade(root, value)`.
4. **Standards only** — custom elements, dynamic `import()`, `MutationObserver`, `IntersectionObserver`, import maps,
   User Timing, View Transitions.
5. **States as CSS** — `ce="loading|defined"`. `ce="error"` is painted only for a tag the catalog knows about, and
   only unless `devErrors: false`; `hooks.error` runs in every case.
6. **Native telemetry** — `load:<tag>` / `define:<tag>` performance measures.
7. **No build step for consumers** — one `<script type="module">`; the catalog can be the page's import map.

Non-goals: bundler, SSR/prerender, design system, framework, orchestration runtime.

## Eventual obsolescence

This library is a polyfill for a standard proposal: `customElements.defineLazy(tag, loader)` plus an
`element-definition-loading` event — open since Jan 2019 and still labelled
["needs concrete proposal"](https://github.com/WICG/webcomponents/issues/782). The proposal itself suggests
polyfilling with a `MutationObserver` that patches `attachShadow` to reach shadow roots, which is what this repo does.
