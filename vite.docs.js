import path from "path";
import { dirname, resolve, basename } from "node:path";
import { readdirSync, statSync } from "fs";

import { defineConfig } from "vite";

import { importMapPlugin } from "./scripts/vite-plugin-importmap.js";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preact from "@preact/preset-vite";
import stencil from "@stencil-community/unplugin-stencil/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const BASE = process.env.NODE_ENV === "production" ? "/ce-autoloader/" : "/";
import importmap from "./importmap.json" with { type: "json" };

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
    vue({
      template: {
        compilerOptions: {
          // Example: Treat all tags with a dash as custom elements.
          isCustomElement: (tag) => tag.includes("-"),
        },
      },
    }),
    svelte({ compilerOptions: { customElement: true } }),
    preact(),
    importMapPlugin({ map: importmap }),
    viteStaticCopy({
      targets: [{ src: "pages/**/*.md", dest: "." }],
    }),
  ],
  base: BASE,
  appType: "mpa",
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "pages"),
    },
  },
  optimizeDeps: {
    exclude: [
      "@nordhealth/components",
      "lit",
      "lit-html",
      "@lit/reactive-element",
      "lit/static-html.js",
      "shadow-observer",
      "web-vitals",
    ],
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      external: Object.keys(importmap.imports),
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        ...collectEntries(path.resolve(import.meta.dirname, "pages/"), ".html"),
        ...collectEntries(path.resolve(import.meta.dirname, "test/"), ".html"),
      },
      output: {
        chunkFileNames: "chunks/[name].js",
      },
    },
    manifest: false,
    outDir: "docs/",
    emptyOutDir: true,
    sourcemap: true,
  },

  server: {
    cors: true,
    host: "0.0.0.0",
    allowedHosts: true,
    debug: true,
  },
});
