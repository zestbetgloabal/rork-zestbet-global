import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';

export default function RealBackendTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [backendInfo, setBackendInfo] = useState<any>(null);

  // Test basic connection
  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      
      // Test direct fetch to backend
      const response = await fetch('http://localhost:3001/api/status');
      const data = await response.json();
      
      setBackendInfo(data);
      setConnectionStatus('connected');
      
      console.log('✅ Backend connection successful!');
    } catch (error) {
      console.error('Backend connection failed:', error);
      setConnectionStatus('failed');
      console.error('❌ Backend connection failed. Make sure the backend is running.');
    }
  };

  // Test tRPC connection
  const hiQuery = trpc.example.hi.useQuery(
    { name: 'Real Backend Test' },
    {
      enabled: false, // Don't auto-run
      retry: false,
    }
  );

  const testTrpcConnection = () => {
    hiQuery.refetch();
  };

  useEffect(() => {
    // Auto-test connection on mount
    testConnection();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Real Backend Test',
          headerStyle: { backgroundColor: '#1a1a1a' },
          headerTintColor: '#fff',
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>🔗 Backend Connection Test</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={[
              styles.statusBadge,
              connectionStatus === 'connected' ? styles.statusSuccess :
              connectionStatus === 'failed' ? styles.statusError :
              styles.statusTesting
            ]}>
              <Text style={styles.statusText}>
                {connectionStatus === 'connected' ? '✅ Connected' :
                 connectionStatus === 'failed' ? '❌ Failed' :
                 '🔄 Testing...'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={testConnection}>
            <Text style={styles.buttonText}>Test Backend Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testTrpcConnection}>
            <Text style={styles.buttonText}>Test tRPC Connection</Text>
          </TouchableOpacity>
        </View>

        {backendInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backend Info</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Status: {backendInfo.status}</Text>
              <Text style={styles.infoText}>Environment: {backendInfo.services?.database}</Text>
              <Text style={styles.infoText}>Uptime: {Math.round(backendInfo.uptime || 0)}s</Text>
              <Text style={styles.infoText}>Memory: {Math.round((backendInfo.memory?.heapUsed || 0) / 1024 / 1024)}MB</Text>
            </View>
          </View>
        )}

        {hiQuery.data && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>tRPC Response</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Message: {hiQuery.data.message}</Text>
              <Text style={styles.infoText}>Date: {hiQuery.data.date?.toString()}</Text>
            </View>
          </View>
        )}

        {hiQuery.error && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>tRPC Error</Text>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{hiQuery.error.message}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>
            1. Make sure the backend is running:{'\n'}
            <Text style={styles.codeText}>chmod +x start-real-backend.sh{'\n'}./start-real-backend.sh</Text>
            {'\n\n'}
            2. The backend should be available at:{'\n'}
            <Text style={styles.codeText}>http://localhost:3001</Text>
            {'\n\n'}
            3. tRPC endpoint:{'\n'}
            <Text style={styles.codeText}>http://localhost:3001/api/trpc</Text>
          </Text>
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
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#ccc',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusSuccess: {
    backgroundColor: '#22c55e',
  },
  statusError: {
    backgroundColor: '#ef4444',
  },
  statusTesting: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#2a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  instructionText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    backgroundColor: '#2a2a2a',
    color: '#22c55e',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
});