import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function ConnectionTestSimple() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testEndpoints = [
    'http://localhost:3001/api',
    'http://localhost:3001/api/status',
    'http://localhost:3001/api/trpc',
    'https://zestapp.online/api',
    'https://zestapp.online/api/status',
    'https://zestapp.online/api/trpc',
  ];

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);
    
    const testResults: any[] = [];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log('🔍 Testing:', endpoint);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/html, */*',
            'Cache-Control': 'no-cache',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const contentType = response.headers.get('content-type') || 'unknown';
        let data = 'No data';
        
        try {
          if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            data = text.substring(0, 200) + (text.length > 200 ? '...' : '');
          }
        } catch (parseError) {
          data = `Parse error: ${String(parseError)}`;
        }
        
        testResults.push({
          endpoint,
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          contentType,
          data,
          error: null,
        });
        
        console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        testResults.push({
          endpoint,
          success: false,
          status: 0,
          statusText: 'Failed',
          contentType: 'error',
          data: null,
          error: errorMessage,
        });
        
        console.log(`❌ ${endpoint}: ${errorMessage}`);
      }
    }
    
    setResults(testResults);
    setIsLoading(false);
  };

  const testTrpcSpecific = async () => {
    try {
      console.log('🔍 Testing tRPC specific endpoint...');
      
      // Try local first, then production
      const trpcUrls = [
        'http://localhost:3001/api/trpc',
        'https://zestapp.online/api/trpc'
      ];
      
      for (const trpcUrl of trpcUrls) {
        try {
          console.log(`Testing ${trpcUrl}...`);
          
          const response = await fetch(trpcUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              "0": {
                "json": { "name": "Test" }
              }
            }),
          });
          
          const data = await response.text();
          
          Alert.alert(
            `tRPC Test Result (${trpcUrl})`,
            `Status: ${response.status}\nContent-Type: ${response.headers.get('content-type')}\nData: ${data.substring(0, 300)}`
          );
          
          if (response.ok) {
            break; // Stop if we get a successful response
          }
          
        } catch (urlError) {
          console.log(`Failed ${trpcUrl}:`, urlError);
          if (trpcUrl === trpcUrls[trpcUrls.length - 1]) {
            // This was the last URL, show the error
            throw urlError;
          }
        }
      }
      
    } catch (error) {
      Alert.alert('tRPC Test Error', String(error));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Connection Test Simple' }} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>API Connection Test</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={testConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Again'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.trpcButton]} 
            onPress={testTrpcSpecific}
          >
            <Text style={styles.buttonText}>Test tRPC Specific</Text>
          </TouchableOpacity>
        </View>

        {results.map((result, index) => (
          <View key={index} style={styles.resultCard}>
            <Text style={styles.endpoint}>{result.endpoint}</Text>
            
            <View style={styles.statusRow}>
              <Text style={[
                styles.status,
                result.success ? styles.success : styles.error
              ]}>
                {result.success ? '✅' : '❌'} {result.status} {result.statusText}
              </Text>
            </View>
            
            <Text style={styles.contentType}>
              Content-Type: {result.contentType}
            </Text>
            
            {result.error && (
              <Text style={styles.errorText}>Error: {result.error}</Text>
            )}
            
            {result.data && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataLabel}>Response:</Text>
                <Text style={styles.dataText}>
                  {typeof result.data === 'string' 
                    ? result.data 
                    : JSON.stringify(result.data, null, 2)
                  }
                </Text>
              </View>
            )}
          </View>
        ))}
        
        {results.length === 0 && !isLoading && (
          <Text style={styles.noResults}>No results yet. Tap "Test Again" to start.</Text>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resultCard: {
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
  endpoint: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusRow: {
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  success: {
    color: '#34C759',
  },
  error: {
    color: '#FF3B30',
  },
  contentType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginBottom: 8,
  },
  dataContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  dataText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },
});