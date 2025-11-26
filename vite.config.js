export default {
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'ce-autoloader',
      fileName: 'ce-autoloader'
    },
  },
  publicDir: "dist",
  server: {
    cors: true
  }
}
