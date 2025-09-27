import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function QuickTestScreen() {
  const [testResult, setTestResult] = useState<string>('Testing...');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Simple tRPC test
  const hiQuery = trpc.example.hi.useQuery(
    { name: 'Quick Test' },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (hiQuery.data) {
      setTestResult(`✅ API Connected: ${hiQuery.data.message}`);
      setIsConnected(true);
    } else if (hiQuery.error) {
      if (hiQuery.error.message.includes('Mock mode')) {
        setTestResult(`🎭 Mock Mode Active: ${hiQuery.error.message}`);
        setIsConnected(false);
      } else {
        setTestResult(`❌ Connection Failed: ${hiQuery.error.message}`);
        setIsConnected(false);
      }
    }
  }, [hiQuery.data, hiQuery.error]);

  const testDirectConnection = async () => {
    setTestResult('Testing direct connection...');
    
    // Test multiple endpoints to find working one
    const endpoints = [
      'https://zestapp.online/api/status',
      'https://zestapp.online/api',
      'https://zestapp.online/api/trpc/example.hi'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('🔍 Testing endpoint:', endpoint);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000)
        });
        
        const contentType = response.headers.get('content-type');
        let data = '';
        
        try {
          if (contentType?.includes('application/json')) {
            const jsonData = await response.json();
            data = JSON.stringify(jsonData, null, 2);
          } else {
            data = await response.text();
          }
        } catch {
          data = 'Could not parse response';
        }
        
        if (response.ok) {
          setTestResult(`✅ Direct API Success (${endpoint}):\n${data.substring(0, 200)}`);
          setIsConnected(true);
          return; // Stop on first success
        } else {
          console.log(`❌ ${endpoint} failed with status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} error:`, error);
      }
    }
    
    // If we get here, all endpoints failed
    setTestResult(`❌ All API endpoints failed. The server may be down or misconfigured.\n\nTested endpoints:\n${endpoints.join('\n')}`);
    setIsConnected(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Quick Test',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text
        }} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>API Connection Status</Text>
        
        <View style={[
          styles.statusCard,
          { backgroundColor: isConnected === true ? colors.success + '20' : 
                           isConnected === false ? colors.warning + '20' : colors.card }
        ]}>
          <Text style={[
            styles.statusText,
            { color: isConnected === true ? colors.success : 
                     isConnected === false ? colors.warning : colors.text }
          ]}>
            {isConnected === true ? '🟢 Connected' : 
             isConnected === false ? '🟡 Mock Mode' : '⚪ Testing...'}
          </Text>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => hiQuery.refetch()}
        >
          <Text style={styles.buttonText}>Retry tRPC Test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testDirectConnection}
        >
          <Text style={styles.buttonText}>Test Direct Connection</Text>
        </TouchableOpacity>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Environment Info:</Text>
          <Text style={styles.infoText}>
            TRPC URL: {process.env.EXPO_PUBLIC_TRPC_URL || 'Not set'}{'\n'}
            API URL: {process.env.EXPO_PUBLIC_API_URL || 'Not set'}{'\n'}
            Platform: {typeof window !== 'undefined' ? 'Web' : 'Mobile'}{'\n'}
            Origin: {typeof window !== 'undefined' ? window.location?.origin || 'N/A' : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What this means:</Text>
          <Text style={styles.infoText}>
            • 🟢 Connected: API is working, real data is loaded{'\n'}
            • 🟡 Mock Mode: API unavailable, using sample data{'\n'}
            • ⚪ Testing: Checking connection status
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});