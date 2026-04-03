import React, { useState, useEffect } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';
import { validateAmount, validateSuiAddress, validatePositiveInteger } from '../../utils/validation';
import { useTransactionRateLimit } from '../../hooks/useRateLimit';

interface Stream {
  id: string;
  recipient: string;
  totalAmount: number;
  startTime: number;
  endTime: number;
  claimed: number;
  isActive: boolean;
}

export default function StreamPaymentsPage() {
  const { signAndExecute, isConnected, publicKey } = useWallet();
  const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('stream-payments');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'incoming' | 'outgoing'>('create');

  // Form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('1000');
  const [duration, setDuration] = useState('30');
  const [validationErrors, setValidationErrors] = useState<{
    recipient?: string;
    amount?: string;
    duration?: string;
  }>({});

  // Mock streams
  const [outgoingStreams, setOutgoingStreams] = useState<Stream[]>([
    {
      id: '0xstream1',
      recipient: '0x742d...89bc',
      totalAmount: 1000,
      startTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 20 * 24 * 60 * 60 * 1000,
      claimed: 333,
      isActive: true
    }
  ]);

  const [incomingStreams, setIncomingStreams] = useState<Stream[]>([
    {
      id: '0xstream2',
      recipient: publicKey || '0x...',
      totalAmount: 500,
      startTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
      endTime: Date.now() + 25 * 24 * 60 * 60 * 1000,
      claimed: 83.3,
      isActive: true
    }
  ]);

  const createStream = async () => {
    // Clear previous errors
    setValidationErrors({});

    // 1. Check wallet connection
    if (!isConnected) {
      showNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first.'
      });
      return;
    }

    // 2. Validate recipient address
    const recipientValidation = validateSuiAddress(recipient);
    if (!recipientValidation.valid) {
      setValidationErrors({ recipient: recipientValidation.error });
      showNotification({
        type: 'error',
        title: 'Invalid Recipient',
        message: recipientValidation.error!
      });
      return;
    }

    // 3. Validate amount
    const amountValidation = validateAmount(amount, {
      min: 1,
      max: 10000000,
      fieldName: 'Stream Amount'
    });
    if (!amountValidation.valid) {
      setValidationErrors({ amount: amountValidation.error });
      showNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: amountValidation.error!
      });
      return;
    }

    // 4. Validate duration (1-365 days)
    const durationValidation = validatePositiveInteger(duration, 'Duration');
    if (!durationValidation.valid) {
      setValidationErrors({ duration: durationValidation.error });
      showNotification({
        type: 'error',
        title: 'Invalid Duration',
        message: durationValidation.error!
      });
      return;
    }

    const durationDays = durationValidation.sanitized as number;
    if (durationDays < 1 || durationDays > 365) {
      const error = 'Duration must be between 1 and 365 days';
      setValidationErrors({ duration: error });
      showNotification({
        type: 'error',
        title: 'Invalid Duration',
        message: error
      });
      return;
    }

    // 5. Check rate limit
    if (!checkLimit()) {
      showNotification({
        type: 'warning',
        title: 'Rate Limit',
        message: `Please wait ${remainingTime} seconds before your next transaction.`
      });
      return;
    }

    setLoading(true);
    playSound('click');

    try {
      const tx = ContractInteractions.createStream(
        recipientValidation.sanitized as string,
        amountValidation.sanitized as number,
        durationDays * 24 * 60 * 60 * 1000 // Convert days to ms
      );
      await signAndExecute(tx);
      playSound('success');
      showNotification({
        type: 'success',
        title: 'Stream Created!',
        message: `Streaming ${amountValidation.sanitized} SUI over ${durationDays} days.`
      });

      // Reset form
      setRecipient('');
      setAmount('1000');
      setDuration('30');
      setValidationErrors({});
    } catch (error: any) {
      console.error('Transaction error:', error);

      let errorMessage = 'Failed to create stream.';
      if (error.message?.includes('Insufficient')) {
        errorMessage = 'Insufficient balance for stream amount plus gas fees.';
      } else if (error.message?.includes('User rejected')) {
        return; // Silent for user rejection
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

  const claimVested = async (streamId: string) => {
    if (!isConnected) return;

    setLoading(true);
    playSound('click');

    try {
      const tx = ContractInteractions.claimStream(streamId);
      await signAndExecute(tx);
      playSound('success');
      showNotification({
        type: 'success',
        title: 'Claimed Successfully!',
        message: 'Vested tokens have been transferred to your wallet.'
      });
    } catch (error) {
      console.error(error);
      showNotification({
        type: 'error',
        title: 'Claim Failed',
        message: 'Failed to claim vested tokens.'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateVested = (stream: Stream): number => {
    const now = Date.now();
    const elapsed = now - stream.startTime;
    const total = stream.endTime - stream.startTime;
    const vested = (elapsed / total) * stream.totalAmount;
    return Math.min(vested, stream.totalAmount);
  };

  const calculateClaimable = (stream: Stream): number => {
    return Math.max(0, calculateVested(stream) - stream.claimed);
  };

  const StreamCard = ({ stream, isIncoming }: { stream: Stream; isIncoming: boolean }) => {
    const vested = calculateVested(stream);
    const claimable = calculateClaimable(stream);
    const progress = (vested / stream.totalAmount) * 100;

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-slate-400 text-sm mb-1">
              {isIncoming ? 'From' : 'To'}
            </div>
            <div className="text-white font-mono text-lg">{stream.recipient}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-sm mb-1">Total Amount</div>
            <div className="text-white font-bold text-xl">{stream.totalAmount} SUI</div>
          </div>
        </div>

        {/* Progress Bar with Animation */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Vested Progress</span>
            <span className="text-cyan-400 font-bold">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-slate-950 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 relative"
              style={{ width: `${progress}%` }}
            >
              {/* Flowing animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-950/50 rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Vested</div>
            <div className="text-emerald-400 font-bold">{vested.toFixed(1)}</div>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Claimed</div>
            <div className="text-slate-300 font-bold">{stream.claimed.toFixed(1)}</div>
          </div>
          <div className="bg-slate-950/50 rounded-xl p-3">
            <div className="text-slate-500 text-xs mb-1">Claimable</div>
            <div className="text-cyan-400 font-bold">{claimable.toFixed(1)}</div>
          </div>
        </div>

        {isIncoming && claimable > 0 && (
          <button
            onClick={() => claimVested(stream.id)}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Claiming...' : `Claim ${claimable.toFixed(2)} SUI`}
          </button>
        )}

        <div className="text-xs text-slate-500 flex justify-between">
          <span>Started {new Date(stream.startTime).toLocaleDateString()}</span>
          <span>Ends {new Date(stream.endTime).toLocaleDateString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Stream Payments</h1>
        <p className="text-slate-400">
          Real-time token vesting. Perfect for payroll, subscriptions, and continuous payments.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-800 pb-1">
        {['create', 'incoming', 'outgoing'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              playSound('click');
            }}
            className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'create' ? 'Create Stream' : tab === 'incoming' ? 'Receiving' : 'Sending'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-cyan-900/20 to-slate-900 border border-cyan-500/30 rounded-2xl p-8 space-y-6">
              <div className="flex gap-4 items-center mb-4">
                <div className="text-5xl">💧</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Create New Stream</h2>
                  <p className="text-slate-400 text-sm">Set up continuous payments</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => {
                      setRecipient(e.target.value);
                      setValidationErrors(prev => ({ ...prev, recipient: undefined }));
                    }}
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white font-mono focus:outline-none ${
                      validationErrors.recipient
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-700 focus:border-cyan-500'
                    }`}
                    placeholder="0x..."
                    disabled={loading}
                  />
                  {validationErrors.recipient && (
                    <p className="text-xs text-rose-400 mt-1">⚠️ {validationErrors.recipient}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      Total Amount (SUI)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setValidationErrors(prev => ({ ...prev, amount: undefined }));
                      }}
                      className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none ${
                        validationErrors.amount
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-700 focus:border-cyan-500'
                      }`}
                      placeholder="1000"
                      min="1"
                      disabled={loading}
                    />
                    {validationErrors.amount && (
                      <p className="text-xs text-rose-400 mt-1">⚠️ {validationErrors.amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => {
                        setDuration(e.target.value);
                        setValidationErrors(prev => ({ ...prev, duration: undefined }));
                      }}
                      className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none ${
                        validationErrors.duration
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-700 focus:border-cyan-500'
                      }`}
                      placeholder="30"
                      min="1"
                      max="365"
                      disabled={loading}
                    />
                    {validationErrors.duration && (
                      <p className="text-xs text-rose-400 mt-1">⚠️ {validationErrors.duration}</p>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {amount && duration && (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Stream Rate</div>
                    <div className="text-white font-bold text-lg">
                      {(Number(amount) / Number(duration)).toFixed(2)} SUI per day
                    </div>
                  </div>
                )}

                <button
                  onClick={createStream}
                  disabled={loading || !canProceed || !isConnected || !recipient || !amount || !duration}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!canProceed ? `Wait ${remainingTime}s` : ''}
                >
                  {loading
                    ? 'Creating Stream...'
                    : !canProceed
                    ? `Wait ${remainingTime}s`
                    : 'Create Stream'}
                </button>
              </div>

              <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
                The recipient can claim vested tokens at any time. You can cancel the stream and
                reclaim unvested funds.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incomingStreams.length > 0 ? (
              incomingStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} isIncoming={true} />
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-50">💧</div>
                <p className="text-slate-400">No incoming streams yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'outgoing' && (
          <div className="space-y-4">
            {outgoingStreams.length > 0 ? (
              outgoingStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} isIncoming={false} />
              ))
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-50">💸</div>
                <p className="text-slate-400">No outgoing streams yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
