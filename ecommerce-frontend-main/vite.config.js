import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Dev-only proxy to avoid CORS: browser calls /products on the Vite origin
      // and Vite forwards it to the backend running on :3000.
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Optional future-proofing for when Orders service is running locally
      '/orders': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
