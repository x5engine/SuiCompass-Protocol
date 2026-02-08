import { useState } from 'react'
import { useChatStore } from '../../stores/chat-store'
import { useNetworkStore } from '../../stores/network-store'
import { useGamificationStore } from '../../stores/gamification-store' // Import gamification store
import { playSound } from '../../utils/sound-effects'
import LevelBadge from '../gamification/LevelBadge' // Import level badge
import Tooltip from './Tooltip' // Import tooltip for badge descriptions

export default function SidePanel() {
    const [isOpen, setIsOpen] = useState(true)
    const { suggestions } = useChatStore()
    const { network } = useNetworkStore()
    const { badges } = useGamificationStore() // Get unlocked badges

    const defaultSuggestions = [
        { text: "Stake 10 SUI", icon: "💰", type: "stake" },
        { text: "Check Portfolio", icon: "📊", type: "portfolio" },
        { text: "Play Chess", icon: "🎮", type: "game" },
        { text: "Tokenize Asset", icon: "💎", type: "rwa" },
    ]
    
    const activeSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions

    const handleSuggestionClick = (text: string) => {
        playSound('click')
        const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (chatInput) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(chatInput, text);
            }
            chatInput.dispatchEvent(new Event('input', { bubbles: true }));
            chatInput.focus();
        }
    }

    return (
        <div className={`fixed right-0 top-20 bottom-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-12'} bg-slate-900 border-l border-slate-800 backdrop-blur-xl shadow-2xl`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -left-3 top-4 w-6 h-12 bg-cyan-600 rounded-l-lg flex items-center justify-center text-white hover:w-8 transition-all shadow-lg shadow-cyan-500/20"
            >
                {isOpen ? '→' : '←'}
            </button>

            <div className={`h-full overflow-y-auto p-4 custom-scrollbar ${!isOpen && 'hidden'}`}>
                {/* Profile Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Profile</h3>
                    <LevelBadge />
                </div>
                
                {/* Badges Section */}
                {badges.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Badges</h4>
                        <div className="flex flex-wrap gap-2">
                            {badges.map(badge => (
                                <Tooltip key={badge.id} content={`${badge.name}: ${badge.description}`} position="top">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-xl border border-slate-700">
                                        {badge.icon}
                                    </div>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1">Copilot</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Context-aware actions</p>
                </div>

                <div className="space-y-3">
                    {activeSuggestions.map((item, idx) => (
                        <button
                            key={idx}
                            className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all group"
                            onClick={() => handleSuggestionClick(item.text)}
                            onMouseEnter={() => playSound('hover')}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{item.icon}</span>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{item.text}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-800/50">
                    <div className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-widest">Network Status</div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${network === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span className="text-xs text-slate-300 font-medium capitalize">Sui {network}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}