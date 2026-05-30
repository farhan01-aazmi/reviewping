import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 250,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) return 'vendor-recharts';
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          if (id.includes('node_modules/@sentry')) return 'vendor-sentry';
          if (id.includes('node_modules/react-helmet-async')) return 'vendor-react';
          if (id.includes('node_modules/sonner')) return 'vendor-ui';
          if (id.includes('node_modules/')) return 'vendor-other';
        },
      },
    },
  },
})
