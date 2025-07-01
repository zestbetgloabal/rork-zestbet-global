import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  
  // Check if the current route is in the auth group
  const isInAuthGroup = segments[0] === '(auth)';
  // Check if the current route is in the legal group
  const isInLegalGroup = segments[0] === 'legal';
  
  useEffect(() => {
    // Handle navigation based on authentication state
    const handleNavigation = () => {
      console.log('Navigation check:', { isAuthenticated, isInAuthGroup, isInLegalGroup, segments });
      
      // If the user is not authenticated and not in the auth group or legal group, redirect to auth
      if (!isAuthenticated && !isInAuthGroup && !isInLegalGroup) {
        console.log('Redirecting to auth');
        router.replace('/(auth)');
        return;
      }
      
      // If the user is authenticated and in the auth group, redirect to tabs
      if (isAuthenticated && isInAuthGroup) {
        console.log('Redirecting to tabs');
        router.replace('/(tabs)');
        return;
      }
    };
    
    // Small delay to ensure state is properly updated
    const timeoutId = setTimeout(handleNavigation, 50);
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, isInAuthGroup, isInLegalGroup, router]);
  
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
          name="live-events/[id]" 
          options={{ 
            title: "Live Event",
          }} 
        />
        <Stack.Screen 
          name="live-events/schedule" 
          options={{ 
            title: "Event Schedule",
          }} 
        />
        <Stack.Screen 
          name="create-challenge" 
          options={{ 
            title: "Create Challenge",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="challenge/[id]" 
          options={{ 
            title: "Challenge Details",
          }} 
        />
      </Stack>
    </>
  );
}