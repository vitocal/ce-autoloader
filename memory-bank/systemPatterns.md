# System patterns

## Flow

`new CEAutoLoader(options)` → merge options → `catalog` is an **accessor, not a snapshot**: the app's entries plus, when
`useImportMapsCatalog: true`, every `<script type="importmap">` in the document — folded _under_ them, so an explicit entry
wins a collision — re-read on every access, so a map appended after construction is honoured on the next lookup → pick the
`define` patch →
`discover()`. The patch is chosen in one place: `deferDefine` → the defer queue;
otherwise `transition` → **throw `SyntaxError`**; otherwise `polyfill_safe_ce_define()` (idempotent `define`). Defaults
are `deferDefine: false` / `devErrors: false`, and `transition` is derived from the **raw** `options.deferDefine`, so
a bare `{ catalog }` lands on safe-define.

`discover` → `watchDOMMutations()` (100 ms debounce) + `upgrade(root, directive)` for each configured directive, then
`upgrade(root)` for tags without a `loading` attribute. When the host application imports `shadow-observer` (optional peer
dep), the observer is upgraded to `ShadowObserver`, which forwards `observe` into new programmatic shadow roots (open
and closed, `shadow: 3`). The `shadowObserver` option (`'auto' | true | false`) controls this explicitly.

`upgrade` → `matchCustomElement(root)` (`:not([ce])` and the name contains `-`, then `owesState()`) → filter by `loading` → dispatch:

| directive           | action                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visible` (default) | one shared `IntersectionObserver`, one batch per intersecting element                                                                                          |
| `click`             | `addEventListener("click", …, { once: true })`                                                                                                                 |
| `eager`, `manual`   | `loadAndDefine(elements)` now (`manual` normally comes from `registry.upgrade(root, "manual")`)                                                                |
| anything else       | `console.error` and **no load** (issue #7) — `ce_elements` is in scope there (declared before the call), so the "undefined" reading in earlier notes was wrong |

`when_visible` takes an element on only while `getLifecycle(el)` is `null` — `ce` is the per-element "the registry has
handled this" flag. **Not** `customElements.get(tagName)`: that flips true the moment _any_ element with the tag is
defined, so a sibling delivered in a later IntersectionObserver callback was dropped and never painted at all (fixed
2026-10-12). The per-element lock (`loading_locks: Set<HTMLElement>`) is the same mistake avoided — a tag-name key is a
per-_tag_ lock. A tag already defined but absent from the catalog is someone else's registration, and is left alone.

`loadAndDefine` → `Promise.allSettled(elements.map(load))` → report the load failures **once** → define the survivors
(`runScopedViewTransition` when `transition`, else `Promise.allSettled(map(define))`) → report the **define** failures
from those `allSettled` results → `customElements.flush()` when `deferDefine`.

`runScopedViewTransition` wraps each definition in an element-scoped `Element.startViewTransition({ types: ["ce"],
update })` and attaches the `finished` cleanup **before** awaiting `updateCallbackDone`: a failing update rejects both
promises, so the styles must be cleared (and `finished` never left unhandled) even though the await throws.

`load(el)` → `getLoader(name)` (exact key, else the wildcard prefix) → **the per-element lock, then `hooks.load(name, el)`** —
`false` returns `null` and the walk stops there (no fetch, no `ce`, no `load:` measure, not a failure), an ES module is
used _instead of_ `loadModule`, `true`/`undefined` runs it → `ce="loading"` → `loadModule` (string → `import(url)`,
function → `loader(name, el)`) → `load:<tag>` measure → `ce="loaded"` → `hooks.loaded({name, el, module, loader})`, a
notification whose return is ignored. `load()` returning `null` is what `loadAndDefine` filters before defining.

`define({name, el, module})` → unwrap `.default` → **`hooks.define({name, el, module})` on the unwrapped constructor:
`false` returns before the measure, so a disabled definition records no `define:<tag>` and is not a failure** → already
defined → nothing; `deferDefine` → `ORIGINAL_DEFINE` the returned constructor if the tag isn't queued, else
`dequeue(name)`; otherwise → `customElements.define()`. Claims `ce="defined"` **only when it really defined**, and
otherwise always records a `define:<tag>` measure. `preload()` runs the same three hooks with `el` `undefined`, and now
awaits `define()`.

The "already defined" branch is not a silent no-op any more. `polyfill_safe_ce_define` makes the tag _name_ the identity,
so a foreign constructor that got there first wins without a sound and the tag is painted `ce="defined"` — the platform's
`NotSupportedError` never fires. When `customElements.get(name) !== module` (the loader returned a constructor that was
_not_ the one that won), `define()` calls `hooks.error` with a `LoadError` and **nothing else**: no `ce="error"`, no
fallback, because the element is live and working. The report lives here rather than in the polyfill because `define()`
is the only place holding the constructor to compare — and because the same name-level check sits in both places, so
fixing the polyfill alone would recover nothing. Only reachable when the loader returned a constructor and an element is
present (`preload` passes no element, so a mismatch there is not reported).

The check has a **false positive on Svelte**: `@sveltejs/vite-plugin-svelte` with `customElement: { tag }` registers the tag itself
and `export default`s a `wrapper` function, so `customElements.get(name) !== module` holds by construction and every Svelte
component reports (issue #20). Diagnostic-only — the element upgrades normally.

## Failures

Every `ce` transition goes through `src/lifecycle.ts` (`markLoading` / `markDefined` / `markFailed` / `hasFailed`), which owns
the vocabulary and enforces the invariant that **failure is terminal**: `markLoading` refuses to move a failed element back to
`loading`, so the "already reported" flag cannot be erased and the failure cannot be reported twice. `loadAndDefine` also filters
failed elements once, at the top, so a re-intersection costs no fetch.

`handleComponentLoadError`: `origin = rejection.reason.details.el`; `hooks.error` runs (when set); already failed
(`hasFailed(origin)`) → return. Then `if (!getLoader(name) && !devErrors) return` — a tag the catalog does not own is left
`:not(:defined)`. Otherwise paint: `markFailed(origin)`, then `new fallback()` with `.error` / `.stack` set as properties and
`appendChild` (light DOM is preserved; nothing clears `innerHTML`). There is no `#errors` map any more — the paint
itself is the "already reported" flag.

