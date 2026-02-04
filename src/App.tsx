import { useState } from 'react'
import ChatInterface from './components/chat/ChatInterface'
import { WalletProvider, useWallet } from './blockchain/WalletProvider'
import { NotificationProvider } from './components/ui/Notification'
import DebugPanel from './components/test/DebugPanel'
import AutoStakeToggle from './components/agent/AutoStakeToggle'

function DebugPanelToggle() {
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const { isConnected } = useWallet()

  // STRICTLY localhost/dev only
  const enableDebugPanel = import.meta.env.DEV

  if (!isConnected || !enableDebugPanel) return null

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={[
              'w-12 h-12 rounded-full flex items-center justify-center text-2xl',
              'border transition-all duration-200 hover:scale-110 active:scale-95',
              'bg-[#0d1117] hover:bg-slate-800 border-slate-700',
              // glow
              showDebugPanel
                ? 'shadow-xl shadow-cyan-500/30 ring-2 ring-cyan-500/40'
                : 'shadow-lg shadow-cyan-500/15',
            ].join(' ')}
            aria-label={showDebugPanel ? 'Close Debug Panel' : 'Open Debug Panel'}
          >
            🐛
          </button>

          {/* Label */}
          <div className="select-none pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity">
            <div className="px-3 py-2 rounded-lg bg-[#0d1117] border border-slate-700/60 text-xs text-slate-200 shadow-xl whitespace-nowrap">
              <div className="font-semibold text-cyan-300/90">Debug Tools</div>
            </div>
          </div>
        </div>
      </div>
      {showDebugPanel && <DebugPanel onClose={() => setShowDebugPanel(false)} />}
    </>
  )
}

import SidePanel from './components/ui/SidePanel'
import ParticleBackground from './components/ui/ParticleBackground'

function App() {
  return (
    <NotificationProvider>
      <WalletProvider autoConnect={true}>
        <ParticleBackground />
        <div className="flex h-screen overflow-hidden relative z-10">
          <div className="flex-1 relative">
            <ChatInterface />
            <DebugPanelToggle />
            <AutoStakeToggle />
          </div>
          <SidePanel />
        </div>
      </WalletProvider>
    </NotificationProvider>
  )
}

export default App
