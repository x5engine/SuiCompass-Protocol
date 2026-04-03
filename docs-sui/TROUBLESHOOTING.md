# SuiCompass Troubleshooting Guide
**Version:** 1.0.0
**Last Updated:** March 22, 2026

---

## Table of Contents

1. [Common Issues](#common-issues)
2. [Build & Development](#build--development)
3. [Wallet & Blockchain](#wallet--blockchain)
4. [Performance](#performance)
5. [UI/UX Issues](#uiux-issues)
6. [Getting Additional Help](#getting-additional-help)

---

## Common Issues

### Issue: App Won't Start

**Symptoms:**
```bash
npm run dev
# Error: Cannot find module...
```

**Solutions:**

1. **Clear and reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check Node version:**
```bash
node -v
# Should be v20.0.0 or higher
```

3. **Update to correct Node version:**
```bash
# Using nvm
nvm install 20
nvm use 20
```

4. **Clear cache:**
```bash
npm cache clean --force
```

---

### Issue: Build Fails

**Symptoms:**
```bash
npm run build
# Error during build...
```

**Solutions:**

1. **Check for TypeScript errors:**
```bash
# TypeScript errors will cause build to fail
# Fix all type errors first
```

2. **Clear dist folder:**
```bash
rm -rf dist
npm run build
```

3. **Check for missing dependencies:**
```bash
npm install
```

4. **Verify all imports:**
```typescript
// ❌ Wrong
import { something } from 'non-existent-package';

// ✅ Correct - verify package exists
import { something } from '@actual/package';
```

---

### Issue: Environment Variables Not Working

**Symptoms:**
- `import.meta.env.VITE_*` returns undefined
- Features requiring API keys don't work

**Solutions:**

1. **Verify .env file exists:**
```bash
ls -la .env
# Should exist in project root
```

2. **Check variable naming:**
```env
# ❌ Wrong - missing VITE_ prefix
API_KEY=xxx

# ✅ Correct
VITE_API_KEY=xxx
```

3. **Restart dev server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

4. **Correct usage in code:**
```typescript
// ❌ Wrong - Node.js syntax
const key = process.env.VITE_API_KEY;

// ✅ Correct - Vite syntax
const key = import.meta.env.VITE_API_KEY;
```

5. **Production environment:**
- Set in hosting provider dashboard (Vercel, Netlify, etc.)
- Don't commit .env to git

---

### Issue: White Screen / Blank Page

**Symptoms:**
- App loads but shows blank screen
- No visible errors in UI

**Solutions:**

1. **Check browser console:**
```
F12 (or Cmd+Option+I on Mac)
Look for red errors
```

2. **Common causes:**

**A. JavaScript Error:**
```javascript
// ErrorBoundary should catch these
// Check console for error details
```

**B. Router Issue:**
```typescript
// Verify all routes are properly configured
// Check AppRoutes.tsx
```

**C. Missing Provider:**
```typescript
// Ensure all required providers are present
<SuiProviders>
  <App />
</SuiProviders>
```

3. **Clear browser cache:**
```
Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
Clear cached images and files
Reload page
```

4. **Try incognito mode:**
- Rules out extension conflicts
- Fresh browser state

---

## Build & Development

### Issue: Hot Reload Not Working

**Symptoms:**
- Changes don't reflect automatically
- Need to manually refresh browser

**Solutions:**

1. **Restart dev server:**
```bash
# Stop with Ctrl+C
npm run dev
```

2. **Check file watcher limit (Linux):**
```bash
# Increase watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Check for syntax errors:**
- HMR may fail with syntax errors
- Fix errors and save again

---

### Issue: Slow Build Times

**Symptoms:**
- `npm run build` takes >1 minute
- Development server slow to start

**Solutions:**

1. **Clear cache:**
```bash
rm -rf node_modules/.vite
npm run build
```

2. **Reduce bundle analysis during dev:**
```typescript
// vite.config.ts
// Comment out heavy plugins during development
```

3. **Upgrade to latest Vite:**
```bash
npm update vite
```

---

### Issue: Module Not Found Errors

**Symptoms:**
```
Error: Cannot find module '@/components/...'
```

**Solutions:**

1. **Check file exists:**
```bash
ls -la src/components/...
```

2. **Verify import path:**
```typescript
// ❌ Wrong - incorrect path
import { Button } from '@/components/Button';

// ✅ Correct - verify actual path
import { Button } from './components/Button';
```

3. **Check file extension:**
```typescript
// For .tsx files, extension is optional
import MyComponent from './MyComponent';  // ✅
import MyComponent from './MyComponent.tsx';  // ✅
```

---

## Wallet & Blockchain

### Issue: Wallet Won't Connect

**Symptoms:**
- Click "Connect Wallet" but nothing happens
- Wallet extension not detected

**Solutions:**

1. **Verify wallet is installed:**
- Check for Sui Wallet extension in browser
- Visit: chrome://extensions

2. **Check browser compatibility:**
- Sui Wallet requires Chrome, Brave, or Edge
- Firefox not supported yet

3. **Refresh page:**
```
Ctrl+R (or Cmd+R on Mac)
```

4. **Check wallet is unlocked:**
- Open wallet extension
- Enter password if locked

5. **Try different wallet:**
- Sui Wallet
- Suiet
- Ethos Wallet

6. **Check console for errors:**
```javascript
// Common error:
// "Wallet adapter not found"
// Solution: Install wallet extension
```

---

### Issue: Transaction Fails

**Symptoms:**
```
Transaction failed
Error: ...
```

**Solutions:**

**A. Insufficient Balance:**
```
Error: Insufficient balance

Solution:
1. Check your SUI balance
2. Ensure you have enough for amount + gas
3. Gas typically ~0.001 SUI
```

**B. Gas Estimation Failed:**
```
Error: Gas estimation failed

Solutions:
1. Try smaller amount
2. Check contract is deployed
3. Verify network (mainnet vs testnet)
```

**C. User Rejected:**
```
Error: User rejected transaction

Solution:
- This is intentional rejection
- No action needed
```

**D. Network Error:**
```
Error: Network request failed

Solutions:
1. Check internet connection
2. Verify Sui network status
3. Try different RPC endpoint
```

---

### Issue: Transaction Pending Forever

**Symptoms:**
- Transaction submitted but never confirms
- Stuck on "Processing..."

**Solutions:**

1. **Check transaction on explorer:**
```
https://suiscan.xyz/mainnet/tx/[TX_HASH]
```

2. **Verify network status:**
```
https://status.sui.io
```

3. **Typical confirmation time:**
- Mainnet: 1-3 seconds
- If >30 seconds, likely failed

4. **Retry transaction:**
- Refresh page
- Try again with higher gas

---

### Issue: Wrong Network

**Symptoms:**
- Contract not found
- Unexpected behavior

**Solutions:**

1. **Check wallet network:**
```
Open wallet extension
Look for "Mainnet" or "Testnet"
Switch if needed
```

2. **Check app network:**
```env
# In .env
VITE_SUI_NETWORK=mainnet  # or testnet
```

3. **Contracts are on mainnet:**
- App defaults to mainnet
- Use mainnet SUI for testing

---

## Performance

### Issue: App is Slow

**Symptoms:**
- Lag when navigating
- Slow to load pages
- High CPU usage

**Solutions:**

1. **Check network tab:**
```
F12 → Network
Look for slow requests
> 3s is concerning
```

2. **Clear browser cache:**
```
Settings → Privacy → Clear browsing data
```

3. **Reduce browser extensions:**
- Disable unnecessary extensions
- Some extensions slow down apps

4. **Check memory usage:**
```
F12 → Performance
Look for memory leaks
```

---

### Issue: High Bundle Size Warning

**Symptoms:**
```
(!) Some chunks are larger than 500 KB
```

**Solution:**
- This is expected and intentional
- Chunks are lazy-loaded
- Initial bundle is only 43.5 KB
- No action needed

---

### Issue: Memory Leak

**Symptoms:**
- Browser tab uses increasing memory
- App gets slower over time
- Eventually crashes

**Solutions:**

1. **Refresh page periodically:**
- Memory will be cleared

2. **Report if reproducible:**
- File bug report with steps to reproduce

3. **Check for common causes:**
```typescript
// ❌ Missing cleanup
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  // Missing: return () => clearInterval(interval);
}, []);

// ✅ Proper cleanup
useEffect(() => {
  const interval = setInterval(() => {}, 1000);
  return () => clearInterval(interval);  // Clean up!
}, []);
```

---

## UI/UX Issues

### Issue: Buttons Not Clickable

**Symptoms:**
- Button visible but doesn't respond to clicks
- No hover effect

**Solutions:**

1. **Check if button is disabled:**
```html
<button disabled>...</button>
```

2. **Check for overlaying elements:**
```css
/* Something might be covering button */
/* Inspect with browser DevTools */
```

3. **Verify onClick handler:**
```typescript
// Should have onClick
<button onClick={handleClick}>...</button>
```

---

### Issue: Styles Not Applying

**Symptoms:**
- Component looks different than expected
- Tailwind classes not working

**Solutions:**

1. **Check class name:**
```html
<!-- ❌ Wrong -->
<div class="bg-red-500">

<!-- ✅ Correct - use className in React -->
<div className="bg-red-500">
```

2. **Verify Tailwind config:**
```javascript
// tailwind.config.js should include:
content: ['./src/**/*.{js,jsx,ts,tsx}']
```

3. **Clear and rebuild:**
```bash
rm -rf dist node_modules/.vite
npm run dev
```

---

### Issue: Modal Won't Close

**Symptoms:**
- Modal opens but can't close
- X button doesn't work

**Solutions:**

1. **Check if loading:**
- Modal may be disabled during loading state
- Wait for operation to complete

2. **Click outside modal:**
- Try clicking dark overlay

3. **Keyboard shortcut:**
- Press `Escape` key

---

### Issue: Text is Cut Off

**Symptoms:**
- Text doesn't fit in container
- Truncated at wrong place

**Solutions:**

1. **Responsive design:**
```html
<!-- Use responsive classes -->
<div className="text-sm md:text-base lg:text-lg">
```

2. **Adjust viewport:**
- Try different screen sizes
- May be designed for desktop

---

## Getting Additional Help

### Before Asking for Help

1. **Search existing issues:**
   - GitHub issues
   - Discussions

2. **Check documentation:**
   - README.md
   - API_DOCUMENTATION.md
   - This guide

3. **Try in incognito mode:**
   - Rules out cache/extension issues

4. **Test on different browser:**
   - Verify not browser-specific

---

### How to Report an Issue

**Include this information:**

1. **Environment:**
```
- OS: Windows 11 / macOS 13 / Ubuntu 22.04
- Browser: Chrome 120
- Node version: v20.0.0
- Wallet: Sui Wallet 1.0.0
```

2. **Steps to reproduce:**
```
1. Go to /dashboard
2. Click "Stake" button
3. See error
```

3. **Expected vs Actual:**
```
Expected: Transaction should complete
Actual: Error "Insufficient gas"
```

4. **Screenshots:**
- Include screenshot of error
- Include browser console (F12)

5. **Console errors:**
```
Copy and paste any red errors from console
```

---

### Where to Get Help

1. **GitHub Issues:**
   - Bug reports
   - Feature requests
   - https://github.com/x5engine/SuiCompass-Protocol/issues

2. **GitHub Discussions:**
   - General questions
   - How-to guides

3. **Documentation:**
   - API docs: `docs-sui/API_DOCUMENTATION.md`
   - Architecture: `docs-sui/ARCHITECTURE.md`
   - Deployment: `docs-sui/DEPLOYMENT_GUIDE.md`

---

## Quick Reference

### Useful Commands

```bash
# Development
npm run dev               # Start dev server
npm run build             # Build for production
npm run preview           # Preview build

# Troubleshooting
rm -rf node_modules       # Remove dependencies
npm install               # Reinstall
rm -rf dist               # Remove build
npm cache clean --force   # Clear npm cache

# Git
git status                # Check status
git reset --hard          # Discard changes
git clean -fd             # Remove untracked files
```

### Environment Variables

```env
# Required
VITE_EMBEDAPI_KEY=xxx

# Optional
VITE_PINATA_API_KEY=xxx
VITE_PINATA_SECRET_KEY=xxx
VITE_SUI_NETWORK=mainnet
```

### Browser Shortcuts

```
F12 or Cmd+Option+I     # Open DevTools
Ctrl+Shift+R            # Hard refresh
Ctrl+Shift+Delete       # Clear cache
Ctrl+Shift+I            # Inspect element
```

---

**Still having issues? Create a GitHub issue with detailed information.**

---

**Last Updated:** March 22, 2026
**Version:** 1.0.0
