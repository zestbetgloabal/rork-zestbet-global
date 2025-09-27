import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { getAppConfig, debugEnvironment } from '@/lib/config';

export default function DebugAPIScreen() {
  const router = useRouter();
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAPIConnection = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      // Test 1: Check environment variables
      addResult('=== ENVIRONMENT CHECK ===');
      const config = getAppConfig();
      addResult(`API URL: ${config.apiUrl}`);
      addResult(`tRPC URL: ${config.trpcUrl}`);
      addResult(`Base URL: ${config.baseUrl}`);
      addResult(`Is Development: ${config.isDevelopment}`);
      addResult(`Platform: ${config.platform}`);
      
      // Debug environment variables
      debugEnvironment();
      
      // Test 2: Test basic API endpoint
      addResult('=== TESTING BASIC API ===');
      const apiUrl = config.apiUrl;
      if (apiUrl) {
        try {
          const response = await fetch(apiUrl);
          addResult(`API Status: ${response.status}`);
          const text = await response.text();
          addResult(`API Response: ${text.substring(0, 200)}...`);
        } catch (error) {
          addResult(`API Error: ${error}`);
        }
      }
      
      // Test 3: Test tRPC endpoint
      addResult('=== TESTING TRPC ENDPOINT ===');
      const trpcUrl = config.trpcUrl;
      if (trpcUrl) {
        try {
          const response = await fetch(trpcUrl);
          addResult(`tRPC Status: ${response.status}`);
          const text = await response.text();
          addResult(`tRPC Response: ${text.substring(0, 200)}...`);
        } catch (error) {
          addResult(`tRPC Error: ${error}`);
        }
      }
      
      // Test 4: Test tRPC client
      addResult('=== TESTING TRPC CLIENT ===');
      try {
        const { trpcClient } = await import('@/lib/trpc');
        addResult('tRPC client imported successfully');
        
        // Try a simple query
        try {
          const result = await trpcClient.example.hi.query();
          addResult(`tRPC Query Success: ${JSON.stringify(result)}`);
        } catch (error: any) {
          addResult(`tRPC Query Error: ${error.message}`);
          addResult(`Error details: ${JSON.stringify(error, null, 2)}`);
        }
      } catch (error) {
        addResult(`tRPC Client Import Error: ${error}`);
      }
      
      // Test 5: Test registration endpoint specifically
      addResult('=== TESTING REGISTRATION ENDPOINT ===');
      try {
        const { trpcClient } = await import('@/lib/trpc');
        
        // Try to call register with test data
        try {
          const result = await trpcClient.auth.register.mutate({
            email: 'test@gmail.com',
            password: 'testpassword123',
            name: 'Test User'
          });
          addResult(`Registration Success: ${JSON.stringify(result)}`);
        } catch (error: any) {
          addResult(`Registration Error: ${error.message}`);
          addResult(`Error details: ${JSON.stringify(error, null, 2)}`);
        }
      } catch (error) {
        addResult(`Registration Test Error: ${error}`);
      }
      
    } catch (error) {
      addResult(`General Error: ${error}`);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>API Debug Tool</Text>
      <Text style={styles.subtitle}>Test API connectivity and registration</Text>
      
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={testAPIConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Run API Tests'}
          </Text>
        </Pressable>
        
        <Pressable style={styles.clearButton} onPress={clearResults}>
          <Text style={styles.clearButtonText}>Clear Results</Text>
        </Pressable>
        
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={`result-${index}-${result.substring(0, 10)}`} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: colors.textSecondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: colors.border,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
  },
  resultText: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});