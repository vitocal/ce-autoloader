import { expect } from "chai";
import AutoLoader from "../src/index.ts";

/**
 * With `transition: true` the loader swaps the global `customElements.define`
 * for a queue (`polyfill_defer_define`), so definitions can be batched inside a
 * view transition. These tests cover that queue: what it must defer and — just
 * as important — what it must *not* touch.
 *
 * Element-scoped view transitions are Chromium-only and `SUPPORTS_SCOPED_VT`
 * (src/index.ts) is read once, when the module is evaluated. On browsers
 * without native support we install a minimal stand-in so the `transition: true`
 * path is still exercised; on Chromium this is a no-op.
 */
const SUPPORTS_SCOPED_VT = "startViewTransition" in Element.prototype;

function ensureScopedViewTransitions() {
  if (SUPPORTS_SCOPED_VT) return;

  Element.prototype.startViewTransition = function (options) {
    const update = typeof options === "function" ? options : options?.update;
    const updateCallbackDone = Promise.resolve().then(() => update?.());
    const ready = updateCallbackDone.then(() => undefined);
    const finished = ready.then(() => undefined);

    return { types: new Set(options?.types || []), updateCallbackDone, ready, finished, skipTransition() {} };
  };
}

/** Every scoped transition started while this suite runs, with its outcome. */
let scoped_transitions = [];

/**
 * Wrap `Element.startViewTransition` to record what the loader starts and how
 * each transition ends (`ready` rejects when the browser skips a transition).
 */
function instrumentScopedViewTransitions() {
  const native = Element.prototype.startViewTransition;

  Element.prototype.startViewTransition = function (options) {
    const transition = native.call(this, options);
    const record = {
      parent: this,
      types: [...(options?.types || [])],
      transition: transition,
      ready: "pending",
      finished: "pending",
    };

    transition.ready.then(
      () => (record.ready = "resolved"),
      (error) => (record.ready = `rejected: ${error.name}`),
    );
    transition.finished.then(
      () => (record.finished = "resolved"),
      (error) => (record.finished = `rejected: ${error.name}`),
    );

    scoped_transitions.push(record);

    return transition;
  };
}

/**
 * The pristine `define`, captured before any registry is created, so the queue
 * can be torn down between tests (it is installed globally, not per instance).
 */
const NATIVE_DEFINE = customElements.define.bind(customElements);

/** Remove the global define patches so each test installs a fresh queue. */
function resetCustomElements() {
  customElements.define = NATIVE_DEFINE;
  delete customElements.queue;
  delete customElements.dequeue;
  delete customElements.flush;
}

