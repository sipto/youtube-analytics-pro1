import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: './', // Important for GitHub Pages and Electron
  build: {
    outDir: 'dist-web',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});