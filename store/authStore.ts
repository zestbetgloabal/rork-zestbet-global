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

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    status?: string;
  };
  isNewUser?: boolean;
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
  loginWithFacebook: () => Promise<boolean>;
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
          // Use tRPC to authenticate with backend
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.login.mutate({ email, password });
          
          if (result && 'success' in result && result.success && 'token' in result && 'user' in result) {
            set({ token: result.token, isLoading: false, isAuthenticated: true });
            
            // Set user data
            const { useUserStore } = await import('./userStore');
            const { setUser } = useUserStore.getState();
            setUser({
              id: result.user.id,
              username: result.user.name,
              zestBalance: 100,
              points: 0,
              inviteCode: 'ZEST123',
              avatar: result.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
              biography: 'Verified user on ZestBet. Ready to make predictions!',
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
          }
          
          return false;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to login. Please check your credentials.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      register: async (params: RegisterParams) => {
        set({ isLoading: true, error: null });
        try {
          // Registration is currently restricted - backend will throw error
          const { trpcClient } = await import('@/lib/trpc');
          await trpcClient.auth.register.mutate({
            email: params.email,
            password: params.password,
            name: params.username,
            phone: params.phone,
          });
          
          // This line should never be reached due to backend restriction
          return false;
        } catch (error: any) {
          const errorMessage = error?.message || 'Registration is currently restricted. Please contact support.';
          set({ error: errorMessage, isLoading: false });
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
          // In production, this would integrate with real Google SDK
          // For now, we reject all Google login attempts to force manual account creation
          throw new Error('Google login is only available for existing accounts. Please contact support to create an account.');
          
          /*
          // This code would be used when Google SDK is properly integrated:
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.socialLogin.mutate({
            provider: 'google',
            token: googleToken, // Real token from Google SDK
            email: googleEmail, // Real email from Google
            name: googleName,   // Real name from Google
          });
          
          if (result && 'success' in result && result.success && 'token' in result && 'user' in result) {
            set({ token: result.token, isLoading: false, isAuthenticated: true });
            
            const { useUserStore } = await import('./userStore');
            const { setUser } = useUserStore.getState();
            setUser({
              id: result.user.id,
              username: result.user.name,
              zestBalance: 100,
              points: 0,
              inviteCode: 'ZEST123',
              avatar: result.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
              biography: 'Verified Google user on ZestBet. Ready to make predictions!',
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
          }
          
          return false;
          */
        } catch (error: any) {
          const errorMessage = error?.message || 'Google login is only available for existing accounts.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      loginWithApple: async () => {
        set({ isLoading: true, error: null });
        try {
          // In production, this would integrate with real Apple SDK
          // For now, we reject all Apple login attempts to force manual account creation
          throw new Error('Apple login is only available for existing accounts. Please contact support to create an account.');
          
          /*
          // This code would be used when Apple SDK is properly integrated:
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.socialLogin.mutate({
            provider: 'apple',
            token: appleToken, // Real token from Apple SDK
            email: appleEmail, // Real email from Apple
            name: appleName,   // Real name from Apple
          });
          
          if (result && 'success' in result && result.success && 'token' in result && 'user' in result) {
            set({ token: result.token, isLoading: false, isAuthenticated: true });
            
            const { useUserStore } = await import('./userStore');
            const { setUser } = useUserStore.getState();
            setUser({
              id: result.user.id,
              username: result.user.name,
              zestBalance: 100,
              points: 0,
              inviteCode: 'ZEST123',
              avatar: result.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
              biography: 'Verified Apple user on ZestBet. Ready to make predictions!',
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
          }
          
          return false;
          */
        } catch (error: any) {
          const errorMessage = error?.message || 'Apple login is only available for existing accounts.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      loginWithFacebook: async () => {
        set({ isLoading: true, error: null });
        try {
          // In production, this would integrate with real Facebook SDK
          // For now, we reject all Facebook login attempts to force manual account creation
          throw new Error('Facebook login is only available for existing accounts. Please contact support to create an account.');
          
          /*
          // This code would be used when Facebook SDK is properly integrated:
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.socialLogin.mutate({
            provider: 'facebook',
            token: facebookToken, // Real token from Facebook SDK
            email: facebookEmail, // Real email from Facebook
            name: facebookName,   // Real name from Facebook
          });
          
          if (result && 'success' in result && result.success && 'token' in result && 'user' in result) {
            set({ token: result.token, isLoading: false, isAuthenticated: true });
            
            const { useUserStore } = await import('./userStore');
            const { setUser } = useUserStore.getState();
            setUser({
              id: result.user.id,
              username: result.user.name,
              zestBalance: 100,
              points: 0,
              inviteCode: 'ZEST123',
              avatar: result.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
              biography: 'Verified Facebook user on ZestBet. Ready to make predictions!',
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
          }
          
          return false;
          */
        } catch (error: any) {
          const errorMessage = error?.message || 'Facebook login is only available for existing accounts.';
          set({ error: errorMessage, isLoading: false });
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
        
        // Immediately clear auth state to trigger navigation
        set({ 
          token: null, 
          isAuthenticated: false, 
          error: null, 
          isLoading: false 
        });
        console.log('Auth state cleared immediately');
        
        try {
          // Clear user state
          const { useUserStore } = await import('./userStore');
          const { logout: userLogout } = useUserStore.getState();
          userLogout();
          console.log('User state cleared');
          
          // Clear AsyncStorage
          await AsyncStorage.multiRemove(['auth-storage', 'user-storage']);
          console.log('Storage cleared');
          
          console.log('=== LOGOUT COMPLETED ===');
          
        } catch (error) {
          console.error('Error during logout cleanup:', error);
          // Try to clear storage individually as fallback
          try {
            await AsyncStorage.removeItem('auth-storage');
            await AsyncStorage.removeItem('user-storage');
          } catch (storageError) {
            console.error('Fallback storage clear error:', storageError);
          }
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