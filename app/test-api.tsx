import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { testTrpcConnection as testTrpcConnectionLib } from '@/lib/trpc';
import { debugApiCall } from '@/utils/crashPrevention';

type TestResult = {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
};

export default function TestApiScreen() {
  const [results, setResults] = useState<TestResult[]>([]);

  const testEndpoints = [
    { name: 'Health Check', url: 'https://rork-zestbet-global.vercel.app/api' },
    { name: 'Status Check', url: 'https://rork-zestbet-global.vercel.app/api/status' },
    { name: 'TRPC Health', url: 'https://rork-zestbet-global.vercel.app/api/trpc/example.hi' },
  ];

  const testEndpoint = async (endpoint: { name: string; url: string }) => {
    const testResult: TestResult = {
      endpoint: endpoint.name,
      status: 'loading'
    };
    
    setResults(prev => [...prev.filter(r => r.endpoint !== endpoint.name), testResult]);

    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.url}`);
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

      const text = await response.text();
      console.log(`Response text (first 200 chars):`, text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`JSON Parse Error: ${text.substring(0, 100)}...`);
      }

      testResult.status = 'success';
      testResult.data = data;
    } catch (error) {
      console.error(`Error testing ${endpoint.name}:`, error);
      testResult.status = 'error';
      testResult.error = error instanceof Error ? error.message : String(error);
    }

    setResults(prev => [...prev.filter(r => r.endpoint !== endpoint.name), testResult]);
  };

  const testTrpcCall = async () => {
    const testResult: TestResult = {
      endpoint: 'TRPC Call',
      status: 'loading'
    };
    
    setResults(prev => [...prev.filter(r => r.endpoint !== 'TRPC Call'), testResult]);

    try {
      // Test TRPC call using POST method
      const response = await fetch('https://rork-zestbet-global.vercel.app/api/trpc/example.hi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "0": {
            "json": null
          }
        })
      });

      const text = await response.text();
      console.log('TRPC Response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`TRPC JSON Parse Error: ${text.substring(0, 100)}...`);
      }

      testResult.status = 'success';
      testResult.data = data;
    } catch (error) {
      console.error('TRPC Error:', error);
      testResult.status = 'error';
      testResult.error = error instanceof Error ? error.message : String(error);
    }

    setResults(prev => [...prev.filter(r => r.endpoint !== 'TRPC Call'), testResult]);
  };

  const testTrpcConnectionTest = async () => {
    const testResult: TestResult = {
      endpoint: 'TRPC Connection Test',
      status: 'loading'
    };
    
    setResults(prev => [...prev.filter(r => r.endpoint !== 'TRPC Connection Test'), testResult]);

    try {
      const result = await testTrpcConnectionLib();
      testResult.status = result.success ? 'success' : 'error';
      testResult.data = result.success ? result.data : undefined;
      testResult.error = result.success ? undefined : result.error;
    } catch (error) {
      testResult.status = 'error';
      testResult.error = error instanceof Error ? error.message : String(error);
    }

    setResults(prev => [...prev.filter(r => r.endpoint !== 'TRPC Connection Test'), testResult]);
  };

  const testWithDebugApiCall = async () => {
    const testResult: TestResult = {
      endpoint: 'Debug API Call',
      status: 'loading'
    };
    
    setResults(prev => [...prev.filter(r => r.endpoint !== 'Debug API Call'), testResult]);

    try {
      const result = await debugApiCall('https://rork-zestbet-global.vercel.app/api/status');
      testResult.status = result.success ? 'success' : 'error';
      testResult.data = result.success ? result.data : { rawText: result.rawText };
      testResult.error = result.success ? undefined : result.error;
    } catch (error) {
      testResult.status = 'error';
      testResult.error = error instanceof Error ? error.message : String(error);
    }

    setResults(prev => [...prev.filter(r => r.endpoint !== 'Debug API Call'), testResult]);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'API Test' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>API Endpoint Tests</Text>
        
        <View style={styles.buttonContainer}>
          {testEndpoints.map((endpoint) => (
            <TouchableOpacity
              key={endpoint.name}
              style={styles.button}
              onPress={() => testEndpoint(endpoint)}
            >
              <Text style={styles.buttonText}>Test {endpoint.name}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[styles.button, styles.trpcButton]}
            onPress={testTrpcCall}
          >
            <Text style={styles.buttonText}>Test TRPC Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.debugButton]}
            onPress={testTrpcConnectionTest}
          >
            <Text style={styles.buttonText}>Test TRPC Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.debugButton]}
            onPress={testWithDebugApiCall}
          >
            <Text style={styles.buttonText}>Test Debug API Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={`${result.endpoint}-${index}`} style={styles.resultItem}>
              <Text style={styles.resultTitle}>{result.endpoint}</Text>
              <Text style={[
                styles.resultStatus,
                result.status === 'success' ? styles.success :
                result.status === 'error' ? styles.error : styles.loading
              ]}>
                Status: {result.status.toUpperCase()}
              </Text>
              
              {result.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataTitle}>Response:</Text>
                  <Text style={styles.dataText}>{JSON.stringify(result.data, null, 2)}</Text>
                </View>
              )}
              
              {result.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorTitle}>Error:</Text>
                  <Text style={styles.errorText}>{result.error}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
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
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trpcButton: {
    backgroundColor: '#34C759',
  },
  debugButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultsContainer: {
    gap: 16,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  loading: {
    color: '#FF9500',
  },
  dataContainer: {
    marginTop: 8,
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  errorContainer: {
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
  },
});