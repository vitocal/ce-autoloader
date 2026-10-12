/**
 * The `ce` lifecycle.
 *
 * `ce` is two things at once: the public styling contract — stylesheets select on
 * `[ce="loading"]`, `[ce="defined"]` and `[ce="error"]` — and the flag the failure
 * reporter reads to decide whether an element has already been handled. That is
 * why the vocabulary lives here and nowhere else: a writer free to overwrite it
 * can erase the evidence the reporter depends on.
 *
 * Failure is terminal. `beginLoading` refuses to move a failed element back to
 * `loading`, so it is never fetched twice and never reported twice.
 */

const ATTRIBUTE = "ce";
const LOADING = "loading";
const DEFINED = "defined";
const ERROR = "error";

/** Has this element already failed? Failure is terminal. */
export function hasFailed(el?: Element | null): boolean {
  return el?.getAttribute(ATTRIBUTE) === ERROR;
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

/** Move `el` to `defined`. */
export function markDefined(el?: Element | null): void {
  el?.setAttribute(ATTRIBUTE, DEFINED);
}

/** Move `el` to `error`. */
export function markFailed(el?: Element | null): void {
  el?.setAttribute(ATTRIBUTE, ERROR);
}
