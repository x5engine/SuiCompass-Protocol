import { useState } from 'react';
import { useWallet } from '../../blockchain/WalletProvider';
import { useDashboardStore } from '../../stores/dashboard-store';
import { playSound } from '../../utils/sound-effects';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { publicKey, disconnect } = useWallet();
  const { setActiveTab } = useDashboardStore();

  const handleProfileClick = () => {
    playSound('click');
    setActiveTab('profile');
    setIsOpen(false);
  };

  if (!publicKey) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => playSound('hover')}
        className="px-4 py-2 bg-slate-800/80 backdrop-blur rounded-lg text-slate-300 text-sm font-mono border border-slate-700 shadow-lg shadow-cyan-900/20 flex items-center gap-2"
      >
        <span className="mr-2 text-cyan-500">●</span>
        {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
      </button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 animate-fade-in-down"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-2">
            <button
              onClick={handleProfileClick}
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg"
            >
              View My Profile
            </button>
            <a
              href={`https://suiscan.xyz/${import.meta.env.VITE_SUI_NETWORK || 'testnet'}/account/${publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg"
            >
              View on SuiScan
            </a>
            <button
              onClick={disconnect}
              className="block w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
