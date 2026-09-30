# System patterns

## Flow

`new CEAutoLoader(options)` → merge options, resolve the catalog (option, else the page's import map) → maybe
install the deferred define queue → `discover()`.

`discover` → `watchDOMMutations()` (100 ms debounce) + `upgrade(root, directive)` for each configured directive,
then `upgrade(root)` for tags without a `loading` attribute.

`upgrade` → `matchCustomElement(root)` (`:not(:defined)` and the tag contains `-`) → filter by `loading` → dispatch:

| directive | action |
| --- | --- |
| `visible` (default) | one shared `IntersectionObserver`, one batch per intersecting element |
| `click` | `addEventListener("click", …, { once: true })` |
| `eager`, `manual` | `loadAndDefine(elements)` now (`manual` is normally triggered by `registry.upgrade(root, "manual")`) |
| anything else | `console.error` — that branch references an undefined `ce_elements` (bug #7 in `progress.md`) |

`loadAndDefine` → `Promise.allSettled(elements.map(load))` → report load failures → split the survivors into
**to_morph** (not defined yet; wrapped in a view transition) and **already_defined** (plain define) → report
define failures → `customElements.flush()` when the queue is installed.

`load(el)` → `getLoader(name)` (exact catalog key, else the wildcard prefix) → `ce="loading"` + a per-tag lock →
`loadModule` (string → `import(url)`, function → `loader(name, el)`) → `load:<tag>` measure in `finally`.

`define({name, el, module})` → unwrap `.default` → **already defined** → nothing; **queue installed** → queue then
`dequeue(name)`; **otherwise** → guarded `define()`. Then `ce="defined"` and a `define:<tag>` measure (both in
`finally`).

## The define queue — the risky part

Self-registering modules (`customElements.define` at import time) are the common case; 18 of the 20 demo
components do it. `loadAndDefine` imports *before* the transition starts, so without help they upgrade outside the
snapshot window and the morph is lost. The queue retimes those definitions into the transition's `update` callback.

- `deferDefine` (default on) controls the patch; `false` patches nothing at all.
- `define()` guards itself with `customElements.get(name)`, so the old swallow-polyfill is gone.
- Only names that resolve through a catalog are queued; everything else goes to the original `define` immediately.
- `DEFERRED_REGISTRIES` exists because the patched `define` is one global function while catalogs are per registry;
  `clean()` opts a registry out.
- Known limits: the patch is document-wide, `customElements.get()` is `undefined` for queued classes until
  `dequeue()` runs, and `whenDefined()` only settles then. Stage 2 (transient capture) is the plan → `roadmap.md`.

## Conventions to keep

`ce` values (`loading` / `defined` / `error`) and the measure names are public contract · option defaults live in
one object in the constructor · one shared IntersectionObserver for all `visible` elements · no runtime
dependencies · capability checks instead of polyfills, with a plain-define fallback.

Refs: [MDN: using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
