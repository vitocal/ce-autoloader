import path from "path";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, statSync } from "fs";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  plugins: [],
  base: process.env.NODE_ENV === "production" ? "/ce-autoloader/" : "/",
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
        ...collectEntries(path.resolve(__dirname, "pages/"), ".html"),
        ...collectEntries(path.resolve(__dirname, "test/"), ".html"),
      },
      output: {
        // entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: `[name].[ext]`,
        itemNames: (chunkInfo) => `[name].[ext]`,
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
