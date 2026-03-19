import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    // ✅ FIX: lower limit so we see warnings earlier
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — always needed, loaded first
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Data fetching
          query: ['@tanstack/react-query'],
          // UI animation + icons — shared across all pages
          ui: ['framer-motion', 'lucide-react'],
          // Charts — only used on analytics/dashboard
          chart: ['recharts'],
          // Markdown renderer — only used in ChatPage
          // highlight.js now uses core-only so this chunk is ~70KB not 981KB
          md: ['marked'],
        },
      },
    },
  },
});
