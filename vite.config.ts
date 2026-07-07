import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import cesium from 'vite-plugin-cesium';

const basePath = process.env.VITE_BASE_PATH ?? '';

export default defineConfig({
  plugins: [
    react(),
    cesium()
  ],
  base: basePath ? `/${basePath}/` : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
