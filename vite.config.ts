import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    // 保留：团队演示仍可能通过内网穿透访问本机 dev 服务
    allowedHosts: ['.trycloudflare.com', '.natappfree.cc', '.vicp.fun', '.nat300.top'],
  },
  build: {
    rollupOptions: {
      output: {
        // 把稳定不变的依赖拆成独立 vendor chunk，页面代码更新时它们的 hash 不变，命中长缓存
        manualChunks: {
          reactVendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
