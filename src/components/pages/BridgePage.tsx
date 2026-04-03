import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';
import { validateAmount, validateChain, validateAssetSymbol } from '../../utils/validation';
import { useTransactionRateLimit } from '../../hooks/useRateLimit';

interface Chain {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Asset {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
}

export default function BridgePage() {
  const { signAndExecute, isConnected } = useWallet();
  const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('bridge');
  const [loading, setLoading] = useState(false);

  const [fromChain, setFromChain] = useState<string>('sui');
  const [toChain, setToChain] = useState<string>('ethereum');
  const [selectedAsset, setSelectedAsset] = useState<string>('SUI');
  const [amount, setAmount] = useState('10');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    amount?: string;
    destination?: string;
  }>({});

  const chains: Chain[] = [
    { id: 'sui', name: 'Sui', icon: '🌊', color: 'cyan' },
    { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: 'purple' },
    { id: 'solana', name: 'Solana', icon: '◎', color: 'green' },
    { id: 'polygon', name: 'Polygon', icon: '⬡', color: 'violet' }
  ];

  const assets: Asset[] = [
    { symbol: 'SUI', name: 'Sui Token', icon: '🌊', balance: 1250.5 },
    { symbol: 'USDC', name: 'USD Coin', icon: '💵', balance: 500.0 },
    { symbol: 'WETH', name: 'Wrapped Ether', icon: '⟠', balance: 2.5 }
  ];

  const bridgeFee = 0.1; // 0.1%
  const estimatedTime = fromChain === 'sui' && toChain === 'ethereum' ? '15-20 min' : '5-10 min';

