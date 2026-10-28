import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // React + Bootstrap + Leaflet superan el aviso por defecto de 500 kB; es normal para esta app
    chunkSizeWarningLimit: 800,
  },
})
