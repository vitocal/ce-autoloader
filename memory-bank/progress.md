# Progress

_2026-09-30 · `option-deferDefine` · package 0.1.2 · `dist/ce-autoloader.js` = 10.05 kB raw / **3,391 B gzip**._

## Works

Catalog resolution (URLs, functions, wildcards, import maps, `?autoload`) · discovery (initial scan + debounced
`MutationObserver`) · directives (`eager`, `visible`, `click`, `manual`, custom values) · `ce` lifecycle states ·
element-scoped view transitions (`types: ["ce"]`, per-element name/class, `ready`/`finished` hooks, plain fallback
when unsupported) · deferred define queue with the `deferDefine` switch · `load:`/`define:` measures ·
error path (`ce="error"`, `error`/`stack`/`retries`, `fallback`, `hooks.error`) · `preload`, `retry`, `clean` ·
ESM-only packaging · demo site (React/Vue/Svelte/Lit/Preact/vanilla, 3D, plots) · `mfe-store` micro-frontend
example · CSS-animation reference page · 24 browser tests.

## Left

Tier 0: `retry()` wipes light DOM; no completion signals; the define patch is not opt-in by default.
Tier 1: pin + `integrity`; docs truth pass; reproducible benchmark; cross-browser matrix; stress fixture (1–2k
elements) and scoped rescans; stop gating discovery by the mutation *target's* tag name; error text out of
attributes; `scrollMargin` → `rootMargin`.
Tier 2: write up the standards proposal using this as evidence; license decision; lean into the differentiators.

`REVIEW.md` is the source of truth; `roadmap.md` is the working copy with the define-patch stages.

## Known issues

| # | Issue | Where | State |
| --- | --- | --- | --- |
| 1 | `getMutationObserver()` always returns native `MutationObserver`: a `return` inside `finally` overrides the `try`, so `shadow-observer` is awaited and then ignored | `src/index.ts` | open |
| 2 | The define patch is document-wide; inside that window `customElements.get()` is `undefined` for queued classes and `whenDefined()` has not settled | `polyfill_defer_define` | Stage 2 |
| 3 | `retry()` clears `innerHTML`, taking slotted/server-rendered content with it | `retry()` | open |
| 4 | Failure gating (`#errors`) and loading locks are keyed by tag name, which conflates instances | watcher / `load()` | open |
| 5 | Error message and stack are written into DOM attributes | `handleComponentLoadError` | open |
| 6 | `prefers-reduced-motion` is read once, not per element | constructor | open |
| 7 | The invalid-directive branch logs an undefined identifier (`ce_elements`) | `applyLoadingDirective` | typo |
| 8 | `intersectionOptions.scrollMargin` is ignored — the real option is `rootMargin` | constructor | open |
| 9 | `custom-elements.json` is advertised but never generated; Stencil plugin imported, never registered | packaging | open |
| 10 | `importmap.json` pins `@latest`, no `integrity`; no CI | repo | Tier 1 |
| 11 | GPL-3.0 blocks some corporate adoption | LICENSE | Tier 2 |

Fixed lately: define-phase failures were swallowed (`ce="error"` was never set) · skipped transitions leaked
unhandled rejections · non-catalog definitions were swallowed by the queue · `docs/.nojekyll` was deleted by the
docs build · the animation page's `ce` states never painted (a `:not(:defined) { visibility: hidden }` guard from
Nord's design system, hidden in the `ds` layer).
