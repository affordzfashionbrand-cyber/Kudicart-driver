import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js'],
  },
  define: {
    global: 'window',
    __DEV__: true,
  },
  optimizeDeps: {
    exclude: [
      'react-native-screens',
      'react-native-safe-area-context',
    ],
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
