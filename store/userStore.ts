import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { mockUser } from '@/constants/mockData';

interface UserState {
  user: User | null;
  isLoading: boolean;
  loadUser: (userId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => boolean;
  incrementWins: () => void;
  incrementLosses: () => void;
  addCharity: (amount: number) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      loadUser: async (userId: string) => {
        set({ isLoading: true });
        try {
          const stored = await AsyncStorage.getItem(`zest-profile-${userId}`);
          if (stored) {
            set({ user: JSON.parse(stored), isLoading: false });
          } else {
            const newUser: User = {
              ...mockUser,
              id: userId,
              zestCoins: 100,
              totalWins: 0,
              totalLosses: 0,
              totalBets: 0,
              charityContributed: 0,
              friends: [],
              createdAt: new Date().toISOString(),
            };
            await AsyncStorage.setItem(`zest-profile-${userId}`, JSON.stringify(newUser));
            set({ user: newUser, isLoading: false });
          }
        } catch (e) {
          console.warn('Failed to load user:', e);
          set({ isLoading: false });
        }
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, ...updates };
        set({ user: updated });
        AsyncStorage.setItem(`zest-profile-${user.id}`, JSON.stringify(updated)).catch(console.warn);
      },

      addCoins: (amount: number) => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, zestCoins: user.zestCoins + amount };
        set({ user: updated });
        AsyncStorage.setItem(`zest-profile-${user.id}`, JSON.stringify(updated)).catch(console.warn);
      },

      removeCoins: (amount: number) => {
        const { user } = get();
        if (!user || user.zestCoins < amount) return false;
        const updated = { ...user, zestCoins: user.zestCoins - amount };
        set({ user: updated });
        AsyncStorage.setItem(`zest-profile-${user.id}`, JSON.stringify(updated)).catch(console.warn);
        return true;
      },

      incrementWins: () => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, totalWins: user.totalWins + 1, totalBets: user.totalBets + 1 };
        set({ user: updated });
        AsyncStorage.setItem(`zest-profile-${user.id}`, JSON.stringify(updated)).catch(console.warn);
      },

      incrementLosses: () => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, totalLosses: user.totalLosses + 1, totalBets: user.totalBets + 1 };
        set({ user: updated });
        AsyncStorage.setItem(`zest-profile-${user.id}`, JSON.stringify(updated)).catch(console.warn);
      },

      addCharity: (amount: number) => {
        const { user } = get();
        if (!user) return;
        const updated = { ...user, charityContributed: user.charityContributed + amount };
        set({ user: updated });
        AsyncStorage.setItem(`zest-profile-${user.id}`, JSON.stringify(updated)).catch(console.warn);
      },

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);
