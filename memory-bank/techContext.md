# Tech context

## Stack

- TypeScript (`src/index.ts` + `src/types.ts`) → ESM-only. `tsconfig`: `target es2025`, `module esnext`,
  `isolatedModules`, `strict: false`, `noUnusedLocals`; **`react` / `react-dom` are aliased to `preact/compat`**
  (Preact is the React in this repo). Types and the `CEError` class live in `src/types.ts` now (the old ambient
  `src/types.d.ts` is gone) — that split is what finally made `tsc --noEmit` clean.
- Library build: `vite.config.js` — lib mode + `vite-plugin-dts`, `formats: ["es"]`, `external: ["shadow-observer"]`.
  Only `tsconfig.json` (`include: ["src/*"]`) is used by `tsc` and the dts step. Note: the dts step writes
  `dist/dist.d.ts` even when `--outDir` points elsewhere.
- Docs build: `vite.docs.js` — Vite MPA, `base: /ce-autoloader/` in production, output `docs/`, plugins for Vue,
  Svelte (`customElement: true`), Preact and import maps. The Stencil plugin is imported but never registered (issue
  #9).
- Editor project: `pages/tsconfig.json` (`extends` the root, `include: ["**/*.ts", "**/*.tsx"]`) binds the demo sources to a *configured* project. A file outside every tsconfig lands in an **inferred** project, which ignores `skipLibCheck` — that is why untyped deps (`three`) leaked "missing declaration file" errors from `node_modules/**/*.d.ts`. `pages/env.d.ts` supplies the demo-only ambient types (CSS side-effect imports, `virtual:importmap`, `process`).
- The big Problems-panel flood is not tsconfig at all: the user profile sets `typescript.tsserver.experimental.enableProjectDiagnostics: true`, so VS Code reports diagnostics for every file in every project, `node_modules` included. `.vscode/settings.json` overrides it to `false` for this workspace; `lit-plugin.rules.no-invalid-tag-name: "off"` stops the (ts-server-plugin) lit analyzer from flagging `preact`/`svelte` `.d.ts` tag-name unions.
- No runtime dependencies. `peerDependencies: shadow-observer` (optional, via `peerDependenciesMeta`). The library no longer imports it — the host app imports it to enable shadow root discovery, and the library detects it via `globalThis[Symbol.for('shadow-observer')]`. `sideEffects: false`.
  `package.json` advertises `custom-elements.json`, which nothing generates.

## Commands

| Command                                  | Notes                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                            | docs/demo dev server, port 5173                                                                                                        |
| `npm run build`                          | library → `dist/` (also on `prepack`); the dts step is clean today                                                                     |
| `npx tsc --noEmit -p tsconfig.json`      | **clean** as of the `types.ts` split (issue #12 fixed)                                                                                 |
| `npm test`                               | `scripts/run-integration-tests.js`: dev server + Playwright + in-browser Mocha, **37 tests × Chromium / WebKit / Firefox**, non-zero exit on failure |
| `npm run test:all`                       | same, plus the branded `chrome` / `msedge` channels — a browser that is not installed is *skipped*, and `--strict` turns a skip into a failure |
| `gzip -c dist/ce-autoloader.js \| wc -c` | budget check: 3,327 B (9.70 kB raw)                                                                                                     |
| `NODE_ENV=production npm run build:docs` | rebuilds all of `docs/` with new hashes — **restore `docs/.nojekyll`** (Vite empties the output dir), and never run it just to "check" |

**While iterating, use the Chrome DevTools MCP instead of `npm test`**: same Mocha report (`window.__MOCHA_STATS__`,
`#mocha-report .test`) plus a live console, `customElements` and the real demo pages in one session. `npm test` stays
the CI entry point; it needs network (Mocha from unpkg, `uhtml` from esm.sh).

## Test traps (each of these cost real debugging time)

- **A correct state is not a painted state.** `ce="loading"` set, the shimmer running, the element invisible: a
  `visibility: hidden` in a _lower_ layer wins. Assert with `el.checkVisibility({ checkVisibilityCSS: true })`;
  pseudo-element animations only show up in `el.getAnimations({ subtree: true })`.
- **Custom elements can never be un-defined** — give every test its own tag, or the loader never runs.
- **`transition` must be declared on the element**, not on the state you leave: the browser reads it from the _new_
  computed style.
- **The viewport is part of the setup.** `#fixtures` is declared before `#mocha`, and tests about something else set
  `loading="eager"`.
- **A define-phase failure surfaces a frame after one `requestIdleCallback`** — poll with the `waitFor` helper.
- **`devErrors` no longer suppresses painting.** A failing catalog loader is painted `ce="error"` at the default
  settings; `devErrors: true` only *adds* painting for a tag with no catalog entry; with `devErrors: false` that
  unknown tag keeps matching `:not(:defined)`. Elements must sit inside `#fixtures` (`runScopedViewTransition` uses
  `el.parentElement`).
- **The live path now works.** `dom_watcher` skips only mutation targets already `ce="error"` (`=== 'error'`). To test
  it, append the element *after* the observer is installed **and** keep it in the viewport (the default `visible`
  directive needs a real intersection — an off-screen container never fires, a false negative).
- **Failure reporting is uniform now.** Both a failed load and a failed `define()` call `hooks.error` exactly once and
  paint `ce="error"` for a catalog tag. A define-only failure lands a frame later on the transition path — poll with
  `waitFor`.
- **The define patches are global.** Restore `customElements.define` and delete `queue` / `dequeue` / `flush` between
  tests, after one idle frame — and note `polyfill_safe_ce_define` installs a patch on the *default* path too.
- **`requestIdleCallback` does not exist in Safari — any version.** caniuse reports it *disabled by default* through
  Safari 27.x (TP only). The suites `await` it directly, so `test/integration.html` shims it for WebKit; the loader
  itself only calls it on the `deferDefine: true` path (`src/index.ts`). Any capability probe must run **before** the
  suites — `transitions.test.js` installs a `startViewTransition` stand-in, so probing afterwards reports the polyfill,
  not the engine.


## Gotchas

- **Element-scoped view transitions are Chromium 147+ (no Firefox, no Safari).** `SUPPORTS_SCOPED_VT` gates the whole
  transition path, so the define queue is never installed there either.
- `@starting-style` / `transition-behavior: allow-discrete` are Baseline everywhere — unlike element-scoped
  transitions. That gap is why the CSS-only animation path matters.
- `intersectionOptions` defaults to `rootMargin: "20%"` (#8): `scrollMargin` is valid but Baseline-newly-available (Sept 2025, ~88%), so it was the wrong default;
- `?autoload` in the module URL boots `window.registry` from the import map — a module-scope side effect.
- Prettier is configured for 2 spaces, double quotes and 120 columns; the source does not follow it consistently, so
  match the file you are editing.

Refs: [caniuse: `Element.startViewTransition`](https://caniuse.com/mdn-api_element_startviewtransition) ·
[Chrome: element-scoped view transitions](https://developer.chrome.com/blog/element-scoped-view-transitions) ·
[web.dev: Baseline entry animations](https://web.dev/blog/baseline-entry-animations)
