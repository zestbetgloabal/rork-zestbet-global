import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testTrpcConnection, vanillaTrpcClient } from '@/lib/trpc';

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

export default function ApiTestScreen() {
  const [testResults, setTestResults] = useState<ConnectionTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trpcTestResult, setTrpcTestResult] = useState<string>('');

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResults(null);
    setTrpcTestResult('');
    
    try {
      console.log('🔍 Starting connection test...');
      const results = await testTrpcConnection();
      setTestResults(results);
      console.log('✅ Connection test completed:', results);
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setTestResults({
        baseUrl: 'unknown',
        results: [{
          endpoint: 'test',
          success: false,
          error: String(error)
        }],
        workingEndpoint: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTrpcTest = async () => {
    setTrpcTestResult('Testing tRPC...');
    
    try {
      // Test the simple hi endpoint using vanilla client
      const result = await vanillaTrpcClient.example.hi.query({ name: 'Test' });
      setTrpcTestResult(`✅ tRPC Success: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTrpcTestResult(`❌ tRPC Error: ${String(error)}`);
    }
  };

  useEffect(() => {
    // Auto-run test on mount
    runConnectionTest();
  }, []);

  const getStatusColor = (success: boolean) => {
    return success ? '#4CAF50' : '#F44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>API Connection Test</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: isLoading ? '#ccc' : '#2196F3' }]}
            onPress={runConnectionTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#4CAF50' }]}
            onPress={runTrpcTest}
          >
            <Text style={styles.buttonText}>Test tRPC</Text>
          </TouchableOpacity>
        </View>

        {testResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Connection Test Results</Text>
            <Text style={styles.baseUrl}>Base URL: {testResults.baseUrl}</Text>
            <Text style={styles.workingEndpoint}>
              Working Endpoint: {testResults.workingEndpoint || 'None found'}
            </Text>
            
            {testResults.results.map((result, index) => (
              <View key={`${result.endpoint}-${index}`} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.endpoint}>{result.endpoint}</Text>
                  <View style={[
                    styles.statusIndicator, 
                    { backgroundColor: getStatusColor(result.success) }
                  ]}>
                    <Text style={styles.statusText}>
                      {result.success ? '✅' : '❌'}
                    </Text>
                  </View>
                </View>
                
                {result.status && (
                  <Text style={styles.status}>Status: {result.status}</Text>
                )}
                
                {result.contentType && (
                  <Text style={styles.contentType}>
                    Content-Type: {result.contentType}
                  </Text>
                )}
                
                {result.data && (
                  <Text style={styles.data}>
                    Data: {typeof result.data === 'string' 
                      ? result.data.substring(0, 200) 
                      : JSON.stringify(result.data, null, 2).substring(0, 200)
                    }
                  </Text>
                )}
                
                {result.error && (
                  <Text style={styles.error}>Error: {result.error}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {trpcTestResult && (
          <View style={styles.trpcResultContainer}>
            <Text style={styles.sectionTitle}>tRPC Test Result</Text>
            <Text style={styles.trpcResult}>{trpcTestResult}</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Environment Info</Text>
          <Text style={styles.infoText}>
            EXPO_PUBLIC_TRPC_URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'undefined'}
          </Text>
          <Text style={styles.infoText}>
            EXPO_PUBLIC_API_URL: {process.env.EXPO_PUBLIC_API_URL || 'undefined'}
          </Text>
          <Text style={styles.infoText}>
            Current Origin: {typeof window !== 'undefined' ? window.location?.origin : 'N/A (mobile)'}
          </Text>
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  baseUrl: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  workingEndpoint: {
    fontSize: 14,
    marginBottom: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  endpoint: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  contentType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  error: {
    fontSize: 12,
    color: '#F44336',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
  },
  trpcResultContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  trpcResult: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});