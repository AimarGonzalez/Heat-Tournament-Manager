import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    hmr: {
      overlay: false
    },
    open: false,
    port: 5173,
    strictPort: true
  },
})
