// import { loadCSSLayer } from '../utils.ts'

const capitalize = (str) =>
    str.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');

let catalog = {
    "hero-example": () => import("./hero-example.js"),
    "vi-example": () => import("./vi-example.js"),

    "confetti-button": () => import("./confetti-button.ts"),
    "three-cube": () => import("./three-cube.js"),
    "observable-plot-wrapper": () => import("./observable-plot-wrapper.js"),
    "pix-qrcode": () => import("./pix/qrcode.ts"),

    "react-example": () => import("./vi/react-example.tsx"),

    "playground-ide": "https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm",
    "json-viewer": "https://esm.sh/@alenaksu/json-viewer",
    "wc-markdown": "https://cdn.skypack.dev/@vanillawc/wc-markdown",

    "model-viewer": async () => {
        // await new Promise((resolve) => setTimeout(resolve, 60000 + Math.random() * 1000));
        await import("https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js");
    },

    "syntax-highlight": async () => {
        // loadCSSLayer('https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/dist/themes/prettylights.min.css', 'scoped');
        return import("https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/+esm");
    },

    /**
     * Nord Health design system
     */
    "nord-*": async (full_name) => {
        const [, namespace, name] = full_name.match(/^([a-z]+)-(.*)/);
        const external = ((process.env.NODE_ENV === 'production') ? ['lit'] : ['lit']).join(',');
        // loadCSSLayer('https://nordcdn.net/ds/css/4.2.0/nord.min.css', 'ds');

        const module = await import(/* @vite-ignore */ `https://esm.sh/@nordhealth/components/lib/${capitalize(name)}.js?external=${external}`);
        if (!customElements.get(full_name)) {
            customElements.define(full_name, module.default);
        }
        return module
    },
};

export default catalog;