Consequence (verified in a browser): a **catalog** failure is painted regardless of `devErrors`; `devErrors: true`
only _adds_ painting for non-catalog tags. Both a load failure and a define failure reach this method exactly once, and
the README / `types.ts` comments now describe this rule.

Known limit: a constructor or `connectedCallback` that throws is _reported to `window`_ by the platform and never
propagates out of `customElements.define()`, so it cannot reach this path (verified in a browser).

## The define queue — the risky part

Catalogs self-register and the module is imported _before_ the transition starts, so the upgrade would land outside
the snapshot window and the placeholder-to-component morph would be lost. The queue retimes those definitions into
the transition's `update` callback.

- `deferDefine` (default **off**) controls the queue; `false` falls back to `polyfill_safe_ce_define` (an idempotent,
  first-wins `define`: any already-defined name is a no-op), which does still patch the global. `transition: true`
  without `deferDefine: true` throws.
- The guard is **name-level, not constructor-level**. Native `define` throws `NotSupportedError` on a same-name _or_ a
  same-constructor re-define; the polyfill tests only the name. So "same name, different ctor" is swallowed, while
  "same ctor, different name" still throws through untouched. The swallowed case is reported by `define()` → above.
- Only names that resolve through a catalog are queued; anything else is forwarded to the original `define`, so a
  third-party registration is never swallowed.
- `DEFERRED_REGISTRIES` exists because the patched `define` is one global function while catalogs are per registry;
  `clean()` opts one out.
- Known limits: the patch is document-wide, and `customElements.get()` is `undefined` for queued classes until
  `dequeue()` runs (issue #2) — a documented limit, not a TODO: Stage 2 (transient capture) was **rejected**, and
  `polyfill_safe_ce_define` is a deliberate, permanent safeguard → `progress.md`.

## Conventions to keep

`ce` values and measure names are public contract · **every `ce` transition goes through `src/lifecycle.ts` — never compare the
attribute to a string literal** · **`defined` is the last state of the success walk, written in the upgrade frame — an entry
animation declared on `[ce="defined"]` plays out in full, so no rule needs a union with a later state** · **"has the registry handled this element?" is `getLifecycle(el)`, never
`customElements.get(tagName)` or `:not(:defined)`** — a tag is shared, an element is not · option defaults live in one object in the constructor · one shared
IntersectionObserver · no runtime dependencies · capability checks instead of polyfills, with a plain-define fallback ·
`devErrors` never gates the hook · `transition` implies `deferDefine` · **import maps are read from the script _text_, never
`import.meta.resolve`** — a resolve only sees the maps the engine accepted, and Firefox merges none · match the file you edit instead of reformatting
it.

Refs: [MDN: using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements)
