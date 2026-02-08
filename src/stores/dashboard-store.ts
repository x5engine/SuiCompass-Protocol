import { create } from 'zustand';

type DashboardTab = 'portfolio' | 'validators' | 'market' | 'transfers' | 'contracts' | 'nfts' | 'agent' | 'rwa' | 'deploy' | 'achievements' | 'games' | null;

interface DashboardState {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  showDashboard: boolean;
  setShowDashboard: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: null,
  setActiveTab: (tab) => set({ activeTab: tab, showDashboard: tab !== null }),
  showDashboard: false,
  setShowDashboard: (show) => set({ showDashboard: show, activeTab: show ? 'portfolio' : null }),
}));
