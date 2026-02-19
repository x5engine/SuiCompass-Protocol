export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'chat' | 'sui' | 'defi' | 'game' | 'meta';
}

export const allBadges: Badge[] = [
  // ... a full library of badges
  { id: 'chat_1', name: 'First Chat', description: 'You started your first conversation!', icon: '👋', category: 'chat' },
  { id: 'stake_1', name: 'First Stake', description: 'You staked SUI for the first time!', icon: '⭐', category: 'sui' },
  { id: 'swap_1', name: 'First Swap', description: 'You performed your first token swap!', icon: '🔄', category: 'defi' },
  { id: 'game_1', name: 'First Game', description: 'You played your first game of chess!', icon: '🎮', category: 'game' },
];
