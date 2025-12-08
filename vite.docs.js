import { dirname, resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: (process.env.NODE_ENV === 'production') ? '/ce-autoloader/' : '/',
  optimizeDeps: {
    include: ['@nordhealth/components/lib/*.js'],
    exclude: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
    esbuildOptions: {
      treeShaking: true
    }
  },
  build: {
    rollupOptions: {

      // external: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
      input: {
        main: resolve(__dirname, 'index.html'),
        single: resolve(__dirname, 'single.html'),
        // The External dependencies bundled together
        vendor: resolve(__dirname, 'src/vendor.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'vendor') {
            return 'assets/[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
      preserveEntrySignatures: 'strict',
    },
    manifest: true,
    outDir: 'docs/',
    emptyOutDir: true,
  },

  server: {
    cors: true,
    host: '0.0.0.0',
    allowedHosts: true,
    debug: true
  },

})
