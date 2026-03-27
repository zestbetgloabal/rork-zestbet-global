import { create } from 'zustand';
import { LeaderboardEntry } from '@/types';
import { mockLeaderboard } from '@/constants/mockData';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  entries: [],
  isLoading: false,

  fetchLeaderboard: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ entries: mockLeaderboard, isLoading: false });
  },
}));
