import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './userStore';

interface RegisterParams {
  email: string;
  password: string;
  username: string;
  phone?: string;
  biography?: string;
  avatar?: string;
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
    snapchat?: string;
    website?: string;
  };
}

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (params: RegisterParams) => Promise<boolean>;
  phoneLogin: (phone: string, code: string) => Promise<boolean>;
  verifyPhone: (phone: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  loginWithBiometrics: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (email !== 'user@example.com' && password !== 'password') {
            // For demo purposes, accept any credentials
            // In a real app, this would validate against the backend
          }
          
          // Set mock token
          set({ token: 'mock-jwt-token', isLoading: false, isAuthenticated: true });
          
          // Set user data
          const { setUser } = useUserStore.getState();
          setUser({
            id: '1',
            username: email.split('@')[0],
            zestBalance: 100,
            points: 0,
            inviteCode: 'ZEST123',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: 'New user on ZestBet. Ready to make predictions!',
            socialMedia: {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString(),
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to login. Please check your credentials.', isLoading: false });
          return false;
        }
      },
      
      register: async (params: RegisterParams) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Set mock token
          set({ token: 'mock-jwt-token', isLoading: false, isAuthenticated: true });
          
          // Set user data
          const { setUser } = useUserStore.getState();
          setUser({
            id: '1',
            username: params.username,
            zestBalance: 100, // Starting balance
            points: 0,
            inviteCode: `ZEST${Math.floor(1000 + Math.random() * 9000)}`, // Random 4-digit code
            avatar: params.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: params.biography || 'New user on ZestBet. Ready to make predictions!',
            socialMedia: params.socialMedia || {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString(),
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to register. Please try again.', isLoading: false });
          return false;
        }
      },
      
      phoneLogin: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (code !== '1234') {
            set({ error: 'Invalid verification code', isLoading: false });
            return false;
          }
          
          // Set mock token
          set({ token: 'mock-jwt-token', isLoading: false, isAuthenticated: true });
          
          // Set user data
          const { setUser } = useUserStore.getState();
          setUser({
            id: '1',
            username: `user${phone.slice(-4)}`,
            zestBalance: 100,
            points: 0,
            inviteCode: 'ZEST123',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: 'New user on ZestBet. Ready to make predictions!',
            socialMedia: {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString(),
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to login. Please try again.', isLoading: false });
          return false;
        }
      },
      
      verifyPhone: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock validation
          if (code !== '1234') {
            set({ error: 'Invalid verification code', isLoading: false });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Failed to verify phone. Please try again.', isLoading: false });
          return false;
        }
      },
      
      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would integrate with Google Sign-In
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Set mock token
          set({ token: 'mock-google-jwt-token', isLoading: false, isAuthenticated: true });
          
          // Set user data
          const { setUser } = useUserStore.getState();
          setUser({
            id: '1',
            username: 'google_user',
            zestBalance: 100,
            points: 0,
            inviteCode: 'ZEST123',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: 'Google user on ZestBet. Ready to make predictions!',
            socialMedia: {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString(),
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to login with Google. Please try again.', isLoading: false });
          return false;
        }
      },
      
      loginWithApple: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would integrate with Apple Sign-In
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Set mock token
          set({ token: 'mock-apple-jwt-token', isLoading: false, isAuthenticated: true });
          
          // Set user data
          const { setUser } = useUserStore.getState();
          setUser({
            id: '1',
            username: 'apple_user',
            zestBalance: 100,
            points: 0,
            inviteCode: 'ZEST123',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: 'Apple user on ZestBet. Ready to make predictions!',
            socialMedia: {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString(),
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to login with Apple. Please try again.', isLoading: false });
          return false;
        }
      },
      
      loginWithBiometrics: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would integrate with device biometrics
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Set mock token
          set({ token: 'mock-biometric-jwt-token', isLoading: false, isAuthenticated: true });
          
          // Set user data
          const { setUser } = useUserStore.getState();
          setUser({
            id: '1',
            username: 'biometric_user',
            zestBalance: 100,
            points: 0,
            inviteCode: 'ZEST123',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: 'Biometric user on ZestBet. Ready to make predictions!',
            socialMedia: {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString(),
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          });
          
          return true;
        } catch (error) {
          set({ error: 'Failed to login with biometrics. Please try again.', isLoading: false });
          return false;
        }
      },
      
      logout: async () => {
        return new Promise<void>((resolve, reject) => {
          try {
            // First, clear auth state
            set({ isLoading: true });
            
            // Clear auth state
            set({ token: null, isAuthenticated: false, error: null });
            
            // Clear user state - get the latest reference to avoid stale closures
            const userStoreLogout = useUserStore.getState().logout;
            userStoreLogout();
            
            // Clear persisted data - do this in a try/catch to handle failures
            AsyncStorage.multiRemove([
              'auth-storage',
              'user-storage',
              'mission-storage',
              'bet-storage',
              'impact-storage',
              'leaderboard-storage',
              'badge-storage',
              'challenge-storage',
              'social-storage',
              'live-event-storage',
              'ai-storage'
            ])
              .then(() => {
                // Set loading to false at the end
                set({ isLoading: false });
                resolve();
              })
              .catch((storageError) => {
                console.error('Error clearing AsyncStorage:', storageError);
                // Continue with logout even if storage clearing fails
                set({ isLoading: false });
                resolve();
              });
          } catch (error) {
            console.error('Error during logout:', error);
            // Make sure we still set authenticated to false even if there's an error
            set({ token: null, isAuthenticated: false, error: null, isLoading: false });
            reject(error);
          }
        });
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);