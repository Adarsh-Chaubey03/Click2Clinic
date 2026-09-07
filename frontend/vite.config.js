
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  define: {
    global: 'window', // Polyfill for global
    'process.env.NODE_ENV': JSON.stringify('development'), // Polyfill process.env
  },
  resolve: {
    alias: {
      // Use browser-compatible versions of dependencies
      'readable-stream': 'readable-stream/readable-browser.js',
      events: 'events', // Use the events polyfill
      util: 'util/', // Use util polyfill (ensure node-util or util is installed)
      process: 'process/browser', // Polyfill process for browser
      buffer: 'buffer/', // Polyfill Buffer for browser
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'util'], // Pre-bundle these dependencies
  },
}); 
