import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from 'react-native';
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import * as Sentry from '@sentry/react-native';

// Initialize Sentry for error monitoring in production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
    debug: false,
    environment: 'production',
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers.authorization;
      }
      return event;
    },
  });
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Simple Error Boundary component
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught error:', error, errorInfo);
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            The app encountered an error. Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutComponent() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Don't throw, just log the error and continue
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </AppErrorBoundary>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  // Check if the current route is in the auth group
  const isInAuthGroup = segments[0] === '(auth)';
  // Check if the current route is in the legal group
  const isInLegalGroup = segments[0] === 'legal';
  
  // Debug: Log auth state changes
  React.useEffect(() => {
    console.log('=== AUTH STATE CHANGED ===', { 
      isAuthenticated, 
      hasToken: !!token, 
      token: token ? 'exists' : 'null',
      currentSegments: segments.join('/') 
    });
  }, [isAuthenticated, token, segments]);
  
  useEffect(() => {
    console.log('Navigation check:', { 
      isAuthenticated, 
      hasToken: !!token, 
      isInAuthGroup, 
      isInLegalGroup, 
      segments,
      currentPath: segments.join('/') 
    });
    
    // If user is not authenticated and not in auth or legal group, redirect to register
    if (!isAuthenticated || !token) {
      if (!isInAuthGroup && !isInLegalGroup) {
        console.log('Redirecting to register - user not authenticated');
        // Use immediate navigation for logout scenarios
        router.replace('/(auth)/register');
      }
      return;
    }
    
    // If user is authenticated and in auth group, redirect to tabs
    if (isAuthenticated && token && isInAuthGroup) {
      console.log('Redirecting to tabs - user authenticated');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, token, isInAuthGroup, isInLegalGroup, router, segments]);
  
  // Additional effect to handle immediate logout state changes
  useEffect(() => {
    // Force immediate redirect when auth state changes to false
    if (!isAuthenticated && !token && !isInAuthGroup && !isInLegalGroup) {
      console.log('Force redirect to register due to logout');
      router.replace('/(auth)/register');
    }
  }, [isAuthenticated, token]);
  
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
});

// Wrap with Sentry for error tracking in production
export default process.env.NODE_ENV === 'production' 
  ? Sentry.wrap(RootLayoutComponent)
  : RootLayoutComponent;