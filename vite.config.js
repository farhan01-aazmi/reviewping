import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 250,
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          // ⚡ Core vendor: React runtime — loaded on every page
          if (id.includes('node_modules/react')) return 'vendor-react';
          // ⚡ Heavy charting: recharts — only loaded when user visits Analytics
          if (id.includes('node_modules/recharts')) return 'vendor-recharts';
          // ⚡ Database client: supabase — needed for auth on most pages
          if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
          // 📦 Everything else (lucide, d3, etc.)
          if (id.includes('node_modules/')) return 'vendor-other';
        },
      },
    },
  },
})
