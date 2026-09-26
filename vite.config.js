import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import vue from "@vitejs/plugin-vue";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import viteImportMaps from "vite-import-maps";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json", // Enforces compilation via your core rules
    }),
  ],
  appType: "mpa",
  build: {
    copyPublicDir: false,
    lib: {
      entry: "src/index.ts",
      name: "CEAutoLoader",
      fileName: "ce-autoloader",
      formats: ["es"],
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
