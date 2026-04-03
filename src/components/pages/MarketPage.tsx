import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';
import { validateAmount } from '../../utils/validation';
import { useTransactionRateLimit } from '../../hooks/useRateLimit';

export default function MarketPage() {
    const [activeTab, setActiveTab] = useState<'index' | 'flash' | 'options'>('index');
    const { signAndExecute, isConnected } = useWallet();
    const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('market');
    const [loading, setLoading] = useState(false);

    // Form States
    const [indexAmount, setIndexAmount] = useState('10');
    const [flashAmount, setFlashAmount] = useState('1000');
    const [validationErrors, setValidationErrors] = useState<{
        index?: string;
        flash?: string;
    }>({});

    const buyIndex = async () => {
        // Clear previous errors
        setValidationErrors(prev => ({ ...prev, index: undefined }));

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
        const amountValidation = validateAmount(indexAmount, {
            min: 1,
            max: 100000,
            fieldName: 'Index Fund Amount'
        });

        if (!amountValidation.valid) {
            setValidationErrors({ index: amountValidation.error });
            showNotification({
                type: 'error',
                title: 'Invalid Amount',
                message: amountValidation.error!
            });
            return;
        }

        // 3. Check rate limit
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
            const tx = ContractInteractions.buyIndexFund(
                amountValidation.sanitized as number,
                0,
                '0x_MOCK_USDC'
            );
            await signAndExecute(tx);
            playSound('success');
            showNotification({
                type: 'success',
                title: 'Index Fund Purchased!',
                message: `Bought ${amountValidation.sanitized} SUI worth of SUIIDX.`
            });
            setIndexAmount('10');
            setValidationErrors(prev => ({ ...prev, index: undefined }));
        } catch (error: any) {
            console.error('Index fund error:', error);

            let errorMessage = 'Failed to buy index fund.';
            if (error.message?.includes('Insufficient')) {
                errorMessage = 'Insufficient balance for purchase plus gas fees.';
            } else if (error.message?.includes('User rejected')) {
                return; // Silent
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

    const executeFlash = async () => {
        // Clear previous errors
        setValidationErrors(prev => ({ ...prev, flash: undefined }));

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
        const amountValidation = validateAmount(flashAmount, {
            min: 100,
            max: 100000,
            fieldName: 'Flash Loan Amount'
        });

        if (!amountValidation.valid) {
            setValidationErrors({ flash: amountValidation.error });
            showNotification({
                type: 'error',
                title: 'Invalid Amount',
                message: amountValidation.error!
            });
            return;
        }

        // 3. Check rate limit
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
            const tx = ContractInteractions.executeFlashArbitrage(
                amountValidation.sanitized as number
            );
            await signAndExecute(tx);
            playSound('success');
            showNotification({
                type: 'success',
                title: 'Flash Arbitrage Executed!',
                message: `Executed flash loan with ${amountValidation.sanitized} SUI.`
            });
            setFlashAmount('1000');
            setValidationErrors(prev => ({ ...prev, flash: undefined }));
        } catch (error: any) {
            console.error('Flash loan error:', error);

            let errorMessage = 'Failed to execute flash arbitrage.';
            if (error.message?.includes('Insufficient')) {
                errorMessage = 'Insufficient gas fees for flash loan.';
            } else if (error.message?.includes('User rejected')) {
                return; // Silent
            } else if (error.message?.includes('gas')) {
                errorMessage = 'Insufficient gas fees.';
            } else if (error.message?.includes('No arbitrage')) {
                errorMessage = 'No profitable arbitrage opportunity found.';
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

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2">DeFi Market</h1>
                <p className="text-slate-400">Advanced trading tools powered by SuiCompass contracts.</p>
            </header>

            {/* TABS */}
            <div className="flex gap-4 border-b border-slate-800 pb-1">
                {['index', 'flash', 'options'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); playSound('click'); }}
                        className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${
                            activeTab === tab 
                                ? 'border-cyan-500 text-cyan-400' 
                                : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {tab === 'index' ? 'Index Fund' : tab === 'flash' ? 'Flash Loans' : 'Derivatives'}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="min-h-[400px]">
                {activeTab === 'index' && (
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                            <h2 className="text-2xl font-bold text-white mb-4">Sui Ecosystem Index (SUIIDX)</h2>
                            <div className="h-64 flex items-center justify-center bg-slate-950/50 rounded-xl mb-6 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 group-hover:opacity-75 transition-opacity" />
                                <div className="text-9xl animate-float">🧺</div>
                            </div>
                            <p className="text-slate-400 mb-6">
                                Single-click exposure to a diversified basket of top Sui assets. 
                                Currently tracks: <strong>50% SUI, 30% USDC, 20% CETUS</strong>.
                            </p>
                            <div className="space-y-2">
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        value={indexAmount}
                                        onChange={e => {
                                            setIndexAmount(e.target.value);
                                            setValidationErrors(prev => ({ ...prev, index: undefined }));
                                        }}
                                        className={`bg-slate-950 border rounded-xl px-4 py-3 text-white w-full ${
                                            validationErrors.index
                                                ? 'border-rose-500'
                                                : 'border-slate-700'
                                        }`}
                                        placeholder="Amount SUI"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={buyIndex}
                                        disabled={loading || !canProceed || !isConnected}
                                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={!canProceed ? `Wait ${remainingTime}s` : ''}
                                    >
                                        {loading
                                            ? 'Buying...'
                                            : !canProceed
                                            ? `Wait ${remainingTime}s`
                                            : 'Buy Index'}
                                    </button>
                                </div>
                                {validationErrors.index && (
                                    <p className="text-xs text-rose-400">⚠️ {validationErrors.index}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-200">Total Value Locked</h3>
                                    <p className="text-sm text-slate-500">Across all index holders</p>
                                </div>
                                <span className="text-2xl font-mono text-emerald-400">$4.2M</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-200">24h Performance</h3>
                                    <p className="text-sm text-slate-500">SUIIDX vs Market</p>
                                </div>
                                <span className="text-2xl font-mono text-emerald-400">+5.4%</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'flash' && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-900/20 to-slate-900 border border-amber-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-4xl">⚡</div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Flash Loan Arbitrage</h2>
                                <p className="text-amber-400 text-sm">Zero Capital Risk • Atomic Execution</p>
                            </div>
                        </div>
                        
                        <div className="space-y-6 max-w-xl">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-sm text-slate-400">
                                <div className="flex justify-between mb-2"><span>Target Pool:</span> <span className="text-white">Cetus / Turbos</span></div>
                                <div className="flex justify-between mb-2"><span>Asset Pair:</span> <span className="text-white">SUI / USDC</span></div>
                                <div className="flex justify-between"><span>Est. Profit:</span> <span className="text-emerald-400">+0.85%</span></div>
                            </div>

                            <button
                                onClick={executeFlash}
                                disabled={loading || !canProceed || !isConnected}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!canProceed ? `Wait ${remainingTime}s` : ''}
                            >
                                {loading
                                    ? 'Executing Swaps...'
                                    : !canProceed
                                    ? `Wait ${remainingTime}s`
                                    : '⚡ Execute Arbitrage Strategy'}
                            </button>
                            {validationErrors.flash && (
                                <p className="text-xs text-rose-400 mt-2">⚠️ {validationErrors.flash}</p>
                            )}
                            <p className="text-xs text-center text-slate-500">
                                The transaction will revert if the trade is not profitable. You only pay gas.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'options' && (
                    <div className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Call Option */}
                            <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/30 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">CALL Option</h3>
                                        <p className="text-sm text-slate-400">RWA Real Estate NFT #1234</p>
                                    </div>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                                        BULLISH
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Strike Price</span>
                                        <span className="text-white font-bold">$100,000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Current Price</span>
                                        <span className="text-white font-bold">$95,000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Premium</span>
                                        <span className="text-cyan-400 font-bold">250 SUI</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Expiry</span>
                                        <span className="text-white">30 days</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Buy Call Option'}
                                </button>
                            </div>

                            {/* Put Option */}
                            <div className="bg-gradient-to-br from-rose-900/20 to-slate-900 border border-rose-500/30 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">PUT Option</h3>
                                        <p className="text-sm text-slate-400">RWA Corporate Bond #5678</p>
                                    </div>
                                    <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold">
                                        BEARISH
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Strike Price</span>
                                        <span className="text-white font-bold">$50,000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Current Price</span>
                                        <span className="text-white font-bold">$52,000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Premium</span>
                                        <span className="text-cyan-400 font-bold">150 SUI</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Expiry</span>
                                        <span className="text-white">60 days</span>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-all"
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Buy Put Option'}
                                </button>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                            <div className="flex gap-4">
                                <div className="text-3xl">📊</div>
                                <div>
                                    <h3 className="font-bold text-white mb-2">How Options Work</h3>
                                    <ul className="text-sm text-slate-300 space-y-1">
                                        <li>• <strong>Call Option:</strong> Right to buy the asset at strike price (profit if price goes up)</li>
                                        <li>• <strong>Put Option:</strong> Right to sell the asset at strike price (profit if price goes down)</li>
                                        <li>• <strong>Premium:</strong> The cost to purchase the option (non-refundable)</li>
                                        <li>• <strong>Expiry:</strong> Options become worthless after expiration date</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
