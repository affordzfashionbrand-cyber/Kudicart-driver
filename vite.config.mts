import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js'],
  },
  define: {
    global: 'window',
    __DEV__: mode !== 'production',
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || 'http://localhost:3001'),
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDNrOgdNcWwL4RxN9f-3Ktp7e73rSlOifc'),
    'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN || 'kudikart-3ec2e.firebaseapp.com'),
    'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || 'kudikart-3ec2e'),
    'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET || 'kudikart-3ec2e.firebasestorage.app'),
    'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '174851114581'),
    'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID || '1:174851114581:web:142cf1f26ea50affe836dc'),
  },
  optimizeDeps: {
    exclude: [
      'react-native-screens',
      'react-native-safe-area-context',
    ],
  },
  server: {
    port: 3002,
    host: true,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
}));
