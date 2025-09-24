import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { DAILY_BET_LIMIT } from '@/constants/app';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setUser: (user: User) => void;
  updateZestBalance: (amount: number) => void;
  updatePoints: (points: number) => void;
  updateUserProfile: (profileData: Partial<User>) => void;
  updateConsent: (agbConsent: boolean, privacyConsent: boolean) => void;
  logout: () => void;
  addTestZest: (amount?: number) => void;
  updateDailyBetAmount: (amount: number) => number; // Returns remaining daily limit
  getRemainingDailyLimit: () => number;
  resetDailyBetAmountIfNewDay: () => void;
  setHasHydrated: (state: boolean) => void;
  initializeDefaultUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      setUser: (user) => set({ user }),
      updateZestBalance: (amount) => 
        set((state) => ({ 
          user: state.user 
            ? { ...state.user, zestBalance: state.user.zestBalance + amount } 
            : null 
        })),
      updatePoints: (points) => 
        set((state) => ({ 
          user: state.user 
            ? { ...state.user, points: state.user.points + points } 
            : null 
        })),
      updateUserProfile: (profileData) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...profileData }
            : null
        })),
      updateConsent: (agbConsent, privacyConsent) =>
        set((state) => ({
          user: state.user
            ? { 
                ...state.user, 
                agbConsent, 
                privacyConsent, 
                consentDate: new Date().toISOString() 
              }
            : null
        })),
      logout: () => {
        // Clear user state completely and immediately
        set({ 
          user: null,
          isLoading: false,
          error: null
        });
      },
      addTestZest: (amount = 100) => 
        set((state) => {
          if (!state.user) return state;
          
          // Check remaining daily limit
          const currentAmount = state.user.dailyBetAmount || 0;
          const today = new Date().toISOString().split('T')[0];
          const lastBetDate = state.user.lastBetDate;
          
          // Reset if it's a new day
          if (lastBetDate !== today) {
            return {
              user: {
                ...state.user,
                zestBalance: state.user.zestBalance + amount,
                dailyBetAmount: amount,
                lastBetDate: today
              }
            };
          }
          
          // Calculate how much can be added within the limit
          const remainingLimit = DAILY_BET_LIMIT - currentAmount;
          const amountToAdd = Math.min(amount, remainingLimit);
          
          if (amountToAdd <= 0) return state;
          
          return {
            user: {
              ...state.user,
              zestBalance: state.user.zestBalance + amountToAdd,
              dailyBetAmount: currentAmount + amountToAdd,
              lastBetDate: today
            }
          };
        }),
      updateDailyBetAmount: (amount) => {
        const { user } = get();
        if (!user) return 0;
        
        // Check if it's a new day
        get().resetDailyBetAmountIfNewDay();
        
        // Calculate new daily bet amount
        const currentAmount = user.dailyBetAmount || 0;
        const newAmount = currentAmount + amount;
        
        // Update user
        set({
          user: {
            ...user,
            dailyBetAmount: newAmount,
            lastBetDate: new Date().toISOString().split('T')[0]
          }
        });
        
        // Return remaining limit
        return DAILY_BET_LIMIT - newAmount;
      },
      getRemainingDailyLimit: () => {
        const { user } = get();
        if (!user) return 0;
        
        // Check if it's a new day - this can cause state updates during render
        // We'll handle this check in a separate function call from useEffect
        const today = new Date().toISOString().split('T')[0];
        const lastBetDate = user.lastBetDate || today;
        
        // Just calculate and return the value without updating state
        const currentAmount = user.dailyBetAmount || 0;
        
        // If it's a new day, we should return the full limit
        // The actual state update will happen in resetDailyBetAmountIfNewDay
        if (lastBetDate !== today) {
          return DAILY_BET_LIMIT;
        }
        
        return Math.max(0, DAILY_BET_LIMIT - currentAmount);
      },
      resetDailyBetAmountIfNewDay: () => {
        const { user } = get();
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        const lastBetDate = user.lastBetDate;
        
        if (lastBetDate !== today) {
          set({
            user: {
              ...user,
              dailyBetAmount: 0,
              lastBetDate: today
            }
          });
        }
      },
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      initializeDefaultUser: () => {
        const { user } = get();
        if (user) return; // Don't overwrite existing user
        
        console.log('UserStore: Initializing default user');
        const defaultUser: User = {
          id: 'user-' + Date.now(),
          username: 'ZestBet User',
          zestBalance: 100,
          points: 0,
          inviteCode: 'ZEST' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
          biography: 'Welcome to ZestBet! Ready to make some predictions.',
          socialMedia: {
            instagram: '',
            twitter: '',
            facebook: '',
            linkedin: '',
            tiktok: '',
            youtube: '',
            pinterest: '',
            snapchat: '',
            website: ''
          },
          dailyBetAmount: 0,
          lastBetDate: new Date().toISOString().split('T')[0],
          agbConsent: true,
          privacyConsent: true,
          consentDate: new Date().toISOString()
        };
        
        set({ user: defaultUser });
        console.log('UserStore: Default user created');
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('UserStore: Hydration complete');
        state?.setHasHydrated(true);
      },
    }
  )
);