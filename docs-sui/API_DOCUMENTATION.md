# SuiCompass API Documentation
**Version:** 1.0.0
**Last Updated:** March 22, 2026

---

## Table of Contents

1. [Smart Contract Interactions](#smart-contract-interactions)
2. [AI & EmbedAPI](#ai--embedapi)
3. [Blockchain Services](#blockchain-services)
4. [React Hooks](#react-hooks)
5. [Utility Functions](#utility-functions)
6. [Error Handling](#error-handling)

---

## Smart Contract Interactions

### ContractInteractions Class

Location: `src/blockchain/contract-interactions.ts`

All smart contract interactions are centralized in this class.

#### Portfolio Manager

```typescript
// Create a new portfolio
static createPortfolio(): Transaction

// Deposit into portfolio
static depositToPortfolio(portfolioId: string, amount: number): Transaction
```

**Example:**
```typescript
import { ContractInteractions } from './blockchain/contract-interactions';
import { useWallet } from './blockchain/WalletProvider';

const { signAndExecute } = useWallet();

// Create portfolio
const tx = ContractInteractions.createPortfolio();
await signAndExecute(tx);

// Deposit 100 SUI
const depositTx = ContractInteractions.depositToPortfolio('0x...', 100);
await signAndExecute(depositTx);
```

---

#### Index Fund

```typescript
// Buy index fund shares
static buyIndexFund(
  amountSui: number,
  amountUsdc: number,
  usdcCoinId: string
): Transaction
```

**Example:**
```typescript
// Buy index with 10 SUI and USDC
const tx = ContractInteractions.buyIndexFund(10, 0, '0xUSDC_ID');
await signAndExecute(tx);
```

---

#### Flash Loan Arbitrage

```typescript
// Execute flash loan arbitrage
static executeFlashArbitrage(amount: number): Transaction
```

**Example:**
```typescript
// Execute arbitrage with 1000 SUI
const tx = ContractInteractions.executeFlashArbitrage(1000);
await signAndExecute(tx);
```

---

#### Prediction Market

```typescript
// Place a bet on prediction market
static placeBet(
  marketId: string,
  prediction: boolean,
  amount: number
): Transaction
```

**Parameters:**
- `marketId`: Market contract ID
- `prediction`: `true` for YES, `false` for NO
- `amount`: Bet amount in SUI

**Example:**
```typescript
// Bet 50 SUI on YES
const tx = ContractInteractions.placeBet('0xMARKET_ID', true, 50);
await signAndExecute(tx);
```

---

#### Social Trading

```typescript
// Deposit into social trading vault
static depositToSocialVault(traderId: string, amount: number): Transaction

// Copy a trader (alias for depositToSocialVault)
static copyTrader(
  vaultId: string,
  treasuryId: string,
  amount: number
): Transaction
```

**Example:**
```typescript
// Copy trader with 100 SUI
const tx = ContractInteractions.depositToSocialVault('0xTRADER_ID', 100);
await signAndExecute(tx);
```

---

#### Stream Payments

```typescript
// Create payment stream
static createStream(
  recipient: string,
  amount: number,
  durationMs: number
): Transaction

// Claim vested tokens
static claimStream(streamId: string): Transaction
```

**Example:**
```typescript
// Stream 1000 SUI over 30 days
const durationMs = 30 * 24 * 60 * 60 * 1000; // 30 days
const tx = ContractInteractions.createStream('0xRECIPIENT', 1000, durationMs);
await signAndExecute(tx);

// Claim vested tokens
const claimTx = ContractInteractions.claimStream('0xSTREAM_ID');
await signAndExecute(claimTx);
```

---

#### Lossless Lottery

```typescript
// Enter lottery pool
static enterLottery(amount: number): Transaction
```

**Example:**
```typescript
// Enter with 50 SUI
const tx = ContractInteractions.enterLottery(50);
await signAndExecute(tx);
```

---

#### Cross-Chain Bridge

```typescript
// Bridge assets to another chain
static bridgeAsset(
  targetChain: string,
  assetSymbol: string,
  amount: number,
  targetAddr: string
): Transaction
```

**Parameters:**
- `targetChain`: `'ethereum'`, `'solana'`, `'polygon'`
- `assetSymbol`: `'SUI'`, `'USDC'`, `'WETH'`
- `amount`: Amount to bridge
- `targetAddr`: Destination address on target chain

**Example:**
```typescript
// Bridge 100 USDC to Ethereum
const tx = ContractInteractions.bridgeAsset(
  'ethereum',
  'USDC',
  100,
  '0xETH_ADDRESS'
);
await signAndExecute(tx);
```

---

#### Reputation ID

```typescript
// Create on-chain identity
static createIdentity(): Transaction
```

**Example:**
```typescript
const tx = ContractInteractions.createIdentity();
await signAndExecute(tx);
```

---

## AI & EmbedAPI

### generateIntent Function

Location: `src/ai/embedapi-client.ts`

Generates AI responses with intent parsing.

```typescript
async function generateIntent(
  userInput: string,
  history?: ChatMessage[]
): Promise<ParsedIntent>
```

**Parameters:**
- `userInput`: User's message
- `history`: Optional conversation history

**Returns:**
```typescript
interface ParsedIntent {
  success: boolean;
  reply?: string;           // AI response (Markdown)
  thought?: string;         // AI's internal reasoning
  suggestions?: Array<{    // Next action suggestions
    text: string;
    icon: string;
    type: string;
  }>;
  intent?: string;          // Detected intent type
  entities?: any;           // Extracted parameters
  error?: string;
}
```

**Example:**
```typescript
import { generateIntent } from './ai/embedapi-client';

const result = await generateIntent('Stake 100 SUI with highest APY');

if (result.success) {
  console.log(result.reply); // "Let me help you stake..."
  console.log(result.intent); // "stake"
  console.log(result.entities); // { amount: 100, strategy: "highest_apy" }
}
```

---

### Contract Knowledge

Location: `src/ai/contract-knowledge.ts`

```typescript
interface ContractCapability {
  id: string;
  name: string;
  description: string;
  module: string;
  functions: string[];
  prompts: string[];
}

export const SUI_CONTRACTS: ContractCapability[]
```

**Available Contracts:**
- `portfolio` - AI Robo-Advisor
- `index_fund` - Decentralized ETF
- `flash_loan` - Flash Loan Arbitrage
- `prediction_market` - Prediction Market
- `social_trading` - Copy Trading Vault
- `stream_pay` - Stream Payments
- `derivatives` - Options & Derivatives
- `lossless_lottery` - Gamified Staking
- `bridge_adaptor` - Cross-Chain Bridge
- `reputation_id` - On-Chain Identity

**Example:**
```typescript
import { SUI_CONTRACTS, getSuggestedPrompts } from './ai/contract-knowledge';

// Get all contracts
const contracts = SUI_CONTRACTS;

// Get random prompt suggestions
const prompts = getSuggestedPrompts(); // Returns 4 random prompts
```

---

## Blockchain Services

### Wallet Provider

Location: `src/blockchain/WalletProvider.tsx`

```typescript
interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  signAndExecute: (transaction: Transaction) => Promise<any>;
  disconnect: () => void;
}

const { isConnected, publicKey, signAndExecute } = useWallet();
```

**Example:**
```typescript
import { useWallet } from './blockchain/WalletProvider';

function StakeButton() {
  const { isConnected, signAndExecute } = useWallet();

  const handleStake = async () => {
    if (!isConnected) {
      alert('Please connect wallet');
      return;
    }

    const tx = ContractInteractions.stake(100);
    await signAndExecute(tx);
  };

  return <button onClick={handleStake}>Stake</button>;
}
```

---

## React Hooks

### useErrorHandler

Location: `src/hooks/useErrorHandler.ts`

Centralized error handling with user notifications.

```typescript
function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: string) => AppError,
    handleSuccess: (message: string, title?: string) => void,
    handleWarning: (message: string, title?: string) => void,
    handleInfo: (message: string, title?: string) => void,
  };
}
```

**Example:**
```typescript
import { useErrorHandler } from './hooks/useErrorHandler';

function MyComponent() {
  const { handleError, handleSuccess } = useErrorHandler();

  const performAction = async () => {
    try {
      await someAsyncOperation();
      handleSuccess('Operation completed!');
    } catch (error) {
      handleError(error, 'MyComponent.performAction');
    }
  };
}
```

---

### useAsyncError

Location: `src/hooks/useErrorHandler.ts`

Execute async operations with automatic error handling.

```typescript
function useAsyncError() {
  return {
    executeAsync: <T>(
      asyncFn: () => Promise<T>,
      options?: {
        successMessage?: string;
        errorContext?: string;
        onSuccess?: (result: T) => void;
        onError?: (error: AppError) => void;
      }
    ) => Promise<T | null>
  };
}
```

**Example:**
```typescript
import { useAsyncError } from './hooks/useErrorHandler';

function MyComponent() {
  const { executeAsync } = useAsyncError();

  const loadData = async () => {
    const data = await executeAsync(
      () => fetchDataFromAPI(),
      {
        successMessage: 'Data loaded successfully!',
        errorContext: 'Loading data',
        onSuccess: (data) => console.log('Got data:', data),
      }
    );

    if (data) {
      // Use data
    }
  };
}
```

---

### usePerformanceMonitor

Location: `src/hooks/usePerformanceMonitor.ts`

Track component performance and render counts.

```typescript
function usePerformanceMonitor(componentName: string, enabled?: boolean) {
  return {
    renderCount: number,
    markTime: (label: string) => void,
    measureTime: (startLabel: string, endLabel: string) => void,
  };
}
```

**Example:**
```typescript
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';

function Dashboard() {
  const { renderCount, markTime, measureTime } = usePerformanceMonitor('Dashboard');

  useEffect(() => {
    markTime('data-fetch-start');
    fetchData().then(() => {
      markTime('data-fetch-end');
      measureTime('data-fetch-start', 'data-fetch-end');
    });
  }, []);

  return <div>Rendered {renderCount} times</div>;
}
```

---

### useOfflineMode

Location: `src/hooks/useOfflineMode.tsx`

Detect and handle offline status.

```typescript
function useOfflineMode() {
  return {
    isOnline: boolean
  };
}
```

**Example:**
```typescript
import { useOfflineMode } from './hooks/useOfflineMode';

function MyComponent() {
  const { isOnline } = useOfflineMode();

  return (
    <div>
      {!isOnline && <div>You are offline</div>}
      {/* Your content */}
    </div>
  );
}
```

---

## Utility Functions

### Error Handling Utilities

Location: `src/utils/error-handler.ts`

#### parseError

```typescript
function parseError(error: unknown): AppError
```

Converts any error into user-friendly format.

**Example:**
```typescript
import { parseError } from './utils/error-handler';

try {
  await riskyOperation();
} catch (error) {
  const appError = parseError(error);
  console.log(appError.title);   // "Network Error"
  console.log(appError.message); // "Unable to connect..."
}
```

---

#### validateAmount

```typescript
function validateAmount(amount: string | number): {
  valid: boolean;
  error?: string;
}
```

**Example:**
```typescript
import { validateAmount } from './utils/error-handler';

const validation = validateAmount('100');
if (!validation.valid) {
  console.error(validation.error);
}
```

---

#### isValidSuiAddress

```typescript
function isValidSuiAddress(address: string): boolean
```

**Example:**
```typescript
import { isValidSuiAddress } from './utils/error-handler';

if (!isValidSuiAddress('0x123...')) {
  alert('Invalid Sui address');
}
```

---

#### retryWithBackoff

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries?: number,
  initialDelay?: number
): Promise<T>
```

**Example:**
```typescript
import { retryWithBackoff } from './utils/error-handler';

const data = await retryWithBackoff(
  () => fetch('/api/data').then(r => r.json()),
  3,    // max retries
  1000  // initial delay (ms)
);
```

---

## Error Handling

### Error Types

```typescript
enum ErrorType {
  NETWORK = 'network',
  WALLET = 'wallet',
  CONTRACT = 'contract',
  VALIDATION = 'validation',
  API = 'api',
  UNKNOWN = 'unknown',
}
```

### AppError Interface

```typescript
interface AppError {
  type: ErrorType;
  title: string;
  message: string;
  originalError?: Error;
  retry?: () => void;
}
```

---

## Component APIs

### ErrorBoundary

```typescript
<ErrorBoundary
  fallback={<CustomErrorUI />}  // Optional
  onError={(error, errorInfo) => {}}  // Optional
>
  <YourApp />
</ErrorBoundary>
```

---

### LoadingState

```typescript
<LoadingState
  message="Loading..."
  size="small" | "medium" | "large"
  fullScreen={false}
/>
```

---

### Skeleton

```typescript
<Skeleton
  className="h-4 w-full"
  count={3}
  type="text" | "circle" | "rect"
/>

<CardSkeleton />
<TableSkeleton rows={5} columns={4} />
```

---

### LazyLoad

```typescript
const Dashboard = lazy(() => import('./Dashboard'));

<LazyLoad
  component={Dashboard}
  fallback={<CustomLoader />}  // Optional
/>
```

---

### TransactionHandler

```typescript
<TransactionHandler>
  {({ executeTransaction, isLoading }) => (
    <button
      onClick={() => executeTransaction(
        () => ContractInteractions.stake(amount),
        {
          successMessage: 'Staked!',
          requireAmount: amount,
        }
      )}
      disabled={isLoading}
    >
      {isLoading ? 'Processing...' : 'Stake'}
    </button>
  )}
</TransactionHandler>
```

---

### ConfirmTransactionModal

```typescript
<ConfirmTransactionModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="Confirm Stake"
  details={[
    { label: 'Amount', value: '100 SUI' },
    { label: 'Validator', value: '0x...' },
  ]}
  warning="This action cannot be undone"
  isLoading={loading}
/>
```

---

## Type Definitions

### Transaction

```typescript
import { Transaction } from '@mysten/sui/transactions';
```

### ChatMessage

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

---

## Constants

### Contract Addresses

Location: `src/lib/constants.ts`

```typescript
export const CONTRACTS = {
  RWA_REGISTRY: '0x3fbda5bad770f8a81d1d84741f1bc508a2f30275203c667ef1cc27fb88f750d2',
  RWA_NFT: '0x33bd2f7e8b9032625fb2647bc840eeed71e4c2e7fa8a3f2b65d869a2472fc710',
  CORE: '0x9cab3a40743b2ee7d6aedb268135fda191d94b14c90a9201d5a713c085b216c4',
};

export const SHARED_OBJECTS = {
  LOSSLESS_POOL: '0x...',
  BRIDGE_CONFIG: '0x...',
};
```

---

## Best Practices

### 1. Always Use Error Handling

```typescript
// ❌ Bad
await someOperation();

// ✅ Good
const { handleError } = useErrorHandler();
try {
  await someOperation();
} catch (error) {
  handleError(error, 'Context');
}

// ✅ Better
const { executeAsync } = useAsyncError();
await executeAsync(() => someOperation());
```

---

### 2. Validate Before Transaction

```typescript
// ✅ Good
if (!isValidSuiAddress(address)) {
  alert('Invalid address');
  return;
}

const validation = validateAmount(amount);
if (!validation.valid) {
  alert(validation.error);
  return;
}

const tx = ContractInteractions.stake(amount);
await signAndExecute(tx);
```

---

### 3. Use TransactionHandler

```typescript
// ✅ Recommended
<TransactionHandler>
  {({ executeTransaction }) => (
    <button onClick={() => executeTransaction(...)}>
      Stake
    </button>
  )}
</TransactionHandler>
```

---

### 4. Lazy Load Heavy Components

```typescript
// ✅ Good for large pages
const Dashboard = lazy(() => import('./Dashboard'));
```

---

### 5. Monitor Performance

```typescript
// ✅ Good for critical components
const { renderCount } = usePerformanceMonitor('ExpensiveComponent');
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/x5engine/SuiCompass-Protocol/issues)
- **Docs:** This file
- **Examples:** See `src/components/pages/` for usage examples

---

**Last Updated:** March 22, 2026
**Version:** 1.0.0
