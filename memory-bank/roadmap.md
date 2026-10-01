# Roadmap (working copy of `REVIEW.md`)

`REVIEW.md` is the source of truth and stays honest; this file is the short version. Tick the box in both.

## Tier 0 — correctness

- [x] Await the definitions in `runScopedViewTransition` (`forEach` returned `undefined`).
- [x] Guard element-scoped view transitions; plain `define()` when the browser has none.
- [x] Packaging: ESM-only, `sideEffects: false`, `shadow-observer` external.
- [~] **Define queue safety** — Stage 1 done (see below); the patch is still on by default.
- [ ] `retry()` must not wipe light DOM — snapshot once, or remove only what the fallback injected.
- [ ] Completion signals: `ce:load` / `ce:error` events + `registry.whenLoaded(tag)`.
- [ ] Open inside the VT guard: re-check `prefers-reduced-motion` per element.

## Tier 1 — credibility

- [ ] Docs truth pass (README still says `document.startViewTransition()`; state the real support story).
- [ ] The `ds` layer CSS from the Nord CDN 404s on its font (`nordhealth-sans.woff2` resolves relative to each
      page, not to the CDN). Rewrite `url()` in `loadCSSLayer`, or ship the font.
- [ ] Pin `importmap.json` and add `integrity`; document import maps + integrity as the production setup.
- [ ] Make the performance claims reproducible (replace the Core Web Vitals screenshot with a harness + method).
- [ ] Cross-browser matrix — Chromium + WebKit + Firefox for the four directives, errors, retry, shadow roots.
- [ ] Stress fixture (1–2k elements) to measure discovery cost, then scope rescans to the mutated subtree.
- [ ] Stop gating discovery by the mutation *target's* tag name (one failed `<my-chart>` suppresses the tag page-wide).
- [ ] Keep error text/stack out of DOM attributes, or document the trade-off.
- [ ] `scrollMargin` → `rootMargin` (the documented 20% margin silently does nothing today).

## Tier 2 — direction

- [ ] Write the standards proposal (`WICG/webcomponents#782`) using this implementation as evidence.
- [ ] License decision + contribution policy (GPL-3.0 is the quiet adoption blocker).
- [ ] Lean into what nobody else combines: declarative directives, the `ce` CSS state machine, native telemetry,
      per-team catalogs, no-build import-map catalogs.

## Medium term

Connection-aware loading (`navigator.connection.saveData` / `effectiveType`) · dependency hints so a tag implies
`rel="modulepreload"` · page/route byte budgets · integrity and pinning as first-class features.

## Define-patch plan

**Why the queue exists.** Catalogs self-register — 18 of 20 demo components call `customElements.define` at import
time — and modules are imported *before* the view transition starts. Without help those definitions land outside the
snapshot window, so the placeholder-to-component morph never happens. The queue retimes them into the transition's
`update` callback.

| Stage | What | State |
| --- | --- | --- |
| 1 | `deferDefine` switch, idempotent `define()`, swallow polyfill deleted, "only morph what we define", define errors surfaced, `ready` rejection guard | **done** |
| 2 | **Transient capture**: patch `define` from "the batch starts loading" until the transition's `update` has run, then hand the platform back. Deletes `queue` / `dequeue` / `flush`, `DEFERRED_REGISTRIES`, the `types.d.ts` augmentation and README's queue section | open |
| 3 | Revisit whether `deferDefine` is needed at all once "let the loader return a constructor" is the documented happy path | open |

### Alternatives considered

| Option | Verdict |
| --- | --- |
| Flag on the existing global queue | Smallest diff; keeps the global patch (this is Stage 1) |
| Transient capture | **Target**: no permanent mutation, deletes public surface, bounded window. Needs a session `Set` plus restore bookkeeping; worst case is a lost animation, not a lost definition |
| Never patch; idempotent `define()` | Simplest and smallest; self-registering catalogs lose the morph, so it cannot be the default |
| Import inside the `update` callback | Removes the patch and keeps morphs, but the transition then spans the network fetch: the page shows a frozen before-snapshot while downloading. Rejected |
| Infer registrations via `customElements.getName()` | Impossible for side-effect bundles. Rejected |

### Stage 2 notes

Capture into **all** open sessions (the first drain defines; the others see `customElements.get()` truthy and skip) ·
`preload()` has no transition, so it defines right after the import · close in a `finally` on every abort path, or
the platform is left patched.

## Reviewer-facing risks (keep these visible)

1. The global `customElements.define` patch is the biggest adoption risk — mitigated, not solved.
2. Element-scoped view transitions are Chromium-only; telling people to set `transition: true` was risky before the
   Tier 0 guard.
3. `#errors` and the loading locks are keyed by tag name, which conflates instances.
4. `retry()` clears user content; error text and stack live in attributes.
5. GPL-3.0 is the quiet blocker for corporate teams.
6. Docs are hand-maintained and have drifted (the animation page was dead for months); a generated reference would
   remove that class of bug.
7. No imperative completion API.
8. The byte claim is re-verified at **3,391 B gzip** (`gzip -c dist/ce-autoloader.js`) — re-check after every change.

Refs: [caniuse: `Element.startViewTransition`](https://caniuse.com/mdn-api_element_startviewtransition) ·
[WICG/webcomponents#782](https://github.com/WICG/webcomponents/issues/782)
