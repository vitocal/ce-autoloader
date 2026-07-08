import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import viteImportMaps from "vite-import-maps";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.NODE_ENV === "production" ? "/ce-autoloader/" : "/";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json", // Enforces compilation via your core rules
    }),
    vue({ features: { customElement: true } }),
    svelte({}),
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
        imports: Object.fromEntries(Object.entries(imports).map(([name, url]) => [name, `${BASE}${url.slice(1)}`])),
      }),
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "pages"),
    },
  },
  appType: "mpa",
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CEAutoLoader",
      fileName: "ce-autoloader",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      output: {
        // Preserve the catalog and other chunks
        // preserveModules: false,
        // exports: "named",
      },
    },
    emptyOutDir: true,
  },

  // server: {
  //   cors: true,
  //   host: "0.0.0.0",
  //   allowedHosts: true,
  //   debug: true,
  // },
});
