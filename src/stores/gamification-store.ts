import { create } from 'zustand';
import { doc, setDoc, onSnapshot, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig.js';
import { Badge, allBadges } from './badge-library';

export type ActionType = 'chat' | 'stake' | 'swap' | 'earn' | 'game' | 'game_win' | 'game_loss' | 'portfolio';

interface GamificationStats {
  level: number;
  points: number;
  actionsCount: { [key in ActionType]?: number };
  streakDays: number;
  lastActiveDate: string | null;
}

interface GamificationState {
  stats: GamificationStats;
  badges: Badge[];
  allBadges: Badge[];
  recentUnlock: Badge | null;
  initialize: () => void;
  awardPoints: (action: ActionType, amount: number) => void;
  awardBadge: (badgeId: string) => void;
  clearRecentUnlock: () => void;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  stats: { level: 1, points: 0, actionsCount: {}, streakDays: 0, lastActiveDate: null },
  badges: [],
  allBadges: allBadges,
  recentUnlock: null,
  initialize: () => {
    const user = auth.currentUser;
    if (!user) return;
    const statsDocRef = doc(db, 'users', user.uid, 'gamification', 'stats');
    
    // Check for streak update
    getDoc(statsDocRef).then((snap) => {
        if(snap.exists()) {
            const data = snap.data() as GamificationStats;
            const today = new Date().toISOString().split('T')[0];
            const lastActive = data.lastActiveDate;
            
            if (lastActive !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                let newStreak = data.streakDays;
                if (lastActive === yesterdayStr) {
                    newStreak += 1;
                } else {
                    newStreak = 1; // Reset streak if missed a day
                }
                
                updateDoc(statsDocRef, {
                    streakDays: newStreak,
                    lastActiveDate: today
                });
            }
        }
    });

    onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        set({ stats: docSnap.data() as GamificationStats });
      } else {
        setDoc(statsDocRef, get().stats);
      }
    });
    // ... badge logic would go here
  },
  awardPoints: (action, amount) => {
    const user = auth.currentUser;
    if (!user) return;
    const statsDocRef = doc(db, 'users', user.uid, 'gamification', 'stats');
    updateDoc(statsDocRef, {
      points: increment(amount),
      [`actionsCount.${action}`]: increment(1)
    });
  },
  awardBadge: (badgeId) => {
    const badge = allBadges.find(b => b.id === badgeId);
    if(badge) set({ recentUnlock: badge });
  },
  clearRecentUnlock: () => set({ recentUnlock: null }),
}));