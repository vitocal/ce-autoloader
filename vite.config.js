import { dirname, resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ce-autoloader',
      fileName: 'ce-autoloader'
    },
    rollupOptions: {}
  },

  server: {
    cors: true,
    host: '0.0.0.0',
    allowedHosts: true,
    debug: true
  },
})
