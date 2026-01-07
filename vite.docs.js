import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

import catalog from './src/components/catalog.js'
// import CECatalogLoader from './src/vite-plugin/ce-catalog-loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    // CECatalogLoader()
  ],
  base: (process.env.NODE_ENV === 'production') ? '/ce-autoloader/' : '/',
  optimizeDeps: {
    exclude: [],
    esbuildOptions: {
      treeShaking: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  build: {
    rollupOptions: {
      external: [
        'syntax-highlight',
        // Externalize these to avoid bundling them in main,
        // they will be provided by vendor.js via import map
        'lit', 'lit-element', 'lit-html', '@lit/reactive-element',
        'lit/decorators.js',
        'lit/directives/ref.js',
        'lit/directives/if-defined.js',
        'lit/directives/unsafe-html.js',
        'lit/directives/style-map.js'
      ],
      input: {
        main: resolve(__dirname, 'index.html'),
        single: resolve(__dirname, 'single.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
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
