import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        democube: resolve(__dirname, 'demo-cube/index.html'),
        demosphere: resolve(__dirname, 'demo-sphere/index.html'),
        hex-map: resolve(__dirname, 'hex-map/index.html'),
      },
    },
  },
})
