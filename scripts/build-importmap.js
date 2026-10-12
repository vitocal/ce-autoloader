#!/usr/bin/env node
/**
 * Regenerates `importmap.json` from `importmap.src.json`.
 *
 * `importmap.src.json` holds the pinned CDN URLs the docs pages resolve their bare
 * specifiers through (`vite.docs.js` → `rollupOptions.external` → the page's
 * `<script type="importmap">`). Versions are pinned by hand on purpose: jspm's own
 * `esm.sh` provider cannot parse esm.sh's bundles (lit, lit-element and
 * @lit/reactive-element all throw "no exports subpath defined"), and its `jsdelivr`
 * provider drops `&standalone` and traces ~88 kB of integrity out of `globe.gl`
 * alone. So jspm only fills in the `integrity` manifest here.
 *
 * esm.sh emits `^`-range imports inside its shims; jspm cannot analyze those
 * (`https://esm.sh/three@%5E0.183.0?target=es2022`), which would abort the hash for
 * `@google/model-viewer` and `lit-element`. The source pins those transitive deps
 * with esm.sh's own `&deps=` flag so the traversal completes.
 *
 * Prefix mappings (`@nordhealth/components/`, `lit/`, `lit-html/`) and the two local
 * files are skipped: a prefix cannot be enumerated, and local files are bundled by
 * Vite rather than fetched from a CDN. Those URLs are simply not SRI-checked.
 *
 * Run with `npm run importmap`.
 */
import { readFile, writeFile } from "node:fs/promises";

import { Generator } from "@jspm/generator";

const SRC = new URL("../importmap.src.json", import.meta.url);
const OUT = new URL("../importmap.json", import.meta.url);

const imports = JSON.parse(await readFile(SRC, "utf8"));

const generator = new Generator({
  integrity: true,
  env: ["browser", "module", "production"],
});

const skipped = [];
const failed = [];

for (const [name, url] of Object.entries(imports)) {
  if (!/^https?:\/\//.test(url)) {
    skipped.push(`${name} (local)`);
    continue;
  }
  if (url.endsWith("/")) {
    skipped.push(`${name} (prefix)`);
    continue;
  }

  try {
    await generator.link(url);
  } catch (error) {
    failed.push(`${name} → ${error.message}`);
  }
}

if (failed.length) {
  console.error("Could not resolve:\n  " + failed.join("\n  "));
  process.exit(1);
}

const { integrity = {} } = generator.getMap();

// Stable order, so the file only changes when a URL's bytes change.
const sorted = Object.fromEntries(
  Object.entries(integrity).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
);

await writeFile(OUT, JSON.stringify({ imports, integrity: sorted }, null, 2) + "\n");

console.log(
  `importmap.json: ${Object.keys(imports).length} imports, ${Object.keys(sorted).length} integrity entries`,
);
if (skipped.length) console.log(`not SRI-checked: ${skipped.join(", ")}`);
