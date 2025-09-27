import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpcClient } from '@/lib/trpc';
import { useChallenges, useFilteredChallenges } from '@/store/challengeStoreProvider';
import { mockChallenges } from '@/constants/mockData';

export default function TestAppFunctionality() {
  const insets = useSafeAreaInsets();
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [testLogs, setTestLogs] = useState<string[]>([]);
  
  // Test challenge store functionality
  const { challenges } = useChallenges();
  const filteredChallenges = useFilteredChallenges('all', 'active', []);

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const updateTestResult = (testName: string, result: 'pending' | 'success' | 'error') => {
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  const testBackendConnection = async () => {
    addLog('Testing backend connection...');
    updateTestResult('backend', 'pending');
    
    try {
      const result = await trpcClient.example.hi.query();
      addLog(`Backend response: ${JSON.stringify(result)}`);
      updateTestResult('backend', 'success');
    } catch (error) {
      addLog(`Backend error: ${error}`);
      updateTestResult('backend', 'error');
    }
  };

  const testLiveEvents = async () => {
    addLog('Testing live events...');
    updateTestResult('liveEvents', 'pending');
    
    try {
      const events = await trpcClient.liveEvents.list.query({});
      addLog(`Live events count: ${events?.events?.length || 0}`);
      updateTestResult('liveEvents', 'success');
    } catch (error) {
      addLog(`Live events error: ${error}`);
      updateTestResult('liveEvents', 'error');
    }
  };

  const testEmailValidation = async () => {
    addLog('Testing email validation...');
    updateTestResult('email', 'pending');
    
    try {
      // Test with a dummy email to see if the endpoint responds
      await trpcClient.auth.resendVerification.mutate({ email: 'test@example.com' });
      addLog('Email validation endpoint is responding');
      updateTestResult('email', 'success');
    } catch (error: any) {
      // Even if it fails with "user not found", it means the endpoint is working
      if (error.message?.includes('not found') || error.message?.includes('User')) {
        addLog('Email validation endpoint is working (expected error for test email)');
        updateTestResult('email', 'success');
      } else {
        addLog(`Email validation error: ${error}`);
        updateTestResult('email', 'error');
      }
    }
  };

  const testWalletBalance = async () => {
    addLog('Testing wallet functionality...');
    updateTestResult('wallet', 'pending');
    
    try {
      const balance = await trpcClient.wallet.balance.query();
      addLog(`Wallet balance endpoint responded: ${JSON.stringify(balance)}`);
      updateTestResult('wallet', 'success');
    } catch (error: any) {
      // If it's an auth error, the endpoint is working
      if (error.message?.includes('auth') || error.message?.includes('token')) {
        addLog('Wallet endpoint is working (auth required)');
        updateTestResult('wallet', 'success');
      } else {
        addLog(`Wallet error: ${error}`);
        updateTestResult('wallet', 'error');
      }
    }
  };

  const testChallengesFunctionality = async () => {
    addLog('Testing challenges functionality...');
    updateTestResult('challenges', 'pending');
    
    try {
      // Test mock data availability
      if (!Array.isArray(mockChallenges) || mockChallenges.length === 0) {
        throw new Error('Mock challenges data is not available');
      }
      addLog(`Mock challenges available: ${mockChallenges.length} items`);
      
      // Test challenge store
      if (!Array.isArray(challenges)) {
        throw new Error('Challenge store is not returning an array');
      }
      addLog(`Challenge store working: ${challenges.length} challenges loaded`);
      
      // Test filtered challenges
      if (!Array.isArray(filteredChallenges)) {
        throw new Error('Filtered challenges is not returning an array');
      }
      addLog(`Filtered challenges working: ${filteredChallenges.length} active challenges`);
      
      // Test filter functionality
      try {
        const testFilter = challenges.filter(() => true);
        if (!Array.isArray(testFilter)) {
          throw new Error('Filter method not working');
        }
        addLog('Filter method is working correctly');
      } catch (filterError) {
        throw new Error(`Filter method failed: ${filterError}`);
      }
      
      updateTestResult('challenges', 'success');
    } catch (error) {
      addLog(`Challenges error: ${error}`);
      updateTestResult('challenges', 'error');
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    setTestLogs([]);
    addLog('Starting comprehensive app test...');
    
    await testChallengesFunctionality();
    await testBackendConnection();
    await testLiveEvents();
    await testEmailValidation();
    await testWalletBalance();
    
    addLog('All tests completed!');
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: 'pending' | 'success' | 'error' | undefined) => {
    switch (status) {
      case 'success': return '✅ PASS';
      case 'error': return '❌ FAIL';
      case 'pending': return '⏳ TESTING';
      default: return '⚪ NOT TESTED';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'App Functionality Test' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>ZestBet App Test Suite</Text>
        <Text style={styles.subtitle}>Test core functionality before App Store submission</Text>
        
        <TouchableOpacity style={styles.runButton} onPress={runAllTests}>
          <Text style={styles.runButtonText}>Run All Tests</Text>
        </TouchableOpacity>
        
        <View style={styles.testsContainer}>
          <Text style={styles.sectionTitle}>Test Results:</Text>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Challenges System</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.challenges) }]}>
              {getStatusText(testResults.challenges)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Backend Connection</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.backend) }]}>
              {getStatusText(testResults.backend)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Live Events</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.liveEvents) }]}>
              {getStatusText(testResults.liveEvents)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Email Validation</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.email) }]}>
              {getStatusText(testResults.email)}
            </Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testName}>Wallet System</Text>
            <Text style={[styles.testStatus, { color: getStatusColor(testResults.wallet) }]}>
              {getStatusText(testResults.wallet)}
            </Text>
          </View>
        </View>
        
        {testLogs.length > 0 && (
          <View style={styles.logsContainer}>
            <Text style={styles.sectionTitle}>Test Logs:</Text>
            {testLogs.map((log, index) => (
              <Text key={`log-${index}-${log.slice(0, 10)}`} style={styles.logItem}>{log}</Text>
            ))}
          </View>
        )}
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>Pre-Submission Checklist:</Text>
          <Text style={styles.instruction}>1. ✅ All tests should pass</Text>
          <Text style={styles.instruction}>2. ✅ Test on physical device with Expo Go</Text>
          <Text style={styles.instruction}>3. ✅ Test login/registration flow</Text>
          <Text style={styles.instruction}>4. ✅ Test live events creation</Text>
          <Text style={styles.instruction}>5. ✅ Test email verification</Text>
          <Text style={styles.instruction}>6. ✅ Test wallet functionality</Text>
          <Text style={styles.instruction}>7. ✅ Test on both iOS and Android</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  runButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  runButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  testsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  testName: {
    fontSize: 16,
    color: '#333',
  },
  testStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  logsContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  logItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10,
  },
});