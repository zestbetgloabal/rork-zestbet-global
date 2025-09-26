import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable } from 'react-native';
import { Stack } from 'expo-router';

interface TestResult {
  url: string;
  status: 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function TestEnv() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const envVars = {
    'EXPO_PUBLIC_API_URL': process.env.EXPO_PUBLIC_API_URL,
    'EXPO_PUBLIC_TRPC_URL': process.env.EXPO_PUBLIC_TRPC_URL,
    'EXPO_PUBLIC_BASE_URL': process.env.EXPO_PUBLIC_BASE_URL,
    'NODE_ENV': process.env.NODE_ENV,
  };
  
  const testUrls = [
    'https://zestapp.online/api',
    'https://zestapp.online/api/status',
    'https://zestapp.online/api/trpc',
  ];
  
  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    for (const url of testUrls) {
      setTestResults(prev => [...prev, {
        url,
        status: 'testing',
        message: 'Testing...'
      }]);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        setTestResults(prev => prev.map(result => 
          result.url === url ? {
            ...result,
            status: response.ok ? 'success' : 'error',
            message: response.ok ? `Success (${response.status})` : `Failed (${response.status})`,
            details: {
              status: response.status,
              contentType,
              data: typeof responseData === 'string' ? responseData.substring(0, 200) : responseData
            }
          } : result
        ));
      } catch (error) {
        setTestResults(prev => prev.map(result => 
          result.url === url ? {
            ...result,
            status: 'error',
            message: `Network Error: ${error instanceof Error ? error.message : String(error)}`,
            details: { error: String(error) }
          } : result
        ));
      }
    }
    
    setIsRunning(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Environment Test' }} />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Environment Variables</Text>
        {Object.entries(envVars).map(([key, value]) => (
          <View key={key} style={styles.envItem}>
            <Text style={styles.envKey}>{key}:</Text>
            <Text style={styles.envValue}>{value || 'undefined'}</Text>
          </View>
        ))}
        
        <Text style={styles.title}>Backend Connectivity Test</Text>
        <Pressable 
          style={[styles.testButton, isRunning && styles.testButtonDisabled]} 
          onPress={runTests}
          disabled={isRunning}
        >
          <Text style={styles.testButtonText}>
            {isRunning ? 'Testing...' : 'Test Backend Connection'}
          </Text>
        </Pressable>
        
        {testResults.map((result, index) => (
          <View key={index} style={[
            styles.testResult,
            result.status === 'success' && styles.testSuccess,
            result.status === 'error' && styles.testError
          ]}>
            <Text style={styles.testUrl}>{result.url}</Text>
            <Text style={[
              styles.testMessage,
              result.status === 'success' && styles.testMessageSuccess,
              result.status === 'error' && styles.testMessageError
            ]}>
              {result.message}
            </Text>
            {result.details && (
              <Text style={styles.testDetails}>
                {JSON.stringify(result.details, null, 2)}
              </Text>
            )}
          </View>
        ))}
        
        <Text style={styles.title}>Diagnosis</Text>
        <Text style={styles.info}>
          If environment variables are undefined, the app cannot connect to your backend.
        </Text>
        <Text style={styles.info}>
          Expected EXPO_PUBLIC_API_URL: https://zestapp.online/api
        </Text>
        <Text style={styles.info}>
          Expected EXPO_PUBLIC_TRPC_URL: https://zestapp.online/api/trpc
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  envItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  envKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  envValue: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'monospace',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testResult: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  testSuccess: {
    backgroundColor: '#f0f9ff',
    borderColor: '#22c55e',
  },
  testError: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  testUrl: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  testMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  testMessageSuccess: {
    color: '#22c55e',
  },
  testMessageError: {
    color: '#ef4444',
  },
  testDetails: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});