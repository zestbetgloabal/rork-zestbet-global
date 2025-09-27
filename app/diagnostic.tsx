import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function DiagnosticScreen() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Environment Variables
    addResult({
      test: 'Environment Variables',
      status: 'pending',
      message: 'Checking environment configuration...'
    });

    const envVars = {
      EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    };

    const missingVars = Object.entries(envVars).filter(([_, value]) => !value);
    
    addResult({
      test: 'Environment Variables',
      status: missingVars.length > 0 ? 'error' : 'success',
      message: missingVars.length > 0 
        ? `Missing variables: ${missingVars.map(([key]) => key).join(', ')}`
        : 'All environment variables are set',
      details: envVars
    });

    // Test 2: Network Connectivity
    addResult({
      test: 'Network Connectivity',
      status: 'pending',
      message: 'Testing basic network connectivity...'
    });

    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        addResult({
          test: 'Network Connectivity',
          status: 'success',
          message: 'Network connectivity is working'
        });
      } else {
        addResult({
          test: 'Network Connectivity',
          status: 'error',
          message: `Network test failed with status: ${response.status}`
        });
      }
    } catch (error) {
      addResult({
        test: 'Network Connectivity',
        status: 'error',
        message: `Network connectivity failed: ${String(error)}`
      });
    }

    // Test 3: API Base URL
    const baseUrls = [
      'https://zestapp.online',
      'https://zestapp.online/api',
      'https://zestapp.online/api/status',
      typeof window !== 'undefined' ? `${window.location.origin}/api` : null
    ].filter(Boolean) as string[];

    for (const baseUrl of baseUrls) {
      addResult({
        test: `API Base URL: ${baseUrl}`,
        status: 'pending',
        message: 'Testing API endpoint...'
      });

      try {
        const response = await fetch(baseUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });

        const contentType = response.headers.get('content-type');
        let responseData = null;
        
        try {
          if (contentType?.includes('application/json')) {
            responseData = await response.json();
          } else {
            responseData = await response.text();
          }
        } catch {
          responseData = 'Could not parse response';
        }

        addResult({
          test: `API Base URL: ${baseUrl}`,
          status: response.ok ? 'success' : 'error',
          message: response.ok 
            ? `API endpoint is accessible (${response.status})`
            : `API endpoint returned ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            contentType,
            data: typeof responseData === 'string' 
              ? responseData.substring(0, 200) 
              : responseData
          }
        });
      } catch (error) {
        addResult({
          test: `API Base URL: ${baseUrl}`,
          status: 'error',
          message: `Failed to connect: ${String(error)}`,
          details: { error: String(error) }
        });
      }
    }

    // Test 4: tRPC Endpoints
    const trpcUrls = [
      'https://zestapp.online/api/trpc',
      'https://zestapp.online/trpc',
      typeof window !== 'undefined' ? `${window.location.origin}/api/trpc` : null
    ].filter(Boolean) as string[];

    for (const trpcUrl of trpcUrls) {
      addResult({
        test: `tRPC Endpoint: ${trpcUrl}`,
        status: 'pending',
        message: 'Testing tRPC endpoint...'
      });

      try {
        // Test with a simple tRPC query format
        const response = await fetch(`${trpcUrl}/example.hi`, {
          method: 'GET',
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        });

        const contentType = response.headers.get('content-type');
        let responseData = null;
        
        try {
          if (contentType?.includes('application/json')) {
            responseData = await response.json();
          } else {
            responseData = await response.text();
          }
        } catch {
          responseData = 'Could not parse response';
        }

        addResult({
          test: `tRPC Endpoint: ${trpcUrl}`,
          status: response.ok ? 'success' : 'error',
          message: response.ok 
            ? `tRPC endpoint is accessible (${response.status})`
            : `tRPC endpoint returned ${response.status}: ${response.statusText}`,
          details: {
            status: response.status,
            contentType,
            data: typeof responseData === 'string' 
              ? responseData.substring(0, 200) 
              : responseData
          }
        });
      } catch (error) {
        addResult({
          test: `tRPC Endpoint: ${trpcUrl}`,
          status: 'error',
          message: `Failed to connect: ${String(error)}`,
          details: { error: String(error) }
        });
      }
    }

    // Test 5: Platform Detection
    addResult({
      test: 'Platform Detection',
      status: 'success',
      message: 'Platform information collected',
      details: {
        platform: typeof window !== 'undefined' ? 'web' : 'mobile',
        origin: typeof window !== 'undefined' ? window.location?.origin : 'N/A',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
      }
    });

    setIsRunning(false);
  };

  useEffect(() => {
    // Auto-run diagnostics on mount
    runDiagnostics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
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
        <Text style={styles.title}>API Diagnostics</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isRunning ? '#ccc' : '#2196F3' }]}
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
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
            <Text style={styles.emptyText}>No diagnostics run yet</Text>
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