/**
 * The `ce` lifecycle.
 *
 * `ce` is two things at once: the public styling contract — stylesheets select on
 * `[ce="loading"]`, `[ce="loaded"]`, `[ce="defined"]`, `[ce="ready"]` and
 * `[ce="error"]` — and the flag the failure reporter reads to decide whether an
 * element has already been handled. That is why the vocabulary lives here and
 * nowhere else: a writer free to overwrite it can erase the evidence the reporter
 * depends on.
 *
 * Failure is terminal. `beginLoading` refuses to move a failed element back to
 * `loading`, so it is never fetched twice and never reported twice.
 *
 * @see {@link LifecycleState} for what each state means and why `defined` and
 * `ready` are two of them.
 */

/** The attribute every state is written to. */
const ATTRIBUTE = "ce";

const LOADING = "loading";
const LOADED = "loaded";
const DEFINED = "defined";
const READY = "ready";
const ERROR = "error";

/**
 * The states, in the order an element moves through them:
 *
 * ```
 * (none) → loading → loaded → defined → ready
 *               └──────────────┴──→ error
 * ```
 *
 * - `loading` — the module is being fetched.
 * - `loaded`  — the module is in memory and the element has *not* upgraded yet.
 *   This is the window `deferDefine` opens: the only moment a batch is complete
 *   but not applied, and therefore the only moment it can be applied *together*.
 * - `defined` — `customElements.define()` has run. Written synchronously from the
 *   upgrade, so a stylesheet sees it on the same frame.
 * - `ready`   — the first paint *after* the upgrade. `defined` is written during
 *   the frame in which the element upgraded, so nothing declared on `defined` has
 *   painted yet; `ready` is the state to hang "the user can see this now" on.
 *
 * Because `ready` supersedes `defined` a couple of frames later, an entry
 * animation must be declared on **both**: `[ce="defined"], [ce="ready"]`. A rule
 * matching only `defined` is torn down the moment `ready` lands.
 */
export type LifecycleState = "loading" | "loaded" | "defined" | "ready" | "error";

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
export function beginLoading(el?: Element | null): boolean {
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
  ready: 3,
};

/**
 * Write `state` onto `el`, unless the walk has already gone past it.
 *
 * `from`, when given, is the single state the element must currently be in. Only
 * the transitions that mean something specific need it — `ready` is a statement
 * about an upgrade that has *finished*, so it must not be reachable from
 * `loading`.
 *
 * Rank is what keeps the walk one-way. `preload()` runs `load()` and `define()`
 * back to back, a define failure lands on the same tick as a `ready` that is
 * already queued for the next paint, and neither may rewrite an element that is
 * already on screen. Only `beginLoading` may rewind: a re-entered load really is
 * a new walk, and the skeleton coming back is the honest thing to show.
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

/** Move `el` to `defined`. The upgrade has happened; the paint has not. */
export function markDefined(el?: Element | null): void {
  advance(el, DEFINED);
}

/**
 * Move `el` to `ready`. The upgrade has been painted.
 *
 * Only reachable from `defined`: a `ready` that was scheduled before the upgrade
 * — or that loses a race with a failure — cannot jump the queue.
 */
export function markReady(el?: Element | null): void {
  advance(el, READY, DEFINED);
}

/**
 * Move `el` to `ready` once the next paint has happened.
 *
 * @see {@link afterPaint}
 */
export function markReadyAfterPaint(el?: Element | null): void {
  if (!el) return;

  afterPaint(() => markReady(el));
}

/** Move `el` to `error`. */
export function markFailed(el?: Element | null): void {
  el?.setAttribute(ATTRIBUTE, ERROR);
}

/**
 * A background tab never fires `requestAnimationFrame`. `ready` is cosmetic, so
 * a late-but-correct paint beats an element parked in `defined` forever.
 */
const PAINT_FALLBACK_MS = 50;

let pending: Array<() => void> = [];
let scheduled: ReturnType<typeof setTimeout> | null = null;

/**
 * Run `fn` after the next paint.
 *
 * Two frames, because a `requestAnimationFrame` callback runs *before* the paint
 * of its own frame: only the second one is guaranteed to be on the far side of
 * the style change that was just made.
 *
 * Callers in the same frame share one schedule, so a batch of a hundred elements
 * costs two frames — not two hundred.
 */
function afterPaint(fn: () => void) {
  pending.push(fn);
  if (scheduled) return;

  const flush = () => {
    if (scheduled) clearTimeout(scheduled);
    scheduled = null;

    const batch = pending;
    pending = [];
    batch.forEach((fn) => fn());
  };

  requestAnimationFrame(() => requestAnimationFrame(flush));
  scheduled = setTimeout(flush, PAINT_FALLBACK_MS);
}
