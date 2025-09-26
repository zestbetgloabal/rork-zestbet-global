import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpcClient } from '@/lib/trpc';

export default function TestBackend() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error instanceof Error ? error.message : String(error) 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: 'API Status',
      test: async () => {
        const response = await fetch(`${window.location.origin}/api/status`);
        return await response.json();
      }
    },
    {
      name: 'tRPC Hi',
      test: async () => {
        const result = await trpcClient.example.hi.query();
        return result;
      }
    },
    {
      name: 'Direct tRPC',
      test: async () => {
        const response = await fetch(`${window.location.origin}/api/trpc/example.hi`);
        return await response.json();
      }
    }
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await testEndpoint(test.name, test.test);
    }
  };

  useEffect(() => {
    runAllTests();
  }, [runAllTests]);

  const getStatusColor = (result: any) => {
    if (!result) return '#666';
    return result.success ? '#4CAF50' : '#F44336';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Test' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Backend Connection Test</Text>
        
        <TouchableOpacity style={styles.refreshButton} onPress={runAllTests}>
          <Text style={styles.refreshText}>🔄 Refresh Tests</Text>
        </TouchableOpacity>

        {tests.map((test) => (
          <View key={test.name} style={styles.testCard}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <View 
                style={[
                  styles.statusIndicator, 
                  { backgroundColor: getStatusColor(results[test.name]) }
                ]} 
              />
            </View>
            
            {loading[test.name] && (
              <Text style={styles.loading}>Testing...</Text>
            )}
            
            {results[test.name] && (
              <View style={styles.result}>
                {results[test.name].success ? (
                  <View>
                    <Text style={styles.successText}>✅ Success</Text>
                    <Text style={styles.resultData}>
                      {JSON.stringify(results[test.name].data, null, 2)}
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.errorText}>❌ Error</Text>
                    <Text style={styles.errorData}>
                      {results[test.name].error}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Environment Info</Text>
          <Text style={styles.infoText}>
            Current URL: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            API URL: {typeof window !== 'undefined' ? `${window.location.origin}/api` : 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            tRPC URL: {typeof window !== 'undefined' ? `${window.location.origin}/api/trpc` : 'N/A'}
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
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  refreshText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loading: {
    color: '#666',
    fontStyle: 'italic',
  },
  result: {
    marginTop: 8,
  },
  successText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorText: {
    color: '#F44336',
    fontWeight: '600',
    marginBottom: 4,
  },
  resultData: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  errorData: {
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    color: '#c62828',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});