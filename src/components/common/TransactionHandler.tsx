import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { validateAmount, isValidSuiAddress } from '../../utils/error-handler';
import { playSound } from '../../utils/sound-effects';
import LoadingState from './LoadingState';

interface TransactionHandlerProps {
  children: (props: {
    executeTransaction: (
      transactionFn: () => Promise<any>,
      options?: TransactionOptions
    ) => Promise<boolean>;
    isLoading: boolean;
  }) => React.ReactNode;
}

interface TransactionOptions {
  successMessage?: string;
  onSuccess?: () => void;
  skipWalletCheck?: boolean;
  requireAddress?: string;
  requireAmount?: number;
}

/**
 * Transaction Handler Component
 * Provides a reusable wrapper for handling blockchain transactions
 */
export function TransactionHandler({ children }: TransactionHandlerProps) {
  const { isConnected, signAndExecute } = useWallet();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const executeTransaction = async (
    transactionFn: () => Promise<any>,
    options: TransactionOptions = {}
  ): Promise<boolean> => {
    // Check wallet connection
    if (!options.skipWalletCheck && !isConnected) {
      handleWarning('Please connect your wallet first.', 'Wallet Not Connected');
      return false;
    }

    // Validate address if required
    if (options.requireAddress && !isValidSuiAddress(options.requireAddress)) {
      handleError(new Error('Invalid Sui address format'), 'Address Validation');
      return false;
    }

    // Validate amount if required
    if (options.requireAmount !== undefined) {
      const validation = validateAmount(options.requireAmount);
      if (!validation.valid) {
        handleError(new Error(validation.error), 'Amount Validation');
        return false;
      }
    }

    setIsLoading(true);
    playSound('click').catch(() => {});

    try {
      await transactionFn();

      playSound('success').catch(() => {});
      if (options.successMessage) {
        handleSuccess(options.successMessage);
      }

      if (options.onSuccess) {
        options.onSuccess();
      }

      return true;
    } catch (error) {
      handleError(error, 'Transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return <>{children({ executeTransaction, isLoading })}</>;
}

/**
 * Transaction Confirmation Modal
 */
interface ConfirmTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  details: Array<{ label: string; value: string | number }>;
  warning?: string;
  isLoading?: boolean;
}

export function ConfirmTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  details,
  warning,
  isLoading = false,
}: ConfirmTransactionProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">Please review before confirming</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Transaction Details */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{detail.label}</span>
              <span className="text-white font-mono font-bold">{detail.value}</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        {warning && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex gap-3">
            <svg
              className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
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
            <p className="text-sm text-amber-200">{warning}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
