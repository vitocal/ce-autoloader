import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/vendor.js'),
            name: 'vendor',
            fileName: () => 'vendor.js',
            formats: ['es']
        },
        outDir: 'docs/assets',
        emptyOutDir: false,
        rollupOptions: {
            // Ensure Lit is bundled (not external)
            external: [],
        }
    }
})
