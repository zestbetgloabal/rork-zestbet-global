import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { DAILY_BET_LIMIT } from '@/constants/app';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
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
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
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
        // Clear user state completely
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
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);