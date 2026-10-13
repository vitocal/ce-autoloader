import { expect } from "chai";
import { html } from "https://esm.sh/uhtml";
import AutoLoader from "../src/index.ts";

class BaseComp extends HTMLElement {
  connectedCallback() {
    this.setAttribute("data-upgraded", "true");
    this.appendChild(this.render());
  }

  render() {
    return html`Hello World`;
  }
}

class ErrorFallback extends HTMLElement {
  connectedCallback() {
    this.appendChild(this.render());
  }
  render() {
    return html`<p>Fallback content</p>`;
  }
}
customElements.define("error-fallback", ErrorFallback);

// Component catalog
const catalog = {
  "test-component": async () => {
    customElements.define("test-component", BaseComp);
  },
  "nested-component": async () => {
    class NestedComponent extends BaseComp {
      render() {
        return html`<test-component></test-component>`;
      }
    }
    customElements.define("nested-component", NestedComponent);
  },
  "dynamic-component": async () => {
    class DynamicComponent extends BaseComp {}
    customElements.define("dynamic-component", DynamicComponent);
  },
  "manual-component": async () => {
    class ManualComponent extends BaseComp {}
    customElements.define("manual-component", ManualComponent);
  },
  "interaction-component": async () => {
    class InteractionComponent extends BaseComp {}
    customElements.define("interaction-component", InteractionComponent);
  },
  "visible-component": async () => {
    class VisibleComponent extends BaseComp {}
    customElements.define("visible-component", VisibleComponent);
  },
  "error-component": async () => {
    throw new Error("Failed to load component");
  },
  "walk-component": async () => {
    // A delay, so `loading` is a state the test can actually observe rather
    // than a step the loader takes and leaves within one task.
    await new Promise((resolve) => setTimeout(resolve, 30));
    class WalkComponent extends BaseComp {}
    customElements.define("walk-component", WalkComponent);
  },
};

/** Poll `check` until it is truthy, or give up after `timeout`. */
async function waitFor(check, timeout = 2000) {
  const deadline = performance.now() + timeout;

  while (performance.now() < deadline) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return false;
}

