import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress', // Prefer Brotli
      ext: '.br',
      threshold: 10240, // Only compress assets > 10KB
    }),
    viteCompression({
      algorithm: 'gzip', // Fallback Gzip
      ext: '.gz',
      threshold: 10240,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-icons', 'lucide-react', 'react-hot-toast'],
          'vendor-utils': ['axios', 'socket.io-client'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
