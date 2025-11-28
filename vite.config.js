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
    cors: true,
    host: '0.0.0.0',
    allowedHosts: true,
    debug: true
  },
}
