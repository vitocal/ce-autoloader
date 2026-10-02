# Implementation Plan

## Overview

Fix issue #1 (`getMutationObserver()` always returns the native observer due to a `return`
inside `finally` that wins over the `try` block) and enable shadow root discovery for both
open and closed shadow roots. The `shadow-observer` peer dependency becomes truly optional:
ce-autoloader detects whether the host application imported it (via
`globalThis[Symbol.for('shadow-observer')]`) and uses `ShadowObserver` when available,
falling back to native `MutationObserver` otherwise. BLUE/GREEN tests confirm both paths.

**Context (issue #1: "`getMutationObserver()` always returns the native observer").**
The method does `try { return (await import('shadow-observer')).ShadowObserver; }` but
the `finally { return Promise.resolve(MutationObserver); }` block **always** executes a
return, which wins over the `try` block's return. The shadow-observer module is awaited and
then silently discarded. The `dom_watcher` method also has a `if (target instanceof ShadowRoot)
continue;` guard that skips mutations delivered from inside shadow roots — correct for the
native path (which never delivers them) but a hard block on the shadow-observer path.
Additionally, `shadow: 1` in the observe options means OPEN only; closed shadow roots are
never forwarded.

**Scope.** One method rewrite (`getMutationObserver`), two method fixes (`watchDOMMutations`,
`dom_watcher`), one new option (`shadowObserver`), one new test file (`test/shadow.test.js`),
and doc/memory-bank updates. The `peerDependency` on `shadow-observer` stays; we just add
`peerDependenciesMeta` to mark it optional.

**Approach.** Replace the dynamic `import('shadow-observer')` with a synchronous check of
`globalThis[Symbol.for('shadow-observer')]` — the module sets this symbol on load, so
importing it is the host app's choice. Add a `shadowObserver` option (`'auto' | true | false`)
for explicit control and test seam. Change `shadow: 1` (OPEN) to `shadow: 3` (OPEN | CLOSED).
Fix the `dom_watcher` ShadowRoot guard so it does not throw on `ShadowRoot` targets.

## Types

- `src/types.ts` — add `shadowObserver` option to `Options`:
  ```ts
  /**
   * Shadow root observation. `'auto'` (default) uses `shadow-observer` if the host
   * application imported it, native `MutationObserver` otherwise.
   * `true` forces shadow observation (warns if shadow-observer is not loaded).
   * `false` forces native `MutationObserver`.
   */
  shadowObserver?: boolean | 'auto';
  ```

## Files

### Modified files

- `src/index.ts`:
  - **`getMutationObserver()`** (lines 151-159): Replace broken dynamic import with
    synchronous globalThis symbol detection. Method becomes sync (no longer async).
  - **`watchDOMMutations()`** (lines 164-177): Remove `async`/`await`. Change `shadow: 1`
    to `shadow: 3` (OPEN | CLOSED).
  - **`dom_watcher()`** (lines 178-203): Replace `if (target instanceof ShadowRoot)
    continue;` with `if (target instanceof Element && target.getAttribute('ce') === 'error')
    continue;` — so ShadowRoot targets don't throw on `.getAttribute` and are not skipped.
  - **`discover()`** (line 274): Remove `await` on `watchDOMMutations()` (now sync).

- `src/types.ts`: Add `shadowObserver?: boolean | 'auto'` to Options.

- `package.json`: Add `peerDependenciesMeta`:
  ```json
  "peerDependenciesMeta": {
    "shadow-observer": { "optional": true }
  }
  ```

- `test/integration.html`:
  - Add `<script type="module">import "shadow-observer";</script>` before the test suites.
  - Add `<script type="module" src="./shadow.test.js"></script>`.

- Documentation:
  - `README.md`: Add "Shadow DOM" section.
  - `REVIEW.md`: Update Discovery row, mark issue #1 as **fixed**.
  - `memory-bank/activeContext.md`, `progress.md`, `techContext.md`, `systemPatterns.md`:
    mark issue #1 fixed, update test count.

### New files

- `test/shadow.test.js` — BLUE/GREEN shadow DOM tests (see **Testing**).

### Not modified

- `vite.config.js`: `external: ["shadow-observer"]` stays (documentation value).
- `importmap.json`, `docs/**`, `index.html`, `pages/**`.

## Functions

### Modified

- **`getMutationObserver()`** → sync. New body:
  ```ts
  private getMutationObserver(): typeof MutationObserver {
    if (this.options.shadowObserver === false) return MutationObserver;
    const ShadowObserverImpl = globalThis[Symbol.for('shadow-observer')];
    if (ShadowObserverImpl) return ShadowObserverImpl;
    if (this.options.shadowObserver === true) {
      console.warn("CEAutoLoader: shadowObserver is true but shadow-observer is not loaded.");
    }
    return MutationObserver;
  }
  ```

- **`watchDOMMutations()`** → sync. Removes `let _MutationObserver = await ...`.
  Changes `shadow: 1` to `shadow: 3`.

- **`dom_watcher()`** — the `if (target instanceof ShadowRoot) continue;` block becomes
  `if (target instanceof Element && target.getAttribute('ce') === 'error') continue;`.

- **`discover()`** — `await this.watchDOMMutations()` becomes `this.watchDOMMutations()`.

## Classes

No class additions, removals, or structural modifications.

## Dependencies

- `package.json`: Add `peerDependenciesMeta` for `shadow-observer` (optional: true).
- No new packages, no version changes.

## Testing

### Approach

BLUE/GREEN test pairs (same convention as `test/transitions.test.js`):
- **BLUE** (`shadowObserver: false`): Native MutationObserver, components inside shadow
  roots are NOT upgraded.
- **GREEN** (`shadowObserver: 'auto'`, default): ShadowObserver, components inside both
  open and closed shadow roots ARE upgraded.

The test page imports `shadow-observer` so the globalThis symbol is set. BLUE tests use
`shadowObserver: false` to opt out. GREEN tests rely on the default auto-detection.

### New file: `test/shadow.test.js`

Six tests across two describe blocks:

**BLUE — shadow-observer disabled:**
1. "should not upgrade components inside open shadow roots" — creates a shadow host with
   `mode: "open"`, appends a catalog component inside, waits 300ms, asserts `data-upgraded`
   is false and `:not(:defined)`.
2. "should not upgrade components inside closed shadow roots" — same with `mode: "closed"`.

**GREEN — shadow-observer enabled:**
3. "should upgrade components inside open shadow roots" — creates registry first (so observer
   is set up), then creates host + shadow + component, awaits `whenDefined`, asserts upgraded.
4. "should upgrade components inside closed shadow roots" — same with `mode: "closed"`.
5. "should upgrade nested components inside shadow roots" — component inside a div inside a
   shadow root.
6. "should respect loading directives inside shadow roots" — component with no `loading`
   attribute (default `visible` directive) inside a shadow root.

### Test traps

- **Timing**: GREEN tests create the registry BEFORE the shadow root, so the ShadowObserver's
  `attachShadow` patch is in place. A 50ms wait ensures the observer is set up.
- **Unique tag names**: Custom elements cannot be un-defined; each test uses its own tag.
- **BLUE tests skip `whenDefined()`**: The tag is never defined, so `whenDefined()` would
  hang. Use a fixed timeout instead.
- **`shadow: 3` required**: The current `shadow: 1` (OPEN only) would fail the closed shadow
  root GREEN test.

### Validation

1. `npx tsc --noEmit -p tsconfig.json` — clean.
2. `npm test` — 30 existing + 6 new = 36 tests passing.
3. Optional: verify `globalThis[Symbol.for('shadow-observer')]` in DevTools.

## Implementation Order

1. `src/types.ts`: Add `shadowObserver` option.
2. `src/index.ts`: Rewrite `getMutationObserver()`, update `watchDOMMutations()`, fix
   `dom_watcher()`, update `discover()`.
3. `package.json`: Add `peerDependenciesMeta`.
4. `test/shadow.test.js`: Create BLUE/GREEN tests.
5. `test/integration.html`: Add shadow-observer import and test script tag.
6. Run `npx tsc --noEmit` and `npm test`; confirm 36/36 pass.
7. Documentation: README.md, REVIEW.md, memory-bank.
8. Optional: `npm run build`; verify `dist/` output.

## Known limitations

- **Existing shadow roots**: Shadow-observer only observes roots created AFTER the observer
  is set up. Pre-existing shadow roots are not scanned. This is a documented limitation of
  `shadow-observer` itself.
- **Initial scan**: `matchCustomElement(root)` uses `querySelectorAll(':not(:defined)')`
  which does not cross shadow boundaries. Shadow root components are discovered only via
  the mutation observer (live mode).
