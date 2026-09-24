import path from "path";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync } from "fs";

import { defineConfig } from "vite";

import { importMapPlugin } from "importmap-vite-plugin";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";

const BASE = process.env.NODE_ENV === "production" ? "/ce-autoloader/" : "/";
import importmap from "./importmap.json";

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
  plugins: [vue({ features: { customElement: true } }), svelte({}), importMapPlugin({ imports: importmap })],
  base: BASE,
  appType: "mpa",
  resolve: {
    alias: {
      "@": resolve(__dirname, "pages"),
    },
  },
  optimizeDeps: {
    exclude: ["@nordhealth/components", "lit", "lit-html", "@lit/reactive-element", "lit/static-html.js"],
  },
  build: {
    modulePreload: false,
    rollupOptions: {
      external: Object.keys(importmap),
      input: {
        main: resolve(__dirname, "index.html"),
        ...collectEntries(path.resolve(__dirname, "pages/"), ".html"),
        ...collectEntries(path.resolve(__dirname, "test/"), ".html"),
      },
      output: {
        chunkFileNames: "chunks/[name].js",
      },
    },
    manifest: false,
    outDir: "docs/",
    emptyOutDir: false,
    sourcemap: true,
  },

  server: {
    cors: true,
    host: "0.0.0.0",
    allowedHosts: true,
    debug: true,
  },
});
