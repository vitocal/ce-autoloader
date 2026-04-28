import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

// import CECatalogLoader from './src/vite-plugin/ce-catalog-loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    // CECatalogLoader({ catalog: './src/components/catalog.js' })
  ],
  optimizeDeps: {
    esbuildOptions: {
      treeShaking: true,
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/"),
      "/assets/vendor.js": resolve(__dirname, "src/vendor.js"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "CEAutoLoader",
      fileName: (format) =>
        `ce-autoloader.${format === "es" ? "js" : "umd.cjs"}`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      output: {
        // Preserve the catalog and other chunks
        preserveModules: false,
        exports: "named",
      },
    },
    emptyOutDir: false,
  },

  server: {
    cors: true,
    host: "0.0.0.0",
    allowedHosts: true,
    debug: true,
  },
});
