# Progress

_2026-10-01 · `option-deferDefine` @ `7098efc` + staged work · package 0.1.2 · `dist/ce-autoloader.js` = 9.54 kB
raw / **3,319 B gzip** · 24 tests · `tsc --noEmit` clean._

House rule: **one fact, one home.** `REVIEW.md` is the audit (tiers, long-form critique); the bank is the short
version. Anything that belongs in both goes in `REVIEW.md` and is summarised here in a line.

## Works

Catalog resolution (URLs, functions, wildcards, import maps, `?autoload`) · initial scan + debounced (100 ms)
`MutationObserver` discovery (**currently broken** — see #14) · directives (`eager`, `visible`, `click`, `manual`,
custom values) · `ce` lifecycle states · element-scoped view transitions (`types: ["ce"]`, per-element name/class,
`ready` / `finished` hooks, plain define when unsupported) · deferred define queue (`deferDefine`) ·
`polyfill_safe_define` (idempotent `define` on the default path) · `load:` / `define:` measures · failure path
(`hooks.error` always, catalog failures always painted, `devErrors` extends painting to non-catalog tags, fallback
appended with `.error` / `.stack` properties) · `preload`, `clean` · ESM-only packaging · demo site
(React/Vue/Svelte/Lit/Preact/vanilla, 3D, plots) · `mfe-store` micro-frontend · CSS-animation reference page.

## Left

`REVIEW.md` is the source of truth for the audit and the full tiered list; this is the short version.

- **Now** — fix `dom_watcher` (#14, a regression); doc truth pass (README + `types.ts` describe the old `devErrors`
  and the old "`false` patches nothing"); decide the failure model on purpose.
- **Tier 0** — completion signals (`ce:load` / `ce:error`, `whenLoaded(tag)`); define-patch Stage 2; a first-render
  throw is invisible (issue #13).
- **Tier 1** — pin + `integrity`; reproducible benchmark; cross-browser matrix; stress fixture (1–2k elements) and
  scoped rescans; `scrollMargin` → `rootMargin`.
- **Tier 2** — the standards write-up (`WICG/webcomponents#782`); license decision.
- The biggest adoption risk stays the global `customElements.define` patch — and it is now installed on **both** paths
  (deferred queue, or idempotent safe-define), so "never patch at all" is no longer an option.

## Define-patch stages

The queue exists because catalogs self-register and the module is imported *before* the transition starts, so their
upgrades would land outside the snapshot window.

| Stage | What | State |
| --- | --- | --- |
| 1 | `deferDefine` switch (now **off by default**), idempotent `define()` (moved to `polyfill_safe_define`), swallow polyfill deleted, "only morph what we define", define errors surfaced, `ready` rejection guard | done |
| 2 | **Transient capture**: patch `define` from "the batch starts loading" until the transition's `update` has run, then hand the platform back. Deletes `queue` / `dequeue` / `flush`, `DEFERRED_REGISTRIES`, the `types.ts` augmentation and README's queue section | open |
| 3 | Revisit whether `deferDefine` is needed at all once "let the loader return a constructor" is the documented happy path | open |

Since the refactor, `transition: true` **requires** `deferDefine: true` (the constructor throws `SyntaxError`
otherwise), so the queue's only remaining reason to exist is the morph.

Stage 2 notes: capture into **all** open sessions (the first drain defines, the rest see `customElements.get()` truthy
and skip) · `preload()` has no transition, so it defines right after the import · close in a `finally` on every abort
path, or the platform is left patched.

Rejected alternatives, in order of how tempting they were: keep the flag on the existing global queue (Stage 1) ·
never patch and only guard `define()` (self-registering catalogs lose the morph) · import inside the `update` callback
(the transition then spans the network fetch: a frozen before-snapshot while downloading) · infer registrations via
`customElements.getName()` (impossible for side-effect bundles).

## Known issues

| # | Issue | State |
| --- | --- | --- |
| 1 | `getMutationObserver()` always returns the native observer — a `return` inside `finally` wins, so `shadow-observer` is awaited and then ignored | open |
| 2 | The define patch is document-wide: `customElements.get()` is `undefined` for queued classes until `dequeue()` | Stage 2 |
| 3 | A `fallback` render cleared `innerHTML`, taking slotted / server-rendered content with it | **fixed** — the fallback is appended now |
| 4 | The loading locks are keyed by tag name, which conflates instances (`#errors` is gone) | open |
| 5 | Error message and stack lived in DOM attributes | **fixed** — they now live on the fallback instance's `.error` / `.stack` properties |
| 6 | `prefers-reduced-motion` is read once, not per element | open |
| 7 | The invalid-directive branch logs an undefined `ce_elements` | typo |
| 8 | `intersectionOptions.scrollMargin` is ignored — the real option is `rootMargin` | open |
| 9 | `custom-elements.json` is advertised but never generated; the Stencil plugin is never registered | open |
| 10 | `importmap.json` pins `@latest`, no `integrity`; no CI | Tier 1 |
| 11 | GPL-3.0 blocks some corporate adoption | Tier 2 |
| 12 | `tsc --noEmit` reported TS2345 at `definitions.push(...)`; the dts step reported nothing | **fixed** by the `src/types.ts` split |
| 13 | A constructor / `connectedCallback` throw is reported to `window`, so the loader can never see it | open |
| 14 | `dom_watcher`'s guard is inverted (`!= 'error'`): dynamic tags no longer upgrade via the MutationObserver (verified in a browser) | **open, regression** |

## Fixed lately

Define-phase failures were swallowed (`ce="error"` was never set) · skipped transitions leaked unhandled rejections ·
the queue swallowed non-catalog definitions · `docs/.nojekyll` died in a docs build · the animation page's `ce` states
never painted (a `:not(:defined) { visibility: hidden }` guard from Nord's design system, hidden in the `ds` layer) ·
`retry()` deleted instead of fixed (it wiped light DOM) · an unpainted failure left `ce="loading"` behind, and a failed
`define()` left a false `ce="defined"`. _(This refactor:)_ TS2345 gone with the `types.ts` split · error text off the
DOM attributes · the fallback appends instead of clearing `innerHTML` · `transition` without `deferDefine` now fails
loudly.
