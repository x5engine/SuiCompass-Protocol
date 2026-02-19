import React, { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { playSound } from '../../utils/sound-effects';
import { showNotification } from '../ui/Notification';

export default function GamesPage() {
    const { signAndExecute, isConnected } = useWallet();
    const [loading, setLoading] = useState(false);

    const enterLottery = async () => {
        if (!isConnected) return;
        setLoading(true);
        playSound('click');
        try {
            // Use real pool ID via shared object constant
            const tx = ContractInteractions.enterLottery(50);
            await signAndExecute(tx);
            playSound('success');
            showNotification({ type: 'success', title: 'Ticket Purchased', message: 'Good luck! Draw is in 24h.' });
        } catch (e) { console.error(e); } finally { setLoading(false); }
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
                        disabled={loading}
                        className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-fuchsia-600/20 transform group-hover:scale-[1.02]"
                    >
                        {loading ? 'Processing...' : '🎟️ Enter Pool (50 SUI)'}
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
                        <button className="w-full group/btn relative overflow-hidden rounded-xl bg-slate-950 border border-emerald-500/30 p-4 hover:border-emerald-500 transition-colors text-left">
                            <div className="absolute inset-0 bg-emerald-500/10 w-[65%]"></div>
                            <div className="relative flex justify-between items-center z-10">
                                <span className="font-bold text-emerald-400">YES</span>
                                <span className="font-mono text-white">65%</span>
                            </div>
                        </button>

                        {/* NO BAR */}
                        <button className="w-full group/btn relative overflow-hidden rounded-xl bg-slate-950 border border-rose-500/30 p-4 hover:border-rose-500 transition-colors text-left">
                            <div className="absolute inset-0 bg-rose-500/10 w-[35%]"></div>
                            <div className="relative flex justify-between items-center z-10">
                                <span className="font-bold text-rose-400">NO</span>
                                <span className="font-mono text-white">35%</span>
                            </div>
                        </button>
                    </div>

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
