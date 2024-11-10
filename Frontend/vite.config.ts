import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend server URL
        changeOrigin: true,

      },
      '/socket.io': {
        target: 'http://localhost:3000', // Proxy for WebSocket connections
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
