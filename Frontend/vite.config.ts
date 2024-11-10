import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://qa-ai-ul8n.onrender.com',
        changeOrigin: true,
        secure: false, // Add this if you have SSL certificate issues
        // No need for a rewrite, so we remove it
      },
      '/socket.io': {
        target: 'https://qa-ai-ul8n.onrender.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
