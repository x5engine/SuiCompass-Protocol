import { useState, useEffect, useRef } from 'react'
import { useWallet } from '../../blockchain/WalletProvider'
import { generateIntent } from '../../ai/embedapi-client'
import Dashboard from '../dashboard/Dashboard'
import EpicLoader from '../common/EpicLoader'
import ChatSidebar from './ChatSidebar'
import { useChatStore, ChatMessage } from '../../stores/chat-store'
import { useGamificationStore } from '../../stores/gamification-store'
import { useDashboardStore } from '../../stores/dashboard-store'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { playSound } from '../../utils/sound-effects'
import UserMenu from '../ui/UserMenu'

export default function ChatInterface() {
  const { isConnected, connect } = useWallet()
  const { messages, createConversation, addMessage, setSuggestions, selectConversation } = useChatStore()
  const { awardPoints } = useGamificationStore()
  const { showDashboard, setShowDashboard, setActiveTab } = useDashboardStore()
  
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const addStoreMessage = async (role: ChatMessage['role'], content: string) => {
    try {
      const convId = useChatStore.getState().currentConversationId || await createConversation();
      await addMessage(convId, { role, content });
    } catch (error) {
      console.error("Failed to add message to store:", error);
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    await addStoreMessage('user', userMessage);
    awardPoints('chat', 10);
    const intentResult = await generateIntent(userMessage);
    if (intentResult.reply) await addStoreMessage('assistant', intentResult.reply);
    setSuggestions(intentResult.suggestions || []);
    // Handle actions...
    setLoading(false);
  }
  
  const handleLogoClick = () => {
    playSound('click');
    setShowDashboard(false);
    setActiveTab(null);
    selectConversation(null); // Deselects conversation to show welcome screen
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <nav className="w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-2 text-slate-400">☰</button>
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
                <div className="text-3xl">🧭</div>
                <h1 className="text-xl font-bold text-slate-100 hidden sm:block">SuiCompass</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowDashboard(!showDashboard)} className="text-slate-300 hover:text-white text-sm font-medium">
                {showDashboard ? 'Chat' : 'Dashboard'}
              </button>
              {isConnected ? <UserMenu /> : <button onClick={connect} className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-semibold text-sm">Connect</button>}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {showMobileSidebar && (
          <div className="md:hidden fixed inset-0 bg-black/60 z-50" onClick={() => setShowMobileSidebar(false)}>
            <div className="w-64 h-full bg-slate-900" onClick={e => e.stopPropagation()}><ChatSidebar /></div>
          </div>
        )}
        <div className="hidden md:block"><ChatSidebar /></div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {showDashboard ? (
            <div className="h-full overflow-y-auto"><Dashboard /></div>
          ) : (
            <div className="flex flex-col h-full w-full">
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4">
                    <div className="text-6xl mb-6">👋</div>
                    <h2 className="text-2xl font-bold text-slate-300">Hello! I'm SuiCompass.</h2>
                    <p className="text-center max-w-md">Your AI Assistant for the Sui Ecosystem.</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3 md:p-4 ${msg.role === 'user' ? 'bg-cyan-600/20' : 'bg-slate-800'}`}>
                      <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                    </div>
                  </div>
                ))}
                {loading && <div className="flex justify-start"><div className="p-4 bg-slate-800 rounded-2xl"><EpicLoader /></div></div>}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="max-w-4xl mx-auto flex gap-2 md:gap-4">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask me to stake SUI..." className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:ring-2 focus:ring-cyan-500/50 outline-none" disabled={loading} />
                  <button onClick={handleSend} disabled={loading} className="px-5 py-3 bg-cyan-600 text-white rounded-xl font-semibold">Send</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}