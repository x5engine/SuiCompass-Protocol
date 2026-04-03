import { useState, useEffect } from 'react';
import { showNotification } from '../components/ui/Notification';

/**
 * Hook for detecting and handling offline mode
 */
export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        showNotification({
          type: 'success',
          title: 'Back Online',
          message: 'Connection restored. You can continue using the app.',
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      showNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'You are currently offline. Some features may not work.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline };
}

/**
 * Offline Mode Indicator Component
 */
export function OfflineIndicator() {
  const { isOnline } = useOfflineMode();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-900/90 backdrop-blur-sm border-b border-amber-500/50 py-2 px-4 animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <svg
          className="w-5 h-5 text-amber-400 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-sm font-bold text-white">
          You are offline. Some features may not work.
        </span>
      </div>
    </div>
  );
}
