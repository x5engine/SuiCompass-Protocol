import { Outlet } from 'react-router-dom';
import ChatSidebar from './components/chat/ChatSidebar';
import SidePanel from './components/ui/SidePanel';
import { useWallet } from './blockchain/WalletProvider';
import { useAuth } from './firebase/useAuth';
import AuthLoader from './components/common/AuthLoader';
import { useEffect } from 'react';
import { useChatStore } from './stores/chat-store';
import { useGamificationStore } from './stores/gamification-store';
import { ChatHeader } from './components/chat/ChatHeader';

function App() {
  const { isConnected } = useWallet();
  const { user, loading, isOffline } = useAuth(); // Now returns isOffline

  useEffect(() => {
    if (user) {
      useChatStore.getState().initialize();
      useGamificationStore.getState().initialize();
    } else if (isOffline) {
        // Fallback to offline mode immediately
        useChatStore.getState().setOfflineMode(true);
        // We can also initialize a local gamification store if needed, but chat is priority
    }
  }, [user, isOffline]);

  if (loading) {
    return <AuthLoader />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          <Outlet />
        </main>
        {isConnected && <SidePanel />}
      </div>
    </div>
  );
}

export default App;