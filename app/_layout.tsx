import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Platform } from 'react-native';
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { initializeCrashPrevention, hermesGuard, initializeIpadCrashPrevention, safeNavigate, safeAsync } from "@/utils/crashPrevention";

// Initialize comprehensive crash prevention with iPad optimizations
try {
  initializeCrashPrevention();
  initializeIpadCrashPrevention();
  console.log('Crash prevention initialized successfully (iPad optimized)');
} catch (error) {
  console.warn('Failed to initialize crash prevention:', error);
}

// Simple error handler for development
if (Platform.OS === 'web') {
  // Prevent hydration mismatches on web
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }
}

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Create a client with error handling
const queryClient = hermesGuard(
  () => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on Hermes crashes
          const errorMessage = error?.message || String(error);
          if (errorMessage.includes('hermes::vm::') || errorMessage.includes('JSObject::')) {
            return false;
          }
          return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      mutations: {
        retry: false, // Don't retry mutations to prevent crashes
      },
    },
  }),
  new QueryClient(),
  'QueryClient creation'
);

// Prevent the splash screen from auto-hiding before asset loading is complete.
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

// Simple Error Boundary
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.log('Error Boundary caught error:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught error:', error.message);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            The app encountered an error. Please try again.
          </Text>
          <Text style={errorStyles.button} onPress={this.handleRetry}>
            Tap to Retry
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutComponent() {
  const [isReady, setIsReady] = useState(false);
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Add longer delay for iPad compatibility
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (loaded || error) {
          if (Platform.OS !== 'web') {
            await SplashScreen.hideAsync();
          }
          // Add additional delay to prevent hydration issues on iPad
          await new Promise(resolve => setTimeout(resolve, 200));
          setIsReady(true);
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
        // Force ready state after delay even on error
        setTimeout(() => setIsReady(true), 500);
      }
    };

    hermesGuard(() => {
      prepare();
    }, undefined, 'app preparation');
  }, [loaded, error]);

  // Show loading screen until ready
  if (!isReady) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <RootLayoutNav />
        </trpc.Provider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, token, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Safe segment access to prevent crashes
  const isInAuthGroup = hermesGuard(() => segments?.[0] === '(auth)', false, 'auth group check');
  const isInLegalGroup = hermesGuard(() => segments?.[0] === 'legal', false, 'legal group check');
  
  // Simplified navigation logic - only redirect authenticated users from auth pages
  useEffect(() => {
    if (!_hasHydrated) return; // Don't navigate until hydrated
    if (isNavigating) return; // Prevent multiple navigations
    
    const handleNavigation = async () => {
      try {
        setIsNavigating(true);
        
        console.log('Navigation check:', {
          isAuthenticated,
          hasToken: !!token,
          isInAuthGroup,
          currentSegments: segments
        });
        
        // Only redirect authenticated users who are in auth group to tabs
        if (isAuthenticated && token && isInAuthGroup) {
          console.log('RootLayout: Redirecting authenticated user to tabs');
          await safeAsync(
            async () => {
              await router.replace('/(tabs)');
            },
            undefined,
            'redirect to tabs'
          );
        }
      } catch (error) {
        console.warn('Navigation error:', error);
      } finally {
        setIsNavigating(false);
      }
    };

    // Only run navigation check after a delay to allow user interaction
    const timer = setTimeout(() => {
      hermesGuard(() => {
        safeAsync(
          async () => {
            await handleNavigation();
          },
          undefined,
          'navigation handling'
        );
      }, undefined, 'navigation timer');
    }, 2000); // Longer delay to allow user interaction
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, isInAuthGroup, router, isNavigating, _hasHydrated, segments]);
  
  // Show loading screen until hydration is complete
  if (!_hasHydrated) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.title}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="bet/[id]" 
          options={{ 
            title: "Bet Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="propose-bet" 
          options={{ 
            title: "Propose a Bet",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="invite" 
          options={{ 
            title: "Invite Friends",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="wallet" 
          options={{ 
            title: "Wallet",
          }} 
        />
        <Stack.Screen 
          name="suggestion" 
          options={{ 
            title: "Suggest Improvement",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="legal" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="profile-edit" 
          options={{ 
            title: "Edit Profile",
          }} 
        />
        <Stack.Screen 
          name="ai-recommendations" 
          options={{ 
            title: "AI Recommendations",
          }} 
        />
        <Stack.Screen 
          name="user-preferences" 
          options={{ 
            title: "User Preferences",
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: "Profile",
          }} 
        />
        <Stack.Screen 
          name="account-settings" 
          options={{ 
            title: "Account",
            presentation: "modal",
          }} 
        />


        <Stack.Screen 
          name="email-verification" 
          options={{ 
            title: "Email Verification",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="test-crash-prevention" 
          options={{ 
            title: "Crash Prevention Tests",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="test-env" 
          options={{ 
            title: "Environment Test",
            presentation: "modal",
          }} 
        />
      </Stack>
    </>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default RootLayoutComponent;