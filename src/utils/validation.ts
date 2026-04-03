/**
 * Comprehensive Input Validation Utilities
 *
 * Provides validation functions for all user inputs including:
 * - Sui addresses
 * - Transaction amounts
 * - Positive integers
 * - Transaction parameters
 * - Input sanitization
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string | number;
}

export interface AmountValidationOptions {
  min?: number;
  max?: number;
  fieldName?: string;
  allowZero?: boolean;
  decimals?: number;
}

export interface TransactionParams {
  amount?: number | string;
  recipient?: string;
  duration?: number;
  marketId?: string;
  traderId?: string;
  streamId?: string;
  [key: string]: any;
}

/**
 * Validates a Sui blockchain address
 *
 * @param address - The address to validate
 * @returns ValidationResult with valid status and error message
 */
export function validateSuiAddress(address: string): ValidationResult {
  if (!address || typeof address !== 'string') {
    return {
      valid: false,
      error: 'Address is required',
    };
  }

  const trimmed = address.trim();

  // Check if address starts with 0x
  if (!trimmed.startsWith('0x')) {
    return {
      valid: false,
      error: 'Sui address must start with 0x',
    };
  }

  // Remove 0x prefix for length check
  const addressWithoutPrefix = trimmed.slice(2);

  // Sui addresses are 64 hex characters (32 bytes) after 0x
  if (addressWithoutPrefix.length !== 64) {
    return {
      valid: false,
      error: 'Sui address must be 66 characters (0x + 64 hex characters)',
    };
  }

  // Check if all characters are valid hexadecimal
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (!hexRegex.test(addressWithoutPrefix)) {
    return {
      valid: false,
      error: 'Sui address must contain only hexadecimal characters',
    };
  }

  return {
    valid: true,
    sanitized: trimmed.toLowerCase(), // Normalize to lowercase
  };
}

/**
 * Validates a numeric amount with optional constraints
 *
 * @param amount - The amount to validate (string or number)
 * @param options - Validation options (min, max, fieldName, allowZero, decimals)
 * @returns ValidationResult with valid status and error message
 */
