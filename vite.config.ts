import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy RPC requests to bypass CORS
      // Try CSPR.cloud first (with auth), then fallback to public node
      '/api/rpc': {
        target: 'https://node.testnet.cspr.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/rpc/, '/rpc'),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            // Add CSPR.cloud authorization header
            proxyReq.setHeader('Authorization', '019b83db-910e-7a93-a378-310a6833e1e5')
          })
        },
      },
      // Proxy CSPR.cloud API to bypass CORS
      '/api/cspr-cloud': {
        target: 'https://api.cspr.cloud',
        changeOrigin: true,
        rewrite: (path) => {
          // Remove /api/cspr-cloud prefix and keep query string
          const newPath = path.replace(/^\/api\/cspr-cloud/, '')
          return newPath
        },
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Preserve query string
            if (req.url) {
              const url = new URL(req.url, `http://${req.headers.host}`)
              proxyReq.path = url.pathname + url.search
            }
          })
        },
      },
    },
  },
})

