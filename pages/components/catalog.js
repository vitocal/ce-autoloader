// import { loadCSSLayer } from '../utils.ts'

const capitalize = (str) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

let catalog = {
  "hero-example": () => import("./hero-example.js"),
  "vi-example": () => import("./vi-example.js"),
  "my-component": async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return import("./my-component.js");
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
  "pix-qrcode": () => import("./pix/qrcode.ts"),

  "react-example": () => import("./vi/react-example.tsx"),
  "react-counter": () => import("./vi/react-counter.tsx"),
  "vue-counter": () => import("./vi/vue-counter.ts"),
  "svelte-counter": () => import("./vi/svelte-counter.ts"),

  "vi-error": (name, attrs) => {
    throw new Error(`An error occurred while loading the component "${name}"`);
  },
  "vi-notloaded": async (full_name, el) => {
    let timeout = Number(el.getAttribute("timeout") || 900 * 1000);
    await new Promise((resolve) => setTimeout(resolve, timeout));
  },
  "vi-defined": () => import("./vi/vi-defined.tsx"),

  "playground-ide": "https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm",
  "json-viewer": "https://esm.sh/@alenaksu/json-viewer",
  "wc-markdown": "https://cdn.skypack.dev/@vanillawc/wc-markdown",
  "fireworks-js": () => import("https://esm.sh/@fireworks-js/web"),

  "model-viewer": async () => {
    await import("@google/model-viewer");
  },

  "syntax-highlight": async () => {
    return import("syntax-highlight-element");
  },

  /**
   * Nord Health design system
   */
  "nord-*": async (full_name) => {
    const [, namespace, name] = full_name.match(/^([a-z]+)-(.*)/);
    const external = (process.env.NODE_ENV === "production" ? ["lit"] : ["lit"]).join(",");
    // loadCSSLayer('https://nordcdn.net/ds/css/4.2.0/nord.min.css', 'ds');

    const module = await import(
      /* @vite-ignore */ `https://esm.sh/@nordhealth/components/lib/${capitalize(name)}.js?external=${external}`
    );
    if (!customElements.get(full_name)) {
      customElements.define(full_name, module.default);
    }
    return module;
  },
};

export default catalog;
