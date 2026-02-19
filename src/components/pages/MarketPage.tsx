import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';

export default function MarketPage() {
    const [activeTab, setActiveTab] = useState<'index' | 'flash' | 'options'>('index');
    const { signAndExecute, isConnected } = useWallet();
    const [loading, setLoading] = useState(false);

    // Form States
    const [indexAmount, setIndexAmount] = useState('10');
    const [flashAmount, setFlashAmount] = useState('1000');

    const handleTransaction = async (action: () => Promise<any>) => {
        if (!isConnected) {
            showNotification({ type: 'error', title: 'Wallet not connected', message: 'Please connect your wallet first.' });
            return;
        }
        setLoading(true);
        playSound('click');
        try {
            await action();
            playSound('success');
            showNotification({ type: 'success', title: 'Transaction Successful', message: 'The blockchain has accepted your request.' });
        } catch (error) {
            console.error(error);
            showNotification({ type: 'error', title: 'Transaction Failed', message: 'See console for details.' });
        } finally {
            setLoading(false);
        }
    };

    const buyIndex = () => handleTransaction(async () => {
        const tx = ContractInteractions.buyIndexFund(Number(indexAmount), 0, '0x_MOCK_USDC'); // Mock USDC ID
        await signAndExecute(tx);
    });

    const executeFlash = () => handleTransaction(async () => {
        const tx = ContractInteractions.executeFlashArbitrage(Number(flashAmount));
        await signAndExecute(tx);
    });

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
                            <div className="flex gap-4">
                                <input 
                                    type="number" 
                                    value={indexAmount}
                                    onChange={e => setIndexAmount(e.target.value)}
                                    className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white w-full"
                                    placeholder="Amount SUI"
                                />
                                <button 
                                    onClick={buyIndex}
                                    disabled={loading}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl transition-all whitespace-nowrap"
                                >
                                    {loading ? 'Buying...' : 'Buy Index'}
                                </button>
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
                                disabled={loading}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-amber-600/20"
                            >
                                {loading ? 'Executing Swaps...' : '⚡ Execute Arbitrage Strategy'}
                            </button>
                            <p className="text-xs text-center text-slate-500">
                                The transaction will revert if the trade is not profitable. You only pay gas.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'options' && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-6 opacity-50">📉</div>
                        <h2 className="text-2xl font-bold text-white mb-2">Derivatives Market</h2>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Hedging contracts for your RWA NFTs are coming soon.
                            <br/>Current Status: <span className="text-cyan-400 font-mono">Contract Deployed</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
