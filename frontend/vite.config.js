import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const productsProxyTarget = process.env.VITE_PRODUCTS_PROXY_TARGET || 'http://localhost:3001'
const ordersProxyTarget = process.env.VITE_ORDERS_PROXY_TARGET || 'http://localhost:3002'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/products': {
        target: productsProxyTarget,
        changeOrigin: true,
      },
      '/orders': {
        target: ordersProxyTarget,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
