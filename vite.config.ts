import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // Un solo chunk: la landing es una sola pantalla y partirla en dos
    // requests en 4G saturada cuesta mas de lo que ahorra.
    cssCodeSplit: false,
    reportCompressedSize: true,
  },
});
