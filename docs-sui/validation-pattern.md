# Form Validation Pattern

**Standard pattern for adding validation to all transaction pages**

This document provides the standardized validation pattern applied across all transaction pages in the SuiCompass application.

---

## Import Required Utilities

```typescript
import { validateAmount, validateSuiAddress, validateTransactionParams } from '../../utils/validation';
import { useTransactionRateLimit } from '../../hooks/useRateLimit';
```

---

## Component State

Add these state variables to your component:

```typescript
export default function YourTransactionPage() {
  const { signAndExecute, isConnected } = useWallet();
  const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('your-page-key');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState<string>('');

  // ... rest of component
}
```

---

## Transaction Handler Pattern

```typescript
const handleTransaction = async () => {
  // 1. Clear previous errors
  setValidationError('');

  // 2. Check wallet connection
  if (!isConnected) {
    showNotification({
      type: 'error',
      title: 'Wallet Not Connected',
      message: 'Please connect your wallet first.'
    });
    return;
  }

  // 3. Validate inputs
  const amountValidation = validateAmount(amount, {
    min: 0.01,
    max: 1000000,
    fieldName: 'Amount'
  });

  if (!amountValidation.valid) {
    setValidationError(amountValidation.error!);
    showNotification({
      type: 'error',
      title: 'Invalid Input',
      message: amountValidation.error!
    });
    return;
  }

  // 4. Check rate limit
  if (!checkLimit()) {
    showNotification({
      type: 'warning',
      title: 'Rate Limit',
      message: `Please wait ${remainingTime} seconds before your next transaction.`
    });
    return;
  }

  // 5. Execute transaction
  setLoading(true);

  try {
    const tx = ContractInteractions.yourMethod(amountValidation.sanitized);
    await signAndExecute(tx);

    showNotification({
      type: 'success',
      title: 'Success!',
      message: 'Transaction completed successfully.'
    });

    // Reset form
    setAmount('');
    setValidationError('');
  } catch (error: any) {
    console.error('Transaction error:', error);

    // Parse error message
    let errorMessage = 'Transaction failed.';
    if (error.message?.includes('Insufficient')) {
      errorMessage = 'Insufficient balance.';
    } else if (error.message?.includes('User rejected')) {
      // Silent for user rejection
      return;
    } else if (error.message?.includes('gas')) {
      errorMessage = 'Insufficient gas fees.';
    }

    showNotification({
      type: 'error',
      title: 'Transaction Failed',
      message: errorMessage
    });
  } finally {
    setLoading(false);
  }
};
```

---

## Input Field Pattern

```typescript
<input
  type="number"
  value={amount}
  onChange={(e) => {
    setAmount(e.target.value);
    setValidationError('');
  }}
  className={`flex-1 bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none ${
    validationError
      ? 'border-rose-500 focus:border-rose-500'
      : 'border-slate-700 focus:border-cyan-500'
  }`}
  placeholder="Enter amount"
  disabled={loading}
/>

{validationError && (
  <p className="text-xs text-rose-400 mt-2">
    ⚠️ {validationError}
  </p>
)}
```

---

## Submit Button Pattern

```typescript
<button
  onClick={handleTransaction}
  disabled={loading || !canProceed || !isConnected}
  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  title={!canProceed ? `Wait ${remainingTime}s` : ''}
>
  {loading
    ? 'Processing...'
    : !canProceed
    ? `Wait ${remainingTime}s`
    : 'Submit'}
</button>
```

---

## Pages Updated

The following pages have been updated with this validation pattern:

1. ✅ **SocialTradingPage** - Copy trader deposits
2. ✅ **StreamPaymentsPage** - Create payment streams
3. ✅ **BridgePage** - Cross-chain transfers
4. ✅ **PortfolioPage** - Portfolio deposits
5. ✅ **IndexFundPage** - Index fund purchases
6. ✅ **FlashLoanPage** - Flash loan execution
7. ✅ **PredictionMarketPage** - Market bets
8. ✅ **LosslessLotteryPage** - Lottery entries
9. ✅ **DerivativesPage** - Options trading
10. ✅ **RWAPage** - Asset tokenization
11. ✅ **Dashboard/ValidatorPerformance** - Staking operations

---

## Validation Types

### Amount Validation

```typescript
validateAmount(amount, {
  min: 0.01,
  max: 1000000,
  fieldName: 'Stake Amount',
  allowZero: false,
  decimals: 9
});
```

### Address Validation

```typescript
validateSuiAddress(address);
```

### Positive Integer Validation

```typescript
validatePositiveInteger(count, 'Ticket Count');
```

### Duration Validation

```typescript
validateDuration(durationMs, 60000, 31536000000);
```

### Transaction Parameters Validation

```typescript
validateTransactionParams({
  amount: amount,
  recipient: recipientAddress,
  duration: durationMs
});
```

---

## Rate Limiting

### Transaction Rate Limit (5 per minute)

```typescript
const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('page-key');
```

### Custom Rate Limit

```typescript
const rateLimit = useRateLimit({
  maxRequests: 10,
  windowMs: 60000,
  key: 'custom-action',
  showToast: true
});
```

---

## Error Handling

### Common Error Patterns

```typescript
catch (error: any) {
  if (error.message?.includes('Insufficient')) {
    return 'Insufficient balance';
  }
  if (error.message?.includes('User rejected')) {
    return; // Silent
  }
  if (error.message?.includes('gas')) {
    return 'Insufficient gas fees';
  }
  if (error.message?.includes('Network')) {
    return 'Network error. Please try again.';
  }
  return 'Transaction failed';
}
```

---

## Testing Checklist

For each page updated:

- [ ] Invalid amounts rejected (negative, zero, NaN)
- [ ] Amounts below minimum rejected
- [ ] Amounts above maximum rejected
- [ ] Invalid addresses rejected
- [ ] Rate limit enforced after 5 rapid transactions
- [ ] Error messages displayed clearly
- [ ] Submit button disabled during loading
- [ ] Submit button disabled when rate limited
- [ ] Form clears after successful transaction
- [ ] Wallet connection checked before submission

---

**Last Updated:** March 29, 2026
**Status:** Implementation Complete
