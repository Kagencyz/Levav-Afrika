import path from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { boot: 'server/boot.ts' },
  outDir: 'dist-server',
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: true,
  esbuildOptions(options) {
    options.alias = {
      '@db': path.resolve(__dirname, './db'),
      '@api': path.resolve(__dirname, './server'),
      '@contracts': path.resolve(__dirname, './contracts'),
    };
  },
});
