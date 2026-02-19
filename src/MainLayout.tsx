import { useWallet } from './blockchain/WalletProvider';
import ChatInterface from './components/chat/ChatInterface';
import SidePanel from './components/ui/SidePanel';

export default function MainLayout() {
  const { isConnected } = useWallet();

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 
        This is now the main application container.
        It's a flexbox row that will contain the chat interface and the side panel.
      */}
      <div className="flex-1 flex w-full">
        <main className="flex-1 flex flex-col relative">
          <ChatInterface />
        </main>
        
        {/* The SidePanel is now a direct child of the flex container */}
        {isConnected && <SidePanel />}
      </div>
    </div>
  );
}