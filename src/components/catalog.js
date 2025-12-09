// import { loadCSSLayer } from '../utils.ts'

let catalog = {
    "hero-example": () => import("./hero-example.js"),
    "confetti-button": () => import("./confetti-button.ts"),
    "three-cube": () => import("./three-cube.js"),

    "playground-ide": "https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm",
    "json-viewer": "https://esm.sh/@alenaksu/json-viewer",
    "wc-markdown": "https://cdn.skypack.dev/@vanillawc/wc-markdown",

    // "syntax-highlight": async () => {
    //     loadCSSLayer('https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/dist/themes/prettylights.min.css', 'scoped');
    //     return import("https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/+esm");
    // },

    /**
     * Nord Health design system
     */
    // "nord-*": async (full_name) => {
    //     const [, namespace, name] = full_name.match(/^([a-z]+)-(.*)/);
    //     const external = ((process.env.NODE_ENV === 'production') ? ['lit'] : ['lit']).join(',');
    //     loadCSSLayer('https://nordcdn.net/ds/css/4.2.0/nord.min.css', 'ds');
    //     const module = await import(/* @vite-ignore */ `https://esm.sh/@nordhealth/components/lib/${capitalize(name)}.js?external=${external}`);
    //     if (!customElements.get(full_name)) {
    //         customElements.define(full_name, module.default);
    //     }
    //     return module
    // },
};

export default catalog;