describe("CEAutoLoader", () => {
  let registry;
  const fixtures = document.getElementById("fixtures");

  beforeEach(() => {
    fixtures.innerHTML = "";

    // Reset observers, but we can't really unregister the custom elements.
    registry?.clean();
    registry = undefined;
  });

  // Clean up the last registry too, so its observers don't leak into
  // the next suite (Observability) and load tags with a stale catalog.
  after(() => {
    registry?.clean();
    registry = undefined;
  });

  it("should upgrade existing components on start", async () => {
    const el = document.createElement("test-component");
    fixtures.appendChild(el);

    registry = new AutoLoader({
      catalog,
      root: fixtures,
    });
    await customElements.whenDefined("test-component");
    expect(el.hasAttribute("data-upgraded")).to.be.true;
  });

  it("should upgrade nested components", async () => {
    const container = document.createElement("div");
    const el = document.createElement("nested-component");
    container.appendChild(el);
    fixtures.appendChild(container);

    registry = new AutoLoader({
      catalog,
      root: fixtures,
    });

    await customElements.whenDefined("nested-component");

    expect(el.hasAttribute("data-upgraded")).to.be.true;
    expect(el.textContent).to.equal("Hello World");
  });

  it("should upgrade dynamically added components (MutationObserver)", async () => {
    registry = new AutoLoader({
      catalog,
      root: fixtures,
      live: true,
    });

    const el = document.createElement("dynamic-component");
    fixtures.appendChild(el);

    // Wait for MutationObserver and async hydration
    await customElements.whenDefined("dynamic-component");

    expect(el.hasAttribute("data-upgraded")).to.be.true;
  });

  describe("loading attribute", () => {
    it("eager", async () => {
      const el = document.createElement("test-component");
      el.setAttribute("loading", "eager");
      fixtures.appendChild(el);

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
      });

      await customElements.whenDefined("test-component");
      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });
    it("manual", async () => {
      const el = document.createElement("manual-component");
      el.setAttribute("loading", "manual");
      fixtures.appendChild(el);

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
      });

      expect(el.hasAttribute("data-upgraded")).to.be.false;
      await registry.upgrade(fixtures, "manual");
      await customElements.whenDefined("manual-component");
      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });
    it("click", async () => {
      const el = document.createElement("interaction-component");
      el.setAttribute("loading", "click");
      fixtures.appendChild(el);

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        // Discovery is async while `live` is on (it awaits the
        // MutationObserver setup), so disable it to attach the
        // click listener synchronously, before dispatching it.
        live: false,
      });

      expect(el.hasAttribute("data-upgraded")).to.be.false;

      await el.dispatchEvent(new MouseEvent("click"));
      await customElements.whenDefined("interaction-component");

      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });
    it("visible", async () => {
      const el = document.createElement("visible-component");
      el.setAttribute("loading", "visible");
      fixtures.appendChild(el);

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
      });

      expect(el.hasAttribute("data-upgraded")).to.be.false;
      await customElements.whenDefined("visible-component");
      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });
  });

  describe("intersectionOptions", () => {
    let NativeIntersectionObserver;
    let created;

    beforeEach(() => {
      NativeIntersectionObserver = window.IntersectionObserver;
      created = [];

      // The shared observer is created inside `visible()`; wrap the global so the
      // test can read the options it received and its normalized rootMargin.
      class SpyIntersectionObserver extends NativeIntersectionObserver {
        constructor(callback, options) {
          super(callback, options);
          created.push({ options, observer: this });
        }
      }

      window.IntersectionObserver = SpyIntersectionObserver;
    });

    afterEach(() => {
      created.forEach(({ observer }) => observer.disconnect());
      window.IntersectionObserver = NativeIntersectionObserver;
    });

    it("defaults the shared IntersectionObserver to a 20% rootMargin", () => {
      // `live: false` makes discover() run synchronously, so the default
      // `visible` directive builds the observer before the constructor returns.
      registry = new AutoLoader({ catalog, root: fixtures, live: false });

      const observer = created[0]?.observer;
      expect(observer, "an IntersectionObserver should have been created").to.exist;
      expect(observer.rootMargin).to.equal("20% 20% 20% 20%");
    });

    it("forwards a custom intersectionOptions verbatim", () => {
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        // A caller-supplied object replaces the default wholesale (shallow merge).
        intersectionOptions: { rootMargin: "0px 0px 100% 0px", threshold: 0.5 },
      });

      const observer = created[0]?.observer;
      expect(observer.rootMargin).to.equal("0px 0px 100% 0px");
      expect(observer.thresholds).to.deep.equal([0.5]);
    });
  });

  describe("Errors", () => {
    it("should handle errors in component definition", async () => {
      // `loading="eager"` instead of the default `visible`: the mocha report
      // grows as the suite runs, which pushes #fixtures below the fold, and
      // the IntersectionObserver would then never fire for this element.
      const el = document.createElement("error-component");
      el.setAttribute("loading", "eager");
      fixtures.appendChild(el);

      let reported = null;

      registry = new AutoLoader({
        catalog: catalog,
        root: fixtures,
        hooks: { error: (error) => (reported = error) },
      });
      await new Promise(requestIdleCallback);

      expect(el.getAttribute("ce")).to.equal("error");

      // The hook never depends on the option.
      expect(reported, "hooks.error should be called").to.exist;
      expect(reported.name).to.equal("error-component");
      expect(reported.el).to.equal(el);
    });
    it("should allow a fallback component", async () => {
      const el = document.createElement("error-component");
      el.setAttribute("loading", "eager"); // see the note above
      fixtures.appendChild(el);

      registry = new AutoLoader({
        catalog: catalog,
        root: fixtures,
        fallback: ErrorFallback,
      });
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for fallback to render

      expect(el.querySelector("error-fallback")).to.exist;
      expect(el.textContent).to.equal("Fallback content");
    });
    it("should display all errors when (devErrors: true) ", async () => {
      const el = document.createElement("error-component");
      el.setAttribute("loading", "eager"); // see the note above
      fixtures.appendChild(el);

      let reported = null;

      registry = new AutoLoader({
        catalog: catalog,
        root: fixtures,
        devErrors: true,
        fallback: ErrorFallback,
        hooks: { error: (error) => (reported = error) },
      });
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(el.getAttribute("ce")).to.exist;
      expect(el.getAttribute("error")).to.be.null;
      expect(el.querySelector("error-fallback")).to.exist;
      expect(el.matches(":not(:defined)"), "the tag stays a placeholder").to.be.true;

      expect(reported, "hooks.error should be called").to.exist;
      expect(reported.name).to.equal("error-component");
      expect(reported.error.message).to.include("Failed to load component");
    });
    it("should leave tags not in catalog alone when devErrors: false", async () => {
      const el = document.createElement("el-notfound");
      el.setAttribute("loading", "eager"); // see the note above
      fixtures.appendChild(el);

      let reported = null;

      registry = new AutoLoader({
        catalog: catalog,
        root: fixtures,
        devErrors: false,
        fallback: ErrorFallback,
        hooks: { error: (error) => (reported = error) },
      });
      await new Promise(requestIdleCallback);

      expect(el.getAttribute("ce"), "no state should be painted").to.be.null;
      expect(el.getAttribute("error")).to.be.null;
      expect(el.querySelector("error-fallback")).to.not.exist;
      expect(el.matches(":not(:defined)"), "the tag stays a placeholder").to.be.true;

      // The failure is still reported, it just doesn't touch the DOM.
      expect(reported, "hooks.error should be called").to.exist;
      expect(reported.name).to.equal("el-notfound");
      expect(reported.error.message).to.include("not found in catalog");
    });

    it("should report a load failure exactly once", async () => {
      const el = document.createElement("error-component");
      el.setAttribute("loading", "eager"); // see the note above
      fixtures.appendChild(el);

      let calls = 0;

      registry = new AutoLoader({
        catalog: catalog,
        root: fixtures,
        hooks: { error: () => calls++ },
      });
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(el.getAttribute("ce")).to.equal("error");
      // The load phase and the define phase must not both claim the same failure.
      expect(calls, "hooks.error should run once per failure").to.equal(1);
    });

    it("should report a loader that neither defines the element nor returns a constructor", async () => {
      const el = document.createElement("empty-component");
      el.setAttribute("loading", "eager"); // see the note above
      fixtures.appendChild(el);

      let reported = null;

      registry = new AutoLoader({
        // The loader resolves, so the *load* phase succeeds; it just defines
        // nothing and returns no constructor, so the failure is raised in the
        // `define` phase and must still be reported.
        catalog: { "empty-component": async () => {} },
        root: fixtures,
        hooks: { error: (error) => (reported = error) },
      });
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(el.getAttribute("ce")).to.equal("error");

      expect(reported, "hooks.error should be called").to.exist;
      expect(reported.name).to.equal("empty-component");
      expect(reported.error.message).to.include("neither defined the element nor returned a constructor");
    });

    it("should report a catalog tag that another constructor already owns", async () => {
      // `polyfill_safe_ce_define` makes the tag *name* the identity, so a foreign
      // constructor that wins the race during the load is swallowed: the
      // platform's `NotSupportedError` never fires and the tag is painted
      // `ce="defined"`. The mismatch must still reach the hook — the implementation
      // live on the page is not the one this catalog returned.
      const el = document.createElement("owned-component");
      el.setAttribute("loading", "eager"); // see the note above
      fixtures.appendChild(el);

      class OursComp extends HTMLElement {}

      let reported = null;

      registry = new AutoLoader({
        catalog: {
          "owned-component": async () => {
            // Another script gets there first, while our module is loading.
            class ForeignComp extends HTMLElement {}
            customElements.define("owned-component", ForeignComp);
            return OursComp;
          },
        },
        root: fixtures,
        hooks: { error: (error) => (reported = error) },
      });
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // The element works — someone's implementation is live — so it is marked
      // defined and never painted as broken.
      expect(el.getAttribute("ce"), "the element should have upgraded").to.be.oneOf(["defined", "ready"]);
      expect(el.querySelector("error-fallback")).to.not.exist;

      expect(reported, "hooks.error should be called").to.exist;
      expect(reported.name).to.equal("owned-component");
      expect(reported.el).to.equal(el);
      expect(reported.error.message).to.include("already defined by another constructor");
    });

    it("should not append a second fallback when a failed component re-intersects", async () => {
      // No `loading` attribute means the default `visible` directive. A failed
      // component stays `:not(:defined)`, so the IntersectionObserver keeps
      // watching it. It must never be re-loaded: `load()` would overwrite
      // `ce="error"` with `ce="loading"`, defeating the "already reported"
      // guard in `handleComponentLoadError` and appending another fallback.
      const el = document.createElement("error-component");
      fixtures.appendChild(el);

      registry = new AutoLoader({
        catalog: catalog,
        root: fixtures,
        fallback: ErrorFallback,
      });
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(el.querySelectorAll("error-fallback")).to.have.length(1);

      // Re-observe the (still failed) element so the shared IntersectionObserver
      // delivers it again, as a real scroll back into the viewport would.
      registry.upgrade(fixtures);
      await new Promise(requestIdleCallback);
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(el.getAttribute("ce")).to.equal("error");
      expect(el.querySelectorAll("error-fallback"), "the fallback must not be duplicated").to.have.length(1);
    });
  });

  /**
   * The `ce` attribute is the public styling contract, so the order it takes its
   * values in is part of the API: `loaded` is the window `deferDefine` opens, and
   * `ready` is the paint after the upgrade. A stylesheet hooking any of them has
   * to be able to rely on the sequence, not just the endpoints.
   */
  describe("lifecycle walk", () => {
    it("should walk loading → loaded → defined → ready, in order", async () => {
      const el = document.createElement("walk-component");
      el.setAttribute("loading", "eager");
      fixtures.appendChild(el);

      /** Every value `ce` takes, oldest first. */
      const seen = [];
      const observer = new MutationObserver((records) => {
        // One callback can carry more than one step — `loaded` and `defined` are
        // written in adjacent microtasks, so the browser may coalesce them. Replay
        // the value each mutation *left behind* before recording where it ended up.
        for (const record of records) seen.push(record.oldValue);
        seen.push(el.getAttribute("ce"));
      });
      observer.observe(el, { attributes: true, attributeFilter: ["ce"], attributeOldValue: true });

      registry = new AutoLoader({ catalog, root: fixtures, devErrors: true });

      const finished = await waitFor(() => el.getAttribute("ce") === "ready");
      observer.disconnect();

      // Drop the leading `null` and any state replayed twice by a coalesced batch.
      const walk = seen.filter((state, i) => state && state !== seen[i - 1]);

      expect(finished, `the walk should reach ready (saw ${walk.join(" → ")})`).to.be.true;
      expect(walk).to.deep.equal(["loading", "loaded", "defined", "ready"]);
      expect(el.hasAttribute("data-upgraded"), "the element really did upgrade").to.be.true;
    });
  });
});
