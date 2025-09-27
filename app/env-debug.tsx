import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { getAppConfig, debugEnvironment } from '@/lib/config';
import Constants from 'expo-constants';

export default function EnvDebugScreen() {
  React.useEffect(() => {
    debugEnvironment();
  }, []);

  const config = getAppConfig();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Environment Debug</Text>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>App Config</Text>
        <Text style={styles.text}>API URL: {config.apiUrl}</Text>
        <Text style={styles.text}>tRPC URL: {config.trpcUrl}</Text>
        <Text style={styles.text}>Base URL: {config.baseUrl}</Text>
        <Text style={styles.text}>Is Development: {String(config.isDevelopment)}</Text>
        <Text style={styles.text}>Platform: {config.platform}</Text>
        
        <Text style={styles.sectionTitle}>Process Environment</Text>
        <Text style={styles.text}>NODE_ENV: {process.env.NODE_ENV}</Text>
        <Text style={styles.text}>EXPO_PUBLIC_API_URL: {process.env.EXPO_PUBLIC_API_URL || 'undefined'}</Text>
        <Text style={styles.text}>EXPO_PUBLIC_TRPC_URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'undefined'}</Text>
        <Text style={styles.text}>EXPO_PUBLIC_BASE_URL: {process.env.EXPO_PUBLIC_BASE_URL || 'undefined'}</Text>
        
        <Text style={styles.sectionTitle}>Expo Constants</Text>
        <Text style={styles.text}>App Name: {Constants.expoConfig?.name}</Text>
        <Text style={styles.text}>Slug: {Constants.expoConfig?.slug}</Text>
        <Text style={styles.text}>Version: {Constants.expoConfig?.version}</Text>
        <Text style={styles.text}>Extra: {JSON.stringify(Constants.expoConfig?.extra, null, 2)}</Text>
        
        <Text style={styles.sectionTitle}>Runtime Info</Text>
        <Text style={styles.text}>__DEV__: {String(__DEV__)}</Text>
        <Text style={styles.text}>Platform: {require('react-native').Platform.OS}</Text>
        
        {typeof window !== 'undefined' && (
          <>
            <Text style={styles.sectionTitle}>Web Info</Text>
            <Text style={styles.text}>Origin: {window.location.origin}</Text>
            <Text style={styles.text}>Hostname: {window.location.hostname}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});