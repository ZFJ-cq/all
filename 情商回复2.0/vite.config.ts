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
      '/api/tiangong': {
        target: 'http://api.tiangong.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tiangong/, ''),
      },
      '/api/xiaosi': {
        target: 'http://api.xiaosi.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xiaosi/, ''),
      },
      '/api/xiaoi': {
        target: 'https://api.xiaoi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xiaoi/, ''),
      },
      '/api/haitun': {
        target: 'https://api.haitun.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/haitun/, ''),
      },
      '/api/benben': {
        target: 'http://api.benbenrobot.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/benben/, ''),
      },
      '/api/mlvoca': {
        target: 'https://mlvoca.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mlvoca/, ''),
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
