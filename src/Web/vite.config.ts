import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5005
  },
  preview: {
    host: '0.0.0.0',
    port: 5005
  },
  build: {
    // Generate hashed filenames for cache busting
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Ensure source maps are generated for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  }
})
