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
    
    try {
      const response = await fetch('https://zestapp.online/api/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.text();
        setTestResult(`✅ Direct API Success: ${data.substring(0, 100)}`);
        setIsConnected(true);
      } else {
        setTestResult(`❌ Direct API Failed: Status ${response.status}`);
        setIsConnected(false);
      }
    } catch (error) {
      setTestResult(`❌ Direct Connection Error: ${String(error)}`);
      setIsConnected(false);
    }
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