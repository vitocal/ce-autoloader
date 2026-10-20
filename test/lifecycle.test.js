import { expect } from "chai";
import { markLoading, getLifecycle, hasFailed, markDefined, markFailed, markLoaded } from "../src/lifecycle.ts";

/**
 * The module owns the `ce` vocabulary, so these tests assert the literal attribute
 * values: stylesheets and demo pages select on `[ce="…"]`, and a rename inside the
 * module must not be able to pass silently.
 *
 * The other half is the invariant. A failed element is terminal — it used to be a
 * convention re-derived at every read site, which is how a failed `visible`
 * component got loaded again and reported a second time (issue #18).
 *
 * The third is the order. `loading → loaded → defined` is a one-way walk: `loaded`
 * exists so `deferDefine` has a window to hold a batch in, and `defined` is written
 * in the frame the element upgrades and is the last state of the success walk, so a
 * rule matching it keeps matching.
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

    expect(markLoading(el), "markLoading reports that it moved the element").to.be.true;
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

  it("should walk loading → loaded → defined", () => {
    const el = make();

    markLoading(el);
    expect(getLifecycle(el), "loading").to.equal("loading");

    markLoaded(el);
    expect(getLifecycle(el), "loaded is the defer window").to.equal("loaded");

    markDefined(el);
    expect(getLifecycle(el), "defined is synchronous with the upgrade").to.equal("defined");
  });

  it("should refuse to load an element that already failed", () => {
    // `ce="error"` is the "already reported" flag, so nothing may overwrite it.
    // `load()` used to do exactly that, which defeated the guard and appended a
    // second fallback on every re-intersection.
    const el = make();
    markFailed(el);

    expect(markLoading(el), "a failed element must not begin loading again").to.be.false;
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

    markLoading(el);
    markFailed(el);

    // `loadAndDefine` reports a rejection on the same tick it defines, so a
    // `defined` may land after the failure.
    markLoaded(el);
    markDefined(el);

    expect(getLifecycle(el), "the failure flag must survive").to.equal("error");
    expect(hasFailed(el)).to.be.true;
  });

  it("should not walk backwards", () => {
    const el = make();

    markLoading(el);
    markLoaded(el);
    markDefined(el);

    // `preload()` runs `load()` and `define()` back to back, so the walk can be
    // re-entered on an element that is already on screen.
    markLoaded(el);
    expect(getLifecycle(el), "loaded must not reopen the defer window").to.equal("defined");

    markDefined(el);
    expect(getLifecycle(el), "defined is the last state of the success walk").to.equal("defined");
  });

  it("should leave defined as the last state of the success walk", async () => {
    const el = make();
    document.body.appendChild(el);

    markLoading(el);
    markDefined(el);

    // Nothing is scheduled behind `defined` any more: it is written in the frame
    // the element upgrades and stays there, so a rule matching `[ce="defined"]`
    // keeps matching. (It used to hand over to `ready` two frames later, which is
    // what forced every entry animation onto a union selector.)
    await new Promise((resolve) => setTimeout(resolve, 120));

    expect(getLifecycle(el), "defined survives the paint").to.equal("defined");
    el.remove();
  });

  it("should tolerate a missing element", () => {
    // `preload()` defines a component with no element behind it.
    expect(hasFailed(undefined)).to.be.false;
    expect(getLifecycle(undefined)).to.be.null;
    expect(markLoading(undefined)).to.be.false;
    expect(() => markLoaded(undefined)).to.not.throw();
    expect(() => markDefined(undefined)).to.not.throw();
    expect(() => markFailed(undefined)).to.not.throw();
  });
});
