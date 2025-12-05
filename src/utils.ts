/**
 * Load a CSS file into a named CSS layer, non-blocking.
 */
export async function loadCSSLayer(url: string, layerName: string, {
    parent = document.head,
    position = 'beforeend'
}: { parent?: Element; position?: InsertPosition } = {}) {
    const cssText = await fetch(url).then(r => r.text());

    const styleEl = document.createElement('style');
    styleEl.setAttribute('data-layer', layerName);

    styleEl.textContent = `@layer ${layerName} {${cssText}}`;

    parent.insertAdjacentElement(position, styleEl);

    return styleEl;
}