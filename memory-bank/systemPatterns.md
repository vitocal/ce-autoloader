# System patterns

## Flow

`new CEAutoLoader(options)` → merge options → resolve the catalog (option, else the page import map) → maybe install
the deferred define queue → `discover()`.

`discover` → `watchDOMMutations()` (100 ms debounce) + `upgrade(root, directive)` for each configured directive, then
`upgrade(root)` for tags without a `loading` attribute.

`upgrade` → `matchCustomElement(root)` (`:not(:defined)` and the name contains `-`) → filter by `loading` → dispatch:

| directive | action |
| --- | --- |
| `visible` (default) | one shared `IntersectionObserver`, one batch per intersecting element |
| `click` | `addEventListener("click", …, { once: true })` |
| `eager`, `manual` | `loadAndDefine(elements)` now (`manual` normally comes from `registry.upgrade(root, "manual")`) |
| anything else | `console.error` — that branch logs an undefined `ce_elements` (issue #7) |

`loadAndDefine` → `Promise.allSettled(elements.map(load))` → report load failures → split the survivors into
**to_morph** (wrapped in a view transition when `transition` is on and supported) and **already_defined** → report
define failures → `customElements.flush()` when the queue is installed.

`load(el)` → `getLoader(name)` (exact key, else the wildcard prefix) → `ce="loading"` + a per-tag lock → `loadModule`
(string → `import(url)`, function → `loader(name, el)`) → `load:<tag>` measure.

`define({name, el, module})` → unwrap `.default` → already defined → nothing; queue installed → queue then
`dequeue(name)`; otherwise → guarded `define()`. Claims `ce="defined"` **only when it really defined**, and always
records a `define:<tag>` measure.

## Failures

`handleComponentLoadError`: the tag goes into `#errors` (the watcher then skips it) and `hooks.error` runs. Then the
**catalog decides** — no `getLoader(name)` → return, because the loader never owned that tag and `:not(:defined)` is
the honest state. Otherwise it is a real failure (a loader that throws, a module that will not import, a `define()`
that blows up) and it is painted on the element (`ce="error"`, `error` / `stack`, `fallback`) unless
`devErrors: false`, which drops the stale `ce` instead.

Known limit: a constructor or `connectedCallback` that throws is *reported to `window`* by the platform and never
propagates out of `customElements.define()`, so it cannot reach this path (verified in a browser).

## The define queue — the risky part

Catalogs self-register and the module is imported *before* the transition starts, so the upgrade would land outside
the snapshot window and the placeholder-to-component morph would be lost. The queue retimes those definitions into
the transition's `update` callback.

- `deferDefine` (default on) controls the patch; `false` patches nothing at all.
- Only names that resolve through a catalog are queued; anything else is forwarded to the original `define`, so a
  third-party registration is never swallowed.
- `DEFERRED_REGISTRIES` exists because the patched `define` is one global function while catalogs are per registry;
  `clean()` opts one out.
- Known limits: the patch is document-wide, and `customElements.get()` is `undefined` for queued classes until
  `dequeue()` runs (issue #2). Stage 2 is the plan → `progress.md`.

## Conventions to keep

`ce` values and measure names are public contract · option defaults live in one object in the constructor · one shared
IntersectionObserver · no runtime dependencies · capability checks instead of polyfills, with a plain-define fallback ·
match the file you edit instead of reformatting it.

Refs: [MDN: using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements)
