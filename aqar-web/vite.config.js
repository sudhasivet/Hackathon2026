import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api':  'https://naac-navigator.onrender.com',
      '/form': 'https://naac-navigator.onrender.com',
    },
  },
})
