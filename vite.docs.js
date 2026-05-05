import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

import catalog from "./src/components/catalog.js";
// import CECatalogLoader from './src/vite-plugin/ce-catalog-loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    // CECatalogLoader()
  ],
  base: process.env.NODE_ENV === "production" ? "/ce-autoloader/" : "/",
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      treeShaking: true,
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        "syntax-highlight",
        // Externalize these to avoid bundling them in main,
        // they will be provided by vendor.js via import map
        "lit-html",
        "lit-html/is-server.js",
        "lit-element",
        "@lit/reactive-element",
        "lit",
        "lit/static-html.js",
        "lit/decorators.js",
        "lit/directives/ref.js",
        "lit/directives/if-defined.js",
        "lit/directives/unsafe-html.js",
        "lit/directives/style-map.js",
        "lit/directives/class-map.js",
        "lit/directives/repeat.js",

        "globe.gl",
        "three",
        "canvas-confetti",
      ],
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "assets/[name]-[hash].js",
      },
      preserveEntrySignatures: "strict",
    },
    manifest: true,
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
