// Vite configuration for building individual web components in src/components/vi
// Each component will be compiled as a separate chunk.
import { defineConfig } from "vite";
import path from "path";
import { readdirSync, statSync } from "fs";

import { hmrPlugin, presets } from "vite-plugin-web-components-hmr";

// Helper – collect every *.ts file under src/components/vi (recursively)
function collectEntries(dir, fileExt = `.ts`) {
  const entries = {};
  readdirSync(dir).forEach((file) => {
    const full = path.resolve(dir, file);
    if (statSync(full).isDirectory()) {
      Object.assign(entries, collectEntries(full, fileExt));
    } else if (file.endsWith(fileExt)) {
      // entry name without extension & without the leading path
      const name = path.relative(path.resolve(__dirname, dir), full).replace(/\.ts$/, "");
      entries[name] = full;
    }
  });
  return entries;
}

export default defineConfig({
  plugins: [
    hmrPlugin({
      include: [
        "pages/components/**/*.ts",
        "pages/components/**/*.js",
        "pages/components/**/*.tsx",
        "pages/components/**/*.jsx",
        "pages/components/*.js",
        "pages/components/*.tsx",
        "pages/components/*.jsx",
      ],
      presets: [presets.lit],
    }),
  ],
  build: {
    lib: {
      // We'll use a custom rollupOptions to create a chunk per file
      name: "vi-components",
      formats: ["es"],
      entry: collectEntries("pages/components/vi"),
    },
    rollupOptions: {
      output: {
        // Ensure each component is emitted as its own file
        preserveModules: true,
        // Keep the folder hierarchy under dist/components/vi
        assetFileNames: "[name][extname]",
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
      },
      external: [
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
        "three.js",
        "canvas-confetti",
        "syntax-highlight-element",
        "@google/model-viewer",
      ],
    },
    outDir: "docs/assets/components/vi",
    emptyOutDir: false,
    manifest: true,
  },
});
