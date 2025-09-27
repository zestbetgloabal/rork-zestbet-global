import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function ApiDiagnostic() {
  const [diagnosticResults, setDiagnosticResults] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults('Starting diagnostic...\n\n');
    
    const log = (message: string) => {
      console.log(message);
      setDiagnosticResults(prev => prev + message + '\n');
    };

    try {
      // Test 1: Basic connectivity
      log('🔍 Test 1: Basic connectivity to zestapp.online');
      try {
        const response = await fetch('https://zestapp.online', {
          method: 'GET',
          headers: { 'Accept': 'text/html,application/json' }
        });
        log(`✅ Basic connectivity: ${response.status} ${response.statusText}`);
        log(`   Content-Type: ${response.headers.get('content-type')}`);
      } catch (error) {
        log(`❌ Basic connectivity failed: ${String(error)}`);
      }

      // Test 2: API root endpoint
      log('\n🔍 Test 2: API root endpoint');
      try {
        const response = await fetch('https://zestapp.online/api', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        log(`✅ API root: ${response.status} ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        log(`   Content-Type: ${contentType}`);
        
        if (contentType?.includes('application/json')) {
          const data = await response.json();
          log(`   Response: ${JSON.stringify(data, null, 2)}`);
        } else {
          const text = await response.text();
          log(`   Response (first 200 chars): ${text.substring(0, 200)}`);
        }
      } catch (error) {
        log(`❌ API root failed: ${String(error)}`);
      }

      // Test 3: API status endpoint
      log('\n🔍 Test 3: API status endpoint');
      try {
        const response = await fetch('https://zestapp.online/api/status', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        log(`✅ API status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          log(`   Status data: ${JSON.stringify(data, null, 2)}`);
        }
      } catch (error) {
        log(`❌ API status failed: ${String(error)}`);
      }

      // Test 4: tRPC endpoint structure
      log('\n🔍 Test 4: tRPC endpoint structure');
      try {
        const response = await fetch('https://zestapp.online/api/trpc', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        log(`✅ tRPC endpoint: ${response.status} ${response.statusText}`);
        log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        const text = await response.text();
        log(`   Response (first 300 chars): ${text.substring(0, 300)}`);
      } catch (error) {
        log(`❌ tRPC endpoint failed: ${String(error)}`);
      }

      // Test 5: tRPC example.hi procedure
      log('\n🔍 Test 5: tRPC example.hi procedure');
      try {
        const response = await fetch('https://zestapp.online/api/trpc/example.hi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            "0": {
              "json": { "name": "DiagnosticTest" }
            }
          }),
        });
        
        log(`✅ tRPC example.hi: ${response.status} ${response.statusText}`);
        log(`   Content-Type: ${response.headers.get('content-type')}`);
        
        const responseText = await response.text();
        log(`   Response: ${responseText}`);
        
        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            log(`   Parsed JSON: ${JSON.stringify(data, null, 2)}`);
          } catch {
            log(`   Could not parse as JSON`);
          }
        }
      } catch (error) {
        log(`❌ tRPC example.hi failed: ${String(error)}`);
      }

      // Test 6: Environment check
      log('\n🔍 Test 6: Environment variables');
      log(`   EXPO_PUBLIC_TRPC_URL: ${process.env.EXPO_PUBLIC_TRPC_URL || 'not set'}`);
      log(`   EXPO_PUBLIC_API_URL: ${process.env.EXPO_PUBLIC_API_URL || 'not set'}`);
      log(`   EXPO_PUBLIC_BASE_URL: ${process.env.EXPO_PUBLIC_BASE_URL || 'not set'}`);

      // Test 7: Platform check
      log('\n🔍 Test 7: Platform information');
      log(`   Platform: ${typeof window !== 'undefined' ? 'web' : 'mobile'}`);
      if (typeof window !== 'undefined') {
        log(`   Origin: ${window.location.origin}`);
        log(`   Hostname: ${window.location.hostname}`);
      }

      log('\n✅ Diagnostic complete!');
      
    } catch (error) {
      log(`\n❌ Diagnostic failed with error: ${String(error)}`);
    }
    
    setIsRunning(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'API Diagnostic' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>API Connection Diagnostic</Text>
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]} 
          onPress={runDiagnostic}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Diagnostic...' : 'Run Diagnostic'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>{diagnosticResults}</Text>
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
  },
});