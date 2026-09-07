import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  define: {
    global: 'window', // Polyfill for global
  },
  optimizeDeps: {
    include: ['util'],
  },
  resolve: {
    alias: {
      // Use browser-compatible versions of dependencies
      'readable-stream': 'readable-stream/readable-browser.js',
      events: 'events', // Use the events polyfill
      util: 'util', // Use the util polyfill (if installed) or a custom shim
    },
  },
});