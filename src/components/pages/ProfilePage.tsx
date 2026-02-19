import React, { useState, useEffect } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { useGamificationStore } from '../../stores/gamification-store';
import LevelBadge from '../gamification/LevelBadge';
import { ContractInteractions } from '../../blockchain/contract-interactions';
import { showNotification } from '../ui/Notification';
import { playSound } from '../../utils/sound-effects';

export default function ProfilePage() {
    const { publicKey, isConnected, signAndExecute } = useWallet();
    const { points, level, badges } = useGamificationStore();
    const [reputationScore, setReputationScore] = useState(650); // Mock starting score
    const [loading, setLoading] = useState(false);

    // Mock history
    const history = [
        { action: "Repaid Flash Loan", points: "+15", date: "2 mins ago" },
        { action: "Minted RWA Invoice", points: "+50", date: "1 hour ago" },
        { action: "Staked 100 SUI", points: "+10", date: "1 day ago" },
    ];

    const createOnChainIdentity = async () => {
        if (!isConnected) return;
        setLoading(true);
        playSound('click');
        try {
            const tx = ContractInteractions.createIdentity();
            await signAndExecute(tx);
            playSound('success');
            showNotification({ type: 'success', title: 'Identity Created', message: 'Your reputation profile is now live on-chain.' });
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-black text-white mb-2">My Identity</h1>
                <p className="text-slate-400">Your on-chain reputation and achievements.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                
                {/* REPUTATION CARD */}
                <div className="md:col-span-2 space-y-8">
                    <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white">DeFi Credit Score</h2>
                                <p className="text-slate-400 text-sm">Powered by <span className="font-mono text-cyan-400">suicompass::reputation_id</span></p>
                            </div>
                            <div className="text-right">
                                <div className="text-5xl font-black text-white">{reputationScore}</div>
                                <div className="text-emerald-400 text-sm font-bold">EXCELLENT</div>
                            </div>
                        </div>

                        {/* Score Bar */}
                        <div className="h-4 bg-slate-800 rounded-full overflow-hidden mb-8">
                            <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 w-[65%] relative">
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={createOnChainIdentity}
                                disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                            >
                                {loading ? 'Minting Profile...' : 'Mint On-Chain Identity'}
                            </button>
                            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-xl transition-all">
                                View History
                            </button>
                        </div>
                    </div>

                    {/* HISTORY LOG */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Reputation History</h3>
                        <div className="space-y-4">
                            {history.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                                    <span className="text-slate-300">{item.action}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-emerald-400 font-mono font-bold">{item.points}</span>
                                        <span className="text-xs text-slate-500">{item.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* GAMIFICATION SIDEBAR */}
                <div className="space-y-8">
                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center">
                        <LevelBadge />
                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-sm text-slate-400">
                                <span>XP Progress</span>
                                <span>{points} / 1000</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-cyan-500 transition-all duration-1000" 
                                    style={{ width: `${(points / 1000) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                        <h3 className="font-bold text-white mb-4">Earned Badges</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {badges.map(badge => (
                                <div key={badge.id} className="aspect-square rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center gap-1 group cursor-pointer hover:border-cyan-500 transition-colors">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{badge.icon}</span>
                                    <span className="text-[8px] uppercase font-bold text-slate-500">{badge.name}</span>
                                </div>
                            ))}
                            {/* Empty slots */}
                            {[...Array(6 - badges.length)].map((_, i) => (
                                <div key={i} className="aspect-square rounded-xl bg-slate-800/30 border border-slate-800 flex items-center justify-center text-slate-700">
                                    🔒
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
