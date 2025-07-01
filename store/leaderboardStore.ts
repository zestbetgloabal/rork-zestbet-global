import { create } from 'zustand';
import { LeaderboardEntry } from '@/types';
import { mockLeaderboard } from '@/constants/mockData';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  fetchLeaderboard: () => Promise<void>;
  reset: () => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,
  fetchLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ entries: mockLeaderboard, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch leaderboard', isLoading: false });
    }
  },
  reset: () => {
    set({
      entries: [],
      isLoading: false,
      error: null
    });
  }
}));