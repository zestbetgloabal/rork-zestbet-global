import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { testTrpcConnection, trpc } from '@/lib/trpc';

interface TestResult {
  endpoint: string;
  success: boolean;
  status?: number;
  contentType?: string | null;
  data?: any;
  error?: string;
}

interface ConnectionTestResult {
  baseUrl: string;
  results: TestResult[];
  workingEndpoint: string | null;
}

export default function ConnectionTestScreen() {
  const [testResults, setTestResults] = useState<ConnectionTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trpcTestResult, setTrpcTestResult] = useState<string | null>(null);

  // Test basic tRPC connection
  const testTrpcQuery = trpc.example.hi.useQuery(
    { name: 'Connection Test' },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Handle tRPC query results
  useEffect(() => {
    if (testTrpcQuery.data) {
      setTrpcTestResult(`✅ tRPC Success: ${JSON.stringify(testTrpcQuery.data)}`);
    } else if (testTrpcQuery.error) {
      setTrpcTestResult(`❌ tRPC Error: ${testTrpcQuery.error.message}`);
    }
  }, [testTrpcQuery.data, testTrpcQuery.error]);

  const runConnectionTest = async () => {
    setIsLoading(true);
    try {
      const results = await testTrpcConnection();
      setTestResults(results);
    } catch (error) {
      console.error('Test Error', String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    const testUrls = [
      // Local development server
      'http://localhost:3001/api',
      'http://localhost:3001/api/status',
      'http://localhost:3001/api/trpc',
      // Production server
      'https://zestapp.online/api',
      'https://zestapp.online/api/status',
      'https://zestapp.online/api/trpc'
    ];

    for (const url of testUrls) {
      try {
        console.log(`🔍 Testing direct fetch to: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📡 Response status: ${response.status}`);
        const contentType = response.headers.get('content-type');
        console.log(`📄 Content-Type: ${contentType}`);
        
        if (response.ok) {
          const data = await response.text();
          console.log(`✅ Success for ${url}:`, data.substring(0, 200));
          console.log('Success!', `${url} is working!\nStatus: ${response.status}\nData: ${data.substring(0, 100)}`);
          return;
        }
      } catch (error) {
        console.error(`❌ Error testing ${url}:`, error);
      }
    }
    
    console.log('All Tests Failed', 'None of the endpoints are responding');
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Connection Test',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>API Connection Test</Text>
        
        {/* tRPC Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tRPC Test</Text>
          <View style={styles.testBox}>
            {testTrpcQuery.isLoading && <Text style={styles.loading}>Loading...</Text>}
            {trpcTestResult && <Text style={styles.result}>{trpcTestResult}</Text>}
          </View>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => testTrpcQuery.refetch()}
          >
            <Text style={styles.buttonText}>Retry tRPC Test</Text>
          </TouchableOpacity>
        </View>

        {/* Connection Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endpoint Tests</Text>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={runConnectionTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Run Connection Test'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={testDirectFetch}
          >
            <Text style={styles.buttonText}>Test Direct Fetch</Text>
          </TouchableOpacity>

          {testResults && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultTitle}>Base URL: {testResults.baseUrl}</Text>
              <Text style={styles.resultTitle}>
                Working Endpoint: {testResults.workingEndpoint || 'None'}
              </Text>
              
              {testResults.results.map((result) => (
                <View key={result.endpoint} style={styles.resultItem}>
                  <Text style={[styles.endpoint, result.success ? styles.success : styles.error]}>
                    {result.success ? '✅' : '❌'} {result.endpoint}
                  </Text>
                  {result.status && (
                    <Text style={styles.detail}>Status: {result.status}</Text>
                  )}
                  {result.contentType && (
                    <Text style={styles.detail}>Type: {result.contentType}</Text>
                  )}
                  {result.error && (
                    <Text style={styles.errorText}>Error: {result.error}</Text>
                  )}
                  {result.data && (
                    <Text style={styles.detail}>
                      Data: {typeof result.data === 'string' 
                        ? result.data.substring(0, 100) 
                        : JSON.stringify(result.data).substring(0, 100)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Environment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Info</Text>
          <Text style={styles.envText}>
            EXPO_PUBLIC_TRPC_URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'Not set'}
          </Text>
          <Text style={styles.envText}>
            EXPO_PUBLIC_API_URL: {process.env.EXPO_PUBLIC_API_URL || 'Not set'}
          </Text>
          <Text style={styles.envText}>
            NODE_ENV: {process.env.NODE_ENV || 'Not set'}
          </Text>
        </View>
        
        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          <Text style={styles.troubleshootingText}>
            If you&apos;re seeing connection errors, try the following:
          </Text>
          
          <View style={styles.troubleshootingItem}>
            <Text style={styles.troubleshootingTitle}>1. Start the backend server</Text>
            <Text style={styles.codeBlock}>./start-backend.sh</Text>
            <Text style={styles.troubleshootingText}>or</Text>
            <Text style={styles.codeBlock}>bun run dev-server.ts</Text>
          </View>
          
          <View style={styles.troubleshootingItem}>
            <Text style={styles.troubleshootingTitle}>2. Check port availability</Text>
            <Text style={styles.troubleshootingText}>
              Make sure port 3001 is not in use by another application.
            </Text>
          </View>
          
          <View style={styles.troubleshootingItem}>
            <Text style={styles.troubleshootingTitle}>3. Verify network connectivity</Text>
            <Text style={styles.troubleshootingText}>
              Ensure your device can connect to the development server.
            </Text>
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
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  testBox: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  loading: {
    color: '#ffa500',
    fontSize: 16,
  },
  result: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 15,
  },
  resultTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  endpoint: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  detail: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 2,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
  },
  envText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  // Troubleshooting styles
  troubleshootingText: {
    color: '#8E8E93',
    fontSize: 14,
    marginBottom: 10,
  },
  troubleshootingItem: {
    marginBottom: 15,
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  troubleshootingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  codeBlock: {
    color: '#FF9500',
    fontSize: 14,
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
});