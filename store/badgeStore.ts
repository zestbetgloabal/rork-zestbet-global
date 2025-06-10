import { create } from 'zustand';
import { Badge, UserRank } from '@/types';
import { mockBadges, mockUserRank } from '@/constants/mockData';

interface BadgeState {
  badges: Badge[];
  userRank: UserRank | null;
  isLoading: boolean;
  error: string | null;
  fetchBadges: () => Promise<void>;
  fetchUserRank: (userId: string) => Promise<void>;
  updateUserRank: (userId: string, tokensEarned: number) => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set, get) => ({
  badges: [],
  userRank: null,
  isLoading: false,
  error: null,
  
  fetchBadges: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ badges: mockBadges, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch badges', isLoading: false });
    }
  },
  
  fetchUserRank: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, just return the mock user rank
      // In a real app, you would fetch the user's rank from the server
      set({ userRank: mockUserRank, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch user rank', isLoading: false });
    }
  },
  
  updateUserRank: async (userId: string, tokensEarned: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { userRank, badges } = get();
      
      if (!userRank) {
        throw new Error('User rank not found');
      }
      
      // Calculate new total tokens
      const newTotalTokens = userRank.totalTokensEarned + tokensEarned;
      
      // Find the appropriate badge for the new total
      const sortedBadges = [...badges]
        .filter(badge => !badge.isTeamBadge)
        .sort((a, b) => b.requiredTokens - a.requiredTokens);
      
      let newBadge = sortedBadges[sortedBadges.length - 1]; // Default to lowest badge
      
      for (const badge of sortedBadges) {
        if (newTotalTokens >= badge.requiredTokens) {
          newBadge = badge;
          break;
        }
      }
      
      // Find the next badge
      const nextBadgeIndex = sortedBadges.findIndex(badge => badge.id === newBadge.id) - 1;
      const nextBadge = nextBadgeIndex >= 0 ? sortedBadges[nextBadgeIndex] : undefined;
      
      // Calculate tokens to next badge
      const tokensToNextBadge = nextBadge 
        ? Math.max(0, nextBadge.requiredTokens - newTotalTokens)
        : 0;
      
      // Check if the user earned a new badge
      const badgeUpgrade = newBadge.id !== userRank.currentBadge.id;
      
      // Update the user rank
      const updatedUserRank: UserRank = {
        ...userRank,
        totalTokensEarned: newTotalTokens,
        currentBadge: newBadge,
        nextBadge,
        tokensToNextBadge
      };
      
      // If the user earned a new badge, add it to their history
      if (badgeUpgrade) {
        updatedUserRank.history = [
          ...userRank.history,
          {
            badgeId: newBadge.id,
            badgeName: newBadge.name,
            earnedAt: new Date()
          }
        ];
      }
      
      set({ userRank: updatedUserRank, isLoading: false });
      
      // Return void to match the Promise<void> return type
    } catch (error) {
      set({ error: 'Failed to update user rank', isLoading: false });
    }
  }
}));