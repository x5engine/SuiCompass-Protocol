import { useGamificationStore } from '../../stores/gamification-store';
import { useDashboardStore } from '../../stores/dashboard-store';
import { playSound } from '../../utils/sound-effects';

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 7000, 9000, 12000, 15000, 20000];

export default function LevelBadge() {
  const { stats } = useGamificationStore();
  const { setActiveTab } = useDashboardStore();

  const { level, points } = stats;
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const xpInLevel = points - currentLevelXP;
  const xpForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercentage = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100;

  const handleBadgeClick = () => {
    playSound('click');
    setActiveTab('achievements');
  }

  return (
    <button 
      onClick={handleBadgeClick}
      className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">Level {level}</span>
        <span className="text-xs text-slate-500">{points} / {nextLevelXP} XP</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden"> {/* Added overflow-hidden */}
        <div 
          className="bg-cyan-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </button>
  );
}
