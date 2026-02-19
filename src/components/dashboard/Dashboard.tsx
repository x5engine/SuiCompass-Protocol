import { useDashboardStore } from '../../stores/dashboard-store';
import ProfilePage from '../profile/ProfilePage';
import PortfolioView from '../portfolio/PortfolioView';
import ValidatorPerformance from '../validators/ValidatorPerformance';
import MarketDashboard from '../market/MarketDashboard';
import TransferHistory from '../transfers/TransferHistory';
import ContractExplorer from '../contracts/ContractExplorer';
import NFTGallery from '../nft/NFTGallery';
import AgentActivity from './AgentActivity';
import RWATokenization from './RWATokenization';
import ContractDeployer from './ContractDeployer';
import AchievementConstellation from '../d3/AchievementConstellation';
import ChessGame from '../games/ChessGame';
import { playSound } from '../../utils/sound-effects';

const FEATURES = [
  { id: 'profile', label: 'Profile', icon: '👤', description: 'View progress & badges', color: 'from-sky-500/20' },
  { id: 'portfolio', label: 'Portfolio', icon: '💰', description: 'Track assets & performance', color: 'from-blue-500/20' },
  { id: 'validators', label: 'Validators', icon: '⭐', description: 'Staking & Node Stats', color: 'from-purple-500/20' },
  { id: 'market', label: 'Market', icon: '📈', description: 'Live Price & Trends', color: 'from-green-500/20' },
  { id: 'achievements', label: 'Achievements', icon: '🏆', description: 'Visual badge constellation', color: 'from-yellow-500/20' },
  { id: 'games', label: 'Play', icon: '🎮', description: 'Play Chess & Earn XP', color: 'from-fuchsia-500/20' },
  { id: 'transfers', label: 'Transfers', icon: '📜', description: 'Transaction History', color: 'from-gray-500/20' },
  { id: 'contracts', label: 'Contracts', icon: '📦', description: 'Explore Smart Contracts', color: 'from-orange-500/20' },
];

export default function Dashboard() {
  const { activeTab, setActiveTab } = useDashboardStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfilePage />;
      case 'portfolio': return <PortfolioView />;
      case 'validators': return <ValidatorPerformance showList={true} />;
      case 'market': return <MarketDashboard />;
      case 'transfers': return <TransferHistory />;
      case 'contracts': return <ContractExplorer />;
      case 'nfts': return <NFTGallery />;
      case 'agent': return <AgentActivity />;
      case 'rwa': return <RWATokenization />;
      case 'deploy': return <ContractDeployer />;
      case 'achievements': return <AchievementConstellation />;
      case 'games': return <ChessGame />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl">
        {activeTab ? (
          <div className="animate-fade-in-up">
            <button 
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">←</div>
              <span className="font-semibold text-sm">Back to Hub</span>
            </button>
            {renderContent()}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white">Compass Hub</h2>
              <p className="text-slate-400">Your central command for the Sui ecosystem.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  onMouseEnter={() => playSound('hover')}
                  className="relative p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 transition-all group text-left"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-bold text-slate-100">{item.label}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}