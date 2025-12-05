import { dirname, resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  optimizeDeps: {
    include: ['@nordhealth/components/lib/*.js'],
    exclude: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
    esbuildOptions: {
      treeShaking: true
    }
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ce-autoloader',
      fileName: 'ce-autoloader'
    },
    rollupOptions: {
      external: ['lit', 'lit-html', 'lit-element', '@lit/reactive-element'],
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
