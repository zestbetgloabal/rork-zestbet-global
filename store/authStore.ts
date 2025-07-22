import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          const { useUserStore } = await import('./userStore');
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
          const { useUserStore } = await import('./userStore');
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
          const { useUserStore } = await import('./userStore');
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
          const { useUserStore } = await import('./userStore');
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
          const { useUserStore } = await import('./userStore');
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
          const { useUserStore } = await import('./userStore');
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
        console.log('=== LOGOUT STARTED ===');
        
        // Clear auth state immediately
        set({ 
          token: null, 
          isAuthenticated: false, 
          error: null, 
          isLoading: false 
        });
        
        console.log('Auth state cleared');
        
        // Clear all stores and storage
        try {
          // Clear user store
          try {
            const { useUserStore } = await import('./userStore');
            useUserStore.getState().logout();
            console.log('User store cleared');
          } catch (e) {
            console.log('Failed to clear user store:', e);
          }
          
          // Clear bet store
          try {
            const { useBetStore } = await import('./betStore');
            const betState = useBetStore.getState();
            if (betState && typeof betState.reset === 'function') {
              betState.reset();
              console.log('Bet store cleared');
            }
          } catch (e) {
            console.log('Failed to clear bet store:', e);
          }
          
          // Clear challenge store
          try {
            const { useChallengeStore } = await import('./challengeStore');
            const challengeState = useChallengeStore.getState();
            if (challengeState && typeof challengeState.reset === 'function') {
              challengeState.reset();
              console.log('Challenge store cleared');
            }
          } catch (e) {
            console.log('Failed to clear challenge store:', e);
          }
          
          // Clear impact store
          try {
            const { useImpactStore } = await import('./impactStore');
            const impactState = useImpactStore.getState();
            if (impactState && typeof impactState.reset === 'function') {
              impactState.reset();
              console.log('Impact store cleared');
            }
          } catch (e) {
            console.log('Failed to clear impact store:', e);
          }
          
          // Clear mission store
          try {
            const { useMissionStore } = await import('./missionStore');
            const missionState = useMissionStore.getState();
            if (missionState && typeof missionState.reset === 'function') {
              missionState.reset();
              console.log('Mission store cleared');
            }
          } catch (e) {
            console.log('Failed to clear mission store:', e);
          }
          
          // Clear leaderboard store
          try {
            const { useLeaderboardStore } = await import('./leaderboardStore');
            const leaderboardState = useLeaderboardStore.getState();
            if (leaderboardState && typeof leaderboardState.reset === 'function') {
              leaderboardState.reset();
              console.log('Leaderboard store cleared');
            }
          } catch (e) {
            console.log('Failed to clear leaderboard store:', e);
          }
          
          // Clear badge store
          try {
            const { useBadgeStore } = await import('./badgeStore');
            const badgeState = useBadgeStore.getState();
            if (badgeState && typeof badgeState.reset === 'function') {
              badgeState.reset();
              console.log('Badge store cleared');
            }
          } catch (e) {
            console.log('Failed to clear badge store:', e);
          }
          

          
          // Clear AI store
          try {
            const { useAIStore } = await import('./aiStore');
            const aiState = useAIStore.getState();
            if (aiState && typeof aiState.reset === 'function') {
              aiState.reset();
              console.log('AI store cleared');
            }
          } catch (e) {
            console.log('Failed to clear AI store:', e);
          }
          
          // Clear chat store
          try {
            const { useChatStore } = await import('./chatStore');
            const chatState = useChatStore.getState();
            if (chatState && typeof chatState.reset === 'function') {
              chatState.reset();
              console.log('Chat store cleared');
            }
          } catch (e) {
            console.log('Failed to clear chat store:', e);
          }
          
          // Clear AsyncStorage completely
          await AsyncStorage.clear();
          console.log('AsyncStorage cleared');
          
          console.log('=== LOGOUT COMPLETED ===');
          
        } catch (error) {
          console.error('Error clearing storage during logout:', error);
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);