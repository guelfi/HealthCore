import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/presentation/components',
      '@/pages': '/src/presentation/pages',
      '@/layouts': '/src/presentation/layouts',
      '@/hooks': '/src/presentation/hooks',
      '@/services': '/src/application/services',
      '@/stores': '/src/application/stores',
      '@/use-cases': '/src/application/use-cases',
      '@/api': '/src/infrastructure/api',
      '@/storage': '/src/infrastructure/storage',
      '@/utils': '/src/infrastructure/utils',
      '@/entities': '/src/domain/entities',
      '@/interfaces': '/src/domain/interfaces',
      '@/enums': '/src/domain/enums',
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // React e ReactDOM juntos
          'react-vendor': ['react', 'react-dom'],
          // MUI Material separado do Emotion
          'mui-material': ['@mui/material'],
          // Emotion separado
          'emotion-vendor': ['@emotion/react', '@emotion/styled'],
          // MUI Icons separado
          'mui-icons': ['@mui/icons-material'],
          // MUI DataGrid separado
          'mui-datagrid': ['@mui/x-data-grid'],
          // Outras bibliotecas
          'utils-vendor': ['axios']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild'
  },
  server: {
    port: 5005,
    host: '0.0.0.0', // Permite acesso de qualquer IP da rede
    strictPort: true, // Força o uso da porta especificada
    hmr: {
      port: 5005,
      host: 'localhost', // Força HMR a usar localhost
    },
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app'],
    // Configuração de proxy para redirecionar chamadas /api para a API
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'http://129.153.86.168:5000'  // IP público da OCI em produção
          : 'http://localhost:5000',      // Localhost em desenvolvimento
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Erro no proxy:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxy request:', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Proxy response:', req.url, '→', proxyRes.statusCode);
          });
        },
      },
    },
  },
});
