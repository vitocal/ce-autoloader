/** We import it before the registry, so it's
 * loaded before the first discover.
 */
import ErrorFallback from '/src/components/error-fallback.js';

import CERegistry from '/src/index.js';
import catalog from '/src/components/catalog.js';

globalThis.catalog = catalog;

globalThis.registry = new CERegistry({
    catalog: globalThis.catalog,
    root: document.body,
    live: false,
    // fallback: ErrorFallback,
    defaultDirective: 'visible',
    transition: true,
});
console.log('Discovered on first run:', await registry.discover());


// async function metrics() {
//     await Promise.allSettled(
//         Object.keys(catalog).map(async (name) => {
//             await customElements.whenDefined(name)
//             await new Promise(requestAnimationFrame)

//             const loaded = performance.getEntriesByName(`load:${name}`);
//             const duration = loaded[0].duration;

//             console.log(`${name} loaded in ${duration.toFixed(2)}ms`);
//         })
//     );
// }