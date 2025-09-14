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
    cors: true,
    proxy: {
      '/api': {
        target: 'http://129.153.86.168:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5005,
    strictPort: true,
    cors: true
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@mui/material', 
      '@mui/icons-material',
      '@mui/material/styles',
      '@mui/material/Button',
      '@mui/material/TextField',
      '@mui/material/Dialog',
      '@mui/material/DialogTitle',
      '@mui/material/DialogContent',
      '@mui/material/DialogActions',
      '@mui/material/Table',
      '@mui/material/TableBody',
      '@mui/material/TableCell',
      '@mui/material/TableContainer',
      '@mui/material/TableHead',
      '@mui/material/TableRow',
      '@mui/material/Paper',
      '@mui/material/Typography',
      '@mui/material/Box',
      '@mui/material/Container',
      '@mui/material/Grid',
      '@mui/material/Card',
      '@mui/material/CardContent'
    ],
    entries: ['src/main.tsx']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  }
})
