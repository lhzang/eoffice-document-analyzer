import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
// import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss()
    // VitePWA({ registerType: 'autoUpdate' })
  ],
  server: {
    port: 5178,
    allowedHosts: process.env.VITE_ALLOWED_HOSTS?.split(',') || []
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@form-element': fileURLToPath(
        new URL('./src/shared/components/form-elements', import.meta.url)
      )
    }
  },
  optimizeDeps: {
    include: ['xlsx']
  },
  assetsInclude: ['**/*.xlsx']
})
