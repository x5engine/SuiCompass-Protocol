import { Badge, useGamificationStore } from '../../stores/gamification-store';
import { useEffect } from 'react';
import { playSound } from '../../utils/sound-effects';

export default function BadgePopup() {
  const { recentUnlock, clearRecentUnlock } = useGamificationStore();

  useEffect(() => {
    if (recentUnlock) {
      playSound('success');
      const timer = setTimeout(() => {
        clearRecentUnlock();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentUnlock, clearRecentUnlock]);

  if (!recentUnlock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(6,182,212,0.5)] transform animate-bounce-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
        <div className="text-6xl mb-4 animate-bounce relative z-10">{recentUnlock.icon}</div>
        <h3 className="text-2xl font-bold text-white mb-2 relative z-10 uppercase tracking-wide">Badge Unlocked!</h3>
        <h4 className="text-xl font-bold text-cyan-400 mb-2 relative z-10">{recentUnlock.name}</h4>
        <p className="text-slate-300 relative z-10">{recentUnlock.description}</p>
      </div>
    </div>
  );
}