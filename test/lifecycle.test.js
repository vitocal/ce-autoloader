import { expect } from "chai";
import { beginLoading, hasFailed, markDefined, markFailed } from "../src/lifecycle.ts";

/**
 * The module owns the `ce` vocabulary, so these tests assert the literal attribute
 * values: stylesheets and demo pages select on `[ce="…"]`, and a rename inside the
 * module must not be able to pass silently.
 *
 * The other half is the invariant. A failed element is terminal — it used to be a
 * convention re-derived at every read site, which is how a failed `visible`
 * component got loaded again and reported a second time (issue #18).
 */
describe("Lifecycle", () => {
  const make = () => document.createElement("lifecycle-fixture");

  it("should start with no state at all", () => {
    const el = make();

    expect(el.hasAttribute("ce")).to.be.false;
    expect(hasFailed(el)).to.be.false;
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

  it("should tolerate a missing element", () => {
    // `preload()` defines a component with no element behind it.
    expect(hasFailed(undefined)).to.be.false;
    expect(beginLoading(undefined)).to.be.false;
    expect(() => markDefined(undefined)).to.not.throw();
    expect(() => markFailed(undefined)).to.not.throw();
  });
});
