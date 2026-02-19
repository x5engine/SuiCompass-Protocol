import { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chat-store';
import { useNetworkStore } from '../../stores/network-store';
import { useGamificationStore } from '../../stores/gamification-store';
import { useAutoStakeStore } from '../../stores/auto-stake-store';
import { playSound } from '../../utils/sound-effects';
import LevelBadge from '../gamification/LevelBadge';
import Tooltip from './Tooltip';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../stores/dashboard-store';
import { showNotification } from './Notification';
import { SUI_CONTRACTS } from '../../ai/contract-knowledge';

// Map contract IDs to icons
const CONTRACT_ICONS: Record<string, string> = {
    portfolio: "🤖",
    index_fund: "🧺",
    flash_loan: "⚡",
    prediction_market: "🔮",
    social_trading: "👥",
    stream_pay: "⏳",
    derivatives: "📉",
    lossless_lottery: "🎟️",
    bridge_adaptor: "🌉",
    reputation_id: "🆔",
    rwa_registry: "🏠"
};

// Generate suggestions dynamically from the contract knowledge base
const DYNAMIC_SUGGESTIONS = SUI_CONTRACTS.map(contract => ({
    text: contract.prompts[0], // Use the first prompt as the primary suggestion
    icon: CONTRACT_ICONS[contract.id] || "📜",
    type: contract.id
}));

export default function SidePanel() {
    const [isOpen, setIsOpen] = useState(true);
    const { suggestions } = useChatStore();
    const { network } = useNetworkStore();
    const { badges } = useGamificationStore();
    const { enabled, status, updateSettings } = useAutoStakeStore();
    const navigate = useNavigate();
    const { setActiveTab } = useDashboardStore();

    // State for rotating suggestions
    const [rotatedSuggestions, setRotatedSuggestions] = useState(DYNAMIC_SUGGESTIONS.slice(0, 4));
    const [fadeKey, setFadeKey] = useState(0);

    // Rotation Logic: Only runs if there are NO AI suggestions
    useEffect(() => {
        if (suggestions.length > 0) return;

        const interval = setInterval(() => {
            setFadeKey(prev => prev + 1);
            
            setTimeout(() => {
                const shuffled = [...DYNAMIC_SUGGESTIONS].sort(() => 0.5 - Math.random());
                setRotatedSuggestions(shuffled.slice(0, 4)); // Show 4 at a time
            }, 200); 

        }, 15000); // Rotate every 15 seconds for more dynamism

        return () => clearInterval(interval);
    }, [suggestions.length]);

    // Use AI suggestions if available, otherwise use rotated ones
    const activeSuggestions = suggestions.length > 0 ? suggestions : rotatedSuggestions;

    const handleSuggestionClick = (text: string, type?: string) => {
        playSound('click');
        
        // Navigation Logic based on Contract Type
        if (type === 'portfolio') { navigate('/dashboard'); setActiveTab('portfolio'); }
        else if (type === 'index_fund') { navigate('/market'); }
        else if (type === 'flash_loan') { navigate('/market'); }
        else if (type === 'lossless_lottery') { navigate('/games'); }
        else if (type === 'reputation_id') { navigate('/profile'); }
        else {
            // Default behavior: Fill chat input
            const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement;
            if (chatInput) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                if(nativeInputValueSetter) {
                    nativeInputValueSetter.call(chatInput, text);
                    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                chatInput.focus();
            }
        }
    };
    
    const handleToggleAgent = () => {
        playSound('click');
        const newState = !enabled;
        updateSettings({ enabled: newState });
        showNotification({ 
            type: newState ? 'success' : 'info', 
            title: newState ? 'Agent Activated' : 'Agent Paused',
            message: newState ? 'Auto-staking is now active.' : 'Auto-staking paused.' 
        });
    };

    const handleToggleOpen = () => {
        playSound('click');
        setIsOpen(!isOpen);
    }

    return (
        <div className={`fixed right-0 top-0 bottom-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-64 bg-slate-900 border-l border-slate-800 backdrop-blur-xl shadow-2xl`}>
             <button
                onClick={handleToggleOpen}
                onMouseEnter={() => playSound('hover')}
                className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-24 bg-cyan-600/80 hover:bg-cyan-500 rounded-l-lg flex items-center justify-center text-white transition-all shadow-lg shadow-cyan-500/20"
            >
                {isOpen ? '→' : '←'}
            </button>

            <div className="h-full overflow-y-auto p-4 custom-scrollbar pt-20">
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Profile</h3>
                    <LevelBadge />
                </div>
                
                {badges.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Badges</h4>
                        <div className="flex flex-wrap gap-2">
                            {badges.map(badge => (
                                <Tooltip key={badge.id} content={`${badge.name}: ${badge.description}`} position="top">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl border border-slate-700 animate-fade-in-up">{badge.icon}</div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Agent</h3>
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{enabled ? '🟢' : '🤖'}</span>
                            <div>
                                <h4 className="text-sm font-medium text-slate-200">Auto-Stake</h4>
                                <p className="text-xs text-slate-500 capitalize">{enabled ? status : 'Paused'}</p>
                            </div>
                        </div>
                        <button onClick={handleToggleAgent} className={`w-10 h-6 rounded-full flex items-center transition-colors ${enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}>
                            <div className="w-4 h-4 bg-white rounded-full m-1 shadow-sm"></div>
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">
                        {suggestions.length > 0 ? 'Copilot' : 'Capabilities'}
                    </h3>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">
                        {suggestions.length > 0 ? 'Context-aware actions' : 'What I can do'}
                    </p>
                </div>

                <div className="space-y-3">
                    {activeSuggestions.map((item, idx) => (
                        <button 
                            key={`${item.text}-${fadeKey}`}
                            className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 animate-fade-in group"
                            onClick={() => handleSuggestionClick(item.text, item.type)}
                            onMouseEnter={() => playSound('hover')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white line-clamp-2">{item.text}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                   <div className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-widest">Network Status</div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${network === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
                            <span className="text-xs text-slate-300 font-medium capitalize">Sui {network}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}