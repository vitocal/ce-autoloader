import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'

import CECatalogLoader from './src/vite-plugin/ce-catalog-loader.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    CECatalogLoader({ catalog: './src/components/catalog.js' })
  ],
  optimizeDeps: {
    include: ['@nordhealth/components/lib/*.js'],
    exclude: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
    esbuildOptions: {
      treeShaking: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/'),
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
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CEAutoLoader',
      fileName: (format) => `ce-autoloader.${format === 'es' ? 'js' : 'umd.cjs'}`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      output: {
        // Preserve the catalog and other chunks
        preserveModules: false,
      }
    },
    emptyOutDir: false,
  },

  server: {
    cors: true,
    host: '0.0.0.0',
    allowedHosts: true,
    debug: true
  },
})
