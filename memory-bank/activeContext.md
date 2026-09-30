# Active Context — ce-autoloader

_Last updated: 2026-09-30 (memory bank initialized/refreshed)_

## Current focus

**Branch `tier0-fixes` @ `d898c37` — working through the *Tier 0 — correctness* list in `REVIEW.md`.**

Recent commits on this branch:

| Commit | Message |
| --- | --- |
| `d898c37` | Organize integration test |
| `f8e605c` | Make polyfill imdepotent and Update tests |
| `d7aa74b` | Re-enable integration tests |
| `87b20ab` | Refactored customElements defer polyfill and renamed some methods |
| `0396830` | Cleaned applyLoadingDirective |
| `11166b8` | Fixes packaging |

`git status` at the time of writing:

- `D .agent/rules/es6.md` — old agent rules removed (superseded by `.clinerules/memory.md`).
- `M REVIEW.md` — working-tree edit only marking Tier 0 items done (see below).
- `?? .clinerules/` — the Memory Bank rule file, not yet committed.

## Tier 0 status (source of truth: `REVIEW.md`, lines ~128–135)

- [X] **Fix the await in `runScopedViewTransition`** — done. Now
  `await Promise.allSettled(components.map(async ({el,name,module}) => …))`, so definitions are actually awaited.
- [X] **Guard element-scoped view transitions** — done. `SUPPORTS_SCOPED_VT = "startViewTransition" in
  Element.prototype`, transitions disabled + `polyfill_swallow_alreadyDefined()` when unsupported.
  (`prefers-reduced-motion` is still only checked once, in the constructor.)
- [X] **Fix packaging** — done. ESM-only (`exports` has no `require`, `main`/`module` → `dist/ce-autoloader.js`),
  `"sideEffects": false`, `shadow-observer` marked external in Rollup.
- [ ] **Make the define-queue safe** — make the `customElements.define` patch opt-in, auto-drain the queue when a
  non-catalog definition arrives, and document the third-party-script implications.
- [ ] **Stop destroying light DOM in `retry()`** — currently `el.innerHTML = ""` wipes slotted/server-rendered
  fallback markup. Snapshot once or remove only what the fallback injected.
- [ ] **Add completion signals** — `ce:load` / `ce:error` CustomEvents and `registry.whenLoaded(tag)`.

## Next steps (suggested order)

1. Finish the three remaining Tier 0 items above (small, local diffs in `src/index.ts`).
2. Re-run `npm test` and confirm the Puppeteer/Mocha suites stay green (see `memory-bank/testing.md`).
3. Update `README.md` "Expert Mode" section for any behavior change (queue opt-in, retry semantics, events).
4. Then move to **Tier 1 — credibility**: pin versions + add `integrity` to `importmap.json`, docs truth pass,
   reproducible benchmark harness, cross-browser matrix.

## Active considerations / open questions

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
