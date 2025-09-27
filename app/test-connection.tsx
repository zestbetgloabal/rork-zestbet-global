import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc, testTrpcConnection } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function TestConnectionScreen() {
  const insets = useSafeAreaInsets();
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Test tRPC example endpoint
  const exampleQuery = trpc.example.hi.useQuery();
  
  // Test challenges endpoint
  const challengesQuery = trpc.challenges.list.useQuery({
    limit: 5,
    offset: 0
  });

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const result = await testTrpcConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({ error: String(error) });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>API Connection Test</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          <Text style={styles.text}>
            TRPC URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'Not set'}
          </Text>
          <Text style={styles.text}>
            API URL: {process.env.EXPO_PUBLIC_API_URL || 'Not set'}
          </Text>
          <Text style={styles.text}>
            Base URL: {process.env.EXPO_PUBLIC_BASE_URL || 'Not set'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example Query (Hi)</Text>
          <Text style={styles.text}>
            Status: {exampleQuery.isLoading ? 'Loading...' : exampleQuery.error ? 'Error' : 'Success'}
          </Text>
          {exampleQuery.error && (
            <Text style={styles.errorText}>
              Error: {exampleQuery.error.message}
            </Text>
          )}
          {exampleQuery.data && (
            <Text style={styles.successText}>
              Data: {JSON.stringify(exampleQuery.data, null, 2)}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenges Query</Text>
          <Text style={styles.text}>
            Status: {challengesQuery.isLoading ? 'Loading...' : challengesQuery.error ? 'Error' : 'Success'}
          </Text>
          {challengesQuery.error && (
            <Text style={styles.errorText}>
              Error: {challengesQuery.error.message}
            </Text>
          )}
          {challengesQuery.data && (
            <Text style={styles.successText}>
              Challenges: {challengesQuery.data.challenges?.length || 0} found
            </Text>
          )}
        </View>

        <Pressable 
          style={[styles.button, isTestingConnection && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={isTestingConnection}
        >
          <Text style={styles.buttonText}>
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Text>
        </Pressable>

        {connectionTest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Test Results</Text>
            <Text style={styles.codeText}>
              {JSON.stringify(connectionTest, null, 2)}
            </Text>
          </View>
        )}
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
  },
  scrollContent: {
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
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontFamily: 'monospace',
    backgroundColor: `${colors.error}10`,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  successText: {
    fontSize: 12,
    color: colors.success,
    fontFamily: 'monospace',
    backgroundColor: `${colors.success}10`,
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  codeText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});