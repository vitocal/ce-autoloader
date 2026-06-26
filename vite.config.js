import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json", // Enforces compilation via your core rules
    }),
  ],
  resolve: {
    alias: {
      "/assets/vendor.js": resolve(__dirname, "src/vendor.js"),
    },
  },
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
