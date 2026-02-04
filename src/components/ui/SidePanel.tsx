/**
 * Innovative Side Panel (Copilot)
 * Provides context-aware prompts and shortcuts
 */

import { useState } from 'react'
// import { generateIntent } from '../../ai/embedapi-client'


export default function SidePanel() {
    const [isOpen, setIsOpen] = useState(true)


    const suggestions = [
        { text: "Stake 10 SUI", icon: "💰", action: "stake" },
        { text: "Check Portfolio", icon: "📊", action: "portfolio" },
        { text: "Max Yield Strategy", icon: "📈", action: "yield" },
        { text: "Tokenize Asset", icon: "💎", action: "rwa" },
    ]

    return (
        <div className={`fixed right-0 top-20 bottom-0 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-12'} bg-sui-card border-l border-slate-700/50 backdrop-blur-xl`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -left-3 top-4 w-6 h-12 bg-sui-blue rounded-l-lg flex items-center justify-center text-slate-900 hover:w-8 transition-all"
            >
                {isOpen ? '→' : '←'}
            </button>

            {/* Content */}
            <div className={`h-full overflow-y-auto p-4 ${!isOpen && 'hidden'}`}>
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-sui-blue uppercase tracking-wider mb-2">Copilot</h3>
                    <p className="text-xs text-slate-400">Context-aware actions</p>
                </div>

                {/* Suggestions Grid */}
                <div className="space-y-3">
                    {suggestions.map((item, idx) => (
                        <button
                            key={idx}
                            className="w-full text-left p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 hover:border-sui-blue/50 transition-all group group-hover:shadow-lg hover:shadow-cyan-500/10"
                            onClick={() => {
                                // In a real app, this would inject text into chat or trigger action
                                const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement
                                if (chatInput) {
                                    chatInput.value = item.text;
                                    chatInput.focus();
                                }
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-white">{item.text}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Live Status (Mock D3 placeholder for now) */}
                <div className="mt-8 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-2">NETWORK STATUS</div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm text-slate-300">Sui Testnet</span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono">TPS: 1,245</div>
                </div>
            </div>
        </div>
    )
}
