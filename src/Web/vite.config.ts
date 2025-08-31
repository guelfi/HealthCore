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
  server: {
    port: 5005,
    host: '0.0.0.0', // Permite acesso de qualquer IP da rede
    strictPort: true, // Força o uso da porta especificada
    hmr: {
      port: 5005,
      host: 'localhost', // Força HMR a usar localhost
    },
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.ngrok.app'],
  },
});
