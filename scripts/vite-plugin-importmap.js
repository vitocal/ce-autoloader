import path from "node:path";

const VIRTUAL_ID = "virtual:importmap";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

/**
 * Replaces `importmap-vite-plugin`, which can only emit an `imports` object.
 *
 * The docs pages need the whole map: jspm's `integrity` manifest has to reach the
 * browser inside the same `<script type="importmap">` as the imports, or the URLs
 * it lists are fetched unchecked. `pages/utils.ts` serialises whatever this module
 * exports straight into that script.
 *
 * Local (`./`) targets keep the original plugin's behaviour — `?url` in dev, an
 * emitted chunk in a build — so the import map points at the bundled file.
 */
export function importMapPlugin({ map }) {
  const chunkRefs = new Map();

  return {
    name: "importmap",

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    buildStart() {
      if (this.meta.watchMode) return;

      for (const [key, value] of Object.entries(map.imports)) {
        if (value.startsWith("./") || value.startsWith("../")) {
          const ref = this.emitFile({
            type: "chunk",
            id: path.resolve(value),
            preserveSignature: "strict",
          });
          chunkRefs.set(key, ref);
        }
      }
    },

    load(id) {
      if (id !== RESOLVED_ID) return;

      const locals = [];
      const entries = [];

      if (this.meta.watchMode) {
        Object.entries(map.imports).forEach(([key, value], i) => {
          if (value.startsWith("./") || value.startsWith("../")) {
            locals.push(`import local_${i} from ${JSON.stringify(value + "?url")}`);
            entries.push(`${JSON.stringify(key)}: new URL(local_${i}, import.meta.url).href`);
          } else {
            entries.push(`${JSON.stringify(key)}: ${JSON.stringify(value)}`);
          }
        });
      } else {
        for (const [key, value] of Object.entries(map.imports)) {
          const ref = chunkRefs.get(key);
          entries.push(
            ref
              ? `${JSON.stringify(key)}: new URL(import.meta.ROLLUP_FILE_URL_${ref}, import.meta.url).href`
              : `${JSON.stringify(key)}: ${JSON.stringify(value)}`,
          );
        }
      }

      const parts = [`imports: {\n    ${entries.join(",\n    ")}\n  }`];
      if (Object.keys(map.integrity ?? {}).length) parts.push(`integrity: ${JSON.stringify(map.integrity)}`);
      if (Object.keys(map.scopes ?? {}).length) parts.push(`scopes: ${JSON.stringify(map.scopes)}`);

      return `${locals.join("\n")}
export default {
  ${parts.join(",\n  ")}
};
`;
    },
  };
}
