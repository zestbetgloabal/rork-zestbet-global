import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testTrpcConnection, vanillaTrpcClient } from '@/lib/trpc';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function ConnectionDebugScreen() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runFullDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Check
    addResult({
      test: 'Environment Variables',
      status: 'pending',
      message: 'Checking configuration...'
    });

    const envVars = {
      EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    };

    addResult({
      test: 'Environment Variables',
      status: 'success',
      message: 'Environment variables loaded',
      details: envVars
    });

    // Test 2: Basic Network Test
    addResult({
      test: 'Network Connectivity',
      status: 'pending',
      message: 'Testing basic network...'
    });

    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: AbortSignal.timeout(10000)
      });
      
      addResult({
        test: 'Network Connectivity',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Network is working' : `Network test failed: ${response.status}`
      });
    } catch (error) {
      addResult({
        test: 'Network Connectivity',
        status: 'error',
        message: `Network error: ${String(error)}`
      });
    }

    // Test 3: API Endpoint Discovery
    addResult({
      test: 'API Endpoint Discovery',
      status: 'pending',
      message: 'Testing API endpoints...'
    });

    try {
      const connectionTest = await testTrpcConnection();
      
      addResult({
        test: 'API Endpoint Discovery',
        status: connectionTest.workingEndpoint ? 'success' : 'error',
        message: connectionTest.workingEndpoint 
          ? `Found working endpoint: ${connectionTest.workingEndpoint}`
          : 'No working endpoints found',
        details: connectionTest
      });
    } catch (error) {
      addResult({
        test: 'API Endpoint Discovery',
        status: 'error',
        message: `Endpoint discovery failed: ${String(error)}`
      });
    }

    // Test 4: Direct API Test
    addResult({
      test: 'Direct API Test',
      status: 'pending',
      message: 'Testing direct API connection...'
    });

    const apiUrls = [
      'https://zestapp.online/api',
      'https://zestapp.online/api/status',
      typeof window !== 'undefined' ? `${window.location.origin}/api` : null
    ].filter(Boolean) as string[];

    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(10000)
        });

        const contentType = response.headers.get('content-type');
        let data = null;
        
        try {
          if (contentType?.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
        } catch {
          data = 'Could not parse response';
        }

        addResult({
          test: `Direct API Test: ${apiUrl}`,
          status: response.ok ? 'success' : 'error',
          message: response.ok 
            ? `API accessible (${response.status})`
            : `API error (${response.status})`,
          details: {
            status: response.status,
            contentType,
            data: typeof data === 'string' ? data.substring(0, 300) : data
          }
        });

        if (response.ok) break; // Stop on first success
      } catch (error) {
        addResult({
          test: `Direct API Test: ${apiUrl}`,
          status: 'error',
          message: `Connection failed: ${String(error)}`
        });
      }
    }

    // Test 5: tRPC Test
    addResult({
      test: 'tRPC Connection Test',
      status: 'pending',
      message: 'Testing tRPC endpoint...'
    });

    try {
      const result = await vanillaTrpcClient.example.hi.query({ name: 'Debug Test' });
      
      addResult({
        test: 'tRPC Connection Test',
        status: 'success',
        message: 'tRPC connection successful!',
        details: result
      });
    } catch (error) {
      addResult({
        test: 'tRPC Connection Test',
        status: 'error',
        message: `tRPC failed: ${String(error)}`,
        details: { error: String(error) }
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runFullDiagnostic();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Connection Debug</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isRunning ? '#ccc' : '#2196F3' }]}
          onPress={runFullDiagnostic}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run Full Diagnostic'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={`${result.test}-${index}`} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.testName}>{result.test}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(result.status) }
                ]}>
                  <Text style={styles.statusIcon}>{getStatusIcon(result.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.message}>{result.message}</Text>
              
              {result.details && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>Details:</Text>
                  <Text style={styles.detailsText}>
                    {JSON.stringify(result.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {results.length === 0 && !isRunning && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tests run yet</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  resultsContainer: {
    gap: 12,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});