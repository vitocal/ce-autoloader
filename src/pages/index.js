import ErrorFallback from '/src/components/error-fallback.js';
import "/src/components/hero-example.js";
import "lit";

import CERegistry from '/src/index.js';

const capitalize = (str) =>
    str.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join('');

const catalog = {

    "syntax-highlight": "https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/+esm",
    "playground-ide": "https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm",
    "json-viewer": "https://esm.sh/@alenaksu/json-viewer",
    "wc-markdown": "https://cdn.skypack.dev/@vanillawc/wc-markdown",

    "confetti-button": () => import("/src/components/confetti-button.ts"),
    "three-cube": () => import("/src/components/three-cube.js"),

    /**
     * Nord Health design system
     */
    "nord-*": async (full_name) => {
        const [, namespace, name] = full_name.match(/^([a-z]+)-(.*)/);
        const module = await import(/* @vite-ignore */ `https://esm.sh/@nordhealth/components/lib/${capitalize(name)}.js?external=lit`);
        if (!customElements.get(full_name)) {
            customElements.define(full_name, module.default);
        }
        return module
    },
};

class MyCustomRegistry extends CERegistry {

    async beforeLoad({ name, el, asset }, next) {
        performance.mark(`load:${name}:start`);

        // add loading/transition-class to all components
        el.setAttribute('ce-loading', 'true');

        await next({ name, el, asset });
    }

    async afterLoad({ name, el, asset }, next) {
        performance.mark(`load:${name}:end`);
        performance.measure(`load:${name}`, `load:${name}:start`, `load:${name}:end`);

        performance.mark(`define:${name}:start`);

        el.removeAttribute('ce-loading');
        el.setAttribute('ce-defined', "");

        if (el.getAttribute('view-transition')) {
            el.style.viewTransitionName = 'match-element';
            el.style.viewTransitionClass = el.tagName.toLowerCase();
        }

        this.batches.push(async () => {
            return await next({ name, asset });
        });
    }

}

globalThis.registry = new MyCustomRegistry({
    catalog,
    root: document.body,
    live: true,
    fallback: ErrorFallback,
    defaultDirective: 'visible',
});
console.log('Discovered on first run:', await registry.discover());


async function metrics() {
    await Promise.allSettled(
        Object.keys(catalog).map(async (name) => {
            await customElements.whenDefined(name)
            await new Promise(requestAnimationFrame)

            const loaded = performance.getEntriesByName(`load:${name}`);
            const duration = loaded[0].duration;

            console.log(`${name} loaded in ${duration.toFixed(2)}ms`);
        })
    );
}


import { loadCSSLayer } from '../utils.ts'

loadCSSLayer('shared.css', 'ds');
loadCSSLayer('https://nordcdn.net/ds/css/4.2.0/nord.min.css', 'ds');

