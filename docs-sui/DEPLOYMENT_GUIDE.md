# SuiCompass Deployment Guide
**Version:** 1.0.0
**Last Updated:** March 22, 2026

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Production Build](#production-build)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js:** v20.0.0 or higher
- **npm:** v10.0.0 or higher
- **Git:** Latest version
- **Sui CLI:** Latest version (for contract interaction)

### Accounts & Services

1. **Sui Wallet**
   - Install [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet)
   - Create account and fund with testnet/mainnet SUI

2. **EmbedAPI Account**
   - Sign up at [EmbedAPI](https://embedapi.com)
   - Get API key for AI functionality

3. **Pinata Account** (Optional, for RWA features)
   - Sign up at [Pinata](https://pinata.cloud)
   - Get API key and secret

4. **Firebase Project** (Optional, for auth)
   - Create project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/x5engine/SuiCompass-Protocol.git
cd SuiCompass-Protocol
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env` file in root directory:

```env
# Required - AI Functionality
VITE_EMBEDAPI_KEY=your_embedapi_key_here

# Optional - RWA Tokenization
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key

# Optional - Network (defaults to mainnet)
VITE_SUI_NETWORK=mainnet  # or testnet

# Optional - Custom RPC (if not using default)
VITE_SUI_RPC_URL=https://fullnode.mainnet.sui.io

# Optional - Analytics
VITE_ANALYTICS_ID=your_analytics_id
```

**Security Note:** Never commit `.env` to version control!

---

## Local Development

### Start Development Server

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Hot reload enabled
- Source maps for debugging

### Available Scripts

```bash
# Start development server
npm run dev
npm run frontend

# Start with Firebase emulators
npm run emulators
npm run dev:full

# Build for production
npm run build

# Preview production build
npm run preview

# Run CLI
npm run cli
```

---

## Production Build

### 1. Build Application

```bash
npm run build
```

This creates optimized production build in `dist/` directory.

**Build Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js          (43.5 KB - initial)
│   ├── vendor-react-[hash].js   (337 KB - cached)
│   ├── vendor-sui-[hash].js     (403 KB - lazy)
│   ├── vendor-firebase-[hash].js
│   └── [page]-[hash].js         (lazy loaded)
└── favicon.ico
```

### 2. Test Production Build Locally

```bash
npm run preview
```

Visit: http://localhost:4173

### 3. Build Optimization

The build is already optimized with:
- ✅ Code splitting (97.7% size reduction)
- ✅ Lazy loading for routes
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression ready
- ✅ Source maps for debugging

**Performance Metrics:**
- Initial bundle: 43.5 KB
- Gzipped: 14.4 KB
- Load time: <1 second

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero config
- Automatic HTTPS
- Global CDN
- Instant rollbacks

**Steps:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow prompts to link project

4. Set environment variables in Vercel dashboard

**Custom Domain:**
```bash
vercel --prod
vercel domains add suicompass.com
```

---

### Option 2: Netlify

**Steps:**

1. Build project:
```bash
npm run build
```

2. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. Deploy:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

---

### Option 3: Firebase Hosting

**Steps:**

1. Install Firebase CLI:
```bash
npm i -g firebase-tools
```

2. Login:
```bash
firebase login
```

3. Initialize:
```bash
firebase init hosting
```

Configuration:
- Public directory: `dist`
- Single-page app: Yes
- GitHub Actions: Optional

4. Deploy:
```bash
npm run build
firebase deploy --only hosting
```

---

### Option 4: AWS S3 + CloudFront

**Steps:**

1. Build project:
```bash
npm run build
```

2. Create S3 bucket:
```bash
aws s3 mb s3://suicompass-app
```

3. Configure bucket for static hosting:
```bash
aws s3 website s3://suicompass-app \
  --index-document index.html \
  --error-document index.html
```

4. Upload files:
```bash
aws s3 sync dist/ s3://suicompass-app --acl public-read
```

5. Create CloudFront distribution for CDN

---

### Option 5: IPFS (Decentralized)

**Why IPFS?**
- Fully decentralized
- Censorship resistant
- Perfect for Web3 apps

**Steps:**

1. Install IPFS CLI:
```bash
npm i -g ipfs-deploy
```

2. Build project:
```bash
npm run build
```

3. Deploy to IPFS:
```bash
npx ipfs-deploy dist/
```

4. Pin with Pinata (for persistence):
```bash
npx ipfs-deploy dist/ --pinata=YOUR_KEY
```

**Result:** Your app is accessible via:
- IPFS: `ipfs://QmXXX...`
- Gateway: `https://gateway.pinata.cloud/ipfs/QmXXX...`

---

### Option 6: Docker

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Enable gzip
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build and run:**
```bash
# Build image
docker build -t suicompass .

# Run container
docker run -p 80:80 suicompass
```

---

## Post-Deployment

### 1. Verify Deployment

Check these critical items:

- [ ] App loads successfully
- [ ] Wallet connection works
- [ ] AI chat responds correctly
- [ ] Contract interactions succeed
- [ ] All routes load (test navigation)
- [ ] No console errors
- [ ] Performance is acceptable (use Lighthouse)

### 2. Set Cache Headers

Configure your hosting to cache static assets:

```
# Example for Netlify (_headers file)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/index.html
  Cache-Control: public, max-age=0, must-revalidate
```

### 3. Enable HTTPS

All hosting providers should auto-enable HTTPS. Verify:
```
https://your-domain.com
```

### 4. Configure DNS

Point your domain to hosting provider:

**Vercel:**
```
A record: 76.76.21.21
```

**Netlify:**
```
CNAME: your-site.netlify.app
```

### 5. Set Up Monitoring

Configure error tracking and analytics:

**Sentry (Error Tracking):**
```typescript
// In production
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

**Google Analytics:**
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

---

## Environment Variables by Environment

### Development (.env.local)
```env
VITE_EMBEDAPI_KEY=dev_key
VITE_SUI_NETWORK=testnet
```

### Staging (.env.staging)
```env
VITE_EMBEDAPI_KEY=staging_key
VITE_SUI_NETWORK=testnet
VITE_ANALYTICS_ID=staging_analytics
```

### Production (.env.production)
```env
VITE_EMBEDAPI_KEY=prod_key
VITE_SUI_NETWORK=mainnet
VITE_ANALYTICS_ID=prod_analytics
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## Performance Optimization

### Already Implemented

- ✅ Code splitting
- ✅ Lazy loading
- ✅ Tree shaking
- ✅ Minification
- ✅ Source maps

### Additional Optimizations

**1. Enable Gzip/Brotli Compression**

Most hosts enable this automatically. Verify:
```bash
curl -H "Accept-Encoding: gzip" -I https://your-domain.com
# Should see: Content-Encoding: gzip
```

**2. Image Optimization**

If adding images:
```bash
npm i -D vite-plugin-imagemin
```

**3. Preload Critical Resources**

In `index.html`:
```html
<link rel="preload" href="/assets/index.js" as="script">
<link rel="preload" href="/assets/index.css" as="style">
```

---

## Troubleshooting

### Build Fails

**Issue:** `npm run build` fails

**Solutions:**
```bash
# Clear cache
rm -rf node_modules dist
npm install

# Check Node version
node -v  # Should be 20+

# Update dependencies
npm update
```

---

### White Screen After Deploy

**Issue:** App shows blank screen in production

**Solutions:**

1. Check console for errors
2. Verify base path in `vite.config.ts`:
```typescript
export default defineConfig({
  base: './',  // or '/your-subdirectory/'
})
```

3. Check routing configuration

---

### Environment Variables Not Working

**Issue:** `process.env.VITE_*` is undefined

**Solutions:**

1. Ensure variables start with `VITE_`
2. Restart dev server after adding variables
3. In production, set in hosting provider dashboard
4. Never use `process.env` - use `import.meta.env.VITE_*`

**Correct Usage:**
```typescript
// ❌ Wrong
const key = process.env.VITE_API_KEY;

// ✅ Correct
const key = import.meta.env.VITE_API_KEY;
```

---

### Wallet Connection Fails

**Issue:** Wallet won't connect in production

**Solutions:**

1. Verify HTTPS is enabled (required for wallet)
2. Check CSP headers allow wallet origin
3. Test with different wallet (Sui Wallet, Suiet, etc.)
4. Check browser console for errors

---

### Slow Load Times

**Issue:** App loads slowly

**Diagnostics:**
```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com
```

**Solutions:**

1. Verify code splitting is working (check Network tab)
2. Enable compression on hosting
3. Use CDN (most hosts include this)
4. Check if large dependencies can be lazy-loaded

---

## Security Checklist

Before deploying to production:

- [ ] Never commit `.env` files
- [ ] Rotate API keys for production
- [ ] Enable HTTPS (automatic on most hosts)
- [ ] Set secure CSP headers
- [ ] Enable rate limiting on API routes
- [ ] Review smart contract permissions
- [ ] Test wallet security
- [ ] Set up error monitoring
- [ ] Configure CORS properly
- [ ] Review third-party dependencies

---

## CI/CD Setup

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_EMBEDAPI_KEY: ${{ secrets.EMBEDAPI_KEY }}
          VITE_SUI_NETWORK: mainnet

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Rollback Strategy

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Manual Rollback

Keep previous build artifacts:
```bash
# Before deploying
cp -r dist dist.backup

# If issues, restore
rm -rf dist
mv dist.backup dist
# Redeploy
```

---

## Monitoring & Maintenance

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### Performance Monitoring

- Lighthouse CI
- Web Vitals tracking
- New Relic / Datadog

### Error Tracking

- Sentry
- LogRocket
- Rollbar

---

## Support

- **Documentation:** [API Docs](./API_DOCUMENTATION.md)
- **Issues:** [GitHub Issues](https://github.com/x5engine/SuiCompass-Protocol/issues)
- **Community:** Discord / Telegram

---

**Last Updated:** March 22, 2026
**Version:** 1.0.0
