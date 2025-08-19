import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use env BASE_URL when provided, otherwise use relative base to work on GitHub Pages subpaths
  base: process.env.BASE_URL || './',
  build: {
    target: 'es2018',
    sourcemap: false,
    outDir: 'dist',
  },
})
