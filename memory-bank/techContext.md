# Tech context

## Stack

- TypeScript source (`src/index.ts`), ESM-only output. `tsconfig`: `target es2025`, `module esnext`,
  `isolatedModules`, `strict: false`, `noUnusedLocals`, `jsx: react-jsx` with **`react` and `react-dom` aliased
  to `preact/compat`** (Preact is the React in this repo).
- Library build: `vite.config.js` — lib mode + `vite-plugin-dts` (rolled-up types), `formats: ["es"]`,
  `external: ["shadow-observer"]`.
- Docs/demo build: `vite.docs.js` — Vite MPA, `base: /ce-autoloader/` in production, output `docs/`, plugins for
  Vue, Svelte (`customElement: true`), Preact and import maps. The Stencil plugin is imported but never registered.
- Tests: Mocha (unpkg) + Chai + `uhtml` (esm.sh) + headless Puppeteer on a Vite dev server → `testing.md`.
- No runtime dependencies. `peerDependencies: shadow-observer` (external, and currently unused). `sideEffects:
  false`. `package.json` advertises `custom-elements.json`, which nothing generates.

## Commands

| Command | Notes |
| --- | --- |
| `npm run dev` | docs/demo dev server on port 5173 |
| `npm run build` | library → `dist/` (also runs on `prepack`) |
| `NODE_ENV=production npm run build:docs` | rebuilds all of `docs/` with new hashes — **restore `docs/.nojekyll` afterwards** (Vite empties the output dir) |
| `npm test` | `scripts/run-integration-tests.js`: dev server + headless Puppeteer + Mocha |
| `npm publish` | `prepack` rebuilds first |

While iterating, prefer the Chrome DevTools MCP over `npm test` — see `testing.md`.

## Gotchas

- **Element-scoped view transitions are Chromium 147+ (64.9% global; no Firefox, no Safari).** `SUPPORTS_SCOPED_VT`
  gates the entire transition path, so in Firefox/Safari the queue is never installed either.
- `@starting-style` and `transition-behavior: allow-discrete` are Baseline (Chrome/Edge 117, Firefox 129,
  Safari 17.5 / 17.4) — unlike element-scoped transitions. That gap is why the CSS-only animation path matters.
- `prefers-reduced-motion` is read once, in the constructor — not per element.
- `intersectionOptions: { scrollMargin: "20%" }` does nothing; `IntersectionObserver` only understands `rootMargin`.
- `shadow-observer` is awaited and then ignored (the `finally` wins — bug #1).
- `?autoload` in the module URL boots `window.registry` with the import-map catalog: a module-scope side effect.
- `importmap.json` pins CDN entries to `@latest` (Tier 1: pin + `integrity`).
- Prettier is configured for 2 spaces, double quotes, 120 columns — the source does not follow it consistently,
  so match the file you are editing instead of reformatting.

Refs: [caniuse: `Element.startViewTransition`](https://caniuse.com/mdn-api_element_startviewtransition) ·
[Chrome: element-scoped view transitions](https://developer.chrome.com/blog/element-scoped-view-transitions) ·
[web.dev: Baseline entry animations](https://web.dev/blog/baseline-entry-animations)
