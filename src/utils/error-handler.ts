/**
 * Error Handler Utilities
 * Centralized error handling and user-friendly error messages
 */

export enum ErrorType {
  NETWORK = 'network',
  WALLET = 'wallet',
  CONTRACT = 'contract',
  VALIDATION = 'validation',
  API = 'api',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
  originalError?: Error;
  retry?: () => void;
}

/**
 * Parse error and return user-friendly message
 */
export function parseError(error: unknown): AppError {
  // Handle null/undefined
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      title: 'Unknown Error',
      message: 'An unexpected error occurred.',
    };
  }

  // Handle Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    ) {
      return {
        type: ErrorType.NETWORK,
        title: 'Network Error',
        message:
          'Unable to connect to the network. Please check your internet connection and try again.',
        originalError: error,
      };
    }

    // Wallet errors
    if (
      message.includes('wallet') ||
      message.includes('user rejected') ||
      message.includes('denied') ||
      message.includes('cancelled')
    ) {
      return {
        type: ErrorType.WALLET,
        title: 'Wallet Error',
        message: 'Transaction was rejected. Please try again if this was unintentional.',
        originalError: error,
      };
    }

    // Insufficient funds
    if (message.includes('insufficient') || message.includes('balance')) {
      return {
        type: ErrorType.WALLET,
        title: 'Insufficient Balance',
        message: 'You do not have enough funds to complete this transaction.',
        originalError: error,
      };
    }

    // Gas errors
    if (message.includes('gas') || message.includes('fee')) {
      return {
        type: ErrorType.CONTRACT,
        title: 'Gas Error',
        message: 'Transaction gas estimation failed. Try increasing gas limit or check your balance.',
        originalError: error,
      };
    }

    // Smart contract errors
    if (
      message.includes('contract') ||
      message.includes('execution') ||
      message.includes('revert')
    ) {
      return {
        type: ErrorType.CONTRACT,
        title: 'Contract Error',
        message: 'Smart contract execution failed. Please verify your inputs and try again.',
        originalError: error,
      };
    }

    // Validation errors
    if (message.includes('invalid') || message.includes('validation')) {
      return {
        type: ErrorType.VALIDATION,
        title: 'Validation Error',
        message: 'Invalid input. Please check your data and try again.',
        originalError: error,
      };
    }

    // API errors
    if (message.includes('api') || message.includes('404') || message.includes('500')) {
      return {
        type: ErrorType.API,
        title: 'API Error',
        message: 'Unable to reach the server. Please try again later.',
        originalError: error,
      };
    }

    // Generic error with message
    return {
      type: ErrorType.UNKNOWN,
      title: 'Error',
      message: error.message || 'An unexpected error occurred.',
      originalError: error,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      title: 'Error',
      message: error,
    };
  }

  // Handle unknown error types
  return {
    type: ErrorType.UNKNOWN,
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Log error to console with context
 */
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}]` : '';

  console.error(`${timestamp} ${contextStr} Error:`, error);

  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { tags: { context } });
}

/**
 * Retry wrapper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logError(lastError, `Retry attempt ${i + 1}/${maxRetries}`);

      // Don't wait after last attempt
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries reached');
}

/**
 * Safe async wrapper that catches errors
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logError(error, 'safeAsync');
    return fallback;
  }
}

/**
 * Validate Sui address format
 */
export function isValidSuiAddress(address: string): boolean {
  if (!address) return false;
  // Sui addresses start with 0x and are 64 hex characters (plus 0x prefix)
  const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/;
  return suiAddressRegex.test(address);
}

/**
 * Validate amount input
 */
export function validateAmount(amount: string | number): {
  valid: boolean;
  error?: string;
} {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num)) {
    return { valid: false, error: 'Please enter a valid number' };
  }

  if (num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (num > 1e12) {
    return { valid: false, error: 'Amount is too large' };
  }

  return { valid: true };
}

/**
 * Create error with retry function
 */
export function createRetryableError(
  error: AppError,
  retryFn: () => void
): AppError {
  return {
    ...error,
    retry: retryFn,
  };
}
