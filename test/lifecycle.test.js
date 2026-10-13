import { expect } from "chai";
import {
  beginLoading,
  getLifecycle,
  hasFailed,
  markDefined,
  markFailed,
  markLoaded,
  markReady,
  markReadyAfterPaint,
} from "../src/lifecycle.ts";

/**
 * The module owns the `ce` vocabulary, so these tests assert the literal attribute
 * values: stylesheets and demo pages select on `[ce="…"]`, and a rename inside the
 * module must not be able to pass silently.
 *
 * The other half is the invariant. A failed element is terminal — it used to be a
 * convention re-derived at every read site, which is how a failed `visible`
 * component got loaded again and reported a second time (issue #18).
 *
 * The third is the order. `loading → loaded → defined → ready` is a one-way walk:
 * `loaded` exists so `deferDefine` has a window to hold a batch in, and `ready` is
 * the frame after the upgrade, which is the only moment an entry animation has
 * something to animate from.
 */
describe("Lifecycle", () => {
  const make = () => document.createElement("lifecycle-fixture");

  it("should start with no state at all", () => {
    const el = make();

    expect(el.hasAttribute("ce")).to.be.false;
    expect(hasFailed(el)).to.be.false;
    expect(getLifecycle(el)).to.be.null;
  });

  it("should move an element to loading", () => {
    const el = make();

    expect(beginLoading(el), "beginLoading reports that it moved the element").to.be.true;
    expect(el.getAttribute("ce")).to.equal("loading");
  });

  it("should move an element to defined", () => {
    const el = make();

    markDefined(el);

    expect(el.getAttribute("ce")).to.equal("defined");
  });

  it("should move an element to error", () => {
    const el = make();

    markFailed(el);

    expect(el.getAttribute("ce")).to.equal("error");
    expect(hasFailed(el)).to.be.true;
  });

  it("should walk loading → loaded → defined → ready", () => {
    const el = make();

    beginLoading(el);
    expect(getLifecycle(el), "loading").to.equal("loading");

    markLoaded(el);
    expect(getLifecycle(el), "loaded is the defer window").to.equal("loaded");

    markDefined(el);
    expect(getLifecycle(el), "defined is synchronous with the upgrade").to.equal("defined");

    markReady(el);
    expect(getLifecycle(el), "ready is the paint after").to.equal("ready");
  });

  it("should refuse to load an element that already failed", () => {
    // `ce="error"` is the "already reported" flag, so nothing may overwrite it.
    // `load()` used to do exactly that, which defeated the guard and appended a
    // second fallback on every re-intersection.
    const el = make();
    markFailed(el);

    expect(beginLoading(el), "a failed element must not begin loading again").to.be.false;
    expect(el.getAttribute("ce"), "the failure flag must survive").to.equal("error");
    expect(hasFailed(el)).to.be.true;
  });

  it("should keep a failure when it is reported again", () => {
    const el = make();

    markFailed(el);
    markFailed(el);

    expect(el.getAttribute("ce")).to.equal("error");
  });

  it("should not let a failure be walked back by a later state", () => {
    const el = make();

    beginLoading(el);
    markFailed(el);

    // A `ready` is already sitting on the paint queue by the time a define
    // failure lands, and `loadAndDefine` reports a rejection on the same tick.
    markLoaded(el);
    markDefined(el);
    markReady(el);

    expect(getLifecycle(el), "the failure flag must survive").to.equal("error");
    expect(hasFailed(el)).to.be.true;
  });

  it("should not walk backwards", () => {
    const el = make();

    beginLoading(el);
    markLoaded(el);
    markDefined(el);
    markReady(el);

    // `preload()` runs `load()` and `define()` back to back, so the walk can be
    // re-entered on an element that is already on screen.
    markLoaded(el);
    expect(getLifecycle(el), "loaded must not reopen the defer window").to.equal("ready");

    markDefined(el);
    expect(getLifecycle(el), "defined must not rewind a painted element").to.equal("ready");
  });

  it("should not reach ready before defined", () => {
    const el = make();

    markReady(el);
    expect(getLifecycle(el), "an untouched element has no state to advance from").to.be.null;

    beginLoading(el);
    markReady(el);
    expect(getLifecycle(el), "ready is meaningless while the module is still in flight").to.equal("loading");
  });

  it("should reach ready on the paint after defined", async () => {
    const el = make();
    document.body.appendChild(el);

    beginLoading(el);
    markDefined(el);
    markReadyAfterPaint(el);

    expect(getLifecycle(el), "still defined on the frame of the upgrade").to.equal("defined");

    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(getLifecycle(el), "ready after the paint").to.equal("ready");
    el.remove();
  });

  it("should tolerate a missing element", () => {
    // `preload()` defines a component with no element behind it.
    expect(hasFailed(undefined)).to.be.false;
    expect(getLifecycle(undefined)).to.be.null;
    expect(beginLoading(undefined)).to.be.false;
    expect(() => markLoaded(undefined)).to.not.throw();
    expect(() => markDefined(undefined)).to.not.throw();
    expect(() => markReady(undefined)).to.not.throw();
    expect(() => markReadyAfterPaint(undefined)).to.not.throw();
    expect(() => markFailed(undefined)).to.not.throw();
  });
});
