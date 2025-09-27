import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

export default function TestTrpcScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`${timestamp}: ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testBasicConnection = async () => {
    setIsLoading(true);
    addLog('=== TESTING BASIC CONNECTION ===');
    
    try {
      // Test basic fetch to API
      const apiUrl = typeof window !== 'undefined' && window.location?.origin 
        ? `${window.location.origin}/api`
        : 'https://zestapp.online/api';
      
      addLog(`Testing API URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ API connection successful: ${data.message}`);
      } else {
        addLog(`❌ API connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addLog(`❌ API connection error: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testTrpcHello = async () => {
    setIsLoading(true);
    addLog('=== TESTING TRPC HELLO ===');
    
    try {
      // Import vanillaTrpcClient for direct usage
      const { vanillaTrpcClient } = await import('@/lib/trpc');
      const result = await vanillaTrpcClient.example.hi.query({ name: 'Test User' });
      addLog(`✅ tRPC Hello successful: ${JSON.stringify(result)}`);
    } catch (error: any) {
      addLog(`❌ tRPC Hello failed: ${error.message || error}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
    }
    
    setIsLoading(false);
  };

  const testTrpcStatus = async () => {
    setIsLoading(true);
    addLog('=== TESTING TRPC STATUS ===');
    
    try {
      // Test status endpoint
      const statusUrl = typeof window !== 'undefined' && window.location?.origin 
        ? `${window.location.origin}/api/status`
        : 'https://zestapp.online/api/status';
      
      addLog(`Testing status URL: ${statusUrl}`);
      
      const response = await fetch(statusUrl);
      const data = await response.json();
      
      if (response.ok) {
        addLog(`✅ Status check successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        addLog(`❌ Status check failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      addLog(`❌ Status check error: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testTrpcEndpoint = async () => {
    setIsLoading(true);
    addLog('=== TESTING TRPC ENDPOINT ===');
    
    try {
      // Test tRPC endpoint directly
      const trpcUrl = typeof window !== 'undefined' && window.location?.origin 
        ? `${window.location.origin}/api/trpc`
        : 'https://zestapp.online/api/trpc';
      
      addLog(`Testing tRPC URL: ${trpcUrl}`);
      
      const response = await fetch(trpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "0": {
            "json": {
              "name": "Test User"
            },
            "meta": {
              "values": {
                "name": ["undefined"]
              }
            }
          }
        }),
      });
      
      const contentType = response.headers.get('content-type');
      addLog(`Response content-type: ${contentType}`);
      addLog(`Response status: ${response.status} ${response.statusText}`);
      
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        addLog(`✅ tRPC endpoint response: ${JSON.stringify(data, null, 2)}`);
      } else {
        const text = await response.text();
        addLog(`❌ tRPC endpoint returned non-JSON: ${text.substring(0, 200)}`);
      }
    } catch (error) {
      addLog(`❌ tRPC endpoint error: ${error}`);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    addLog('tRPC Test Screen loaded');
    addLog(`Environment: ${typeof window !== 'undefined' ? 'Web' : 'Mobile'}`);
    if (typeof window !== 'undefined') {
      addLog(`Current origin: ${window.location?.origin}`);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>tRPC Connection Test</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={testBasicConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test API Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={testTrpcStatus}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Status Endpoint</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={testTrpcEndpoint}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test tRPC Endpoint</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={testTrpcHello}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test tRPC Hello</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.clearButton]} 
            onPress={clearLogs}
          >
            <Text style={styles.clearButtonText}>Clear Logs</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Test Logs:</Text>
          {logs.map((log, index) => (
            <Text key={`log-${index}-${log.substring(0, 10)}`} style={styles.logText}>
              {log}
            </Text>
          ))}
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    minHeight: 200,
  },
  logsTitle: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});