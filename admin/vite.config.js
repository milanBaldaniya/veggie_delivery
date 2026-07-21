import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The admin app calls the existing backend through a dev proxy, so requests go
// to `/api/*` (same-origin) and Vite forwards them to the Express server on
// 5001 — no CORS juggling, and prod can point the proxy at the real host.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
