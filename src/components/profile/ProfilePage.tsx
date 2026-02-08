import { useGamificationStore } from '../../stores/gamification-store';
import LevelBadge from '../gamification/LevelBadge';

export default function ProfilePage() {
  const { stats, badges, allBadges } = useGamificationStore();

  return (
    <div className="p-4 md:p-8 text-white animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Level & Stats */}
          <div className="md:col-span-1 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Progress</h2>
            <LevelBadge />
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Points:</span>
                <span className="font-mono text-white">{stats.points}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chats Sent:</span>
                <span className="font-mono text-white">{stats.actionsCount.chat || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stakes Made:</span>
                <span className="font-mono text-white">{stats.actionsCount.stake || 0}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-slate-400">Swaps Made:</span>
                <span className="font-mono text-white">{stats.actionsCount.swap || 0}</span>
              </div>
            </div>
          </div>
          
          {/* Wallet Info (Placeholder) */}
          <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center items-center text-center">
             <div className="text-5xl mb-4">🧭</div>
             <h2 className="text-lg font-bold">Sui Wallet</h2>
             <p className="text-xs text-slate-400 font-mono mt-1 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                {/* Public key would be passed here or read from store */}
                0x...placeholder
             </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allBadges.map(badge => {
              const isUnlocked = badges.some(b => b.id === badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isUnlocked 
                      ? 'bg-slate-800 border-slate-700' 
                      : 'bg-slate-900/50 border-slate-800 opacity-40'
                  }`}
                >
                  <div className="text-4xl text-center mb-3">{badge.icon}</div>
                  <h3 className={`font-bold text-sm text-center ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 text-center mt-1 h-12 overflow-hidden">
                    {isUnlocked ? badge.description : 'Keep exploring to unlock.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
