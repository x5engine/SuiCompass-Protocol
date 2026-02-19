import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../blockchain/WalletProvider';
import { playSound } from '../../utils/sound-effects';
import UserMenu from '../ui/UserMenu';
import { useAutoStakeStore } from '../../stores/auto-stake-store';
import { showNotification } from '../ui/Notification';
import { useAutoStakeAgent } from '../../hooks/useAutoStakeAgent';

export function ChatHeader() {
  const { isConnected, connect } = useWallet();
  const location = useLocation();
  const path = location.pathname;
  
  // Initialize the agent hook to ensure it's monitoring when enabled
  const { executePendingStake } = useAutoStakeAgent();
  
  // Connect to the auto-stake store
  const { enabled, status, updateSettings } = useAutoStakeStore();

  const handleSound = () => playSound('click');

  const toggleBot = () => {
    playSound('click');
    const newState = !enabled;
    updateSettings({ enabled: newState });
    
    showNotification({
      type: newState ? 'success' : 'info',
      title: newState ? 'Auto-Stake Agent Active' : 'Agent Paused',
      message: newState ? 'I am now monitoring your wallet for staking opportunities.' : 'Monitoring paused.',
    });
  };

  const NavLink = ({ to, label, icon }: { to: string, label: string, icon?: string }) => {
    const isActive = path === to || (to !== '/' && path.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={handleSound}
        className={`text-sm font-medium transition-all px-3 py-2 rounded-lg flex items-center gap-2 ${
          isActive 
            ? 'text-white bg-slate-800' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        {icon && <span>{icon}</span>}
        {label}
      </Link>
    );
  };

  return (
    <nav className="w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl z-50 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" onClick={handleSound} className="flex items-center gap-3 cursor-pointer mr-8">
            <div className="text-3xl">🧭</div>
            <h1 className="text-xl font-bold text-slate-100 hidden md:block">SuiCompass</h1>
          </Link>
          
          {/* MAIN NAVIGATION */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <NavLink to="/" label="Chat" icon="💬" />
            <NavLink to="/dashboard" label="Dashboard" icon="📊" />
            <NavLink to="/market" label="Market" icon="📈" />
            <NavLink to="/assets" label="Assets" icon="💎" />
            <NavLink to="/games" label="Games" icon="🎮" />
            <NavLink to="/profile" label="Profile" icon="🆔" />
            <NavLink to="/faq" label="FAQ" icon="❓" />
          </div>

          <div className="flex items-center gap-4 ml-4">
            <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

            {isConnected ? (
              <div className="flex items-center gap-4">
                <UserMenu />
                
                {/* INTERACTIVE BOT STATUS BUTTON WITH ICON */}
                <button 
                  onClick={toggleBot}
                  onMouseEnter={() => playSound('hover')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                    enabled 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                  title={enabled ? "Auto-Stake Agent Active" : "Enable Auto-Stake Agent"}
                >
                  <div className="relative">
                    <span className="text-lg">🤖</span>
                    {enabled && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">
                    {enabled ? (status === 'idle' ? 'Live' : status) : 'Idle'}
                  </span>
                </button>

                {status === 'ready' && (
                    <button 
                        onClick={executePendingStake}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse"
                    >
                        STAKE NOW
                    </button>
                )}
              </div>
            ) : (
              <button onClick={() => { handleSound(); connect(); }} className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition-all">Connect</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
