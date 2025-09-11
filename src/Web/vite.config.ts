import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5005,
    strictPort: true,
    hmr: {
      port: 5005
    },
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5005,
    strictPort: true,
    cors: true
  },
  optimizeDeps: {
    force: true,
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@mui/icons-material']
  },
  build: {
    // Generate hashed filenames for cache busting with timestamp
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    },
    // Ensure source maps are generated for debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Force cache invalidation
    assetsInlineLimit: 0
  }
})
