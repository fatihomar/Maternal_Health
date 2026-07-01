import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Force restart Vite server
export default defineConfig({
  plugins: [react()],
})
