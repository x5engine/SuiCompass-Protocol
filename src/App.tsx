import { useState, useEffect } from 'react'
import ChatInterface from './components/chat/ChatInterface'
import { WalletProvider, useWallet } from './blockchain/WalletProvider'
import { NotificationProvider } from './components/ui/Notification'
import DebugPanel from './components/test/DebugPanel'
import AutoStakeToggle from './components/agent/AutoStakeToggle'
import BadgePopup from './components/gamification/BadgePopup'
import SidePanel from './components/ui/SidePanel'
import ParticleBackground from './components/ui/ParticleBackground'
import AuthLoader from './components/common/AuthLoader'
import { auth } from '../firebaseConfig.js'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'

function DebugPanelToggle() {
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const { isConnected } = useWallet()

  const enableDebugPanel = import.meta.env.DEV

  if (!isConnected || !enableDebugPanel) return null

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-[#0d1117] hover:bg-slate-800 border-slate-700 border transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={showDebugPanel ? 'Close Debug Panel' : 'Open Debug Panel'}
        >
          🐛
        </button>
      </div>
      {showDebugPanel && <DebugPanel onClose={() => setShowDebugPanel(false)} />}
    </>
  )
}

function MainApp() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Attempt to sign in on initial load if no user is present.
    // This will trigger the onAuthStateChanged listener below.
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((error: any) => {
        console.error("Anonymous sign-in failed", error);
        // Optionally show an error UI here
      });
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Auth state ready. User:", user.uid);
        setIsAuthReady(true);
        unsubscribe(); // We only need this for the initial load gate.
      }
    });
    
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return <AuthLoader />;
  }

  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      <div className="flex-1 relative">
        <ChatInterface />
        <DebugPanelToggle />
        <AutoStakeToggle />
      </div>
      <SidePanel />
    </div>
  )
}


function App() {
  return (
    <NotificationProvider>
      <WalletProvider autoConnect={true}>
        <ParticleBackground />
        <BadgePopup />
        <MainApp />
      </WalletProvider>
    </NotificationProvider>
  )
}

export default App
