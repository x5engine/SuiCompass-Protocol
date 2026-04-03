import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';
import { validateAmount, validateSuiAddress } from '../../utils/validation';
import { useTransactionRateLimit } from '../../hooks/useRateLimit';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  roi: number;
  aum: number;
  riskScore: number;
  trades: number;
  winRate: number;
  followers: number;
}

export default function SocialTradingPage() {
  const { signAndExecute, isConnected } = useWallet();
  const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('social-trading');
  const [loading, setLoading] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('100');
  const [validationError, setValidationError] = useState<string>('');

  // Mock top traders
  const traders: Trader[] = [
    {
      id: '0x1',
      name: 'SuiWhale_99',
      avatar: '🐋',
      roi: 342.5,
      aum: 2400000,
      riskScore: 7.2,
      trades: 847,
      winRate: 78.5,
      followers: 1250
    },
    {
      id: '0x2',
      name: 'YieldHunter',
      avatar: '🎯',
      roi: 189.3,
      aum: 890000,
      riskScore: 4.8,
      trades: 623,
      winRate: 71.2,
      followers: 892
    },
    {
      id: '0x3',
      name: 'DeFiNinja',
      avatar: '🥷',
      roi: 256.7,
      aum: 1560000,
      riskScore: 8.1,
      trades: 1024,
      winRate: 74.8,
      followers: 1580
    },
    {
      id: '0x4',
      name: 'AlgoTrader',
      avatar: '🤖',
      roi: 145.2,
      aum: 680000,
      riskScore: 3.5,
      trades: 2341,
      winRate: 68.9,
      followers: 654
    }
  ];

  const copyTrader = async (traderId: string) => {
    // Clear previous validation error
    setValidationError('');

    // 1. Check wallet connection
    if (!isConnected) {
      showNotification({
        type: 'error',
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet first.'
      });
      return;
    }

    // 2. Validate amount
    const amountValidation = validateAmount(depositAmount, {
      min: 1,
      max: 1000000,
      fieldName: 'Deposit Amount'
    });

    if (!amountValidation.valid) {
      setValidationError(amountValidation.error!);
      showNotification({
        type: 'error',
        title: 'Invalid Amount',
        message: amountValidation.error!
      });
      return;
    }

    // 3. Validate trader address
    const addressValidation = validateSuiAddress(traderId);
    if (!addressValidation.valid) {
      showNotification({
        type: 'error',
        title: 'Invalid Trader Address',
        message: addressValidation.error!
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

    setLoading(true);
    playSound('click');

    try {
      const tx = ContractInteractions.depositToSocialVault(
        traderId,
        amountValidation.sanitized as number
      );
      await signAndExecute(tx);
      playSound('success');
      showNotification({
        type: 'success',
        title: 'Successfully Copied!',
        message: `You are now copying this trader's strategy with ${amountValidation.sanitized} SUI.`
      });
      setSelectedTrader(null);
      setDepositAmount('100');
      setValidationError('');
    } catch (error: any) {
      console.error('Transaction error:', error);

      // Parse error message
      let errorMessage = 'Failed to join trading vault.';
      if (error.message?.includes('Insufficient')) {
        errorMessage = 'Insufficient balance. Please check your wallet.';
      } else if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user.';
        // Don't show error notification for user rejection
        return;
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Insufficient gas. Please ensure you have enough SUI for gas fees.';
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

  const getRiskColor = (score: number) => {
    if (score < 4) return 'text-emerald-400';
    if (score < 7) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getRiskLabel = (score: number) => {
    if (score < 4) return 'LOW';
    if (score < 7) return 'MEDIUM';
    return 'HIGH';
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Social Trading</h1>
        <p className="text-slate-400">
          Copy the strategies of top-performing traders. Your funds remain non-custodial.
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Total AUM</div>
          <div className="text-2xl font-bold text-white">$5.5M</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Active Traders</div>
          <div className="text-2xl font-bold text-cyan-400">127</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Total Copiers</div>
          <div className="text-2xl font-bold text-cyan-400">4,382</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Avg ROI</div>
          <div className="text-2xl font-bold text-emerald-400">+178%</div>
        </div>
      </div>

      {/* Trader Leaderboard */}
      <div className="space-y-4">
        {traders.map((trader, index) => (
          <div
            key={trader.id}
            className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all"
          >
            <div className="flex items-start justify-between gap-6">
              {/* Left: Trader Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="relative">
                  <div className="text-5xl">{trader.avatar}</div>
                  <div className="absolute -top-2 -left-2 bg-cyan-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{trader.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${getRiskColor(trader.riskScore)} bg-slate-800`}>
                      {getRiskLabel(trader.riskScore)} RISK
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Total ROI</div>
                      <div className="text-emerald-400 font-bold text-lg">+{trader.roi}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500">AUM</div>
                      <div className="text-white font-bold">${(trader.aum / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Win Rate</div>
                      <div className="text-white font-bold">{trader.winRate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Followers</div>
                      <div className="text-cyan-400 font-bold">{trader.followers.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Copy Button */}
              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => setSelectedTrader(selectedTrader === trader.id ? null : trader.id)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
                >
                  {selectedTrader === trader.id ? 'Cancel' : 'Copy Trader'}
                </button>
                <div className="text-xs text-slate-500">
                  {trader.trades.toLocaleString()} total trades
                </div>
              </div>
            </div>

            {/* Deposit Form (Expanded) */}
            {selectedTrader === trader.id && (
              <div className="mt-6 pt-6 border-t border-slate-800 animate-fade-in">
                <div className="max-w-md">
                  <label className="block text-sm font-bold text-slate-300 mb-2">
                    Deposit Amount (SUI)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => {
                        setDepositAmount(e.target.value);
                        setValidationError('');
                      }}
                      className={`flex-1 bg-slate-950 border rounded-xl px-4 py-3 text-white focus:outline-none ${
                        validationError
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-slate-700 focus:border-cyan-500'
                      }`}
                      placeholder="100"
                      min="1"
                      disabled={loading}
                    />
                    <button
                      onClick={() => copyTrader(trader.id)}
                      disabled={loading || !canProceed || !isConnected}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!canProceed ? `Wait ${remainingTime}s` : ''}
                    >
                      {loading
                        ? 'Processing...'
                        : !canProceed
                        ? `Wait ${remainingTime}s`
                        : 'Confirm'}
                    </button>
                  </div>
                  {validationError && (
                    <p className="text-xs text-rose-400 mt-2">
                      ⚠️ {validationError}
                    </p>
                  )}
                  {!validationError && (
                    <p className="text-xs text-slate-500 mt-2">
                      Performance fee: 20% on profits. You can withdraw anytime.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-3xl">ℹ️</div>
          <div>
            <h3 className="font-bold text-white mb-2">How Social Trading Works</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Your funds are deposited into a smart contract vault</li>
              <li>• The trader can only execute trades with the pooled funds</li>
              <li>• You receive vault shares proportional to your deposit</li>
              <li>• The trader earns performance fees only on profits</li>
              <li>• You can withdraw your share at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