export function validateAmount(
  amount: string | number,
  options: AmountValidationOptions = {}
): ValidationResult {
  const {
    min = 0.000000001, // Default minimum (1 MIST for Sui)
    max = Number.MAX_SAFE_INTEGER,
    fieldName = 'Amount',
    allowZero = false,
    decimals = 9, // Sui has 9 decimals
  } = options;

  // Convert to string for consistent handling
  const amountStr = String(amount).trim();

  // Check if empty
  if (!amountStr) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  // Check if valid number
  const numericValue = Number(amountStr);
  if (isNaN(numericValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  // Check if finite
  if (!isFinite(numericValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a finite number`,
    };
  }

  // Check if zero (when not allowed)
  if (numericValue === 0 && !allowZero) {
    return {
      valid: false,
      error: `${fieldName} must be greater than zero`,
    };
  }

  // Check if negative
  if (numericValue < 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be negative`,
    };
  }

  // Check minimum
  if (numericValue < min && numericValue !== 0) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  // Check maximum
  if (numericValue > max) {
    return {
      valid: false,
      error: `${fieldName} cannot exceed ${max.toLocaleString()}`,
    };
  }

  // Check decimal places
  const decimalPart = amountStr.split('.')[1];
  if (decimalPart && decimalPart.length > decimals) {
    return {
      valid: false,
      error: `${fieldName} cannot have more than ${decimals} decimal places`,
    };
  }

  return {
    valid: true,
    sanitized: numericValue,
  };
}

/**
 * Validates a positive integer
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult with valid status and error message
 */
export function validatePositiveInteger(
  value: string | number,
  fieldName: string = 'Value'
): ValidationResult {
  const valueStr = String(value).trim();

  if (!valueStr) {
    return {
      valid: false,
      error: `${fieldName} is required`,
    };
  }

  const numericValue = Number(valueStr);

  if (isNaN(numericValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a valid number`,
    };
  }

  if (!Number.isInteger(numericValue)) {
    return {
      valid: false,
      error: `${fieldName} must be a whole number`,
    };
  }

  if (numericValue <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be greater than zero`,
    };
  }

  return {
    valid: true,
    sanitized: numericValue,
  };
}

/**
 * Validates duration in milliseconds
 *
 * @param durationMs - Duration in milliseconds
 * @param minMs - Minimum allowed duration
 * @param maxMs - Maximum allowed duration
 * @returns ValidationResult
 */
export function validateDuration(
  durationMs: number,
  minMs: number = 60000, // 1 minute
  maxMs: number = 31536000000 // 1 year
): ValidationResult {
  if (!durationMs || typeof durationMs !== 'number') {
    return {
      valid: false,
      error: 'Duration is required',
    };
  }

  if (durationMs < minMs) {
    const minMinutes = Math.floor(minMs / 60000);
    return {
      valid: false,
      error: `Duration must be at least ${minMinutes} minute${minMinutes > 1 ? 's' : ''}`,
    };
  }

  if (durationMs > maxMs) {
    const maxDays = Math.floor(maxMs / 86400000);
    return {
      valid: false,
      error: `Duration cannot exceed ${maxDays} days`,
    };
  }

  return {
    valid: true,
    sanitized: durationMs,
  };
}

/**
 * Validates transaction parameters based on type
 *
 * @param params - Transaction parameters object
 * @returns ValidationResult with valid status and error message
 */
export function validateTransactionParams(params: TransactionParams): ValidationResult {
  const errors: string[] = [];

  // Validate amount if present
  if (params.amount !== undefined) {
    const amountResult = validateAmount(params.amount);
    if (!amountResult.valid) {
      errors.push(amountResult.error!);
    }
  }

  // Validate recipient address if present
  if (params.recipient) {
    const addressResult = validateSuiAddress(params.recipient);
    if (!addressResult.valid) {
      errors.push(`Recipient: ${addressResult.error}`);
    }
  }

  // Validate duration if present
  if (params.duration !== undefined) {
    const durationResult = validateDuration(params.duration);
    if (!durationResult.valid) {
      errors.push(durationResult.error!);
    }
  }

  // Validate object IDs (marketId, traderId, streamId, etc.)
  const objectIdFields = ['marketId', 'traderId', 'streamId', 'portfolioId', 'vaultId'];
  for (const field of objectIdFields) {
    if (params[field]) {
      const result = validateSuiAddress(params[field]);
      if (!result.valid) {
        const fieldLabel = field.replace(/Id$/, ' ID');
        errors.push(`${fieldLabel}: ${result.error}`);
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
    };
  }

  return {
    valid: true,
  };
}

/**
 * Sanitizes user input by removing potentially harmful characters
 *
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets (XSS prevention)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
}

/**
 * Validates an email address
 *
 * @param email - Email address to validate
 * @returns ValidationResult
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email is required',
    };
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid email format',
    };
  }

  if (trimmed.length > 254) {
    return {
      valid: false,
      error: 'Email is too long',
    };
  }

  return {
    valid: true,
    sanitized: trimmed,
  };
}

/**
 * Validates a URL
 *
 * @param url - URL to validate
 * @param allowedProtocols - Allowed protocols (default: http, https)
 * @returns ValidationResult
 */
export function validateUrl(
  url: string,
  allowedProtocols: string[] = ['http', 'https']
): ValidationResult {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL is required',
    };
  }

  const trimmed = url.trim();

  try {
    const urlObj = new URL(trimmed);

    const protocol = urlObj.protocol.replace(':', '');
    if (!allowedProtocols.includes(protocol)) {
      return {
        valid: false,
        error: `URL must use one of these protocols: ${allowedProtocols.join(', ')}`,
      };
    }

    return {
      valid: true,
      sanitized: trimmed,
    };
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Validates a percentage value (0-100)
 *
 * @param percentage - Percentage value to validate
 * @param fieldName - Name of the field for error messages
 * @returns ValidationResult
 */
export function validatePercentage(
  percentage: string | number,
  fieldName: string = 'Percentage'
): ValidationResult {
  return validateAmount(percentage, {
    min: 0,
    max: 100,
    fieldName,
    allowZero: true,
    decimals: 2,
  });
}

/**
 * Validates a chain name for bridge operations
 *
 * @param chain - Chain name to validate
 * @returns ValidationResult
 */
export function validateChain(chain: string): ValidationResult {
  const validChains = ['ethereum', 'solana', 'polygon', 'sui'];

  if (!chain || typeof chain !== 'string') {
    return {
      valid: false,
      error: 'Chain is required',
    };
  }

  const normalized = chain.toLowerCase().trim();

  if (!validChains.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid chain. Must be one of: ${validChains.join(', ')}`,
    };
  }

  return {
    valid: true,
    sanitized: normalized,
  };
}

/**
 * Validates an asset symbol
 *
 * @param symbol - Asset symbol to validate
 * @returns ValidationResult
 */
export function validateAssetSymbol(symbol: string): ValidationResult {
  const validSymbols = ['SUI', 'USDC', 'USDT', 'WETH', 'WBTC'];

  if (!symbol || typeof symbol !== 'string') {
    return {
      valid: false,
      error: 'Asset symbol is required',
    };
  }

  const normalized = symbol.toUpperCase().trim();

  if (!validSymbols.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid asset symbol. Must be one of: ${validSymbols.join(', ')}`,
    };
  }

  return {
    valid: true,
    sanitized: normalized,
  };
}

/**
 * Batch validates multiple fields
 *
 * @param validations - Object with field names and validation results
 * @returns Combined ValidationResult
 */
export function validateBatch(
  validations: Record<string, ValidationResult>
): ValidationResult {
  const errors: string[] = [];

  for (const [field, result] of Object.entries(validations)) {
    if (!result.valid) {
      errors.push(`${field}: ${result.error}`);
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      error: errors.join('; '),
    };
  }

  return {
    valid: true,
  };
}
