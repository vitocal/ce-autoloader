# System patterns

## Flow

`new CEAutoLoader(options)` → merge options → resolve the catalog (the option + the page import map's `-`-named
imports) → pick the `define` patch → `discover()`. The patch is chosen in one place: `deferDefine` → the defer queue;
otherwise `transition` → **throw `SyntaxError`**; otherwise `polyfill_safe_define()` (idempotent `define`). Defaults
are `deferDefine: false` / `devErrors: false`, and `transition` is derived from the **raw** `options.deferDefine`, so
a bare `{ catalog }` lands on safe-define.

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

`define({name, el, module})` → unwrap `.default` → already defined → nothing; `deferDefine` → `ORIGINAL_DEFINE` the
returned constructor if the tag isn't queued, else `dequeue(name)`; otherwise → `customElements.define()`. Claims
`ce="defined"` **only when it really defined**, and always records a `define:<tag>` measure.

## Failures

`handleComponentLoadError`: `origin = rejection.reason.details.el`; `hooks.error` runs (when set); already painted
(`ce="error"`) → return. Then `if (!getLoader(name) && !devErrors) return` — a tag the catalog does not own is left
`:not(:defined)`. Otherwise paint: `ce="error"`, then `new fallback()` with `.error` / `.stack` set as properties and
`appendChild` (light DOM is preserved; nothing clears `innerHTML`). There is no `#errors` map any more — the paint
itself is the "already reported" flag.

Consequence (verified in a browser): a **catalog** failure is painted regardless of `devErrors`; `devErrors: true`
only *adds* painting for non-catalog tags. The README and the `types.ts` comments still describe the previous rule.

Known limit: a constructor or `connectedCallback` that throws is *reported to `window`* by the platform and never
propagates out of `customElements.define()`, so it cannot reach this path (verified in a browser).

## The define queue — the risky part

Catalogs self-register and the module is imported *before* the transition starts, so the upgrade would land outside
the snapshot window and the placeholder-to-component morph would be lost. The queue retimes those definitions into
the transition's `update` callback.

- `deferDefine` (default **off**) controls the queue; `false` falls back to `polyfill_safe_define` (an idempotent
  `define`), which does still patch the global. `transition: true` without `deferDefine: true` throws.
- Only names that resolve through a catalog are queued; anything else is forwarded to the original `define`, so a
  third-party registration is never swallowed.
- `DEFERRED_REGISTRIES` exists because the patched `define` is one global function while catalogs are per registry;
  `clean()` opts one out.
- Known limits: the patch is document-wide, and `customElements.get()` is `undefined` for queued classes until
  `dequeue()` runs (issue #2). Stage 2 is the plan → `progress.md`.

## Conventions to keep

`ce` values and measure names are public contract · option defaults live in one object in the constructor · one shared
IntersectionObserver · no runtime dependencies · capability checks instead of polyfills, with a plain-define fallback ·
`devErrors` never gates the hook · `transition` implies `deferDefine` · match the file you edit instead of reformatting
it.

Refs: [MDN: using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements)