  const handleBridge = async () => {
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

    // 2. Validate chains
    const fromChainValidation = validateChain(fromChain);
    const toChainValidation = validateChain(toChain);
    if (!fromChainValidation.valid || !toChainValidation.valid) {
      showNotification({
        type: 'error',
        title: 'Invalid Chain',
        message: 'Please select valid source and destination chains.'
      });
      return;
    }

    if (fromChain === toChain) {
      showNotification({
        type: 'error',
        title: 'Invalid Bridge',
        message: 'Source and destination chains cannot be the same.'
      });
      return;
    }

    // 3. Validate asset
    const assetValidation = validateAssetSymbol(selectedAsset);
    if (!assetValidation.valid) {
      showNotification({
        type: 'error',
        title: 'Invalid Asset',
        message: assetValidation.error!
      });
      return;
    }

    // 4. Validate amount
    const amountValidation = validateAmount(amount, {
      min: 0.1,
      max: 1000000,
      fieldName: 'Bridge Amount'
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

    // 5. Validate destination address (basic check - could be Ethereum, Solana, etc.)
    if (!destinationAddress || destinationAddress.trim().length < 20) {
      const error = 'Please enter a valid destination address';
      setValidationErrors({ destination: error });
      showNotification({
        type: 'error',
        title: 'Invalid Destination',
        message: error
      });
      return;
    }

    // 6. Check rate limit
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
      const tx = ContractInteractions.bridgeAsset(
        toChain,
        assetValidation.sanitized as string,
        amountValidation.sanitized as number,
        destinationAddress.trim()
      );
      await signAndExecute(tx);
      playSound('success');
      showNotification({
        type: 'success',
        title: 'Bridge Transaction Initiated!',
        message: `Your ${amountValidation.sanitized} ${selectedAsset} will arrive in ${estimatedTime}.`
      });

      // Reset form
      setAmount('10');
      setDestinationAddress('');
      setValidationErrors({});
    } catch (error: any) {
      console.error('Bridge error:', error);

      let errorMessage = 'Transaction failed.';
      if (error.message?.includes('Insufficient')) {
        errorMessage = 'Insufficient balance for bridge amount plus fees.';
      } else if (error.message?.includes('User rejected')) {
        return; // Silent for user rejection
      } else if (error.message?.includes('gas')) {
        errorMessage = 'Insufficient gas fees.';
      }

      showNotification({
        type: 'error',
        title: 'Bridge Failed',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const swapChains = () => {
    playSound('click');
    const temp = fromChain;
    setFromChain(toChain);
    setToChain(temp);
  };

  const getChainColor = (chainId: string) => {
    return chains.find((c) => c.id === chainId)?.color || 'cyan';
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Cross-Chain Bridge</h1>
        <p className="text-slate-400">
          Transfer assets seamlessly between Sui and other blockchains using Wormhole/LayerZero.
        </p>
      </header>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Total Bridged (24h)</div>
          <div className="text-2xl font-bold text-white">$12.4M</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Active Bridges</div>
          <div className="text-2xl font-bold text-cyan-400">4,283</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Avg Time</div>
          <div className="text-2xl font-bold text-emerald-400">8 min</div>
        </div>
      </div>

      {/* Bridge Interface */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>

          {/* From Chain */}
          <div className="relative z-10 space-y-3">
            <label className="block text-sm font-bold text-slate-300">From</label>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-4">
                <select
                  value={fromChain}
                  onChange={(e) => setFromChain(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-lg focus:outline-none focus:border-cyan-500"
                >
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-slate-500">
                  Balance: {assets.find((a) => a.symbol === selectedAsset)?.balance || 0}
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setValidationErrors(prev => ({ ...prev, amount: undefined }));
                  }}
                  className={`flex-1 bg-transparent text-white text-2xl font-bold focus:outline-none ${
                    validationErrors.amount ? 'text-rose-400' : ''
                  }`}
                  placeholder="0.0"
                  min="0"
                  disabled={loading}
                />
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                >
                  {assets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.icon} {asset.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative z-10 flex justify-center -my-3">
            <button
              onClick={swapChains}
              className="bg-slate-800 hover:bg-slate-700 border-4 border-slate-950 text-white p-3 rounded-full transition-all hover:scale-110 hover:rotate-180"
              style={{ transition: 'all 0.3s ease' }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          {/* To Chain */}
          <div className="relative z-10 space-y-3">
            <label className="block text-sm font-bold text-slate-300">To</label>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-lg focus:outline-none focus:border-cyan-500 mb-4"
              >
                {chains
                  .filter((chain) => chain.id !== fromChain)
                  .map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
              </select>

              <div className="text-2xl font-bold text-white">
                {(Number(amount) * (1 - bridgeFee / 100)).toFixed(4)} {selectedAsset}
              </div>
              <div className="text-sm text-slate-500 mt-2">You will receive</div>
            </div>
          </div>

          {/* Destination Address */}
          <div className="relative z-10 space-y-3">
            <label className="block text-sm font-bold text-slate-300">
              Destination Address ({chains.find((c) => c.id === toChain)?.name})
            </label>
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => {
                setDestinationAddress(e.target.value);
                setValidationErrors(prev => ({ ...prev, destination: undefined }));
              }}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-white font-mono focus:outline-none ${
                validationErrors.destination
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-800 focus:border-cyan-500'
              }`}
              placeholder="0x..."
              disabled={loading}
            />
            {validationErrors.destination && (
              <p className="text-xs text-rose-400">⚠️ {validationErrors.destination}</p>
            )}
            {validationErrors.amount && (
              <p className="text-xs text-rose-400">⚠️ {validationErrors.amount}</p>
            )}
          </div>

          {/* Route Preview */}
          <div className="relative z-10 bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Bridge Provider</span>
              <span className="text-white font-bold">Wormhole</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Time</span>
              <span className="text-cyan-400 font-bold">{estimatedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bridge Fee ({bridgeFee}%)</span>
              <span className="text-white">
                {(Number(amount) * (bridgeFee / 100)).toFixed(4)} {selectedAsset}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2">
              <span className="text-slate-300 font-bold">You Receive</span>
              <span className="text-emerald-400 font-bold">
                {(Number(amount) * (1 - bridgeFee / 100)).toFixed(4)} {selectedAsset}
              </span>
            </div>
          </div>

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={loading || !canProceed || !isConnected || !destinationAddress || !amount || Number(amount) <= 0}
            className="relative z-10 w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-600/20"
            title={!canProceed ? `Wait ${remainingTime}s` : ''}
          >
            {loading
              ? 'Processing Bridge...'
              : !canProceed
              ? `Wait ${remainingTime}s`
              : 'Bridge Assets'}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-2xl mx-auto bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="text-3xl">ℹ️</div>
          <div className="space-y-3">
            <h3 className="font-bold text-white">How Cross-Chain Bridging Works</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>
                • <strong>Lock & Mint:</strong> Your assets are locked on Sui and equivalent
                tokens are minted on the destination chain
              </li>
              <li>
                • <strong>Relayer Network:</strong> Decentralized validators verify and relay
                the transaction
              </li>
              <li>
                • <strong>Finality:</strong> Once confirmed, you receive your tokens on the
                destination chain
              </li>
              <li>
                • <strong>Security:</strong> All bridges are audited and monitored 24/7
              </li>
            </ul>
            <div className="pt-3 border-t border-blue-500/20">
              <p className="text-xs text-slate-400">
                ⚠️ Always double-check the destination address. Bridge transactions cannot be
                reversed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bridges */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-4">Recent Bridge Activity</h3>
        <div className="space-y-2">
          {[
            { from: 'Sui', to: 'Ethereum', amount: '100 SUI', time: '2 min ago', status: 'Completed' },
            { from: 'Ethereum', to: 'Sui', amount: '0.5 ETH', time: '15 min ago', status: 'Completed' },
            { from: 'Sui', to: 'Solana', amount: '250 USDC', time: '1 hour ago', status: 'Completed' }
          ].map((bridge, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-mono text-white">{bridge.amount}</span>
                  <span className="text-slate-500 mx-2">•</span>
                  <span className="text-slate-400">
                    {bridge.from} → {bridge.to}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">{bridge.time}</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                  {bridge.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
