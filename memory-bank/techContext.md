# Tech context

## Stack

- TypeScript (`src/index.ts`) → ESM-only. `tsconfig`: `target es2025`, `module esnext`, `isolatedModules`,
  `strict: false`, `noUnusedLocals`; **`react` / `react-dom` are aliased to `preact/compat`** (Preact is the React in
  this repo).
- Library build: `vite.config.js` — lib mode + `vite-plugin-dts`, `formats: ["es"]`, `external: ["shadow-observer"]`. Only `tsconfig.json` (`include: ["src/*"]`) is used by `tsc` and the dts step.
- Docs build: `vite.docs.js` — Vite MPA, `base: /ce-autoloader/` in production, output `docs/`, plugins for Vue,
  Svelte (`customElement: true`), Preact and import maps. The Stencil plugin is imported but never registered (issue
  #9).
- Editor project: `pages/tsconfig.json` (`extends` the root, `include: ["**/*.ts", "**/*.tsx"]`) binds the demo sources to a *configured* project. A file outside every tsconfig lands in an **inferred** project, which ignores `skipLibCheck` — that is why untyped deps (`three`) leaked "missing declaration file" errors from `node_modules/**/*.d.ts`. `pages/env.d.ts` supplies the demo-only ambient types (CSS side-effect imports, `virtual:importmap`, `process`).
- The big Problems-panel flood is not tsconfig at all: the user profile sets `typescript.tsserver.experimental.enableProjectDiagnostics: true`, so VS Code reports diagnostics for every file in every project, `node_modules` included. `.vscode/settings.json` overrides it to `false` for this workspace; `lit-plugin.rules.no-invalid-tag-name: "off"` stops the (ts-server-plugin) lit analyzer from flagging `preact`/`svelte` `.d.ts` tag-name unions.
- No runtime dependencies. `peerDependencies: shadow-observer` (external, and currently unused). `sideEffects: false`.
  `package.json` advertises `custom-elements.json`, which nothing generates.

## Commands

| Command                                  | Notes                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                            | docs/demo dev server, port 5173                                                                                                        |
| `npm run build`                          | library → `dist/` (also on `prepack`); the dts step is clean today                                                                     |
| `npx tsc --noEmit -p tsconfig.json`      | still one pre-existing TS2345 — issue #12                                                                                              |
| `npm test`                               | `scripts/run-integration-tests.js`: dev server + headless Puppeteer + Mocha, 26 tests, non-zero exit on failure                        |
| `gzip -c dist/ce-autoloader.js \| wc -c` | budget check: 3,337 B                                                                                                                  |
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
- **The catalog decides what a failure is.** A failing catalog loader gets `ce="error"`; a tag with no catalog entry
  never does, even with `devErrors: true`; `devErrors: false` paints nothing, but then the `loading` state must be gone
  too. Elements must sit inside `#fixtures` (`runScopedViewTransition` uses `el.parentElement`).
- **The queue is global.** Restore `customElements.define` and delete `queue` / `dequeue` / `flush` between tests,
  after one idle frame.

## Gotchas

- **Element-scoped view transitions are Chromium 147+ (no Firefox, no Safari).** `SUPPORTS_SCOPED_VT` gates the whole
  transition path, so the define queue is never installed there either.
- `@starting-style` / `transition-behavior: allow-discrete` are Baseline everywhere — unlike element-scoped
  transitions. That gap is why the CSS-only animation path matters.
- `intersectionOptions.scrollMargin` does nothing (#8);
- `?autoload` in the module URL boots `window.registry` from the import map — a module-scope side effect.
- Prettier is configured for 2 spaces, double quotes and 120 columns; the source does not follow it consistently, so
  match the file you are editing.

Refs: [caniuse: `Element.startViewTransition`](https://caniuse.com/mdn-api_element_startviewtransition) ·
[Chrome: element-scoped view transitions](https://developer.chrome.com/blog/element-scoped-view-transitions) ·
[web.dev: Baseline entry animations](https://web.dev/blog/baseline-entry-animations)
