import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'app/renderer'),
      '@shared': path.resolve(__dirname, 'app/shared'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
