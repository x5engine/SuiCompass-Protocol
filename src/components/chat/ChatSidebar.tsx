import { useState, useEffect } from 'react';
import { useChatStore } from '../../stores/chat-store';
import { useDashboardStore } from '../../stores/dashboard-store';
import { playSound } from '../../utils/sound-effects';
import { useWallet } from '../../blockchain/WalletProvider';
import suiClient, { getUsdcBalance } from '../../blockchain/sui-client';
import LevelBadge from '../gamification/LevelBadge';
import { useNavigate } from 'react-router-dom';

export default function ChatSidebar() {
  const { conversations, currentConversationId, selectConversation, createConversation, deleteConversation } = useChatStore();
  const { setShowDashboard, setActiveTab } = useDashboardStore();
  const { publicKey, isConnected } = useWallet();
  const [suiBalance, setSuiBalance] = useState('0.00');
  const [usdcBalance, setUsdcBalance] = useState('0.00');
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && publicKey) {
      suiClient.getBalance({ owner: publicKey }).then(bal => setSuiBalance((Number(bal.totalBalance) / 1e9).toFixed(2)));
      getUsdcBalance(publicKey).then(bal => setUsdcBalance(bal.toFixed(2)));
    }
  }, [isConnected, publicKey]);

  const handleSelect = (id: string) => {
    playSound('click');
    selectConversation(id);
    navigate('/');
  };

  const handleNewChat = async (suggestion?: string) => {
    playSound('click');
    const newId = await createConversation();
    if (newId) {
      selectConversation(newId);
      navigate('/');
    }
  };
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playSound('click');
    deleteConversation(id);
  }

  return (
    // THE FIX: Added 'hidden md:flex' to hide on mobile and show on desktop
    <div className="hidden md:flex w-64 h-full bg-slate-900 border-r border-slate-800 flex-col shrink-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Conversations</h2>
        <button 
            onClick={() => handleNewChat()}
            onMouseEnter={() => playSound('hover')}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>
      
      <div className="p-4 border-b border-slate-700/50 bg-slate-800/20">
          <LevelBadge />
      </div>

      <div className="p-4 border-b border-slate-700">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Wallet Assets</h3>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center"><span className="text-sm">SUI</span><span className="font-mono">{suiBalance}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">USDC</span><span className="font-mono">{usdcBalance}</span></div>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => handleSelect(conv.id)}
            onMouseEnter={() => playSound('hover')}
            className={`w-full text-left p-3 rounded-lg text-sm group relative ${currentConversationId === conv.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
          >
            <span className="truncate pr-6 block">{conv.title || 'New Chat'}</span>
            <div onClick={(e) => handleDelete(e, conv.id)} className="absolute right-2 top-3 p-1 rounded opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400">🗑️</div>
          </button>
        ))}
      </div>
    </div>
  );
}