/** Poll until `check()` passes, so the suite never hangs on a missing signal. */
async function waitFor(check, timeout = 2000) {
  const started = performance.now();

  while (!check()) {
    if (performance.now() - started > timeout) return false;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return true;
}

describe("Transition", () => {
  let registry;
  const fixtures = document.getElementById("fixtures");

  /**
   * A loader that defines `tag` and marks the element as upgraded.
   *
   * Custom elements can never be un-defined, so every test owns its own tag:
   * once a tag is registered, appending another element of it upgrades
   * synchronously and never touches the loader (nor its transition).
   */
  function loaderFor(tag) {
    return async () => {
      class Component extends HTMLElement {
        connectedCallback() {
          this.setAttribute("data-upgraded", "true");
        }
      }
      customElements.define(tag, Component);
    };
  }

  /** A catalog holding exactly `tags`, each one resolved by its own loader. */
  function catalogWith(...tags) {
    return Object.fromEntries(tags.map((tag) => [tag, loaderFor(tag)]));
  }

  function ctorLoader() {
    return async () => {
      return class Component extends HTMLElement {
        connectedCallback() {
          this.setAttribute("data-upgraded", "true");
        }
      };
    };
  }

  /** Wildcard resolver: every `nord-*` tag is served by a single loader. */
  const wildcard_catalog = {
    "nord-*": async (full_name) => {
      class NordComponent extends HTMLElement {}
      customElements.define(full_name, NordComponent);
    },
  };

  /**
   * A registry with the deferred define queue installed, which is the wiring the
   * constructor performs when `transition: true` and element-scoped view
   * transitions are available.
   *
   * `deferDefine` is only forwarded when a test asks for it, so the *default*
   * path stays the one under test elsewhere.
   */
  function transitionsRegistry({ catalog = {}, deferDefine, ...options } = {}) {
    const loader = new AutoLoader({
      catalog,
      root: fixtures,
      // Discovery is async while `live` is on, so disable it and drive the
      // upgrades explicitly from each test.
      live: false,
      transition: true,
      ...(deferDefine === undefined ? {} : { deferDefine }),
      ...options,
    });

    // Without element-scoped view transitions the constructor falls back to the
    // plain define, so install the same queue it would otherwise install.
    if (!SUPPORTS_SCOPED_VT && deferDefine !== false) {
      loader.options.transition = true;
      loader.polyfill_defer_define();
    }

    return loader;
  }

  before(() => {
    ensureScopedViewTransitions();
    // Records every transition the loader starts (installed here so the
    // suites that run before this one are not instrumented).
    instrumentScopedViewTransitions();
  });

  beforeEach(() => {
    fixtures.innerHTML = "";
    scoped_transitions = [];

    registry?.clean();
    registry = undefined;

    resetCustomElements();
  });

  afterEach(async () => {
    registry?.clean();
    registry = undefined;

    // Let in-flight load/define chains settle before their queue functions are
    // removed, otherwise `customElements.flush()` can be missing mid-flight.
    await new Promise(requestIdleCallback);

    resetCustomElements();
  });

  describe("catalog components are deferred and batched", () => {
    it("upgrades a catalog component through the deferred queue", async () => {
      const el = document.createElement("transition-base");
      el.setAttribute("loading", "eager");
      fixtures.appendChild(el);

      registry = transitionsRegistry({ catalog: catalogWith("transition-base") });

      await customElements.whenDefined("transition-base");

      expect(el.hasAttribute("data-upgraded")).to.be.true;
      expect(el.getAttribute("ce")).to.equal("defined");

      // Deferred definitions are only batched in transition mode, so a
      // scoped transition on the fixture is proof the queue did the work.
      expect(scoped_transitions.length).to.be.at.least(1);
    });

    it("runs the upgrade inside a scoped view transition", async () => {
      const el = document.createElement("transition-card-comp");
      el.setAttribute("loading", "eager");
      el.setAttribute("view-transition-name", "transition-card");
      el.setAttribute("view-transition-class", "fade-up");
      fixtures.appendChild(el);

      let ready_hook = null;
      let finished_hook = null;

      registry = transitionsRegistry({
        catalog: catalogWith("transition-card-comp"),
        hooks: {
          viewTransition: {
            ready: (transition) => {
              ready_hook = transition;
              return Promise.resolve();
            },
            finished: (transition) => {
              finished_hook = transition;
              return Promise.resolve();
            },
          },
        },
      });

      await customElements.whenDefined("transition-card-comp");

      expect(el.hasAttribute("data-upgraded")).to.be.true;

      // The loader wraps the definition in `Element.startViewTransition()`,
      // tagged with the `ce` transition type.
      const started = scoped_transitions.find((record) => record.parent === fixtures);
      expect(started, "a scoped view transition should be started").to.exist;
      expect(started.types).to.include("ce");

      // The transition styles are live while the upgrade runs...
      expect(el.style.viewTransitionName).to.equal("transition-card");
      expect(el.style.viewTransitionClass).to.equal("fade-up");

      // ...and are cleaned up once the transition finishes.
      const did_finish = await waitFor(() => started.finished !== "pending");
      expect(did_finish, `the scoped transition should settle (got ${started.finished})`).to.be.true;
      expect(finished_hook, "viewTransition.finished hook should run").to.exist;

      expect(el.style.viewTransitionName).to.equal("");
      expect(el.style.viewTransitionClass).to.equal("");

      const did_ready = await waitFor(() => ready_hook !== null);
      expect(did_ready, `viewTransition.ready hook should run (ready: ${started.ready})`).to.be.true;
    });

    it("defers catalog components until dequeue() or flush()", () => {
      registry = transitionsRegistry({ catalog: catalogWith("transition-batched") });

      class BatchedComponent extends HTMLElement {}
      customElements.define("transition-batched", BatchedComponent);

      expect(customElements.queue["transition-batched"].ctor).to.equal(BatchedComponent);
      expect(customElements.get("transition-batched")).to.be.undefined;

      customElements.flush();

      expect(customElements.get("transition-batched")).to.equal(BatchedComponent);
    });

    it("defers wildcard catalog names (nord-*)", () => {
      registry = transitionsRegistry({ catalog: wildcard_catalog });

      class NordButton extends HTMLElement {}
      customElements.define("nord-button", NordButton);

      expect(customElements.queue["nord-button"].ctor).to.equal(NordButton);
      expect(customElements.get("nord-button")).to.be.undefined;
    });

    it("keeps deferring names from a catalog installed later", () => {
      // The queue is global, so a registry installed after the one that owns
      // the queue must still be able to batch its own catalog.
      const first = transitionsRegistry({ catalog: catalogWith("transition-first") });
      registry = transitionsRegistry({ catalog: catalogWith("transition-second") });

      class SecondComponent extends HTMLElement {}
      customElements.define("transition-second", SecondComponent);

      expect(customElements.queue["transition-second"].ctor).to.equal(SecondComponent);
      expect(customElements.get("transition-second")).to.be.undefined;

      // No observers to disconnect (`live: false`); the suite-level reset
      // between tests drops both registries from the queue.
      first.clean();
    });
  });

  /**
   * BLUE — the guarantee that must survive `deferDefine`: a catalog component
   * morphs even when its own module registers the tag (`customElements.define`
   * at import time), which is how most real catalogs are written.
   */
  describe("self-registering catalog components morph (default)", () => {
    it("morphs a component whose loader defines the tag itself", async () => {
      const el = document.createElement("transition-self");
      el.setAttribute("loading", "eager");
      el.setAttribute("view-transition-name", "transition-self-card");
      fixtures.appendChild(el);

      // No `deferDefine` option: the default must keep the morph.
      registry = transitionsRegistry({ catalog: catalogWith("transition-self") });

      await customElements.whenDefined("transition-self");

      expect(el.hasAttribute("data-upgraded")).to.be.true;
      expect(el.getAttribute("ce")).to.equal("defined");

      // The module defined the tag itself, yet the definition still happened
      // inside the transition (that is what the defer queue is for).
      const started = scoped_transitions.find((record) => record.parent === fixtures);
      expect(started, "a self-defined component should morph by default").to.exist;
      expect(started.types).to.include("ce");
    });
  });

  /**
   * GREEN — the bug this change fixes. While the deferred queue is installed,
   * a component that is *not* in the catalog (a third-party script, or a module
   * that registers extra tags) was pushed into the queue and never drained:
   * the element never upgraded, `customElements.get()` stayed `undefined` and
   * `customElements.whenDefined()` never settled.
   */
  describe("non-catalog components are defined right away", () => {
    it("defines non-catalog components immediately instead of queueing them", () => {
      registry = transitionsRegistry();

      class ThirdPartyGreeting extends HTMLElement {}
      customElements.define("third-party-greeting", ThirdPartyGreeting);

      expect(customElements.get("third-party-greeting")).to.equal(ThirdPartyGreeting);
      expect(customElements.queue["third-party-greeting"]).to.be.undefined;
    });

    it("renders (upgrades) a non-catalog component added to the page", async () => {
      registry = transitionsRegistry();

      const el = document.createElement("third-party-badge");
      el.textContent = "static fallback";
      fixtures.appendChild(el);

      class ThirdPartyBadge extends HTMLElement {
        connectedCallback() {
          this.setAttribute("data-upgraded", "true");
        }
      }
      customElements.define("third-party-badge", ThirdPartyBadge);

      await customElements.whenDefined("third-party-badge");

      expect(el.hasAttribute("data-upgraded")).to.be.true;
      // The element is upgraded in place, its light DOM untouched.
      expect(el.textContent).to.equal("static fallback");
    });

    it("does not hold third-party definitions behind a pending catalog one", () => {
      registry = transitionsRegistry({ catalog: catalogWith("transition-pending") });

      // A catalog component is queued while a third-party script registers itself.
      class CatalogComponent extends HTMLElement {}
      customElements.define("transition-pending", CatalogComponent);

      class ThirdPartyWidget extends HTMLElement {}
      customElements.define("third-party-widget", ThirdPartyWidget);

      expect(customElements.queue["transition-pending"].ctor).to.equal(CatalogComponent);
      expect(customElements.get("third-party-widget")).to.equal(ThirdPartyWidget);

      customElements.flush();

      expect(customElements.get("transition-pending")).to.equal(CatalogComponent);
    });
  });

  /**
   * GREEN — `deferDefine: false` must never patch `customElements.define`. A
   * self-registering component then upgrades without a morph (only loaders that
   * *return* a constructor can morph), and third-party code is never
   * intercepted by ce-autoloader at all.
   */
  describe("deferDefine: false — no global patch", () => {
    it("leaves customElements.define untouched", () => {
      registry = transitionsRegistry({ deferDefine: false, catalog: catalogWith("transition-unpatched") });

      expect(customElements.define).to.equal(NATIVE_DEFINE);
      expect(customElements.queue).to.be.undefined;
      expect(customElements.dequeue).to.be.undefined;
    });

    it("upgrades a self-registering catalog component without a transition", async () => {
      const el = document.createElement("transition-self-nopatch");
      el.setAttribute("loading", "eager");
      fixtures.appendChild(el);

      registry = transitionsRegistry({ deferDefine: false, catalog: catalogWith("transition-self-nopatch") });

      await customElements.whenDefined("transition-self-nopatch");
      // Without the defer queue the element upgrades inside the loader, so the
      // registry only marks `ce="defined"` once its own define step runs.
      await new Promise(requestIdleCallback);

      expect(el.hasAttribute("data-upgraded")).to.be.true;
      expect(el.getAttribute("ce")).to.equal("defined");

      // Nothing left to define ⇒ no transition should be started for it.
      expect(scoped_transitions).to.have.lengthOf(0);
    });

    it("morphs a component whose loader returns a constructor", async () => {
      const el = document.createElement("transition-ctor");
      el.setAttribute("loading", "eager");
      el.setAttribute("view-transition-name", "ctor-card");
      fixtures.appendChild(el);

      registry = transitionsRegistry({
        deferDefine: false,
        catalog: { "transition-ctor": ctorLoader() },
      });

      await customElements.whenDefined("transition-ctor");

      expect(el.hasAttribute("data-upgraded")).to.be.true;
      expect(el.getAttribute("ce")).to.equal("defined");

      // The registry defines it, so the definition can happen inside a transition.
      const started = scoped_transitions.find((record) => record.parent === fixtures);
      expect(started, "the definition should happen inside a transition").to.exist;
      expect(started.types).to.include("ce");
    });

    it("defines non-catalog components right away", () => {
      registry = transitionsRegistry({ deferDefine: false });

      class UntouchedThirdParty extends HTMLElement {}
      customElements.define("untouched-third-party", UntouchedThirdParty);

      expect(customElements.get("untouched-third-party")).to.equal(UntouchedThirdParty);
    });

    it("reports a loader that neither defines nor returns a constructor", async () => {
      const el = document.createElement("transition-empty");
      el.setAttribute("loading", "eager");
      fixtures.appendChild(el);

      registry = transitionsRegistry({
        deferDefine: false,
        catalog: { "transition-empty": async () => {} },
      });

      await new Promise(requestIdleCallback);

      // The failure is raised inside the view transition's update callback, so it
      // can land a frame later than the idle callback.
      const did_error = await waitFor(() => el.getAttribute("ce") === "error");
      expect(did_error, `the element should report the failure (ce=${el.getAttribute("ce")})`).to.be.true;
      expect(el.getAttribute("error"), "the failure should be reported on the element").to.not.be.empty;
    });
  });
});
