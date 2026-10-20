/**
 * The `ce` lifecycle.
 *
 * `ce` is two things at once: the public styling contract — stylesheets select on
 * `[ce="loading"]`, `[ce="loaded"]`, `[ce="defined"]` and `[ce="error"]` — and the
 * flag the failure reporter reads to decide whether an element has already been
 * handled. That is why the vocabulary lives here and nowhere else: a writer free to
 * overwrite it can erase the evidence the reporter depends on.
 *
 * Failure is terminal. `markLoading` refuses to move a failed element back to
 * `loading`, so it is never fetched twice and never reported twice.
 *
 * @see {@link LifecycleState} for what each state means.
 */

/** The attribute every state is written to. */
const ATTRIBUTE = "ce";

const LOADING = "loading";
const LOADED = "loaded";
const DEFINED = "defined";
const ERROR = "error";

/**
 * The states, in the order an element moves through them:
 *
 * ```
 * (none) → loading → loaded → defined
 *               └──────────────┴──→ error
 * ```
 *
 * - `loading` — the module is being fetched.
 * - `loaded`  — the module is in memory and the element has *not* upgraded yet.
 *   This is the window `deferDefine` opens: the only moment a batch is complete
 *   but not applied, and therefore the only moment it can be applied *together*.
 * - `defined` — `customElements.define()` has run. Written synchronously from the
 *   upgrade, in the frame the element upgrades, and it is the last state of the
 *   success walk: nothing moves the element on afterwards, so a rule matching
 *   `[ce="defined"]` keeps matching and an entry animation declared on it plays
 *   out in full.
 */
export type LifecycleState = "loading" | "loaded" | "defined" | "error";

/** The state `el` is in, or `null` while it has never been touched. */
export function getLifecycle(el?: Element | null): LifecycleState | null {
  return (el?.getAttribute(ATTRIBUTE) as LifecycleState) ?? null;
}

/** Has this element already failed? Failure is terminal. */
export function hasFailed(el?: Element | null): boolean {
  return getLifecycle(el) === ERROR;
}

/**
 * Move `el` to `loading`, unless it has already failed.
 *
 * Returns whether it moved: a caller that gets `false` should not fetch the
 * module, because the element is done failing.
 */
export function markLoading(el?: Element | null): boolean {
  if (!el || hasFailed(el)) return false;

  el.setAttribute(ATTRIBUTE, LOADING);
  return true;
}

/**
 * How far along the walk each state sits.
 *
 * `error` is terminal and deliberately off the scale: `advance` refuses to touch
 * a failed element before it ever reads this.
 */
const RANK: Record<LifecycleState, number> = {
  error: -1,
  loading: 0,
  loaded: 1,
  defined: 2,
};

/**
 * Write `state` onto `el`, unless the walk has already gone past it.
 *
 * `from`, when given, is the single state the element must currently be in. Only
 * the transitions that mean something specific need it — `loaded` must be reachable
 * only from `loading`, so that a `preload()` pass over an element that is already on
 * screen cannot re-open the defer window.
 *
 * Rank is what keeps the walk one-way. `preload()` runs `load()` and `define()` back
 * to back, so neither may rewrite an element that is already on screen. Only
 * `markLoading` may rewind: a re-entered load really is a new walk, and the
 * skeleton coming back is the honest thing to show.
 */
function advance(el: Element | null | undefined, state: LifecycleState, from?: LifecycleState): boolean {
  if (!el || hasFailed(el)) return false;
  if (from !== undefined && getLifecycle(el) !== from) return false;

  const current = getLifecycle(el);
  if (current && RANK[current] >= RANK[state]) return false;

  el.setAttribute(ATTRIBUTE, state);
  return true;
}

/**
 * Move `el` to `loaded`: the module resolved, the upgrade has not happened.
 *
 * Only reachable from `loading`, so a `preload()` pass over an element that is
 * already on screen cannot re-open the defer window.
 */
export function markLoaded(el?: Element | null): void {
  advance(el, LOADED, LOADING);
}

/** Move `el` to `defined`. The upgrade has happened, in this frame. */
export function markDefined(el?: Element | null): void {
  advance(el, DEFINED);
}

/** Move `el` to `error`. */
export function markFailed(el?: Element | null): void {
  el?.setAttribute(ATTRIBUTE, ERROR);
}
