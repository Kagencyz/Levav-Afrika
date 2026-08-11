/// <reference types="vitest/config" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, './db'),
      '@api': path.resolve(__dirname, './server'),
      '@contracts': path.resolve(__dirname, './contracts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
    include: ['server/**/*.test.ts', 'db/**/*.test.ts', 'src/**/*.test.ts'],
    // Server modules validate env at import time; give tests a valid shape.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
      CORS_ORIGIN: 'http://localhost:5173',
      JWT_SECRET: 'vitest-only-secret-not-used-anywhere-real',
    },
  },
});
