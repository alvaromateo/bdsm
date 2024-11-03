import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: { alias: { src: resolve('src/') } },
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'BDSM',
      fileName: 'bdsm',
    },
  },
});
