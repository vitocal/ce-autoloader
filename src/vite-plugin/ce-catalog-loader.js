export default function CECatalogLoader(catalog) {
  const PREFIX = 'ce:'

  console.log("catalog", catalog)

  return {
    name: 'ce-catalog-loader',

    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),

    resolveId(id, importer) {
      // Only handle ce: imports
      if (!id.startsWith(PREFIX)) return null

      // strip prefix → "anything"
      const inner = id.slice(PREFIX.length)

      // You can return ANY type of resolved id.
      // Option A: return a virtual module id
      return '\0ce:' + inner
    },

    load(id) {
      if (!id.startsWith('\0ce:')) return null

      const name = id.slice('\0ce:'.length)

      // At this point YOU decide the behavior.
      // Examples:
      //  - load a file dynamically
      //  - generate code
      //  - register custom elements
      //  - return metadata
      //  - wrap exports
      //  - etc.

      // For demo: generate a tiny module
      return `
        export const tagName = "${name}";
        export default class extends HTMLElement {
          connectedCallback() {
            this.innerHTML = "Loaded CE: ${name}";
          }
        };
      `
    }
  }
}