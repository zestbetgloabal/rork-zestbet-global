import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

interface DiagnosticResult {
  url: string;
  status: 'success' | 'error' | 'pending';
  statusCode?: number;
  contentType?: string;
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function ApiDiagnosticScreen() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testUrls = [
    'https://main.ddk0z2esbs19wf.amplifyapp.com/api',
    'https://main.ddk0z2esbs19wf.amplifyapp.com/api/trpc',
    'https://main.ddk0z2esbs19wf.amplifyapp.com/api/trpc/example.hi',
    'https://zestapp.online/api',
    'https://zestapp.online/api/trpc',
    'https://zestapp.online/api/trpc/example.hi',
  ];

  const testUrl = async (url: string): Promise<DiagnosticResult> => {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Testing: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/html, */*',
          'User-Agent': 'ZestBet-Mobile-App/1.0',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      const contentType = response.headers.get('content-type') || 'unknown';
      let data: any = null;
      
      try {
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = text.substring(0, 300); // Limit text length
        }
      } catch (parseError) {
        data = `Parse error: ${String(parseError)}`;
      }
      
      console.log(`✅ ${url} - Status: ${response.status}, Time: ${responseTime}ms`);
      
      return {
        url,
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        contentType,
        data,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ ${url} - Error:`, error);
      
      let errorMessage = String(error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout (10s)';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error - Cannot reach server';
        }
      }
      
      return {
        url,
        status: 'error',
        error: errorMessage,
        responseTime,
      };
    }
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    
    console.log('🚀 Starting API diagnostic...');
    
    // Initialize results with pending status
    const initialResults: DiagnosticResult[] = testUrls.map(url => ({
      url,
      status: 'pending' as const,
    }));
    setResults(initialResults);
    
    // Test each URL
    for (let i = 0; i < testUrls.length; i++) {
      const result = await testUrl(testUrls[i]);
      
      setResults(prev => prev.map((r, index) => 
        index === i ? result : r
      ));
    }
    
    setIsRunning(false);
    console.log('✅ API diagnostic completed');
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
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
      <Stack.Screen 
        options={{ 
          title: 'API Diagnostic',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>API Connection Diagnostic</Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: isRunning ? '#666' : '#007AFF' }]}
          onPress={runDiagnostic}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Diagnostic...' : 'Run Diagnostic'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {results.map((result, index) => (
            <View key={index} style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.url}>{result.url}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) }]}>
                  <Text style={styles.statusText}>
                    {getStatusIcon(result.status)} {result.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {result.statusCode && (
                <Text style={styles.detail}>Status Code: {result.statusCode}</Text>
              )}
              
              {result.contentType && (
                <Text style={styles.detail}>Content-Type: {result.contentType}</Text>
              )}
              
              {result.responseTime && (
                <Text style={styles.detail}>Response Time: {result.responseTime}ms</Text>
              )}
              
              {result.error && (
                <Text style={styles.error}>Error: {result.error}</Text>
              )}
              
              {result.data && (
                <View style={styles.dataContainer}>
                  <Text style={styles.dataLabel}>Response Data:</Text>
                  <Text style={styles.data}>
                    {typeof result.data === 'string' 
                      ? result.data 
                      : JSON.stringify(result.data, null, 2)
                    }
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Environment Info</Text>
          <Text style={styles.infoText}>
            EXPO_PUBLIC_TRPC_URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'Not set'}
          </Text>
          <Text style={styles.infoText}>
            EXPO_PUBLIC_API_URL: {process.env.EXPO_PUBLIC_API_URL || 'Not set'}
          </Text>
          <Text style={styles.infoText}>
            NODE_ENV: {process.env.NODE_ENV || 'Not set'}
          </Text>
          <Text style={styles.infoText}>
            Platform: {typeof window !== 'undefined' ? 'Web' : 'Mobile'}
          </Text>
          {typeof window !== 'undefined' && (
            <Text style={styles.infoText}>
              Current Origin: {window.location?.origin || 'Unknown'}
            </Text>
          )}
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
  resultsContainer: {
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  url: {
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
  detail: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 8,
  },
  dataContainer: {
    marginTop: 8,
  },
  dataLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  data: {
    color: '#8E8E93',
    fontSize: 11,
    backgroundColor: '#2a2a2a',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});