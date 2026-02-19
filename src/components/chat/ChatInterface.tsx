import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chat-store';
import { useGamificationStore } from '../../stores/gamification-store';
import { useDashboardStore } from '../../stores/dashboard-store';
import { generateIntent } from '../../ai/embedapi-client';
import { useWallet } from '../../blockchain/WalletProvider';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EpicLoader from '../common/EpicLoader';
import { playSound } from '../../utils/sound-effects';
import { getSuggestedPrompts } from '../../ai/contract-knowledge';

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (msg: string) => void }) {
    const [suggestions, setSuggestions] = useState<{text: string, icon: string, color: string}[]>([]);

    useEffect(() => {
        const rawPrompts = getSuggestedPrompts();
        const mappedSuggestions = rawPrompts.map((text, idx) => {
            let icon = "⚡";
            let color = "from-cyan-500/20 to-blue-500/5";

            if (text.includes("Index")) { icon = "📊"; color = "from-emerald-500/20 to-teal-500/5"; }
            else if (text.includes("Bridge")) { icon = "🌉"; color = "from-violet-500/20 to-purple-500/5"; }
            else if (text.includes("Bet") || text.includes("Odds")) { icon = "🎲"; color = "from-amber-500/20 to-orange-500/5"; }
            else if (text.includes("Flash")) { icon = "⚡"; color = "from-yellow-500/20 to-amber-500/5"; }
            else if (text.includes("Copy") || text.includes("Trader")) { icon = "👥"; color = "from-blue-500/20 to-indigo-500/5"; }
            else if (text.includes("Stream")) { icon = "⏳"; color = "from-cyan-500/20 to-sky-500/5"; }
            else if (text.includes("Option")) { icon = "📉"; color = "from-pink-500/20 to-rose-500/5"; }
            else if (text.includes("Lottery")) { icon = "🎰"; color = "from-fuchsia-500/20 to-purple-500/5"; }
            else if (text.includes("Credit") || text.includes("Identity")) { icon = "🆔"; color = "from-indigo-500/20 to-violet-500/5"; }

            return { text, icon, color };
        });
        setSuggestions(mappedSuggestions);
    }, []);

    const handleItemClick = (text: string) => {
        playSound('click');
        onSuggestionClick(text);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
            {/* LOGO & BRANDING */}
            <div className="mb-12 text-center group">
                <div className="relative inline-block mb-6">
                    <div className="text-8xl md:text-9xl filter drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-500 cursor-default animate-float">🧭</div>
                    <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">BETA</div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-slate-400">
                    SuiCompass
                </h1>
                <p className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto font-medium">
                    Your epic AI companion for the <span className="text-cyan-400 font-bold">Sui</span> ecosystem. 
                    <br/><span className="text-sm opacity-60">Ready to trade, stake, and play.</span>
                </p>
            </div>

            {/* SUGGESTION GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestions.map(item => (
                    <button 
                        key={item.text} 
                        onClick={() => handleItemClick(item.text)}
                        onMouseEnter={() => playSound('hover')}
                        className={`group relative overflow-hidden p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 text-left`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                                {item.icon}
                            </div>
                            <div>
                                <span className="block font-bold text-slate-200 group-hover:text-white transition-colors">{item.text}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold group-hover:text-cyan-400 transition-colors">One-click action</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* QUICK HINT */}
            <div className="mt-12 flex items-center gap-3 text-slate-500 text-sm bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800/50">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Pro tip: Try saying "Create a lossless lottery pool!"
            </div>
        </div>
    );
}

function MessageList() {
    const messages = useChatStore((state) => state.messages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-4 shadow-xl ${
                        msg.role === 'user' 
                            ? 'bg-cyan-600/20 text-slate-100 border border-cyan-500/20 ml-12' 
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 mr-12 backdrop-blur-sm'
                    }`}>
                        <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || ''}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}

function ChatInput({ onSend, isLoading }: { onSend: (msg: string) => void, isLoading: boolean }) {
    const [input, setInput] = useState('');
    const handleSendClick = () => { if (input.trim()) { onSend(input); setInput(''); } };
    return (
        <div className="p-4 md:p-6 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto flex gap-2 md:gap-4 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSendClick()} 
                    placeholder="Message SuiCompass..." 
                    className="relative flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all placeholder:text-slate-600" 
                    disabled={isLoading} 
                />
                <button 
                    onClick={handleSendClick} 
                    disabled={isLoading} 
                    className="relative px-6 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function ChatInterface() {
  const { currentConversationId, createConversation, addMessage, setSuggestions, messages } = useChatStore();
  const { awardPoints } = useGamificationStore();
  const { setActiveTab } = useDashboardStore();
  const { signAndExecute, publicKey } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSend = async (message: string) => {
    const sanitizedMsg = message.trim().toLowerCase();
    if (!sanitizedMsg) return;

    if (sanitizedMsg.includes('play chess')) {
        playSound('click');
        awardPoints('game', 25);
        setActiveTab('games');
        navigate('/dashboard');
        return;
    }

    setLoading(true);
    playSound('click');
    
    let convId = currentConversationId || await createConversation();
    if (!convId) { setLoading(false); return; }

    const history = messages.slice(-10);
    await addMessage(convId, { role: 'user', content: message });
    awardPoints('chat', 10);
    
    try {
        const intentResult = await generateIntent(message, history);
        
        if (intentResult.success && intentResult.reply) {
            await addMessage(convId, { role: 'assistant', content: intentResult.reply });
            setSuggestions(intentResult.suggestions || []);
        } else {
            await addMessage(convId, { role: 'assistant', content: "I'm having trouble connecting to the Sui network right now. Please try again." });
        }
    } catch (error) {
        console.error("AI Error:", error);
        await addMessage(convId, { role: 'assistant', content: "Sorry, I encountered an error processing your request." });
    } finally {
        setLoading(false);
    }
  };

  const showWelcome = !currentConversationId && messages.length === 0;

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-950/50">
      {showWelcome ? <WelcomeScreen onSuggestionClick={handleSend} /> : <MessageList />}
      {loading && (
          <div className="absolute bottom-24 left-4 md:left-8 p-4 bg-slate-800/90 rounded-2xl border border-slate-700/50 backdrop-blur-md shadow-2xl animate-fade-in-up z-10">
              <EpicLoader />
          </div>
      )}
      <ChatInput onSend={handleSend} isLoading={loading} />
    </div>
  );
}