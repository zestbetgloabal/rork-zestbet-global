import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc, testTrpcConnection } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function DebugTrpcScreen() {
  const insets = useSafeAreaInsets();
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Test the simple hi endpoint
  const hiQuery = trpc.example.hi.useQuery(
    { name: 'Debug Test' },
    {
      retry: 1,
      enabled: false, // Don't auto-run
    }
  );

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await testTrpcConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({ success: false, error: String(error) });
    }
    setTestingConnection(false);
  };

  const testTrpcQuery = () => {
    hiQuery.refetch();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>tRPC Debug Console</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          <Text style={styles.debugText}>
            EXPO_PUBLIC_TRPC_URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'undefined'}
          </Text>
          <Text style={styles.debugText}>
            EXPO_PUBLIC_API_URL: {process.env.EXPO_PUBLIC_API_URL || 'undefined'}
          </Text>
          <Text style={styles.debugText}>
            EXPO_PUBLIC_BASE_URL: {process.env.EXPO_PUBLIC_BASE_URL || 'undefined'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Test</Text>
          <Pressable 
            style={styles.button} 
            onPress={testConnection}
            disabled={testingConnection}
          >
            {testingConnection ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Test API Connection</Text>
            )}
          </Pressable>
          
          {connectionTest && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Connection Result:</Text>
              <Text style={styles.debugText}>
                {JSON.stringify(connectionTest, null, 2)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tRPC Query Test</Text>
          <Pressable 
            style={styles.button} 
            onPress={testTrpcQuery}
            disabled={hiQuery.isLoading}
          >
            {hiQuery.isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Test tRPC Hi Query</Text>
            )}
          </Pressable>
          
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Query Status:</Text>
            <Text style={styles.debugText}>Loading: {hiQuery.isLoading.toString()}</Text>
            <Text style={styles.debugText}>Error: {hiQuery.error?.message || 'none'}</Text>
            <Text style={styles.debugText}>Data: {JSON.stringify(hiQuery.data, null, 2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Runtime Info</Text>
          <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
          <Text style={styles.debugText}>
            Window Origin: {typeof window !== 'undefined' ? window.location?.origin : 'N/A (Native)'}
          </Text>
          <Text style={styles.debugText}>DEV Mode: {__DEV__.toString()}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
});