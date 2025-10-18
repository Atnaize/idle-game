import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // New feature-based structure
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@core': path.resolve(__dirname, './src/core'),

      // Legacy aliases (point to new locations)
      '@engine': path.resolve(__dirname, './src/core/engine'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@hooks': path.resolve(__dirname, './src/shared/hooks'),
      '@utils': path.resolve(__dirname, './src/core/utils'),
      '@config': path.resolve(__dirname, './src/shared/config'),
      '@store': path.resolve(__dirname, './src/core/store'),
    },
  },
});
