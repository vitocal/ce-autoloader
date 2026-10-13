import { loadCSSLayer } from "../utils.ts";

const capitalize = (str) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

let catalog = {
  "hero-example": () => import("./hero-example.js"),
  "vi-example": () => import("./vi-example.js"),
  "my-component": async () => {
    return import("./my-component.js");
  },

  /**
   * The reveal panels for the lifecycle demo (index.html → `#lifecycle`).
   *
   * Deliberately slow: `loading` is only visible if the fetch is. `CE_DEMO_DELAY`
   * is set by `pages/index.ts`; the fallback keeps the fetch honest if it isn't.
   */
  "ce-reveal": async () => {
    await new Promise((resolve) => setTimeout(resolve, globalThis.CE_DEMO_DELAY ?? 1200));
    return import("./ce-reveal.js");
  },

  "confetti-button": () => import("./confetti-button.ts"),
  "three-cube": () => import("./three-cube.js"),
  "gl-globe": () => import("./vi/gl-globe.ts"),
  "observable-plot-wrapper": async () => {
    await new Promise((resolve) => {
      import("./observable-plot-wrapper.js");
      setTimeout(resolve, 1250);
    });
  },
  "performance-metrics-plot": () => import("./performance-metrics-plot.js"),
  "web-vitals": () => import("./web-vitals.js"),
  "pix-qrcode": () => import("./pix/qrcode.ts"),

  "react-example": () => import("./vi/react-example.tsx"),

  "react-counter": () => import("./vi/frameworks/react-counter.tsx"),
  "svelte-counter": () => import("./vi/frameworks/svelte-counter.svelte"),
  "vue-counter": async (name) => {
    const { defineCustomElement } = await import("vue");
    const VueCounter = await import("./vi/frameworks/vue-counter.ce.vue");
    return defineCustomElement(VueCounter.default, { shadowRoot: false });
  },

  "vi-error": (name, attrs) => {
    throw new Error(`I've crashed 😭`);
  },
  "vi-notloaded": async (full_name, el) => {
    await new Promise((resolve) => setTimeout(resolve, 900 * 1000));
  },
  "vi-defined": () => import("./vi/vi-defined.js"),

  "playground-ide": "https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm",
  "json-viewer": "https://esm.sh/@alenaksu/json-viewer",
  "wc-markdown": "https://cdn.skypack.dev/@vanillawc/wc-markdown",
  "fireworks-js": () => import("https://esm.sh/@fireworks-js/web"),

  "model-viewer": async () => {
    await import("@google/model-viewer");
  },

  "syntax-highlight": async () => {
    loadCSSLayer("https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/dist/themes/prettylights.min.css", "scoped");
    return import("syntax-highlight-element");
  },

  /**
   * Nord Health design system
   */
  "nord-*": async (full_name) => {
    const [, namespace, name] = full_name.match(/^([a-z]+)-(.*)/);
    const external = (process.env.NODE_ENV === "production" ? ["lit"] : ["lit"]).join(",");

    // loadCSSLayer("https://nordcdn.net/ds/css/5.0.1/nord.min.css", "ds");

    // /* @vite-ignore */ `@nordhealth/components/lib/${capitalize(name)}.js?external=${external}`
    const module = await import(/* @vite-ignore */ `@nordhealth/components/lib/${capitalize(name)}.js`);
    if (!customElements.get(full_name)) {
      customElements.define(full_name, module.default);
    }
    return module;
  },
};

export default catalog;
