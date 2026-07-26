import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'app/shared'),
      '@main': path.resolve(__dirname, 'app/main'),
    },
  },
  build: {
    rollupOptions: {
      external: [
        'better-sqlite3',
        'electron',
        'electron-log',
        'path',
        'fs',
        'os',
        'crypto',
      ],
    },
  },
});
