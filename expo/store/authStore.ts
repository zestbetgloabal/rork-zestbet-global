import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      _hasHydrated: false,
      pendingEmail: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 800));

          if (!email || !password) {
            set({ error: 'Bitte E-Mail und Passwort eingeben.', isLoading: false });
            return false;
          }

          const storedUsers = await AsyncStorage.getItem('zest-users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const user = users.find((u: { email: string; password: string }) => u.email === email.toLowerCase().trim());

          if (!user) {
            set({ error: 'Kein Account mit dieser E-Mail gefunden.', isLoading: false });
            return false;
          }

          if (user.password !== password) {
            set({ error: 'Falsches Passwort.', isLoading: false });
            return false;
          }

          if (!user.verified) {
            set({ error: 'Bitte bestätige zuerst deine E-Mail.', isLoading: false, pendingEmail: email });
            return false;
          }

          const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          set({ token, userId: user.id, isAuthenticated: true, isLoading: false, pendingEmail: null });
          console.log('Login successful for:', email);
          return true;
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Login fehlgeschlagen.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      register: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 800));

          if (!email || !password || !username) {
            set({ error: 'Bitte alle Felder ausfüllen.', isLoading: false });
            return false;
          }

          if (password.length < 6) {
            set({ error: 'Passwort muss mindestens 6 Zeichen lang sein.', isLoading: false });
            return false;
          }

          const storedUsers = await AsyncStorage.getItem('zest-users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];

          if (users.find((u: { email: string }) => u.email === email.toLowerCase().trim())) {
            set({ error: 'Diese E-Mail ist bereits registriert.', isLoading: false });
            return false;
          }

          const newUser = {
            id: `user-${Date.now()}`,
            email: email.toLowerCase().trim(),
            password,
            username: username.trim(),
            verified: false,
            verificationCode: String(Math.floor(100000 + Math.random() * 900000)),
            createdAt: new Date().toISOString(),
          };

          users.push(newUser);
          await AsyncStorage.setItem('zest-users', JSON.stringify(users));

          console.log('Registration successful. Verification code:', newUser.verificationCode);
          set({ isLoading: false, pendingEmail: email.toLowerCase().trim() });
          return true;
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      verifyEmail: async (code: string) => {
        set({ isLoading: true, error: null });
        try {
          const { pendingEmail } = useAuthStore.getState();
          if (!pendingEmail) {
            set({ error: 'Keine E-Mail zur Verifizierung.', isLoading: false });
            return false;
          }

          const storedUsers = await AsyncStorage.getItem('zest-users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          const userIndex = users.findIndex((u: { email: string }) => u.email === pendingEmail);

          if (userIndex === -1) {
            set({ error: 'Benutzer nicht gefunden.', isLoading: false });
            return false;
          }

          if (users[userIndex].verificationCode !== code.trim()) {
            set({ error: 'Ungültiger Code.', isLoading: false });
            return false;
          }

          users[userIndex].verified = true;
          await AsyncStorage.setItem('zest-users', JSON.stringify(users));

          const token = `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          set({
            token,
            userId: users[userIndex].id,
            isAuthenticated: true,
            isLoading: false,
            pendingEmail: null,
          });

          console.log('Email verified and logged in for:', pendingEmail);
          return true;
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Verifizierung fehlgeschlagen.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        set({ token: null, userId: null, isAuthenticated: false, error: null, pendingEmail: null });
        try {
          await AsyncStorage.multiRemove(['auth-storage', 'user-storage', 'bet-storage']);
        } catch (e) {
          console.warn('Cleanup error during logout:', e);
        }
        console.log('Logged out successfully');
      },

      clearError: () => set({ error: null }),
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, userId: state.userId, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Auth rehydration error:', error);
        }
        console.log('Auth rehydrated, authenticated:', state?.isAuthenticated);
        useAuthStore.setState({ _hasHydrated: true });
      },
    }
  )
);
