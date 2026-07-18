import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: 'playground',
  plugins: [react()],
  build: {
    outDir: '../playground-dist',
    emptyOutDir: true,
  },
});
