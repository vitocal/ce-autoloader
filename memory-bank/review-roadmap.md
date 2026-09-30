# Review Roadmap — condensed backlog (from `REVIEW.md`)

`REVIEW.md` is the project's honest review *and* its working TODO list. The checkboxes below mirror it; when you
finish an item, strike it in **both** files. Reviewer-facing risks are listed after the tiers.

## Tier 0 — correctness (small diffs, big payoff)

- [x] Fix the `await` in `runScopedViewTransition` (`forEach` returned `undefined`) → now
      `await Promise.allSettled(components.map(...))`.
- [x] Guard element-scoped view transitions (`Element.prototype.startViewTransition`) and fall back to a plain
      `define()`.
      - Still open inside this item: re-check `prefers-reduced-motion` **per element**, not once in the constructor.
- [x] Fix packaging: ESM-only (no `require`/UMD), `"sideEffects": false`, `shadow-observer` external.
- [ ] **Make the define-queue safe** — make the `customElements.define` patch opt-in, auto-drain the queue when a
      non-catalog definition arrives, document third-party-script implications.
- [ ] **Stop destroying light DOM in `retry()`** — snapshot once, or remove only what the fallback injected.
- [ ] **Add completion signals** — `ce:load` / `ce:error` CustomEvents + `registry.whenLoaded(tag)`.

## Tier 1 — credibility

- [ ] **Docs truth pass** — directive list (incl. what `hover` really does today), queue semantics, real
      view-transition browser support, and a working "Documentation" link.
- [ ] **Pin versions and add integrity** — replace `@latest` in `importmap.json`, add `integrity` for CDN entries,
      document "import map + integrity" as the recommended production setup.
- [ ] **Make performance claims reproducible** — replace the Core Web Vitals screenshot with a runnable harness,
      raw numbers and methodology.
- [ ] **Cross-browser test matrix** — Chromium + WebKit + Firefox for the four directives, error path, retry and
      shadow-root discovery (Mocha + Puppeteer already in place).
- [ ] **Stress fixture** (1–2k elements) to measure discovery cost; then scope the rescan to the mutated subtree.
- [ ] **Trim observer cost** — stop skipping by the mutation *target's* tag name (one failed `<my-chart>`
      currently suppresses discovery for that tag page-wide).
- [ ] **Keep error text out of attributes** (or clearly document the trade-off).

## Tier 2 — direction

- [ ] **Write the standards proposal** (`WICG/webcomponents#782`, open since Jan 2019) using this implementation
      as reference + evidence.
- [ ] **License decision** — permissive (MIT/Apache-2.0) for adoption vs GPL as an explicit values position;
      either way add a contribution and support policy.
- [ ] **Lean into the differentiators** nobody else combines: declarative directives, the `ce` CSS state machine,
      native telemetry, per-team catalogs, no-build import-map catalogs.

## Future directions (medium term)

- Connection-aware loading (`navigator.connection.saveData` / `effectiveType`).
- Component dependency hints so `<my-chart>` implies `rel="modulepreload"` for its chunks.
- Page/route byte budgets ("this route may not exceed 150 KB of components").
- Integrity + pinning as first-class features ("no bundler" ≠ "no supply chain").

## Reviewer-facing risks (do not lose these)

1. The global `customElements.define` patch is the biggest adoption risk (see Tier 0).
2. Element-scoped view transitions are Chromium-only; the README's advice to set `transition: true` was
   dangerous before the Tier 0 guard.
3. Per-tag failure suppression (`#errors`) and `loading_locks` are keyed by **tag name**, which conflates
   instances.
4. `retry()` clears user content; error text/stack live in attributes.
5. GPL-3.0 is the quiet adoption blocker for corporate teams.
6. Docs are hand-maintained and have drifted before; a generated API reference would remove the class of bugs.
7. No imperative completion API (Tier 0 item 3).
8. Byte claim verified at **3,286 bytes gzipped** for `dist/ce-autoloader.js` — re-verify after any change.
   Re-measured 2026-09-30: **3,268 bytes** via `gzip -c`; `vite build` reports 9.29 kB raw / gzip 3.18 kB.
