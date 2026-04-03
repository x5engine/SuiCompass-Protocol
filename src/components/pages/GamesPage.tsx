import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';
import { validateAmount, validatePositiveInteger } from '../../utils/validation';
import { useTransactionRateLimit } from '../../hooks/useRateLimit';

export default function GamesPage() {
    const { signAndExecute, isConnected } = useWallet();
    const { checkLimit, canProceed, remainingTime } = useTransactionRateLimit('games');
    const [loading, setLoading] = useState(false);
    const [betAmount, setBetAmount] = useState('10');
    const [showBetModal, setShowBetModal] = useState<'yes' | 'no' | null>(null);
    const [validationError, setValidationError] = useState<string>('');

    const enterLottery = async () => {
        // 1. Check wallet connection
        if (!isConnected) {
            showNotification({
                type: 'error',
                title: 'Wallet Not Connected',
                message: 'Please connect your wallet first.'
            });
            return;
        }

        // 2. Validate amount (fixed 50 SUI)
        const lotteryAmount = 50;
        const amountValidation = validateAmount(lotteryAmount, {
            min: 50,
            max: 50,
            fieldName: 'Lottery Entry'
        });

        if (!amountValidation.valid) {
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
            const tx = ContractInteractions.enterLottery(lotteryAmount);
            await signAndExecute(tx);
            playSound('success');
            showNotification({
                type: 'success',
                title: 'Ticket Purchased!',
                message: 'Good luck! Draw is in 24h.'
            });
        } catch (error: any) {
            console.error('Lottery error:', error);

            let errorMessage = 'Failed to enter lottery.';
            if (error.message?.includes('Insufficient')) {
                errorMessage = 'Insufficient balance. You need 50 SUI plus gas fees.';
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

    const placeBet = async (prediction: boolean) => {
        // Clear previous errors
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

        // 2. Validate bet amount
        const amountValidation = validateAmount(betAmount, {
            min: 1,
            max: 10000,
            fieldName: 'Bet Amount'
        });

        if (!amountValidation.valid) {
            setValidationError(amountValidation.error!);
            showNotification({
                type: 'error',
                title: 'Invalid Bet Amount',
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
            const tx = ContractInteractions.placeBet(
                '0xMOCK_MARKET_ID',
                prediction,
                amountValidation.sanitized as number
            );
            await signAndExecute(tx);
            playSound('success');
            showNotification({
                type: 'success',
                title: 'Bet Placed!',
                message: `You bet ${amountValidation.sanitized} SUI on ${prediction ? 'YES' : 'NO'}`
            });
            setShowBetModal(null);
            setBetAmount('10');
            setValidationError('');
        } catch (error: any) {
            console.error('Bet error:', error);

            let errorMessage = 'Failed to place bet.';
            if (error.message?.includes('Insufficient')) {
                errorMessage = 'Insufficient balance for bet amount plus gas fees.';
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

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-fade-in">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600 mb-4">
                    Game Center
                </h1>
                <p className="text-slate-400 text-lg">Win big with Sui's verifiable randomness.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* LOSSLESS LOTTERY */}
                <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-fuchsia-900/20 to-slate-900 border border-fuchsia-500/30 overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 bg-fuchsia-500 text-white font-bold text-xs rounded-bl-2xl">
                        NO LOSS
                    </div>
                    <div className="mb-8 text-center">
                        <div className="text-6xl mb-4 animate-bounce">🎰</div>
                        <h2 className="text-3xl font-bold text-white mb-2">Lossless Lottery</h2>
                        <p className="text-slate-400">Deposit SUI. Keep your principal. Win the yield.</p>
                    </div>
                    
                    <div className="bg-slate-950/50 rounded-2xl p-6 border border-fuchsia-500/20 text-center mb-8">
                        <div className="text-sm text-fuchsia-300 uppercase tracking-widest font-bold mb-2">Current Jackpot</div>
                        <div className="text-5xl font-mono text-white font-black tracking-tight">
                            2,450 <span className="text-2xl text-slate-500">SUI</span>
                        </div>
                    </div>

                    <button
                        onClick={enterLottery}
                        disabled={loading || !canProceed || !isConnected}
                        className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-fuchsia-600/20 transform group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        title={!canProceed ? `Wait ${remainingTime}s` : ''}
                    >
                        {loading
                            ? 'Processing...'
                            : !canProceed
                            ? `Wait ${remainingTime}s`
                            : '🎟️ Enter Pool (50 SUI)'}
                    </button>
                </div>

                {/* PREDICTION MARKET */}
                <div className="relative group p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30">
                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <h2 className="text-2xl font-bold text-white">Prediction Market</h2>
                            <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold">LIVE</span>
                        </div>
                        <p className="text-slate-400 mt-2">Will SUI price exceed $2.50 by Friday?</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {/* YES BAR */}
                        <button
                            onClick={() => setShowBetModal('yes')}
                            className="w-full group/btn relative overflow-hidden rounded-xl bg-slate-950 border border-emerald-500/30 p-4 hover:border-emerald-500 transition-colors text-left"
                        >
                            <div className="absolute inset-0 bg-emerald-500/10 w-[65%]"></div>
                            <div className="relative flex justify-between items-center z-10">
                                <span className="font-bold text-emerald-400">YES</span>
                                <span className="font-mono text-white">65%</span>
                            </div>
                        </button>

                        {/* NO BAR */}
                        <button
                            onClick={() => setShowBetModal('no')}
                            className="w-full group/btn relative overflow-hidden rounded-xl bg-slate-950 border border-rose-500/30 p-4 hover:border-rose-500 transition-colors text-left"
                        >
                            <div className="absolute inset-0 bg-rose-500/10 w-[35%]"></div>
                            <div className="relative flex justify-between items-center z-10">
                                <span className="font-bold text-rose-400">NO</span>
                                <span className="font-mono text-white">35%</span>
                            </div>
                        </button>
                    </div>

                    {/* Bet Modal */}
                    {showBetModal && (
                        <div className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-xl animate-fade-in">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-white font-bold">
                                    Betting on: {showBetModal === 'yes' ? '✅ YES' : '❌ NO'}
                                </span>
                                <button
                                    onClick={() => setShowBetModal(null)}
                                    className="text-slate-500 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => {
                                        setBetAmount(e.target.value);
                                        setValidationError('');
                                    }}
                                    className={`flex-1 bg-slate-900 border rounded-lg px-4 py-2 text-white ${
                                        validationError
                                            ? 'border-rose-500'
                                            : 'border-slate-700'
                                    }`}
                                    placeholder="Amount (SUI)"
                                    min="1"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => placeBet(showBetModal === 'yes')}
                                    disabled={loading || !canProceed || !isConnected}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!canProceed ? `Wait ${remainingTime}s` : ''}
                                >
                                    {loading
                                        ? 'Placing...'
                                        : !canProceed
                                        ? `Wait ${remainingTime}s`
                                        : 'Place Bet'}
                                </button>
                                {validationError && (
                                    <p className="text-xs text-rose-400 mt-1">⚠️ {validationError}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                        <span>Oracle: Pyth Network</span>
                        <span>•</span>
                        <span>Vol: $124k</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
