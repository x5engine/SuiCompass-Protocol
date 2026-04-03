import { useCallback } from 'react';
import { parseError, logError, AppError } from '../utils/error-handler';
import { showNotification } from '../components/ui/Notification';
import { playSound } from '../utils/sound-effects';

/**
 * Custom hook for centralized error handling
 */
export function useErrorHandler() {
  const handleError = useCallback((error: unknown, context?: string) => {
    // Log error with context
    logError(error, context);

    // Parse error to user-friendly format
    const appError: AppError = parseError(error);

    // Play error sound
    playSound('error').catch(() => {
      // Silently fail if sound doesn't play
    });

    // Show notification to user
    showNotification({
      type: 'error',
      title: appError.title,
      message: appError.message,
    });

    return appError;
  }, []);

  const handleSuccess = useCallback((message: string, title: string = 'Success') => {
    playSound('success').catch(() => {});
    showNotification({
      type: 'success',
      title,
      message,
    });
  }, []);

  const handleWarning = useCallback((message: string, title: string = 'Warning') => {
    showNotification({
      type: 'warning',
      title,
      message,
    });
  }, []);

  const handleInfo = useCallback((message: string, title: string = 'Info') => {
    showNotification({
      type: 'info',
      title,
      message,
    });
  }, []);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncError() {
  const { handleError, handleSuccess } = useErrorHandler();

  const executeAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      options?: {
        successMessage?: string;
        errorContext?: string;
        onSuccess?: (result: T) => void;
        onError?: (error: AppError) => void;
      }
    ): Promise<T | null> => {
      try {
        const result = await asyncFn();

        if (options?.successMessage) {
          handleSuccess(options.successMessage);
        }

        if (options?.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        const appError = handleError(error, options?.errorContext);

        if (options?.onError) {
          options.onError(appError);
        }

        return null;
      }
    },
    [handleError, handleSuccess]
  );

  return { executeAsync };
}
