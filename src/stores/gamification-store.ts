import { create } from 'zustand'
import { db, auth } from '../../firebaseConfig.js'
import { User } from 'firebase/auth'
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  increment,
  Unsubscribe
} from 'firebase/firestore'
import { playSound } from '../utils/sound-effects'
import confetti from 'canvas-confetti'

// --- Types ---

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'novice' | 'defi' | 'social' | 'whale' | 'secret'
  unlockedAt?: number // timestamp
}

export interface UserStats {
  points: number
  level: number
  actionsCount: {
    stake: number
    swap: number
    earn: number
    chat: number
    [key: string]: number
  }
}

interface GamificationState {
  stats: UserStats
  badges: Badge[] // User's unlocked badges
  allBadges: Badge[] // Definitions of all badges
  recentUnlock: Badge | null
  
  unsubscribeStats: Unsubscribe | null
  unsubscribeBadges: Unsubscribe | null
  
  initialize: () => void
  awardPoints: (actionType: 'stake' | 'swap' | 'earn' | 'chat', amount: number) => Promise<void>
  clearRecentUnlock: () => void
}

// --- Constants ---

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 7000, 9000, 12000, 15000, 20000];

export const ALL_BADGES: Badge[] = [
  // --- Novice (The Awakening) ---
  { id: 'first_chat', name: 'Digital Whisper', description: 'Awakened the AI with your first message.', icon: '🔮', category: 'novice' },
  { id: 'first_stake', name: 'Seed Planter', description: 'Planted your first SUI seed in the staking fields.', icon: '🌱', category: 'novice' },
  { id: 'first_swap', name: 'Coin Flipper', description: 'Completed your first atomic swap.', icon: '🪙', category: 'novice' },
  { id: 'level_5', name: 'Rising Star', description: 'Reached Level 5 consciousness.', icon: '🌟', category: 'novice' },

  // --- DeFi (The Yieldmancer) ---
  { id: 'defi_degen', name: 'Yield Seeker', description: 'Entered the lending markets.', icon: '🌾', category: 'defi' },
  { id: 'swap_master', name: 'Swap Sorcerer', description: 'Performed 10+ swaps.', icon: '🧙‍♂️', category: 'defi' },
  { id: 'staking_guru', name: 'Stake Sage', description: 'Staked over 10 times.', icon: '🧘', category: 'defi' },
  { id: 'liquidity_lord', name: 'Liquidity Lord', description: 'Provided assets to the ecosystem.', icon: '💧', category: 'defi' },
  { id: 'diamond_hands', name: 'Diamond Hands', description: 'Held positions without unstaking for a long duration.', icon: '💎', category: 'defi' },
  { id: 'alpha_hunter', name: 'Alpha Hunter', description: 'Discovered a high-yield opportunity.', icon: '🦅', category: 'defi' },

  // --- Whale (The Leviathan) ---
  { id: 'whale', name: 'Baby Whale', description: 'Accumulated 1000 Points.', icon: '🐋', category: 'whale' },
  { id: 'megalodon', name: 'Megalodon', description: 'Accumulated 5000 Points.', icon: '🦈', category: 'whale' },
  { id: 'kraken', name: 'The Kraken', description: 'Accumulated 10,000 Points. You move markets.', icon: '🦑', category: 'whale' },
  { id: 'market_mover', name: 'Market Mover', description: 'Executed a swap larger than 1000 SUI.', icon: '🌊', category: 'whale' },

  // --- Social (The Oracle) ---
  { id: 'chatterbox', name: 'Neural Networker', description: 'Sent 50 messages to the AI.', icon: '🗣️', category: 'social' },
  { id: 'prompt_engineer', name: 'Prompt Engineer', description: 'Mastered the art of talking to machines.', icon: '🤖', category: 'social' },
  { id: 'community_pillar', name: 'Community Pillar', description: 'Your presence is felt.', icon: '🏛️', category: 'social' },

  // --- Secret (The Void) ---
  { id: 'glitch', name: 'The Glitch', description: 'Found a bug (or broke the system).', icon: '👾', category: 'secret' },
  { id: 'time_traveler', name: 'Time Traveler', description: 'Interacted from a different timezone.', icon: '⏳', category: 'secret' },
  { id: 'sui_maxi', name: 'Sui Maxi', description: '100% of portfolio is in SUI.', icon: '🔵', category: 'secret' },
];

