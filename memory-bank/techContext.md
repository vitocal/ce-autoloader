# Tech Context — ce-autoloader

## Stack

- **Language:** TypeScript (source), plain ESM output. `tsconfig.json`: `target: es2025`, `module: esnext`,
  `isolatedModules`, `noEmit`, `jsx: react-jsx`, `strict: false`, `noUnusedLocals`/`noUnusedParameters` on,
  `experimentalDecorators`, `libReplacement`. `include: ["src/*"]`.
  - `react`, `react-dom` and their subpaths are path-aliased to `preact/compat` — **Preact is the React in this
    repo.**
- **Build (library):** Vite library mode + `vite-plugin-dts` (`rollupTypes: true`, `insertTypesEntry: true`).
  `vite.config.js`: entry `src/index.ts`, name `CEAutoLoader`, fileName `ce-autoloader`, `formats: ["es"]`,
  `external: ["shadow-observer"]`, `copyPublicDir: false`, `emptyOutDir: true`.
- **Build (docs/demo):** `vite.docs.js` — MPA (`appType: "mpa"`), output to `docs/`, `base` = `/ce-autoloader/`
  when `NODE_ENV=production` else `/`, inputs = `index.html` + every `.html` under `pages/` and `test/`,
  `modulePreload: false`, `chunkFileNames: "chunks/[name].js"`, `manifest: false`, `sourcemap: true`,
  alias `@ → pages`.
- **Plugins used for the demo:** `@vitejs/plugin-vue` (all dashed tags treated as custom elements),
  `@sveltejs/vite-plugin-svelte` (`customElement: true`), `@preact/preset-vite`, `importmap-vite-plugin`
  (provides `virtual:importmap`); `@stencil-community/unplugin-stencil` is **imported but not registered** in
  `vite.docs.js` (`stencil` is currently an unused import).
- **`optimizeDeps.exclude`:** `@nordhealth/components`, `lit`, `lit-html`, `@lit/reactive-element`,
  `lit/static-html.js`, `shadow-observer`.
- **Tests:** Mocha (browser, loaded from unpkg) + Chai + `uhtml` (from `esm.sh`) + Puppeteer (headless) driving a
  Vite dev server. See `memory-bank/testing.md`.
- **Runtime deps:** none shipped. `peerDependencies: { "shadow-observer": "^0.1.7" }`, declared `external` in the
  Rollup config. `sideEffects: false`. `exports` only exposes `.` → `dist/ce-autoloader.js` with types
  `dist/dist.d.ts`. `main`/`module` also point at the ESM bundle (packaging was fixed on this branch: no
  `require`/UMD entry any more).
- **`customElements` manifest:** `package.json` declares `"customElements": "custom-elements.json"`, but
  **no such file is generated** by any script and `@custom-elements-manifest/analyzer` is installed but unused.
- **Docs/demo frameworks in `devDependencies`:** vue, svelte, preact, lit, react(-dom) [→preact], three.js,
  `@google/model-viewer`, `globe.gl`, `nordhealth/components`, `canvas-confetti`, `qrcode-pix`, `navigo`,
  `syntax-highlight-element`, `@r2wc/react-to-web-component`, `view-transitions-toolkit`,
  `@preact/signals-core|react`, `remount`, `puppeteer`, `mocha`, `chai`.

## Environment (verified)

- Node **v25.8.1**, npm **11.11.0** (macOS/darwin).
- Current branch **`tier0-fixes`** @ `d898c37` ("Organize integration test"); `origin` =
  https://github.com/vitocal/ce-autoloader ; `origin/main` @ `607a012` ("Update docs").
- `dist/` is built and gitignored; `docs/` is committed output (GitHub Pages).
- `package-lock.json` is gitignored.

## Commands

| Command                              | What it does                                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                      | Build the library with `vite.config.js` → `dist/` (also runs on `prepack`)                                                                                                                    |
| `npm run dev`                        | Docs/demo dev server via `vite.docs.js` (default port **5173**)                                                                                                                               |
| `npm run build:docs`                 | Build the docs site into `docs/` (use `NODE_ENV=production npm run build:docs` for the GH Pages base path)                                                                                    |
| `npm test` → `npm run test:headless` | `node scripts/run-integration-tests.js`: spawns `npm run dev`, waits 3 s, runs Mocha tests in headless Puppeteer at `http://localhost:5173/test/integration.html`, exits non-zero on failures |
| `npm publish`                        | Publish (`prepack` rebuilds) to npm                                                                                                                                                           |

## Technical constraints & gotchas

- **ESM-only.** No CJS/UMD entry; `require("ce-autoloader")` is not supported (by design).
- **Element-scoped view transitions are Chromium-only** (`Element.prototype.startViewTransition`) — guarded by
  `SUPPORTS_SCOPED_VT`; transition default is therefore off in Firefox/Safari. Document-scoped
  `document.startViewTransition` is broadly available and is used in the commented-out legacy path.
- **`prefers-reduced-motion`** is checked **once in the constructor**, not per element.
- `src/index.ts` module tail: if the loaded URL has `?autoload` in its query string, it immediately creates
  `window.registry = new CEAutoLoader({ useImportMapsCatalog: true })` — this is a side effect at module scope
  (mitigated by `sideEffects: false` in `package.json`).
- `types.d.ts` augments the DOM globally: `window.registry`, `CSSStyleDeclaration.viewTransitionClass`,
  `HTMLElement.startViewTransition`, `CustomElementRegistry.queue/flush/dequeue`, plus a `globe.gl` ambient
  module declaration.
- `importmap.json` pins everything to `@latest` (known reproducibility problem — Tier 1 backlog).
- The docs catalog intentionally routes some entries through bare specifiers (`lit`, `@nordhealth/components`,
  `@google/model-viewer`) which are resolved by the import map, not the bundler (`/* @vite-ignore */` is used for
  dynamic bare-specifier imports).
- Formatting: Prettier config (`.prettierrc`) — `printWidth: 120`, double quotes, `tabWidth: 2`, trailing commas
  `all`. The existing source does not consistently follow it; match surrounding code rather than reformatting.
