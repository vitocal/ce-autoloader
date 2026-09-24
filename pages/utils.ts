import importMap from 'virtual:importmap'

/**
 * Load a CSS file into a named CSS layer, non-blocking.
 */
export async function loadCSSLayer(
  url: string,
  layerName: string,
  { parent = document.head, position = "beforeend" }: { parent?: Element; position?: InsertPosition } = {},
) {
  if (document.querySelector(`style[data-src="${url}"]`)) {
    return;
  }

  const cssText = await fetch(url).then((r) => r.text());

  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-layer", layerName);
  styleEl.setAttribute("data-src", url);

  styleEl.textContent = `@layer ${layerName} {${cssText}}`;

  parent.insertAdjacentElement(position, styleEl);

  return styleEl;
}

/** Setup import-maps from `importmap-vite-plugin` */
export function setupImportMap() {
  const mapScript = document.createElement('script')
  mapScript.type = 'importmap'
  mapScript.textContent = JSON.stringify(importMap, null, 2)
  document.head.append(mapScript)
}