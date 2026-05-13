import path from "path";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync } from "fs";

import { defineConfig } from "vite";
import viteImportMaps from "vite-import-maps";

const BASE = process.env.NODE_ENV === "production" ? "/ce-autoloader/" : "/";

function collectEntries(dir, fileExt = `.ts`) {
  const entries = {};
  readdirSync(dir).forEach((file) => {
    const full = path.resolve(dir, file);
    if (statSync(full).isDirectory()) {
      Object.assign(entries, collectEntries(full, fileExt));
    } else if (file.endsWith(fileExt)) {
      // entry name without extension & without the leading path
      const name = basename(file).replace(/fileExt$/, "");
      entries[name] = full;
    }
  });
  return entries;
}

export default defineConfig({
  plugins: [
    viteImportMaps({
      log: true,
      modulesOutDir: "shared",
      imports: [
        // Externalize these to avoid bundling them in main,
        // they will be provided by vendor.js via import map
        { name: "lit-html", entry: "pages/vendor.js" },
        { name: "lit-html/is-server.js", entry: "pages/vendor.js" },
        { name: "lit-element", entry: "pages/vendor.js" },
        { name: "@lit/reactive-element", entry: "pages/vendor.js" },
        { name: "lit", entry: "pages/vendor.js" },
        { name: "lit/static-html.js", entry: "pages/vendor.js" },
        { name: "lit/decorators.js", entry: "pages/vendor.js" },
        { name: "lit/directives/ref.js", entry: "pages/vendor.js" },
        { name: "lit/directives/if-defined.js", entry: "pages/vendor.js" },
        { name: "lit/directives/unsafe-html.js", entry: "pages/vendor.js" },
        { name: "lit/directives/style-map.js", entry: "pages/vendor.js" },
        { name: "lit/directives/class-map.js", entry: "pages/vendor.js" },
        { name: "lit/directives/repeat.js", entry: "pages/vendor.js" },

        "globe.gl",
        "three.js",
        "canvas-confetti",
        "syntax-highlight-element",
        "@google/model-viewer",
      ],
      // Transform url from relative to absolute
      importMapHtmlTransformer: ({ imports }) => ({
        imports: Object.fromEntries(Object.entries(imports).map(([name, url]) => [name, `${BASE}${url.slice(2)}`])),
      }),
    }),
  ],
  base: BASE,
  appType: "mpa",
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      treeShaking: true,
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "pages"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        // Externalize these to avoid bundling them in main,
        // they will be provided by vendor.js via import map
        // "lit-html",
        // "lit-html/is-server.js",
        // "lit-element",
        // "@lit/reactive-element",
        // "lit",
        // "lit/static-html.js",
        // "lit/decorators.js",
        // "lit/directives/ref.js",
        // "lit/directives/if-defined.js",
        // "lit/directives/unsafe-html.js",
        // "lit/directives/style-map.js",
        // "lit/directives/class-map.js",
        // "lit/directives/repeat.js",
        // "globe.gl",
        // "three.js",
        // "canvas-confetti",
        // "syntax-highlight-element",
        // "@google/model-viewer",
      ],
      input: {
        main: resolve(__dirname, "index.html"),
        ...collectEntries(path.resolve(__dirname, "pages/"), ".html"),
        ...collectEntries(path.resolve(__dirname, "test/"), ".html"),
      },
      preserveEntrySignatures: "strict",
    },
    manifest: false,
    outDir: "docs/",
    emptyOutDir: true,
  },

  server: {
    cors: true,
    host: "0.0.0.0",
    allowedHosts: true,
    debug: true,
  },
});
