import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: './',
  build: {
    sourcemap: 'hidden',
  },
  server: {
    proxy: {
      '/api/qingyunke': {
        target: 'http://api.qingyunke.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/qingyunke/, ''),
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
