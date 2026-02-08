import { useState, useEffect } from 'react'
import { useChatStore } from '../../stores/chat-store'
import { useDashboardStore } from '../../stores/dashboard-store'
import { playSound } from '../../utils/sound-effects'
import { useWallet } from '../../blockchain/WalletProvider'
import suiClient, { getUsdcBalance } from '../../blockchain/sui-client' // Import getUsdcBalance
import LevelBadge from '../gamification/LevelBadge'

export default function ChatSidebar() {
  const { conversations, currentConversationId, selectConversation, createConversation, deleteConversation } = useChatStore()
  const { setShowDashboard } = useDashboardStore();
  
  const { publicKey, isConnected } = useWallet()
  const [suiBalance, setSuiBalance] = useState<string>('0.00')
  const [usdcBalance, setUsdcBalance] = useState<string>('0.00')

  useEffect(() => {
      if (isConnected && publicKey) {
          suiClient.getBalance({ owner: publicKey }).then(bal => {
            setSuiBalance((Number(bal.totalBalance) / 1e9).toFixed(2));
          });
          getUsdcBalance(publicKey).then(bal => {
            setUsdcBalance(bal.toFixed(2));
          });
      }
  }, [isConnected, publicKey])

  const handleSelect = (id: string) => {
    playSound('click')
    selectConversation(id)
    setShowDashboard(false);
  }

  const handleNewChat = (suggestion?: string) => {
    playSound('click')
    createConversation();
    setShowDashboard(false);
    if (suggestion) {
      const chatInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (chatInput) chatInput.value = suggestion;
    }
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id);
  }

  return (
    <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Conversations</h2>
        <button onClick={() => handleNewChat()} className="p-1.5 text-slate-400 hover:text-white rounded-lg">+</button>
      </div>
      
      <div className="p-4 bg-slate-800/20 border-b border-slate-700/50">
          <LevelBadge />
      </div>

      <div className="p-4 border-b border-slate-700">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wide">Wallet Assets</h3>
          <div className="space-y-2 mt-2">
              <div className="flex justify-between items-center"><span className="text-sm">SUI</span><span className="font-mono">{suiBalance}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm">USDC</span><span className="font-mono">{usdcBalance}</span></div>
          </div>
          {isConnected && (
            <button 
              onClick={() => handleNewChat('Swap 1 SUI to USDC')}
              className="mt-3 w-full py-1.5 bg-cyan-600/20 text-cyan-400 text-xs rounded"
            >
              Swap SUI / USDC
            </button>
          )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => handleSelect(conv.id)}
            className={`w-full text-left p-3 rounded-lg text-sm group relative ${currentConversationId === conv.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
          >
            <span className="truncate pr-6 block">{conv.title}</span>
            <div onClick={(e) => handleDelete(e, conv.id)} className="absolute right-2 top-3 p-1 rounded opacity-0 group-hover:opacity-100">🗑️</div>
          </button>
        ))}
      </div>
    </div>
  )
}