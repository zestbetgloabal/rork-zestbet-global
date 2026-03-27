import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, Platform } from 'react-native';
import colors from "@/constants/colors";
import { useAuthStore } from "@/store/authStore";
import ErrorBoundary from "@/components/ErrorBoundary";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

function RootLayoutComponent() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error && __DEV__) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync();
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>🎯</Text>
        <Text style={styles.loadingText}>ZestBet</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, _hasHydrated, setHasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [hydrationTimeout, setHydrationTimeout] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!_hasHydrated) {
        console.warn('Hydration timeout - forcing continue');
        setHydrationTimeout(true);
        setHasHydrated(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [_hasHydrated, setHasHydrated]);

  useEffect(() => {
    if (!_hasHydrated && !hydrationTimeout) return;

    const isInAuthGroup = segments?.[0] === '(auth)' as string;

    const currentSegment = segments?.[0] as string | undefined;

    if (isAuthenticated && isInAuthGroup) {
      console.log('Redirecting authenticated user to tabs');
      router.replace('/(tabs)' as Href);
    } else if (!isAuthenticated && !isInAuthGroup && currentSegment !== 'legal' && currentSegment !== 'email-verification' && segments.length > 0) {
      console.log('Redirecting unauthenticated user to login');
      router.replace('/(auth)/login' as Href);
    }
  }, [isAuthenticated, _hasHydrated, hydrationTimeout, segments, router]);

  if (!_hasHydrated && !hydrationTimeout) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingEmoji}>🎯</Text>
        <Text style={styles.loadingText}>ZestBet</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' as const },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="bet/[id]" options={{ title: "Wette" }} />
        <Stack.Screen name="propose-bet" options={{ title: "Neue Wette", presentation: "modal" }} />
        <Stack.Screen name="invite" options={{ title: "Einladen", presentation: "modal" }} />
        <Stack.Screen name="wallet" options={{ title: "Wallet" }} />
        <Stack.Screen name="profile-edit" options={{ title: "Profil bearbeiten" }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="legal" options={{ headerShown: false }} />
        <Stack.Screen name="email-verification" options={{ title: "Verifizierung", headerShown: false }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loadingEmoji: {
    fontSize: 48,
  },
  loadingText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.primary,
  },
});

export default RootLayoutComponent;