// --- Store ---

export const useGamificationStore = create<GamificationState>((set, get) => ({
  stats: {
    points: 0,
    level: 1,
    actionsCount: { stake: 0, swap: 0, earn: 0, chat: 0 }
  },
  badges: [],
  allBadges: ALL_BADGES,
  recentUnlock: null,
  unsubscribeStats: null,
  unsubscribeBadges: null,

  initialize: () => {
    auth.onAuthStateChanged(async (user: User | null) => {
      // Cleanup
      if (get().unsubscribeStats) get().unsubscribeStats!();
      if (get().unsubscribeBadges) get().unsubscribeBadges!();

      if (user) {
        // 1. Subscribe to Stats
        const statsRef = doc(db, `users/${user.uid}/gamification/stats`);
        
        const unsubStats = onSnapshot(statsRef, (docSnap) => {
          if (docSnap.exists()) {
            set({ stats: docSnap.data() as UserStats });
          } else {
            // Initialize defaults if empty
            setDoc(statsRef, {
              points: 0,
              level: 1,
              actionsCount: { stake: 0, swap: 0, earn: 0, chat: 0 }
            });
          }
        });

        // 2. Subscribe to Badges
        const badgesRef = collection(db, `users/${user.uid}/gamification/badges/items`);
        const unsubBadges = onSnapshot(badgesRef, (snapshot) => {
          const badges = snapshot.docs.map(d => d.data() as Badge);
          set({ badges });
        });

        set({ unsubscribeStats: unsubStats, unsubscribeBadges: unsubBadges });
      } else {
        set({ stats: { points: 0, level: 1, actionsCount: { stake: 0, swap: 0, earn: 0, chat: 0 } }, badges: [] });
      }
    });
  },

  awardPoints: async (actionType, amount) => {
    const user = auth.currentUser;
    if (!user) return;

    const statsRef = doc(db, `users/${user.uid}/gamification/stats`);
    const currentStats = get().stats;
    
    // Optimistic Calculation
    const newPoints = currentStats.points + amount;
    const newActionCount = (currentStats.actionsCount[actionType] || 0) + 1;
    
    // Check Level Up
    let newLevel = currentStats.level;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (newPoints >= LEVEL_THRESHOLDS[i]) {
            newLevel = i + 1;
        }
    }
    
    const isLevelUp = newLevel > currentStats.level;

    // --- Updates ---
    
    // 1. Update Stats Doc
    await setDoc(statsRef, {
        points: increment(amount),
        level: newLevel,
        actionsCount: {
            ...currentStats.actionsCount,
            [actionType]: newActionCount
        }
    }, { merge: true });

    // 2. Check for Badges (Local Logic)
    const currentBadgeIds = get().badges.map(b => b.id);
    const badgesToAward: Badge[] = [];

    // Helper to award
    const award = (badgeId: string) => {
        if (!currentBadgeIds.includes(badgeId)) {
            const badgeDef = ALL_BADGES.find(b => b.id === badgeId);
            if (badgeDef) {
                badgesToAward.push({
                    ...badgeDef,
                    unlockedAt: Date.now()
                });
            }
        }
    };

    // --- Badge Logic Rules ---
    if (newActionCount === 1) award(`first_${actionType}`);
    
    if (actionType === 'chat' && newActionCount >= 50) award('chatterbox');
    if (actionType === 'stake' && newActionCount >= 10) award('staking_guru');
    if (actionType === 'swap' && newActionCount >= 10) award('swap_master');
    
    if (newPoints >= 1000) award('whale');
    if (newPoints >= 5000) award('megalodon');
    if (newPoints >= 10000) award('kraken');
    
    if (newLevel >= 5) award('level_5');
    
    if (currentStats.actionsCount.earn > 0) award('defi_degen');

    // Commit Badges
    for (const badge of badgesToAward) {
        const badgeRef = doc(db, `users/${user.uid}/gamification/badges/items/${badge.id}`);
        await setDoc(badgeRef, badge);
        
        // Trigger Popup
        set({ recentUnlock: badge });
        playSound('success'); 
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#00FFFF'] });
    }

    if (isLevelUp) {
        playSound('success'); // Level up sound
        confetti({ particleCount: 300, spread: 150, origin: { y: 0.6 } });
    }
  },

  clearRecentUnlock: () => set({ recentUnlock: null })

}));
