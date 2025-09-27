import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { testTrpcConnection, testTrpcHello } from '@/lib/trpc';

interface TestResult {
  name: string;
  value: string | undefined;
  source: string;
  status: 'success' | 'warning' | 'error';
}

export default function EnvTestScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [trpcTest, setTrpcTest] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    
    // Environment variable tests
    const envTests: TestResult[] = [
      {
        name: 'EXPO_PUBLIC_API_URL (process.env)',
        value: process.env.EXPO_PUBLIC_API_URL,
        source: 'process.env',
        status: process.env.EXPO_PUBLIC_API_URL ? 'success' : 'error'
      },
      {
        name: 'EXPO_PUBLIC_TRPC_URL (process.env)',
        value: process.env.EXPO_PUBLIC_TRPC_URL,
        source: 'process.env',
        status: process.env.EXPO_PUBLIC_TRPC_URL ? 'success' : 'error'
      },
      {
        name: 'EXPO_PUBLIC_API_URL (Constants.expoConfig.extra)',
        value: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL,
        source: 'Constants.expoConfig.extra',
        status: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ? 'success' : 'warning'
      },
      {
        name: 'EXPO_PUBLIC_TRPC_URL (Constants.expoConfig.extra)',
        value: Constants.expoConfig?.extra?.EXPO_PUBLIC_TRPC_URL,
        source: 'Constants.expoConfig.extra',
        status: Constants.expoConfig?.extra?.EXPO_PUBLIC_TRPC_URL ? 'success' : 'warning'
      },
      {
        name: 'NODE_ENV',
        value: process.env.NODE_ENV,
        source: 'process.env',
        status: process.env.NODE_ENV ? 'success' : 'warning'
      },
      {
        name: '__DEV__',
        value: String(__DEV__),
        source: 'global',
        status: 'success'
      },
      {
        name: 'Platform.OS',
        value: Platform.OS,
        source: 'Platform',
        status: 'success'
      }
    ];

    setResults(envTests);

    // Test tRPC connection
    try {
      console.log('🧪 Testing tRPC connection...');
      const trpcResult = await testTrpcHello();
      setTrpcTest(trpcResult);
    } catch (error) {
      setTrpcTest({ success: false, error: String(error) });
    }

    // Test API endpoints
    try {
      console.log('🧪 Testing API endpoints...');
      const connectionResult = await testTrpcConnection();
      setConnectionTest(connectionResult);
    } catch (error) {
      setConnectionTest({ error: String(error) });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Environment Test',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Environment Variables Test</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isLoading ? '#666' : '#007AFF' }]}
          onPress={runTests}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Running Tests...' : 'Run Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          {results.map((result, index) => (
            <View key={index} style={styles.testItem}>
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{result.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusIcon(result.status)} {result.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.testSource}>Source: {result.source}</Text>
              <Text style={styles.testValue}>
                Value: {result.value || 'undefined'}
              </Text>
            </View>
          ))}
        </View>

        {trpcTest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>tRPC Connection Test</Text>
            <View style={styles.testItem}>
              <Text style={[styles.testResult, { color: trpcTest.success ? '#4CAF50' : '#F44336' }]}>
                {trpcTest.success ? '✅ Success' : '❌ Failed'}
              </Text>
              {trpcTest.data && (
                <Text style={styles.testData}>
                  Data: {JSON.stringify(trpcTest.data, null, 2)}
                </Text>
              )}
              {trpcTest.error && (
                <Text style={styles.testError}>
                  Error: {trpcTest.error}
                </Text>
              )}
            </View>
          </View>
        )}

        {connectionTest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>API Endpoint Test</Text>
            <View style={styles.testItem}>
              <Text style={styles.testValue}>
                Base URL: {connectionTest.baseUrl}
              </Text>
              <Text style={styles.testValue}>
                Working Endpoint: {connectionTest.workingEndpoint || 'None found'}
              </Text>
              {connectionTest.results && connectionTest.results.length > 0 && (
                <View style={styles.endpointResults}>
                  <Text style={styles.testLabel}>Endpoint Results:</Text>
                  {connectionTest.results.map((result: any, index: number) => (
                    <Text key={index} style={styles.endpointResult}>
                      {result.success ? '✅' : '❌'} {result.endpoint} ({result.status || 'Error'})
                    </Text>
                  ))}
                </View>
              )}
              {connectionTest.error && (
                <Text style={styles.testError}>
                  Error: {connectionTest.error}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Info</Text>
          <View style={styles.testItem}>
            <Text style={styles.testValue}>
              Constants.expoConfig: {JSON.stringify(Constants.expoConfig?.extra, null, 2)}
            </Text>
            <Text style={styles.testValue}>
              Current Time: {new Date().toISOString()}
            </Text>
            {Platform.OS === 'web' && typeof window !== 'undefined' && (
              <Text style={styles.testValue}>
                Window Location: {window.location?.href}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  testItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  testSource: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  testValue: {
    color: '#8E8E93',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  testResult: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testData: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#2a2a2a',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  testError: {
    color: '#F44336',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  testLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  endpointResults: {
    marginTop: 8,
  },
  endpointResult: {
    color: '#8E8E93',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});