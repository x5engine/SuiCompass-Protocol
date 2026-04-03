/**
 * Rate Limiting Hook
 *
 * Provides rate limiting functionality to prevent transaction spam
 * and API abuse. Tracks request counts per user/key within time windows.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { showNotification } from '../components/ui/Notification';

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  key?: string;
  onLimitExceeded?: (remainingTime: number) => void;
  showToast?: boolean;
}

// Global storage for rate limit data (persists across component re-renders)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Hook for rate limiting user actions
 *
 * @param options - Rate limit configuration
 * @returns Rate limit state and functions
 */
export function useRateLimit(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    key = 'default',
    onLimitExceeded,
    showToast = true,
  } = options;

  const [isLimited, setIsLimited] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  /**
   * Checks if the action is within rate limit
   */
  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // No previous requests
    if (!entry) {
      rateLimitStore.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now,
      });
      return true;
    }

    // Check if window has expired
    const timeSinceFirst = now - entry.firstRequest;
    if (timeSinceFirst > windowMs) {
      // Window expired, reset counter
      rateLimitStore.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now,
      });
      setIsLimited(false);
      setRemainingTime(0);
      return true;
    }

    // Within window, check if limit exceeded
    if (entry.count >= maxRequests) {
      const timeRemaining = Math.ceil((windowMs - timeSinceFirst) / 1000);
      setIsLimited(true);
      setRemainingTime(timeRemaining);

      if (showToast) {
        showNotification({
          type: 'warning',
          title: 'Rate Limit Exceeded',
          message: `Please wait ${timeRemaining} seconds before trying again.`,
          duration: 4000,
        });
      }

      if (onLimitExceeded) {
        onLimitExceeded(timeRemaining);
      }

      // Set up timer to reset UI state
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsLimited(false);
        setRemainingTime(0);
      }, timeSinceFirst);

      return false;
    }

    // Increment counter
    rateLimitStore.set(key, {
      ...entry,
      count: entry.count + 1,
      lastRequest: now,
    });

    return true;
  }, [key, maxRequests, windowMs, onLimitExceeded, showToast]);

  /**
   * Gets remaining requests in current window
   */
  const getRemainingRequests = useCallback((): number => {
    const entry = rateLimitStore.get(key);
    if (!entry) return maxRequests;

    const now = Date.now();
    const timeSinceFirst = now - entry.firstRequest;

    // Window expired
    if (timeSinceFirst > windowMs) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  }, [key, maxRequests, windowMs]);

  /**
   * Resets the rate limit for this key
   */
  const resetLimit = useCallback(() => {
    rateLimitStore.delete(key);
    setIsLimited(false);
    setRemainingTime(0);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [key]);

  /**
   * Gets time until rate limit resets (in seconds)
   */
  const getResetTime = useCallback((): number => {
    const entry = rateLimitStore.get(key);
    if (!entry) return 0;

    const now = Date.now();
    const timeSinceFirst = now - entry.firstRequest;
    const remaining = windowMs - timeSinceFirst;

    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, [key, windowMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    checkLimit,
    isLimited,
    remainingTime,
    getRemainingRequests,
    resetLimit,
    getResetTime,
    canProceed: !isLimited,
  };
}

/**
 * Pre-configured hook for transaction rate limiting
 * Limits to 5 transactions per minute
 */
export function useTransactionRateLimit(key: string = 'transactions') {
  return useRateLimit({
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    key: `tx_${key}`,
    showToast: true,
  });
}

/**
 * Pre-configured hook for API call rate limiting
 * Limits to 30 calls per minute
 */
export function useApiRateLimit(endpoint: string) {
  return useRateLimit({
    maxRequests: 30,
    windowMs: 60000, // 1 minute
    key: `api_${endpoint}`,
    showToast: false,
  });
}

/**
 * Pre-configured hook for chat message rate limiting
 * Limits to 10 messages per minute
 */
export function useChatRateLimit() {
  return useRateLimit({
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    key: 'chat_messages',
    showToast: true,
  });
}

/**
 * Hook for throttling function calls
 * Ensures a function is not called more than once per delay period
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        lastRun.current = now;
        return callback(...args);
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            lastRun.current = Date.now();
            callback(...args);
          },
          delay - timeSinceLastRun
        );
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledFunction;
}

/**
 * Hook for debouncing function calls
 * Delays function execution until after delay period of inactivity
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunction;
}

/**
 * Clears all rate limit data (useful for testing or admin reset)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Gets rate limit statistics for debugging
 */
export function getRateLimitStats(): Map<string, RateLimitEntry> {
  return new Map(rateLimitStore);
}
