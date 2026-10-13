import { expect } from "chai";
import AutoLoader from "../src/index.ts";

// Ensure shadow-observer is loaded so the globalThis symbol is set.
// The module sets globalThis[Symbol.for('shadow-observer')] on evaluation.
import "shadow-observer";

describe("Shadow DOM", () => {
  let registry;
  const fixtures = document.getElementById("fixtures");

  beforeEach(() => {
    fixtures.innerHTML = "";
    registry?.clean();
    registry = undefined;
  });

  after(() => {
    registry?.clean();
    registry = undefined;
  });

  /**
   * BLUE — shadow-observer disabled (shadowObserver: false).
   *
   * Native MutationObserver does not reach into shadow roots, so components
   * inside them are never discovered or upgraded. The catalog loader is never
   * called, the tag stays :not(:defined), and data-upgraded is never set.
   */
  describe("BLUE — shadow-observer disabled (native MutationObserver)", () => {
    it("should not upgrade components inside open shadow roots", async () => {
      const host = document.createElement("div");
      fixtures.appendChild(host);
      const shadow = host.attachShadow({ mode: "open" });
      const el = document.createElement("shadow-blue-open");
      el.setAttribute("loading", "eager");
      shadow.appendChild(el);

      registry = new AutoLoader({
        catalog: {
          "shadow-blue-open": async () => {
            class ShadowBlueOpen extends HTMLElement {
              connectedCallback() {
                this.setAttribute("data-upgraded", "true");
              }
            }
            customElements.define("shadow-blue-open", ShadowBlueOpen);
          },
        },
        root: fixtures,
        live: true,
        shadowObserver: false,
      });

      // Wait for the mutation observer to fire — it won't see inside shadow roots.
      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(el.hasAttribute("data-upgraded"), "component inside shadow root should NOT be upgraded").to.be.false;
      expect(el.matches(":not(:defined)"), "component should remain undefined").to.be.true;
    });

    it("should not upgrade components inside closed shadow roots", async () => {
      const host = document.createElement("div");
      fixtures.appendChild(host);
      const shadow = host.attachShadow({ mode: "closed" });
      const el = document.createElement("shadow-blue-closed");
      el.setAttribute("loading", "eager");
      shadow.appendChild(el);

      registry = new AutoLoader({
        catalog: {
          "shadow-blue-closed": async () => {
            class ShadowBlueClosed extends HTMLElement {
              connectedCallback() {
                this.setAttribute("data-upgraded", "true");
              }
            }
            customElements.define("shadow-blue-closed", ShadowBlueClosed);
          },
        },
        root: fixtures,
        live: true,
        shadowObserver: false,
      });

      await new Promise((resolve) => setTimeout(resolve, 400));

      expect(el.hasAttribute("data-upgraded"), "component inside closed shadow root should NOT be upgraded").to.be.false;
    });
  });

  /**
   * GREEN — shadow-observer enabled (default 'auto' detects the loaded module).
   *
   * ShadowObserver reaches into both open and closed shadow roots, so components
   * inside them are discovered and upgraded. The registry must be created BEFORE
   * the shadow root, so the attachShadow patch is in place when the root is created.
   */
  describe("GREEN — shadow-observer enabled (ShadowObserver)", () => {
    it("should upgrade components inside open shadow roots", async () => {
      // Create registry first so the observer is set up before the shadow root.
      registry = new AutoLoader({
        catalog: {
          "shadow-green-open": async () => {
            class ShadowGreenOpen extends HTMLElement {
              connectedCallback() {
                this.setAttribute("data-upgraded", "true");
              }
            }
            customElements.define("shadow-green-open", ShadowGreenOpen);
          },
        },
        root: fixtures,
        live: true,
        // default: shadowObserver: 'auto' → detects shadow-observer
      });

      // Wait for the mutation observer to be set up.
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Now create the shadow fixture — shadow-observer patches attachShadow.
      const host = document.createElement("div");
      fixtures.appendChild(host);
      const shadow = host.attachShadow({ mode: "open" });
      const el = document.createElement("shadow-green-open");
      el.setAttribute("loading", "eager");
      shadow.appendChild(el);

      await customElements.whenDefined("shadow-green-open");
      await new Promise(requestIdleCallback);

      expect(el.hasAttribute("data-upgraded"), "component inside open shadow root should be upgraded").to.be.true;
      expect(el.getAttribute("ce"), "component should be marked as defined").to.equal("defined");
    });

    it("should upgrade components inside closed shadow roots", async () => {
      registry = new AutoLoader({
        catalog: {
          "shadow-green-closed": async () => {
            class ShadowGreenClosed extends HTMLElement {
              connectedCallback() {
                this.setAttribute("data-upgraded", "true");
              }
            }
            customElements.define("shadow-green-closed", ShadowGreenClosed);
          },
        },
        root: fixtures,
        live: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const host = document.createElement("div");
      fixtures.appendChild(host);
      const shadow = host.attachShadow({ mode: "closed" });
      const el = document.createElement("shadow-green-closed");
      el.setAttribute("loading", "eager");
      shadow.appendChild(el);

      await customElements.whenDefined("shadow-green-closed");
      await new Promise(requestIdleCallback);

      expect(el.hasAttribute("data-upgraded"), "component inside closed shadow root should be upgraded").to.be.true;
      expect(el.getAttribute("ce"), "component should be marked as defined").to.equal("defined");
    });

    it("should upgrade nested components inside shadow roots", async () => {
      registry = new AutoLoader({
        catalog: {
          "shadow-green-nested": async () => {
            class ShadowGreenNested extends HTMLElement {
              connectedCallback() {
                this.setAttribute("data-upgraded", "true");
              }
            }
            customElements.define("shadow-green-nested", ShadowGreenNested);
          },
        },
        root: fixtures,
        live: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const host = document.createElement("div");
      fixtures.appendChild(host);
      const shadow = host.attachShadow({ mode: "open" });
      const container = document.createElement("div");
      shadow.appendChild(container);
      const el = document.createElement("shadow-green-nested");
      el.setAttribute("loading", "eager");
      container.appendChild(el);

      await customElements.whenDefined("shadow-green-nested");
      await new Promise(requestIdleCallback);

      expect(el.hasAttribute("data-upgraded"), "nested component inside shadow root should be upgraded").to.be.true;
    });

    it("should respect loading directives inside shadow roots", async () => {
      registry = new AutoLoader({
        catalog: {
          "shadow-green-visible": async () => {
            class ShadowGreenVisible extends HTMLElement {
              connectedCallback() {
                this.setAttribute("data-upgraded", "true");
              }
            }
            customElements.define("shadow-green-visible", ShadowGreenVisible);
          },
        },
        root: fixtures,
        live: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const host = document.createElement("div");
      fixtures.appendChild(host);
      const shadow = host.attachShadow({ mode: "open" });
      const el = document.createElement("shadow-green-visible");
      // No loading attribute → default directive (visible).
      shadow.appendChild(el);

      await customElements.whenDefined("shadow-green-visible");
      await new Promise(requestIdleCallback);

      expect(el.hasAttribute("data-upgraded"), "component with default directive inside shadow root should be upgraded").to.be.true;
    });
  });
});
