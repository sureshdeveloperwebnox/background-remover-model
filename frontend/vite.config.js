import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/remove-image': {
        target: 'http://backend:8000',
        changeOrigin: true
      },
      '/remove-video': {
        target: 'http://backend:8000',
        changeOrigin: true
      }
    }
  }
})

