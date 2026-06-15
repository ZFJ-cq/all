import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/index.css',
        'src/vite-env.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
