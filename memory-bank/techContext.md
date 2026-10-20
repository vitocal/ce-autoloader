# Tech context

## Stack

- TypeScript (`src/index.ts` + `src/types.ts` + `src/lifecycle.ts`) → ESM-only. `tsconfig`: `target es2025`,
  `module esnext`, `isolatedModules`, `strict: false`, `noUnusedLocals`; **`react` / `react-dom` are aliased to
  `preact/compat`** (Preact is the React in this repo). Types and the `CEError` class live in `src/types.ts` (the old
  ambient `src/types.d.ts` is gone) — that split is what finally made `tsc --noEmit` clean. The `ce` lifecycle lives in
  `src/lifecycle.ts`, an **internal seam**: it is not re-exported, so it stays out of `dist/index.d.ts`.
- Library build: `vite.config.js` — lib mode + `vite-plugin-dts`, `formats: ["es"]`, `external: ["shadow-observer"]`.
  Only `tsconfig.json` (`include: ["src/*"]`) is used by `tsc` and the dts step. Note: the dts step writes
  `dist/dist.d.ts` even when `--outDir` points elsewhere.
- Docs build: `vite.docs.js` — Vite MPA, `base: /ce-autoloader/` in production, output `docs/`, which is **gitignored**
  and published by `.github/workflows/pages.yml` (`configure-pages` → `build:docs` with `NODE_ENV=production` →
  `upload-pages-artifact` → `deploy-pages`), so hashed-asset churn never reaches git. Plugins for Vue,
  Svelte (`customElement: true`), Preact and import maps. The Stencil plugin is imported but never registered (issue
  #9). Tailwind v4 (`@tailwindcss/vite`) is in the build as well, but only for
  `pages/components/hairline/hairline.css` — the Hairline UI demo components; the layer order it needs is the
  gotcha below. The import-map plugin is local now (`scripts/vite-plugin-importmap.js`, replacing `importmap-vite-plugin`, which
  could only emit an `imports` object) because the page needs the whole `{ imports, integrity }` map inside one
  `<script type="importmap">`. Its input, `importmap.json`, is **generated** from `importmap.src.json` by
  `npm run importmap` (`@jspm/generator`).
- Editor project: `pages/tsconfig.json` (`extends` the root, `include: ["**/*.ts", "**/*.tsx"]`) binds the demo sources to a *configured* project. A file outside every tsconfig lands in an **inferred** project, which ignores `skipLibCheck` — that is why untyped deps (`three`) leaked "missing declaration file" errors from `node_modules/**/*.d.ts`. `pages/env.d.ts` supplies the demo-only ambient types (CSS side-effect imports, `virtual:importmap`, `process`).
- The big Problems-panel flood is not tsconfig at all: the user profile sets `typescript.tsserver.experimental.enableProjectDiagnostics: true`, so VS Code reports diagnostics for every file in every project, `node_modules` included. `.vscode/settings.json` overrides it to `false` for this workspace; `lit-plugin.rules.no-invalid-tag-name: "off"` stops the (ts-server-plugin) lit analyzer from flagging `preact`/`svelte` `.d.ts` tag-name unions.
- No runtime dependencies. `peerDependencies: shadow-observer` (optional, via `peerDependenciesMeta`). The library no longer imports it — the host app imports it to enable shadow root discovery, and the library detects it via `globalThis[Symbol.for('shadow-observer')]`. `sideEffects: true`, and it genuinely is: the module patches `customElements.define` and boots `window.registry` on `?autoload`. The Node floor is declared in `engines` + `.nvmrc` (22.12 — vite 8's floor). `custom-elements.json` is no longer advertised: nothing generated it, and the library ships no elements of its own.

## Commands

| Command                                  | Notes                                                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                            | docs/demo dev server, port 5173                                                                                                        |
| `npm run build`                          | library → `dist/` (also on `prepack`); the dts step is clean today                                                                     |
| `npm run typecheck`                      | `tsc --noEmit -p tsconfig.json` — **clean** as of the `types.ts` split (issue #12 fixed); this is the CI gate                          |
| `npm test`                               | `scripts/run-integration-tests.js`: dev server + Playwright + in-browser Mocha, **68 tests × Chromium / WebKit / Firefox**, non-zero exit on failure |
| `npm run test:all`                       | same, plus the branded `chrome` / `msedge` channels — a browser that is not installed is *skipped*, and `--strict` turns a skip into a failure |
| `npm run test` (CI)                      | `.github/workflows/test.yml`, every push and PR: Node 22, `npm ci` (`setup-node` `cache: npm`), `typecheck`, `build` + `npm pack --dry-run` + a **4096 B gzip budget gate** (`dist/index.d.ts` must exist), `~/.cache/ms-playwright` cached on `hashFiles('package-lock.json')`, `npx playwright install --with-deps chromium firefox webkit`, then `npm run test` with `TEST_STRICT=1` |
| `npm version patch` → push tag           | release: the tag fires `.github/workflows/release.yml` — tag vs `package.json` check, an "already published" guard, `typecheck`, `build` + `pack --dry-run`, `npm publish` through a **trusted publisher** (OIDC, no token), `gh release create`. Tags may be `1.2.3` or `v1.2.3` (the old ones are bare) |
| `gzip -c dist/ce-autoloader.js \| wc -c` | budget check: 3,467 B (10,125 B raw) — measured 2026-10-12, after the #19 fix                                                           |
| `npm run importmap`                       | regenerates `importmap.json` (pinned + `integrity`) from `importmap.src.json` via `@jspm/generator`; needs network. Run it when a pinned version changes — `importmap.json` is generated, so hand edits are lost |
| `NODE_ENV=production npm run build:docs` | writes `docs/` (~47 MB, 331 files, new hashes) — **gitignored**, so it no longer pollutes git and the old `docs/.nojekyll` restore trap is gone (an artifact deploy skips Jekyll entirely). CI runs it and uploads `docs` |

**While iterating, use the Chrome DevTools MCP instead of `npm test`**: same Mocha report (`window.__MOCHA_STATS__`,
`#mocha-report .test`) plus a live console, `customElements` and the real demo pages in one session. `npm test` stays
the CI entry point; it needs network (Mocha from unpkg, `uhtml` from esm.sh).

**CI runs exactly `npm run test`, and `package-lock.json` is committed for it.** The lockfile used to be gitignored, which
ruled out both `npm ci` and `setup-node`'s `cache: npm`; both are in play now, and the Playwright browsers are cached on
`hashFiles('package-lock.json')` — an exact key, unlike `package.json`, whose `^1.64.0` would let a newer Playwright
resolve against an older cached browser build. No `restore-keys` on purpose: a mismatched browser is worse than a
re-download, and `TEST_STRICT=1` turns the resulting launch failure red instead of a silent skip. `npm test` needs network
(Mocha from unpkg, `uhtml` from esm.sh), which a runner has.

**Three workflows, three jobs.** `test.yml` (branches and PRs: the browser suite plus the cheap gates), `pages.yml` (push
to `main`: `build:docs` → Pages artifact), `release.yml` (a version tag: tag/version check, npm duplicate guard,
`typecheck`, `build`, `npm publish`, `gh release create`). The browser suite is deliberately **not** re-run on release — it
already gated the commit on `main`, and repeating it would duplicate the Playwright install into a third workflow.
`test.yml` filters `push: branches: ["**"]` so a tag does not spawn a second suite run under a tag-scoped cache.

**Publishing is tokenless, and that has two traps.** `release.yml` authenticates with a **trusted publisher** (OIDC): the
npmjs.com package settings must name `vitocal/ce-autoloader`, workflow `release.yml`, and **no environment** (the job
declares none); the workflow needs `id-token: write`. (1) Node 22 bundles npm 10, and trusted publishing needs **npm >=
11.5.1**, so the job installs `npm@^11.5.1` first (11.21.1 today) — without that, publish fails on an unknown auth path.
(2) An **unvalidated** configuration *expires 48 h after creation* (validated = its first successful publish), so create
it close to a release. Provenance is automatic — the `--provenance` flag is redundant — and OIDC tokens are rejected on
`pull_request_target` / `issue_comment` events; publishing on a tag `push` is permitted.

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
- **The import-map suite owns its own `<script type="importmap">`.** `test/importmap.test.js` installs one per test — two, in the
  multiple-maps case — and points the entries at per-test `blob:` URLs, revoked in `afterEach`. Values must be absolute URLs:
  Firefox ignores an import map added after module evaluation *for resolution*, so a bare specifier there would fail on Firefox
  only. The loader reads the script *text*, so it sees maps the engine itself refuses to merge; the engine's console warning is
  the only noise ("Multiple import maps are not allowed." on Firefox, a removed-conflicting-rule warning on Chromium/WebKit).
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
- **esm.sh's `&standalone` is a shim, not a single file.** `https://esm.sh/lit@3.3.3&standalone` returns a two-line
  module that imports the real bundle by *absolute path* on esm.sh, and some shims import `^`-range URLs
  (`/three@^0.183.0?target=es2022`) — which `@jspm/generator` **cannot analyze**, aborting the integrity pass for
  `@google/model-viewer` and `lit-element`. `importmap.src.json` pins those transitive deps with esm.sh's own
  `&deps=three@0.183.2` so the traversal completes. jspm's own `esm.sh` provider is not an option (it throws on lit's
  exports map: "no './css-tag' exports subpath defined"), and its `jsdelivr` provider drops `&standalone` and traces
  **~88 kB** of integrity out of `globe.gl` alone — the `&standalone` bundles are why the map stays ~7 kB.
- **Not every import-map entry can carry `integrity`.** Prefix mappings (`@nordhealth/components/`, `lit/`, `lit-html/`)
  cannot be enumerated — the demo's `nord-*` resolver picks subpaths at runtime — and the two local files are bundled by
  Vite, not fetched from a CDN. `npm run importmap` prints what it skipped; those URLs load unchecked.
- **The engines disagree about multiple import maps, and none of them can enumerate a map.** Measured 2026-10-20 (Chromium 156,
  WebKit 27.2, Firefox 157): Chromium 133+ and Safari 18.4+ merge every map — the *first* mapping of a specifier wins, a later
  map can add but never remap — while Firefox honours one and warns "Multiple import maps are not allowed." for the rest. A map
  appended after module evaluation resolves in Chromium and WebKit, and throws in Firefox. **`import.meta.resolve()` therefore
  cannot replace parsing an import map**: it resolves *one* specifier, only against the maps the *engine* accepted, and no API
  lists the entries — a catalog built on it would be engine-dependent and, on Firefox, missing whole maps. It stays useful in
  the other direction (resolving a bare specifier the app already knows about, integrity and scopes inherited for free), never
  for discovery.
- **`document.scripts` is ~50× cheaper than `querySelectorAll('script[type="importmap"]')`.** Measured 2026-10-20 on an
  8,005-element DOM: 0.5 µs vs 27 µs (Chromium) / 1 µs vs 1 µs (Firefox) / 0.5 µs vs 53 µs (WebKit). It is a *live* collection,
  so it also picks up a script added a moment ago — which is what lets `catalog` be an accessor re-read on every lookup instead
  of a construction-time snapshot. `JSON.parse` of the docs' 7 kB map is ~10 µs and is deliberately not memoised: a catalog read
  is followed by a network fetch anyway.
- `?autoload` in the module URL boots `window.registry` from the import map — a module-scope side effect. It sets `useImportMapsCatalog: true`, which makes the import map *the* catalog; on the default path the import map is harvested too, with `catalog` winning on a collision (#19 fixed 2026-10-12).
- Prettier is configured for 2 spaces, double quotes and 120 columns; the source does not follow it consistently, so
  match the file you are editing.
- **Tailwind's layers are positioned by `public/styles.css`, not by the component that imports Tailwind.** The
  Hairline UI components (`pages/components/hairline/`) bring Tailwind v4 into the docs build, and the page's
  layer statement is `properties, theme, normalize, ds, shared, page, components, scoped, hairline, utilities,
  hotfix`:
  - `theme` early, or Tailwind's `--radius-*`/`--shadow-*`/`--font-mono` beat the page's own values.
  - `hairline` — the components' base rules (the `code`/`button` resets, the `.grid` reset, the host `display`) —
    above the page's layers, so they beat the page's `code` rule (a dark pill) and Nord's typeset, and *below*
    `utilities`, so a class like `text-[12px]` still beats them. **Unlayered is the trap here**: it wins over the
    utilities too, so `font: inherit` on a button beats its own `text-[12px]` (the period chips rendered at 16px).
  - `utilities` late, so the components' classes outrank the page's; `hotfix` stays the top layer.
- **The token mapping is `@theme inline`, and the raw variables exist too.** `inline` because the page declares
  `--color-primary` and `--color-accent` itself (a plain `@theme` of the same name either loses the cascade or
  references itself) and because Tailwind's `--radius-lg` has to be pinned at 8px — the page's is 1.25rem, and
  `rounded-lg` inside a component means Tailwind's. The raw names (`--border`, `--primary`, …) are defined as
  variables on the components' own tags, because the sources use them *inside arbitrary values*
  (`shadow-[0_0_0_1px_var(--border)]`), where a Tailwind colour name is no help.
- **`node` / `npm` are not on the default shell `PATH`** in a fresh shell (`zsh: command not found: node`). The Homebrew
  binaries are at `/opt/homebrew/bin/node` (v25.8.1) — use the absolute path, or `export PATH=/opt/homebrew/bin:$PATH`.
  Playwright's browsers are installed under `~/Library/Caches/ms-playwright` (chromium 1248 / firefox 1555 / webkit 2370),
  so a one-off repro script is cheap: `createRequire` from the repo's `package.json` resolves `playwright`.

Refs: [caniuse: `Element.startViewTransition`](https://caniuse.com/mdn-api_element_startviewtransition) ·
[Chrome: element-scoped view transitions](https://developer.chrome.com/blog/element-scoped-view-transitions) ·
[web.dev: Baseline entry animations](https://web.dev/blog/baseline-entry-animations)
