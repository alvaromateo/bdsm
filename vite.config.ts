import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: { alias: { src: resolve('lib/') } },
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'bdsm',
      fileName: 'bdsm',
    },
  },
  plugins: [react(), tsconfigPaths()],
});

// https://medium.com/@tristan.wyl/build-multiple-javascripts-in-library-mode-with-vitejs-fc3fac4ea653
// How to add the example website (could be created using create-react-app)
