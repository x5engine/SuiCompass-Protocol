# SuiCompass Architecture Documentation
**Version:** 1.0.0
**Last Updated:** March 22, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Smart Contract Architecture](#smart-contract-architecture)
5. [Data Flow](#data-flow)
6. [Performance Architecture](#performance-architecture)
7. [Security Architecture](#security-architecture)

---

## Overview

SuiCompass is a production-ready, AI-native DeFi platform built on the Sui blockchain. It combines 11 smart contracts with an intelligent frontend to provide seamless DeFi interactions through natural language.

### Key Architectural Principles

1. **Modular Design:** Components are loosely coupled and highly cohesive
2. **Performance First:** Code splitting, lazy loading, and optimization
3. **Error Resilience:** Comprehensive error handling at all layers
4. **Type Safety:** Full TypeScript coverage
5. **Scalability:** Designed to handle growth

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  React App   │  │  Sui Wallet  │  │  AI Service  │     │
│  │  (Frontend)  │  │  Extension   │  │  (EmbedAPI)  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ RPC Calls        │ Sign Tx         │ NLP
          ↓                  ↓                  ↓
┌─────────────────────────────────────────────────────────────┐
│                      Sui Blockchain                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   RWA    │ │Portfolio │ │  Index   │ │  Flash   │      │
│  │ Registry │ │ Manager  │ │   Fund   │ │   Loan   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Prediction│ │  Social  │ │ Stream   │ │Derivativ.│      │
│  │  Market  │ │ Trading  │ │   Pay    │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Lottery  │ │  Bridge  │ │Reputation│                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
          │
          │ IPFS Storage
          ↓
┌─────────────────────────────────────────────────────────────┐
│                         IPFS/Pinata                          │
│                    (Document Storage)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 19 | UI components |
| **Language** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast builds |
| **Routing** | React Router v7 | Client-side routing |
| **State Management** | Zustand | Global state |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Blockchain** | @mysten/sui | Sui SDK |
| **Wallet** | @mysten/dapp-kit | Wallet integration |
| **AI** | @embedapi/core | Natural language |
| **Visualization** | D3.js | Data visualization |

---

### Directory Structure

```
src/
├── ai/                          # AI & NLP
│   ├── embedapi-client.ts      # AI integration
│   ├── contract-knowledge.ts   # Contract metadata
│   └── architecture-context.ts # System context
│
├── blockchain/                  # Blockchain layer
│   ├── WalletProvider.tsx      # Wallet context
│   └── contract-interactions.ts # Contract calls
│
├── components/                  # React components
│   ├── chat/                   # Chat interface
│   ├── dashboard/              # Dashboard tabs
│   ├── pages/                  # Page components
│   ├── common/                 # Shared components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingState.tsx
│   │   ├── LazyLoad.tsx
│   │   └── TransactionHandler.tsx
│   └── ui/                     # UI primitives
│
├── hooks/                      # Custom React hooks
│   ├── useErrorHandler.ts
│   ├── usePerformanceMonitor.ts
│   └── useOfflineMode.tsx
│
├── services/                   # Business logic
│   ├── auto-stake-agent.ts
│   ├── contract-deployment.ts
│   ├── ai-risk-audit.ts
│   └── rwa-tokenization.ts
│
├── stores/                     # State management
│   ├── chat-store.ts
│   ├── auto-stake-store.ts
│   └── dashboard-store.ts
│
├── utils/                      # Utilities
│   ├── error-handler.ts
│   └── sound-effects.ts
│
├── types/                      # TypeScript types
│   ├── auto-stake.ts
│   ├── contract-templates.ts
│   └── rwa-audit.ts
│
├── App.tsx                     # Root component
├── AppRoutes.tsx               # Route configuration
├── main.tsx                    # Entry point
└── vite.config.ts              # Build config
```

---

### Component Architecture

#### 1. Atomic Design Pattern

```
Atoms (Primitives)
  ↓
Molecules (Simple components)
  ↓
Organisms (Complex components)
  ↓
Templates (Page layouts)
  ↓
Pages (Full pages)
```

**Example:**
```
Button (Atom)
  ↓
TransactionButton (Molecule)
  ↓
StakingForm (Organism)
  ↓
DashboardTemplate (Template)
  ↓
Dashboard (Page)
```

---

#### 2. Component Hierarchy

```
App
├── ErrorBoundary (Global error catching)
├── OfflineIndicator (Network status)
└── BrowserRouter
    ├── SuiProviders (Blockchain context)
    │   ├── WalletProvider
    │   └── QueryClientProvider
    └── Routes
        ├── ChatInterface (/)
        ├── Dashboard (/dashboard)
        ├── MarketPage (/market)
        ├── SocialTradingPage (/social-trading)
        ├── StreamPaymentsPage (/stream-payments)
        ├── BridgePage (/bridge)
        ├── GamesPage (/games)
        ├── ProfilePage (/profile)
        └── FAQPage (/faq)
```

---

### State Management Architecture

#### Global State (Zustand)

```typescript
┌─────────────────────────────────┐
│      Global State Stores         │
├─────────────────────────────────┤
│  • chat-store                   │
│    - messages                   │
│    - suggestions                │
│  • auto-stake-store             │
│    - enabled                    │
│    - settings                   │
│  • dashboard-store              │
│    - activeTab                  │
│  • gamification-store           │
│    - points, level, badges      │
└─────────────────────────────────┘
```

**Benefits:**
- Lightweight (< 1KB)
- No boilerplate
- TypeScript-friendly
- Persistent state support

---

#### Local State (React useState)

Used for:
- Form inputs
- UI toggles
- Temporary data
- Component-specific state

---

### Routing Architecture

#### Lazy Loading Strategy

```typescript
// All routes are lazy-loaded
const ChatInterface = lazy(() => import('./components/chat/ChatInterface'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
// ... etc

// Wrapped with Suspense
<Route path="/dashboard" element={
  <LazyLoad component={Dashboard} />
} />
```

**Benefits:**
- 43.5 KB initial bundle (vs 1,918 KB)
- Faster initial load
- Better caching
- Progressive enhancement

---

## Smart Contract Architecture

### Contract Overview

```
┌────────────────────────────────────────────────────────────┐
│                    Contract Layer                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Core Contracts (RWA, Portfolio, Index Fund)               │
│  ├─ RWA Registry     [Tokenization]                        │
│  ├─ Portfolio        [Robo-Advisor]                        │
│  └─ Index Fund       [ETF-style Baskets]                   │
│                                                             │
│  Trading Contracts (Flash Loan, Social, Derivatives)       │
│  ├─ Flash Loan       [Arbitrage]                           │
│  ├─ Social Trading   [Copy Trading]                        │
│  └─ Derivatives      [Options]                             │
│                                                             │
│  Market Contracts (Prediction, Lottery)                    │
│  ├─ Prediction       [Binary Options]                      │
│  └─ Lossless Lottery [Gamified Staking]                    │
│                                                             │
│  Infrastructure (Stream Pay, Bridge, Reputation)           │
│  ├─ Stream Pay       [Vesting]                             │
│  ├─ Bridge Adaptor   [Cross-chain]                         │
│  └─ Reputation ID    [Credit Score]                        │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

### Contract Interaction Flow

```
User Action (UI)
  ↓
Contract Interactions Class
  ↓
Build Transaction (Transaction Builder)
  ↓
Wallet Sign (User Approval)
  ↓
Submit to Sui Network
  ↓
Transaction Confirmation
  ↓
UI Update (State Refresh)
```

---

### Contract Addresses (Mainnet)

| Contract | Package ID | Status |
|----------|-----------|--------|
| RWA Registry | `0x3fbda5b...` | 🟢 Live |
| RWA NFT | `0x33bd2f7...` | 🟢 Live |
| Core Suite | `0x9cab3a4...` | 🟢 Live |

---

## Data Flow

### User Input → AI → Transaction

```
┌──────────────┐
│ User Types   │ "Stake 100 SUI with best validator"
│   Message    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  EmbedAPI    │ Claude 3.5 Sonnet processes
│   (AI NLP)   │
└──────┬───────┘
       │
       ↓ Returns ParsedIntent
       │ { intent: "stake", entities: { amount: 100, strategy: "best" } }
       │
┌──────────────┐
│  Intent      │ Parse intent and entities
│   Handler    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Contract    │ ContractInteractions.stake(100)
│Interactions  │
└──────┬───────┘
       │
       ↓ Build Transaction
       │
┌──────────────┐
│   Wallet     │ User signs transaction
│   Provider   │
└──────┬───────┘
       │
       ↓ Submit to network
       │
┌──────────────┐
│     Sui      │ Execute transaction
│  Blockchain  │
└──────┬───────┘
       │
       ↓ Confirmation
       │
┌──────────────┐
│  UI Update   │ Show success, refresh data
│   & Feedback │
└──────────────┘
```

---

### Error Handling Flow

```
Error Occurs
  ↓
ErrorBoundary (Component errors)
  ↓
parseError() (Categorize error)
  ↓
handleError() (Log & notify)
  ↓
User Notification (Toast)
  +
Console Log (Debugging)
  +
Sentry (Production tracking)
```

---

## Performance Architecture

### Build Optimization

```
Source Code (2,412 modules)
  ↓
Vite Bundler
  ↓
Code Splitting Strategy
  ├─ Initial Bundle (43.5 KB)
  │   └─ App shell + Chat
  │
  ├─ Vendor Chunks (lazy)
  │   ├─ vendor-react.js (337 KB)
  │   ├─ vendor-sui.js (403 KB)
  │   ├─ vendor-firebase.js (513 KB)
  │   ├─ vendor-d3.js (52 KB)
  │   └─ vendor-ai.js (7 KB)
  │
  └─ Page Chunks (lazy)
      ├─ Dashboard.js (51 KB)
      ├─ MarketPage.js (10 KB)
      └─ ... other pages
  ↓
Browser Cache
  ├─ Vendor chunks (long cache)
  └─ App chunks (short cache)
```

---

### Loading Strategy

```
Page Load
  ↓
1. HTML (0.9 KB) - Instant
  ↓
2. Initial JS (43.5 KB) - <100ms
  ↓
3. Initial CSS (56 KB) - <100ms
  ↓
4. App Shell Renders - <200ms
  ↓
5. Vendor Chunks Load (parallel)
   - React (337 KB)
   - Sui SDK (403 KB)
  ↓
6. Page Interactive - <1s
  ↓
7. Other Features (lazy)
   - Load on-demand
```

---

### Caching Strategy

```
Browser Cache
├─ Long-term (1 year)
│   ├─ vendor-react-[hash].js
│   ├─ vendor-sui-[hash].js
│   └─ vendor-firebase-[hash].js
│
├─ Medium-term (1 week)
│   ├─ Dashboard-[hash].js
│   ├─ MarketPage-[hash].js
│   └─ other pages
│
└─ Short-term (no cache)
    └─ index.html (entry point)
```

**Benefits:**
- Returning visitors: 90% cache hit rate
- Only download changed files
- Instant repeat visits

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────┐
│  Layer 1: Input Validation          │
│  - Validate addresses, amounts      │
│  - Sanitize user input              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Layer 2: Error Boundaries          │
│  - Catch component errors           │
│  - Graceful degradation             │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Layer 3: Transaction Safety        │
│  - Confirmation modals              │
│  - Amount limits                    │
│  - Gas estimation                   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Layer 4: Smart Contract Security   │
│  - Access control                   │
│  - Reentrancy protection            │
│  - Overflow checks                  │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│  Layer 5: Network Security          │
│  - HTTPS only                       │
│  - CSP headers                      │
│  - CORS configuration               │
└─────────────────────────────────────┘
```

---

### Security Best Practices

1. **Input Validation**
   - All user inputs validated client-side
   - Sui addresses verified with regex
   - Amounts checked for range

2. **Error Handling**
   - No sensitive data in error messages
   - Errors logged securely
   - Production errors sent to Sentry

3. **Wallet Security**
   - HTTPS required for wallet
   - No private keys stored
   - Transactions signed in wallet

4. **Smart Contract**
   - All contracts deployed on mainnet
   - Access control enforced
   - Audited and tested

---

## Scalability Considerations

### Current Capacity

- **Users:** Designed for 100K+ concurrent
- **Transactions:** Limited by Sui network
- **Data:** Stateless frontend, scales horizontally

### Future Scaling

1. **CDN Distribution**
   - Static assets on CDN
   - Global edge locations
   - Reduced latency

2. **Database Layer**
   - Optional Firebase/Supabase
   - Cache frequently accessed data
   - Reduce RPC calls

3. **Microservices**
   - Separate AI service
   - Separate indexer service
   - Independent scaling

---

## Technology Decisions

### Why React?
- ✅ Mature ecosystem
- ✅ Excellent TypeScript support
- ✅ Large community
- ✅ React 19 performance improvements

### Why Vite?
- ✅ Extremely fast builds
- ✅ Superior HMR
- ✅ Modern ESM support
- ✅ Excellent code splitting

### Why Zustand?
- ✅ Minimal boilerplate
- ✅ Lightweight (< 1KB)
- ✅ TypeScript-first
- ✅ No providers needed

### Why Tailwind?
- ✅ Utility-first approach
- ✅ Excellent performance
- ✅ Easy customization
- ✅ No CSS-in-JS overhead

---

## Development Workflow

```
Local Development
  ↓
Git Commit
  ↓
Push to GitHub
  ↓
CI/CD Pipeline
  ├─ Lint & Type Check
  ├─ Build
  └─ Deploy to Vercel
  ↓
Production (Live)
```

---

## Monitoring & Observability

### Metrics Tracked

1. **Performance**
   - Web Vitals (LCP, FID, CLS)
   - Page load time
   - Component render time

2. **Errors**
   - JavaScript errors
   - Failed transactions
   - API failures

3. **Usage**
   - Page views
   - User flows
   - Feature usage

---

## Future Architecture

### Planned Improvements

1. **Service Workers**
   - Offline support
   - Background sync
   - Push notifications

2. **Web Workers**
   - Heavy computation
   - Parallel processing
   - Better performance

3. **Module Federation**
   - Micro-frontends
   - Independent deployments
   - Team autonomy

---

**Last Updated:** March 22, 2026
**Version:** 1.0.0
