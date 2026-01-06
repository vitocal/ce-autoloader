import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

import catalog from './src/components/catalog.js'
import CECatalogLoader from './src/vite-plugin/ce-catalog-loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    CECatalogLoader()
  ],
  base: (process.env.NODE_ENV === 'production') ? '/ce-autoloader/' : '/',
  optimizeDeps: {
    include: ['@nordhealth/components/lib/*.js'],
    exclude: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
    esbuildOptions: {
      treeShaking: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '/assets/vendor.js': resolve(__dirname, 'src/vendor.js'),
      'three-cube': resolve(__dirname, 'src/components/three-cube.js'),
      'model-viewer': 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js',
      'syntax-highlight': 'https://cdn.jsdelivr.net/npm/syntax-highlight-element@1/+esm',
      '@nord-ui/button': 'https://esm.sh/@nordhealth/components/lib/Button.js?external=lit',
      '@nord-ui/icon': 'https://esm.sh/@nordhealth/components/lib/Icon.js?external=lit',
      '@nord-ui/select': 'https://esm.sh/@nordhealth/components/lib/Select.js?external=lit',
    }
  },
  build: {
    rollupOptions: {
      external: [
        'lit', 'lit-html', 'lit-element', '@lit/reactive-element',
        'syntax-highlight'
      ],
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
