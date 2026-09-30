import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json", // Enforces compilation via your core rules
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: "src/index.ts",
      name: "CEAutoLoader",
      fileName: "ce-autoloader",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["shadow-observer"],
    },
    emptyOutDir: true,
  },
});
