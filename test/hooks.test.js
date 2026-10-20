import { expect } from "chai";
import AutoLoader from "../src/index.ts";
import HookProvidedComponent from "./hooks.fixture.js";

/** Poll `check` until it is truthy, or give up after `timeout`. */
async function waitFor(check, timeout = 2000) {
  const deadline = performance.now() + timeout;

  while (performance.now() < deadline) {
    if (check()) return true;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return false;
}

/** A component that marks itself the moment it upgrades. */
const component = () =>
  class extends HTMLElement {
    connectedCallback() {
      this.setAttribute("data-upgraded", "true");
    }
  };

/** A catalog whose loader registers the tag itself, and records that it ran. */
function spyCatalog(tag) {
  const calls = [];

  return {
    calls,
    catalog: {
      [tag]: async (name) => {
        calls.push(name);
        customElements.define(tag, component());
      },
    },
  };
}

/**
 * `hooks.load`, `hooks.loaded` and `hooks.define` — one call each, per component.
 *
 * Every test uses a tag of its own: a custom element registration cannot be undone,
 * so a shared tag would let one test's definition decide the next one's outcome.
 *
 * The `loading="eager"` attribute keeps the walk off the IntersectionObserver — the
 * mocha report grows as the suite runs and pushes `#fixtures` below the fold — and
 * `live: false` keeps the MutationObserver out of it, so the constructor's
 * `discover()` is the only thing that reaches the elements.
 */
describe("hooks", () => {
  let registry;
  const fixtures = document.getElementById("fixtures");

  beforeEach(() => {
    fixtures.innerHTML = "";

    // Reset observers, but we can't really unregister the custom elements.
    registry?.clean();
    registry = undefined;
  });

  after(() => {
    registry?.clean();
    registry = undefined;
  });

  /** An element the registry loads on construction, no visibility needed. */
  const eagerElement = (tag) => {
    const el = document.createElement(tag);
    el.setAttribute("loading", "eager");
    fixtures.appendChild(el);
    return el;
  };

  describe("hooks.load", () => {
    it("should load as usual when it returns true", async () => {
      const tag = "hook-load-true";
      const el = eagerElement(tag);
      const { catalog, calls } = spyCatalog(tag);

      const seen = [];
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: {
          load: (name, target) => {
            seen.push([name, target]);
            return true;
          },
        },
      });

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;

      expect(seen, "one call per component").to.have.lengthOf(1);
      expect(seen[0][0], "the hook is told which component").to.equal(tag);
      expect(seen[0][1], "and which element").to.equal(el);
      expect(calls, "`true` means the catalog loader runs").to.have.lengthOf(1);
      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });

    it("should load as usual when it returns nothing", async () => {
      const tag = "hook-load-void";
      const el = eagerElement(tag);
      const { catalog, calls } = spyCatalog(tag);

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: { load: () => { } },
      });

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;
      expect(calls, "a handler that just returns is read as `true`").to.have.lengthOf(1);
    });

    it("should skip the component when it returns false", async () => {
      const tag = "hook-load-false";
      const el = eagerElement(tag);
      const { catalog, calls } = spyCatalog(tag);

      let hook_calls = 0;
      let reported = null;

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: {
          load: () => {
            hook_calls++;
            return false;
          },
          error: (error) => (reported = error),
        },
      });

      // Nothing is scheduled behind a skip, so give a load every chance to happen.
      await new Promise((resolve) => setTimeout(resolve, 120));

      expect(hook_calls, "the hook still ran").to.equal(1);
      expect(calls, "the catalog loader must not run").to.have.lengthOf(0);
      expect(customElements.get(tag), "nothing was defined").to.be.undefined;
      expect(el.hasAttribute("ce"), "a skipped element keeps no state").to.be.false;
      expect(el.hasAttribute("data-upgraded")).to.be.false;

      // A skip is a decision, not a failure: no report, no `ce="error"`.
      expect(reported, "a skip must not be reported").to.be.null;
    });

    it("should ask again on the next upgrade when it skipped", async () => {
      const tag = "hook-load-retry";
      const el = eagerElement(tag);
      const { catalog, calls } = spyCatalog(tag);

      let answer = false;
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: { load: () => answer },
      });

      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(customElements.get(tag), "skipped, and left unhandled").to.be.undefined;

      answer = true;
      registry.upgrade(fixtures, "eager");

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;
      expect(calls, "the second answer was honoured").to.have.lengthOf(1);
    });

    it("should use the module it returns in place of the catalog loader's", async () => {
      const tag = "hook-load-module";
      const el = eagerElement(tag);
      const { catalog, calls } = spyCatalog(tag);

      const loaded = [];
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: {
          // A real ES module: only a namespace object carries
          // `Symbol.toStringTag === "Module"`, and only that gets unwrapped.
          load: () => import("./hooks.fixture.js"),
          loaded: (result) => loaded.push(result),
        },
      });

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;

      expect(calls, "the catalog loader must not run").to.have.lengthOf(0);
      expect(customElements.get(tag), "defined from the module the hook handed back")
        .to.equal(HookProvidedComponent);
      expect(el.hasAttribute("data-upgraded")).to.be.true;

      // `loaded` sees the module as it came back; `define` is the one that unwraps
      // it, so it sees the constructor.
      expect(loaded[0].module.default).to.equal(HookProvidedComponent);
    });
  });

  describe("hooks.loaded", () => {
    it("should run once, with the module in memory and the element not upgraded", async () => {
      const tag = "hook-loaded";
      const el = eagerElement(tag);
      const { catalog } = spyCatalog(tag);

      const seen = [];
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: {
          loaded: (result) => seen.push({
            name: result.name,
            el: result.el,
            ce: result.el.getAttribute("ce"),
          }),
        },
      });

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;

      expect(seen, "one call per component").to.have.lengthOf(1);
      expect(seen[0].name).to.equal(tag);
      expect(seen[0].el).to.equal(el);
      expect(seen[0].ce, "the walk is at `loaded` when the hook runs").to.equal("loaded");
      expect(el.getAttribute("ce"), "and it moves on to `defined`").to.equal("defined");
    });

    it("should ignore what it returns", async () => {
      const tag = "hook-loaded-void";
      const el = eagerElement(tag);
      const { catalog } = spyCatalog(tag);

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        // `false` from `loaded` is not `false` from `define`: a notification
        // cannot disable anything.
        hooks: { loaded: () => false },
      });

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;
      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });
  });

  describe("hooks.define", () => {
    it("should define as usual when it returns true", async () => {
      const tag = "hook-define-true";
      const el = eagerElement(tag);
      const Klass = component();
      const catalog = { [tag]: async () => Klass };

      const seen = [];
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: { define: (result) => (seen.push(result), true) },
      });

      expect(await waitFor(() => el.getAttribute("ce") === "defined")).to.be.true;

      expect(seen, "one call per component").to.have.lengthOf(1);
      expect(seen[0].name).to.equal(tag);
      expect(seen[0].el).to.equal(el);
      expect(customElements.get(tag)).to.equal(Klass);
      expect(el.hasAttribute("data-upgraded")).to.be.true;
    });

    it("should disable the definition when it returns false", async () => {
      const tag = "hook-define-false";
      const el = eagerElement(tag);
      const Klass = component();
      const catalog = { [tag]: async () => Klass };

      const seen = [];
      let reported = null;

      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: {
          define: (result) => (seen.push(result), false),
          error: (error) => (reported = error),
        },
      });

      // Nothing is scheduled behind a disabled definition, so wait it out.
      await new Promise((resolve) => setTimeout(resolve, 120));

      expect(seen, "one call per component").to.have.lengthOf(1);
      expect(seen[0].name).to.equal(tag);
      expect(seen[0].module, "the hook is handed the unwrapped constructor").to.equal(Klass);

      expect(customElements.get(tag), "nothing was defined").to.be.undefined;
      expect(el.hasAttribute("data-upgraded")).to.be.false;
      expect(el.getAttribute("ce"), "the walk stopped at `loaded`").to.equal("loaded");
      expect(reported, "a disabled definition is not a failure").to.be.null;
    });
  });



  describe("preload", () => {
    it("should run the hooks for a preloaded component", async () => {
      const tag = "hook-preloaded";
      const Klass = component();
      const catalog = { [tag]: async () => Klass };

      const seen = { load: [], loaded: [], define: [] };
      registry = new AutoLoader({
        catalog,
        root: fixtures,
        live: false,
        hooks: {
          load: (name, el) => (seen.load.push([name, el]), true),
          loaded: (result) => seen.loaded.push(result),
          define: (result) => (seen.define.push(result), true),
        },
      });

      await registry.preload([tag]);

      expect(seen.load, "`load` ran once").to.have.lengthOf(1);
      expect(seen.load[0][0]).to.equal(tag);
      expect(seen.load[0][1], "a preload has no element behind it").to.be.undefined;

      expect(seen.loaded, "`loaded` ran once").to.have.lengthOf(1);
      expect(seen.loaded[0].el).to.be.undefined;

      expect(seen.define, "`define` ran once").to.have.lengthOf(1);
      expect(seen.define[0].module).to.equal(Klass);

      expect(customElements.get(tag), "preload defined the tag").to.equal(Klass);
    });
  });

  it("should call each hook once per component", async () => {
    const tag = "hook-batch";
    const first = eagerElement(tag);
    const second = eagerElement(tag);
    const { catalog } = spyCatalog(tag);

    const seen = { load: 0, loaded: 0, define: 0 };
    registry = new AutoLoader({
      catalog,
      root: fixtures,
      live: false,
      hooks: {
        load: () => (seen.load++, true),
        loaded: () => (seen.loaded++, undefined),
        define: () => (seen.define++, true),
      },
    });

    expect(await waitFor(() => second.getAttribute("ce") === "defined")).to.be.true;

    // Two elements sharing a tag are two components: two loads, two definitions.
    expect(seen).to.deep.equal({ load: 2, loaded: 2, define: 2 });
    expect(first.hasAttribute("data-upgraded")).to.be.true;
    expect(second.hasAttribute("data-upgraded")).to.be.true;
  });
});
