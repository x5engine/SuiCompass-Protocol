import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/**
 * Security headers plugin for production builds
 * Adds CSP, X-Frame-Options, and other security headers
 */
function securityHeadersPlugin(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Development security headers (more relaxed for HMR)
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        // Production-like security headers for preview
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Content Security Policy (relaxed for inline scripts from build)
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // unsafe-inline needed for Vite build
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://fullnode.mainnet.sui.io https://fullnode.testnet.sui.io https://embedapi.com https://*.pinata.cloud wss://fullnode.mainnet.sui.io",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ')
        );
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative paths for IPFS deployment
  plugins: [
    react(),
    securityHeadersPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks by package type
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@mysten') || id.includes('@tanstack')) {
              return 'vendor-sui';
            }
            if (id.includes('d3')) {
              return 'vendor-d3';
            }
            if (id.includes('@embedapi') || id.includes('axios')) {
              return 'vendor-ai';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            // Other node_modules
            return 'vendor-other';
          }
        },
      },
    },
    // Increase chunk size warning limit since we're optimizing
    chunkSizeWarningLimit: 600,
    // Enable source maps for debugging in production
    sourcemap: true,
  },
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

