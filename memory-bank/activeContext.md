# Active Context — ce-autoloader

_Last updated: 2026-09-30 (after making the define-queue safe)_

## Current focus

**Branch `tier0-fixes` @ `dc0a0f3` — working through the *Tier 0 — correctness* list in `REVIEW.md`.**

Recent commits on this branch:

| Commit | Message |
| --- | --- |
| `dc0a0f3` | Added cline memory bank |
| `d898c37` | Organize integration test |
| `f8e605c` | Make polyfill imdepotent and Update tests |
| `d7aa74b` | Re-enable integration tests |
| `87b20ab` | Refactored customElements defer polyfill and renamed some methods |
| `0396830` | Cleaned applyLoadingDirective |
| `11166b8` | Fixes packaging |

Uncommitted work from this task:

- `M src/index.ts` — define-queue safety: non-catalog definitions are forwarded to `ORIGINAL_DEFINE`,
  consulted through `getLoader()` over **every** registry that installed the queue (`DEFERRED_REGISTRIES`),
  `dequeue()` is idempotent, and `clean()` opts a registry out.
- `M test/integration.html` — registers the new transitions suite last (it patches the global define queue).
- `?? test/transitions.test.js` — new suite: blue base cases for the deferred queue/transition path, green
  regression cases for non-catalog components.
- `M README.md` / `M REVIEW.md` — docs for the new queue semantics; Tier 0 item annotated as partially done.

## Tier 0 status (source of truth: `REVIEW.md`, lines ~128–135)

- [X] **Fix the await in `runScopedViewTransition`** — done. Now
  `await Promise.allSettled(components.map(async ({el,name,module}) => …))`, so definitions are actually awaited.
- [X] **Guard element-scoped view transitions** — done. `SUPPORTS_SCOPED_VT = "startViewTransition" in
  Element.prototype`, transitions disabled + `polyfill_swallow_alreadyDefined()` when unsupported.
  (`prefers-reduced-motion` is still only checked once, in the constructor.)
- [X] **Fix packaging** — done. ESM-only (`exports` has no `require`, `main`/`module` → `dist/ce-autoloader.js`),
  `"sideEffects": false`, `shadow-observer` marked external in Rollup.
- [ ] **Make the define-queue safe** — **partially done.** Non-catalog definitions are forwarded to the original
  `define` (never swallowed), the deferral decision consults `getLoader()` on every registry that installed the
  queue, `dequeue()` is idempotent, and `clean()` opts a registry out; covered by `test/transitions.test.js`.
  **Still open:** make the `customElements.define` patch genuinely *opt-in*.
- [ ] **Stop destroying light DOM in `retry()`** — currently `el.innerHTML = ""` wipes slotted/server-rendered
  fallback markup. Snapshot once or remove only what the fallback injected.
- [ ] **Add completion signals** — `ce:load` / `ce:error` CustomEvents and `registry.whenLoaded(tag)`.

## Next steps (suggested order)

1. Finish the remaining Tier 0 items: make the define-queue patch **opt-in**, stop destroying light DOM in
   `retry()`, and add completion signals (`ce:load` / `ce:error` + `registry.whenLoaded(tag)`).
2. Consider the adjacent robustness fix found while testing: `transition.ready` rejects with
   `AbortError: Transition was skipped` when two transitions collide on the same parent, and
   `src/index.ts` attaches no rejection handler — see *Active considerations* below.
3. Re-run `npm test` (`17 passing / 0 failing` at the time of writing) before committing;
   see `memory-bank/testing.md` for the suite layout and the traps.
4. Then move to **Tier 1 — credibility**: pin versions + add `integrity` to `importmap.json`, docs truth pass
   (the View Transitions section still says `document.startViewTransition()`), reproducible benchmark harness,
   cross-browser matrix.

## Active considerations / open questions

- **`transition.ready` can reject and nothing handles it.** When two transitions start on the same element in
  the same batch (routine: `runScopedViewTransition` starts one transition **per component** on
  `el.parentElement`), the browser skips the later one and `transition.ready` rejects with
  `AbortError: Transition was skipped`. `src/index.ts` does
  `transition.ready.then(() => hooks.viewTransition.ready(transition))` with no rejection handler and no
  `else` branch, so the library produces an **unhandled promise rejection** (it showed up as a Puppeteer
  `pageerror` and in the harness `#errors` panel during this task). Proposed minimal fix:
  `transition.ready.then(onReady, () => {})`. Not implemented yet (out of scope for the queue fix).
- **The define queue is global, so ownership matters.** `customElements.define` is one function for the whole
  document; `polyfill_defer_define()` used to early-return for the second registry, leaving the patched
  `define` consulting only the **first** registry's catalog. This task fixed it by consulting every registry
  that installed the queue (`DEFERRED_REGISTRIES`). Any future work on multiple registries per page must keep
  this in mind (and `clean()` must stay in sync, since it now opts a registry out).

- **`getMutationObserver()` never returns `ShadowObserver`.** In `src/index.ts` the `try` returns the dynamic
  `import("shadow-observer").ShadowObserver`, but the `finally` block also *returns*
  `Promise.resolve(MutationObserver)` — and a `return` in `finally` overrides the earlier return. Net effect:
  shadow-root discovery is effectively disabled while `shadow-observer` is still awaited. Worth deciding: fix the
  `finally`, or drop `shadow-observer` entirely (it is a `peerDependency` and external in the bundle).
- **The zero-config path.** When `catalog` is omitted, `options.catalog` is `undefined`, so the import-map branch
  runs (`useImportMapsCatalog` is effectively redundant for that decision). Decide whether to keep both knobs.
- **`retry()` is destructive** — fixing it changes semantics; prefer "remove only what the fallback injected".
- **`#errors` gating by tag name** suppresses discovery for a tag page-wide after one failure, and the mutation
  watcher skips by the mutation *target's* tag name (Tier 1 item).
- **GPL-3.0 vs adoption** — a license decision is deliberately pending (Tier 2).
- **`custom-elements.json`** is declared in `package.json` but never generated; generating it could remove the
  docs-drift class of bugs (Tier 1/2).

## Patterns & preferences to honor

- One-file library: keep new logic inside `src/index.ts` unless there is a strong reason not to.
- No runtime dependencies; anything extra must be capability-detected and optional.
- Prefer standards + feature detection over polyfills; always provide a plain `define()` fallback path.
- Keep the `ce` attribute state machine and `performance.measure` names (`load:<tag>`, `define:<tag>`) stable —
  they are public contract.
- Match existing code style; the repo does **not** consistently follow `.prettierrc` (printWidth 120, double
  quotes), so do not mass-reformat.
- `REVIEW.md` is maintained as an honest, living document: check items off, don't silently drop them.
