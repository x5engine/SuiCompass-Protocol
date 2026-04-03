# Security Guidelines

**SuiCompass Protocol - Security Best Practices**

This document outlines security measures, validation rules, and best practices for developing and maintaining the SuiCompass application.

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Input Validation](#input-validation)
3. [Rate Limiting](#rate-limiting)
4. [Authentication & Authorization](#authentication--authorization)
5. [Transaction Security](#transaction-security)
6. [API Security](#api-security)
7. [Frontend Security](#frontend-security)
8. [Smart Contract Security](#smart-contract-security)
9. [Reporting Security Issues](#reporting-security-issues)
10. [Security Checklist](#security-checklist)

---

## Security Overview

### Security Principles

SuiCompass follows these core security principles:

1. **Defense in Depth** - Multiple layers of security controls
2. **Least Privilege** - Minimal permissions by default
3. **Fail Secure** - System fails to a secure state
4. **Input Validation** - Trust no input, validate everything
5. **Security by Design** - Security built-in from the start

### Security Layers

```
┌─────────────────────────────────────────┐
│  Frontend Validation & Rate Limiting    │ ← First line of defense
├─────────────────────────────────────────┤
│  API Validation & Authentication        │ ← Secondary validation
├─────────────────────────────────────────┤
│  Smart Contract Validation              │ ← Final authority
├─────────────────────────────────────────┤
│  Blockchain Consensus                   │ ← Immutable records
└─────────────────────────────────────────┘
```

---

## Input Validation

### Validation Rules

All user inputs MUST be validated before processing. Use the validation utilities in `src/utils/validation.ts`.

#### Sui Address Validation

```typescript
import { validateSuiAddress } from '@/utils/validation';

const result = validateSuiAddress(address);
if (!result.valid) {
  // Show error: result.error
  return;
}
// Use result.sanitized
```

**Rules:**
- Must start with `0x`
- Must be exactly 66 characters (0x + 64 hex chars)
- Only hexadecimal characters allowed
- Case-insensitive (normalized to lowercase)

#### Amount Validation

```typescript
import { validateAmount } from '@/utils/validation';

const result = validateAmount(amount, {
  min: 0.01,
  max: 1000000,
  fieldName: 'Stake Amount',
  decimals: 9,
});

if (!result.valid) {
  // Show error: result.error
  return;
}
// Use result.sanitized
```

**Rules:**
- Must be a valid number
- Must be positive (unless allowZero: true)
- Must be within min/max range
- Maximum 9 decimal places (Sui standard)
- Cannot be Infinity or NaN

#### Integer Validation

```typescript
import { validatePositiveInteger } from '@/utils/validation';

const result = validatePositiveInteger(value, 'Ticket Count');
if (!result.valid) {
  // Show error: result.error
  return;
}
```

**Rules:**
- Must be a whole number
- Must be greater than zero
- No decimal places allowed

### Sanitization

Always sanitize user input to prevent XSS attacks:

```typescript
import { sanitizeInput } from '@/utils/validation';

const clean = sanitizeInput(userInput);
```

**Sanitization removes:**
- HTML tags (`<`, `>`)
- JavaScript protocols (`javascript:`)
- Event handlers (`onclick=`, etc.)
- Limits input to 1000 characters

### Validation Best Practices

**✅ DO:**
```typescript
// Validate at component level
const handleSubmit = () => {
  const validation = validateAmount(amount);
  if (!validation.valid) {
    setError(validation.error);
    return;
  }

  // Proceed with validated data
  executeTransaction(validation.sanitized);
};
```

**❌ DON'T:**
```typescript
// Don't trust user input directly
executeTransaction(amount); // BAD!

// Don't skip validation
if (amount > 0) {  // BAD - not comprehensive
  executeTransaction(amount);
}
```

---

## Rate Limiting

### Transaction Rate Limiting

Prevent transaction spam with built-in rate limiting:

```typescript
import { useTransactionRateLimit } from '@/hooks/useRateLimit';

function StakePage() {
  const { canProceed, checkLimit, remainingTime } = useTransactionRateLimit();

  const handleStake = async () => {
    // Check rate limit before transaction
    if (!checkLimit()) {
      // User will see toast: "Wait X seconds"
      return;
    }

    // Proceed with transaction
    await executeStake();
  };

  return (
    <button
      onClick={handleStake}
      disabled={!canProceed}
    >
      {canProceed ? 'Stake' : `Wait ${remainingTime}s`}
    </button>
  );
}
```

### Rate Limit Configuration

**Default Limits:**
- **Transactions:** 5 per minute
- **API Calls:** 30 per minute
- **Chat Messages:** 10 per minute

**Custom Rate Limits:**
```typescript
import { useRateLimit } from '@/hooks/useRateLimit';

const rateLimit = useRateLimit({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  key: 'custom-action',
  showToast: true,
});
```

### Rate Limiting Best Practices

**✅ DO:**
- Apply rate limiting to all transaction endpoints
- Show clear countdown timers to users
- Reset limits on successful completion
- Log rate limit violations for monitoring

**❌ DON'T:**
- Allow unlimited rapid-fire transactions
- Hide rate limit errors from users
- Set limits too restrictive for normal use
- Bypass rate limits in production code

---

## Authentication & Authorization

### Wallet Authentication

```typescript
import { useWallet } from '@/blockchain/WalletProvider';

function ProtectedAction() {
  const { isConnected, publicKey } = useWallet();

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  // User is authenticated
  return <ActionButton />;
}
```

**Authentication Rules:**
- Always check `isConnected` before transactions
- Validate wallet signatures
- Don't trust client-side authentication alone
- Verify ownership on-chain

### Authorization Checks

```typescript
// Check if user owns the asset
const isOwner = userAddress === assetOwner;
if (!isOwner) {
  toast.error('You do not own this asset');
  return;
}
```

---

## Transaction Security

### Transaction Validation Flow

```typescript
async function executeTransaction() {
  // 1. Validate inputs
  const amountValidation = validateAmount(amount);
  if (!amountValidation.valid) {
    return;
  }

  // 2. Check rate limit
  if (!checkRateLimit()) {
    return;
  }

  // 3. Verify wallet connected
  if (!isConnected) {
    toast.error('Wallet not connected');
    return;
  }

  // 4. Check balance
  if (balance < amount) {
    toast.error('Insufficient balance');
    return;
  }

  // 5. Build transaction
  const tx = ContractInteractions.stake(amountValidation.sanitized);

  // 6. User confirmation (optional but recommended)
  const confirmed = await confirmTransaction(tx);
  if (!confirmed) {
    return;
  }

  // 7. Execute with error handling
  try {
    const result = await signAndExecute(tx);
    toast.success('Transaction successful!');
  } catch (error) {
    handleError(error, 'Transaction');
  }
}
```

### Transaction Best Practices

**✅ DO:**
```typescript
// Show transaction preview
<ConfirmTransactionModal
  details={[
    { label: 'Amount', value: `${amount} SUI` },
    { label: 'Recipient', value: truncateAddress(recipient) },
    { label: 'Est. Gas', value: '~0.001 SUI' },
  ]}
  onConfirm={handleConfirm}
/>

// Handle all error cases
catch (error) {
  if (error.message.includes('Insufficient')) {
    toast.error('Insufficient balance');
  } else if (error.message.includes('User rejected')) {
    // Silent - user intentionally canceled
  } else {
    toast.error('Transaction failed');
  }
}
```

**❌ DON'T:**
```typescript
// Don't hide transaction details
await signAndExecute(tx); // User doesn't know what they're signing!

// Don't ignore gas costs
const amount = balance; // BAD - leaves no room for gas

// Don't retry failed transactions automatically
while (attempts < 10) {
  try { await execute(); break; }
  catch { attempts++; }
} // BAD - might drain gas
```

---

## API Security

### API Key Management

```typescript
// ✅ Correct - Use environment variables
const apiKey = import.meta.env.VITE_EMBEDAPI_KEY;

// ❌ Wrong - Never hardcode keys
const apiKey = 'sk_live_abc123...'; // NEVER DO THIS
```

**Rules:**
- Store API keys in `.env` file
- Never commit `.env` to version control
- Use `VITE_` prefix for Vite apps
- Rotate keys regularly
- Use different keys for dev/staging/prod

### API Request Security

```typescript
// Add timeout to prevent hanging
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(data),
  signal: AbortSignal.timeout(10000), // 10 second timeout
});

// Validate response
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}
```

**Best Practices:**
- Always set request timeouts
- Validate response status codes
- Handle network errors gracefully
- Don't expose API errors to users
- Log errors for debugging

---

## Frontend Security

### Content Security Policy (CSP)

CSP headers are configured in `vite.config.ts`:

```typescript
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://fullnode.mainnet.sui.io https://embedapi.com;
  frame-ancestors 'none';
```

### XSS Prevention

**✅ DO:**
```typescript
// Use React's built-in escaping
<div>{userInput}</div>  // Automatically escaped

// Sanitize before rendering
<div>{sanitizeInput(userInput)}</div>

// Use dangerouslySetInnerHTML only when necessary
<div dangerouslySetInnerHTML={{ __html: sanitized }} />
```

**❌ DON'T:**
```typescript
// Don't use dangerouslySetInnerHTML with raw user input
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // DANGEROUS!

// Don't disable CSP in production
<meta http-equiv="Content-Security-Policy" content=""> // BAD
```

### CSRF Prevention

- Use SameSite cookies
- Validate origin headers
- Use CORS properly
- Don't use GET for state-changing operations

### Local Storage Security

```typescript
// ✅ DO - Store non-sensitive data only
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');

// ❌ DON'T - Store sensitive data
localStorage.setItem('privateKey', key); // NEVER!
localStorage.setItem('password', pwd); // NEVER!
localStorage.setItem('apiKey', key); // NEVER!
```

---

## Smart Contract Security

### Transaction Parameters

Always validate parameters before building transactions:

```typescript
// Validate before building transaction
const params = {
  amount: parseFloat(amount),
  recipient: recipientAddress,
};

const validation = validateTransactionParams(params);
if (!validation.valid) {
  toast.error(validation.error);
  return;
}

// Build transaction with validated params
const tx = ContractInteractions.transfer(
  params.recipient,
  params.amount
);
```

### Gas Estimation

```typescript
// Always account for gas fees
const totalCost = amount + estimatedGas;

if (balance < totalCost) {
  toast.error(`Insufficient balance. Need ${totalCost} SUI (including gas)`);
  return;
}
```

### Contract Interaction Best Practices

**✅ DO:**
- Validate all inputs before contract calls
- Handle contract errors gracefully
- Show clear error messages to users
- Test on testnet before mainnet
- Use official contract addresses

**❌ DON'T:**
- Call contracts with unvalidated inputs
- Ignore transaction failures
- Hide contract errors from users
- Use unverified contract addresses
- Skip gas estimation

---

## Reporting Security Issues

### How to Report

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. **DO NOT** disclose publicly until fixed
3. **DO** email: security@suicompass.io (if available) or create a private security advisory on GitHub

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: 1 month

---

## Security Checklist

### Development Checklist

- [ ] All user inputs validated
- [ ] Sui addresses validated with proper format
- [ ] Amount validation with min/max ranges
- [ ] Rate limiting applied to transactions
- [ ] Error handling in all async operations
- [ ] No console.log() in production code
- [ ] No API keys in source code
- [ ] No sensitive data in localStorage
- [ ] CSP headers configured
- [ ] XSS prevention measures in place

### Code Review Checklist

- [ ] Input validation present
- [ ] Rate limiting implemented
- [ ] Error handling comprehensive
- [ ] No hardcoded secrets
- [ ] No dangerous HTML rendering
- [ ] Transaction preview shown to users
- [ ] Gas fees accounted for
- [ ] Balance checks before transactions
- [ ] Wallet connection verified

### Deployment Checklist

- [ ] Environment variables set correctly
- [ ] API keys rotated from development
- [ ] CSP headers enabled
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Error monitoring set up
- [ ] Rate limiting active
- [ ] Backup and recovery plan in place
- [ ] Incident response plan documented

---

## Common Security Pitfalls

### 1. Trusting User Input

**Problem:**
```typescript
const tx = ContractInteractions.stake(userInput); // BAD
```

**Solution:**
```typescript
const validation = validateAmount(userInput);
if (!validation.valid) return;
const tx = ContractInteractions.stake(validation.sanitized); // GOOD
```

### 2. Ignoring Rate Limits

**Problem:**
```typescript
onClick={() => executeTransaction()} // No rate limiting
```

**Solution:**
```typescript
const { checkLimit } = useTransactionRateLimit();
onClick={() => {
  if (checkLimit()) executeTransaction();
}}
```

### 3. Exposing Sensitive Data

**Problem:**
```typescript
console.log('API Key:', import.meta.env.VITE_API_KEY); // BAD
```

**Solution:**
```typescript
// Don't log sensitive data
// Use monitoring tools instead
```

### 4. Insufficient Error Handling

**Problem:**
```typescript
try {
  await transaction();
} catch (e) {
  // Silent failure
}
```

**Solution:**
```typescript
try {
  await transaction();
} catch (error) {
  handleError(error, 'Transaction');
  // Log for monitoring
  // Show user-friendly message
}
```

### 5. No Balance Checks

**Problem:**
```typescript
const tx = ContractInteractions.stake(amount);
await signAndExecute(tx); // Might fail due to insufficient balance
```

**Solution:**
```typescript
if (balance < amount + GAS_ESTIMATE) {
  toast.error('Insufficient balance');
  return;
}
const tx = ContractInteractions.stake(amount);
await signAndExecute(tx);
```

---

## Additional Resources

### Internal Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Sui Security Best Practices](https://docs.sui.io/build/security)
- [Web3 Security Guide](https://ethereum.org/en/developers/docs/security/)

---

## Security Updates

This document is regularly updated as new security measures are implemented.

**Last Updated:** March 29, 2026
**Version:** 1.0.0
**Next Review:** April 2026

---

**Stay Secure! 🔒**

Remember: Security is everyone's responsibility. If you see something suspicious, report it immediately.
