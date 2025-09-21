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

interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  requiresEmailVerification: boolean;
  requiresPhoneVerification: boolean;
}

interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  pendingVerification: {
    userId?: string;
    email?: string;
    phone?: string;
    requiresEmailVerification?: boolean;
    requiresPhoneVerification?: boolean;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (params: RegisterParams) => Promise<RegisterResponse | null>;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  verifyPhone: (phone: string, code: string) => Promise<boolean>;
  phoneLogin: (phone: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  clearPendingVerification: () => void;
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
      pendingVerification: null,
      
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
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.register.mutate({
            email: params.email,
            password: params.password,
            name: params.username,
            phone: params.phone,
          });
          
          // Store pending verification info
          set({ 
            pendingVerification: {
              userId: result.userId,
              email: params.email,
              phone: params.phone,
              requiresEmailVerification: result.requiresEmailVerification,
              requiresPhoneVerification: result.requiresPhoneVerification,
            },
            isLoading: false 
          });
          
          return result;
        } catch (error: any) {
          const errorMessage = error?.message || 'Registration failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },
      
      phoneLogin: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          // Phone login is restricted - only allow existing accounts
          throw new Error('Phone login is only available for existing accounts. Please contact support to create an account.');
        } catch (error: any) {
          const errorMessage = error?.message || 'Phone login is only available for existing accounts.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      verifyEmail: async (email: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.verifyEmail.mutate({ email, code });
          
          set({ isLoading: false });
          
          // If fully verified, clear pending verification
          if (result.isFullyVerified) {
            set({ pendingVerification: null });
          }
          
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to verify email. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      verifyPhone: async (phone: string, code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { trpcClient } = await import('@/lib/trpc');
          const result = await trpcClient.auth.verifyPhone.mutate({ phone, code });
          
          set({ isLoading: false });
          
          // If fully verified, clear pending verification
          if (result.isFullyVerified) {
            set({ pendingVerification: null });
          }
          
          return true;
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to verify phone. Please try again.';
          set({ error: errorMessage, isLoading: false });
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
          // Biometric login is restricted - only allow existing accounts
          throw new Error('Biometric login is only available for existing accounts. Please contact support to create an account.');
        } catch (error: any) {
          const errorMessage = error?.message || 'Biometric login is only available for existing accounts.';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },
      
      logout: async () => {
        console.log('=== LOGOUT STARTED ===');
        
        // Clear auth state FIRST to immediately update UI
        set({ 
          token: null, 
          isAuthenticated: false, 
          error: null, 
          isLoading: false,
          pendingVerification: null
        });
        console.log('Auth state cleared immediately');
        
        try {
          // Clear all possible storage keys
          const storageKeys = [
            'auth-storage', 
            'user-storage',
            'bet-storage',
            'social-storage',
            'ai-storage',
            'badge-storage',
            'impact-storage',
            'leaderboard-storage',
            'live-event-storage',
            'mission-storage',
            'chat-storage'
          ];
          
          // Clear AsyncStorage
          try {
            await AsyncStorage.multiRemove(storageKeys);
            console.log('AsyncStorage cleared');
          } catch (e) {
            console.warn('AsyncStorage.multiRemove failed, trying individual removal', e);
            for (const key of storageKeys) {
              try {
                await AsyncStorage.removeItem(key);
              } catch (e2) {
                console.warn(`Failed to remove ${key}`, e2);
              }
            }
          }
          
          // Clear localStorage for web - more aggressive approach
          if (typeof window !== 'undefined') {
            try {
              // Clear specific keys first
              storageKeys.forEach(key => {
                window.localStorage?.removeItem(key);
                window.sessionStorage?.removeItem(key);
              });
              
              // Clear all storage as backup
              window.localStorage?.clear();
              window.sessionStorage?.clear();
              
              // Clear all cookies
              document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
              });
              
              console.log('Web storage and cookies cleared');
            } catch (lsErr) {
              console.warn('Web storage cleanup failed', lsErr);
            }
          }
          
          // Clear user state
          try {
            const { useUserStore } = await import('./userStore');
            const { logout: userLogout } = useUserStore.getState();
            userLogout();
            console.log('User state cleared');
          } catch (userErr) {
            console.warn('User state cleanup failed', userErr);
          }
          
          // Try backend logout (best-effort, don't block on failure)
          try {
            const { trpcClient } = await import('@/lib/trpc');
            await trpcClient.auth.logout.mutate();
            console.log('Backend session revoked');
          } catch (apiErr) {
            console.warn('Backend logout failed or not necessary', apiErr);
          }
          
        } catch (error) {
          console.error('Error during logout cleanup:', error);
        }
        
        console.log('=== LOGOUT COMPLETE ===');
      },
      
      clearError: () => set({ error: null }),
      
      clearPendingVerification: () => set({ pendingVerification: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);