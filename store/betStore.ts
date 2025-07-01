import { create } from 'zustand';
import { Bet, BetPlacement } from '@/types';
import { mockBets } from '@/constants/mockData';

interface BetState {
  bets: Bet[];
  userBets: BetPlacement[];
  isLoading: boolean;
  error: string | null;
  visibilityFilter: 'all' | 'public' | 'private';
  currentUser: string | null; // Store current user to avoid dependency on userStore during render
  fetchBets: () => Promise<void>;
  likeBet: (betId: string) => void;
  placeBet: (betPlacement: BetPlacement) => Promise<boolean>;
  proposeBet: (bet: Partial<Bet> & { invitedFriends?: string[], mediaFiles?: Array<{uri: string, type: 'image' | 'video', name?: string}> }) => Promise<boolean>;
  setVisibilityFilter: (filter: 'all' | 'public' | 'private') => void;
  setCurrentUser: (username: string | null) => void;
  getFilteredBets: () => Bet[];
  reset: () => void;
}

export const useBetStore = create<BetState>((set, get) => ({
  bets: [],
  userBets: [],
  isLoading: false,
  error: null,
  visibilityFilter: 'all',
  currentUser: null,
  
  fetchBets: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ bets: mockBets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch bets', isLoading: false });
    }
  },
  
  likeBet: (betId: string) => {
    set((state) => ({
      bets: state.bets.map(bet => 
        bet.id === betId 
          ? { ...bet, likes: bet.likes + 1 } 
          : bet
      )
    }));
  },
  
  placeBet: async (betPlacement: BetPlacement) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate the net amount that goes to the pool (after platform fee)
      const netAmount = betPlacement.platformFee 
        ? betPlacement.amount - betPlacement.platformFee 
        : betPlacement.amount;
      
      set((state) => ({
        userBets: [...state.userBets, betPlacement],
        bets: state.bets.map(bet => 
          bet.id === betPlacement.betId 
            ? { 
                ...bet, 
                participants: bet.participants + 1,
                totalPool: bet.totalPool + netAmount
              } 
            : bet
        ),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to place bet', isLoading: false });
      return false;
    }
  },
  
  proposeBet: async (bet: Partial<Bet> & { invitedFriends?: string[], mediaFiles?: Array<{uri: string, type: 'image' | 'video', name?: string}> }) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the first image from mediaFiles to use as the main bet image
      const mainImage = bet.mediaFiles && bet.mediaFiles.length > 0 && bet.mediaFiles[0].type === 'image' 
        ? bet.mediaFiles[0].uri 
        : undefined;
      
      const newBet: Bet = {
        id: `${Date.now()}`,
        title: bet.title || 'New Bet',
        description: bet.description || 'No description provided',
        creator: get().currentUser || 'zest_user', // Use current user if available
        likes: 0,
        participants: 0,
        totalPool: 0,
        minBet: bet.minBet || 10,
        maxBet: bet.maxBet || 1000,
        endDate: bet.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        category: bet.category || 'other',
        image: mainImage,
        mediaFiles: bet.mediaFiles,
        visibility: bet.visibility || 'public',
        invitedFriends: bet.invitedFriends
      };
      
      // In a real app, we would also handle the friend invitations here
      // For example, sending notifications to the invited friends
      if (bet.invitedFriends && bet.invitedFriends.length > 0) {
        console.log(`Inviting friends to bet: ${bet.invitedFriends.join(', ')}`);
      }
      
      set((state) => ({
        bets: [newBet, ...state.bets],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to propose bet', isLoading: false });
      return false;
    }
  },
  
  setVisibilityFilter: (filter) => {
    set({ visibilityFilter: filter });
  },
  
  setCurrentUser: (username) => {
    // Simple setter function that doesn't depend on other stores
    set({ currentUser: username });
  },
  
  getFilteredBets: () => {
    const { bets, visibilityFilter, currentUser } = get();
    
    if (visibilityFilter === 'all') {
      // For 'all', show public bets and private bets where the user is the creator or invited
      return bets.filter(bet => 
        bet.visibility === 'public' || 
        bet.creator === currentUser ||
        (bet.invitedFriends && currentUser && bet.invitedFriends.includes(currentUser))
      );
    } else if (visibilityFilter === 'public') {
      return bets.filter(bet => bet.visibility === 'public');
    } else {
      // For 'private', only show private bets where the user is the creator or invited
      return bets.filter(bet => 
        bet.visibility === 'private' && 
        (bet.creator === currentUser || 
         (bet.invitedFriends && currentUser && bet.invitedFriends.includes(currentUser)))
      );
    }
  },
  
  reset: () => {
    set({
      bets: [],
      userBets: [],
      isLoading: false,
      error: null,
      visibilityFilter: 'all',
      currentUser: null
    });
  }
}));