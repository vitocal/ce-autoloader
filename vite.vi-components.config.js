// Vite configuration for building individual web components in src/components/vi
// Each component will be compiled as a separate chunk.
import { defineConfig } from 'vite';
import path from 'path';

import { readdirSync, statSync } from 'fs';

// Helper – collect every *.ts file under src/components/vi (recursively)
function collectComponentEntries(dir) {
  const entries = {};
  readdirSync(dir).forEach((file) => {
    const full = path.resolve(dir, file);
    if (statSync(full).isDirectory()) {
      Object.assign(entries, collectComponentEntries(full));
    } else if (file.endsWith('.ts')) {
      // entry name without extension & without the leading path
      const name = path
        .relative(path.resolve(__dirname, 'src/components/vi'), full)
        .replace(/\.ts$/, '');
      entries[name] = full;
    }
  });
  return entries;
}

export default defineConfig({
  build: {
    lib: {
      // We'll use a custom rollupOptions to create a chunk per file
      name: 'vi-components',
      formats: ['es'],
      entry: collectComponentEntries(path.resolve(__dirname, 'src/components/vi')),
    },
    rollupOptions: {
      output: {
        // Ensure each component is emitted as its own file
        preserveModules: true,
        // Keep the folder hierarchy under dist/components/vi
        assetFileNames: '[name][extname]',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
    outDir: 'dist/components/vi',
    emptyOutDir: false,
  },
});
