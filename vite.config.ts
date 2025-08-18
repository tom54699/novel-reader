import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow overriding base via env (e.g., GitHub Pages)
  base: process.env.BASE_URL || '/',
})

