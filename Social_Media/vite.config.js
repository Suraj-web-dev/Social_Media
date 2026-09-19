import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'vendor-ui'
            }
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'vendor-redux'
            }
            if (
              id.includes('axios') ||
              id.includes('moment') ||
              id.includes('socket.io-client')
            ) {
              return 'vendor-utils'
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react'
            }
          }
        },
      },
    },
  },
})
