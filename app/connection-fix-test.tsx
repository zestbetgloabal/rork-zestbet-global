import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TestResult {
  test: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

export default function ConnectionFixTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    
    // Test 1: Basic API endpoint
    try {
      console.log('Testing basic API endpoint...');
      const response = await fetch('http://localhost:3001/api');
      const data = await response.json();
      addTestResult('Basic API', 'success', `✅ API Response: ${data.message}`);
    } catch (error) {
      addTestResult('Basic API', 'error', `❌ API Error: ${String(error)}`);
    }

    // Test 2: tRPC Hello via direct fetch
    try {
      console.log('Testing tRPC example.hi...');
      const response = await fetch('http://localhost:3001/api/trpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'example.hi', input: { name: 'ConnectionTest' } })
      });
      const data = await response.json();
      if (data.result?.data?.message) {
        addTestResult('tRPC Hello', 'success', `✅ tRPC Response: ${data.result.data.message}`);
      } else {
        throw new Error('Invalid tRPC response');
      }
    } catch (error) {
      addTestResult('tRPC Hello', 'error', `❌ tRPC Error: ${String(error)}`);
    }

    // Test 3: Challenges Query via direct fetch
    try {
      console.log('Testing challenges.list...');
      const response = await fetch('http://localhost:3001/api/trpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: 'challenges.list', input: {} })
      });
      const data = await response.json();
      if (data.result?.data?.challenges) {
        addTestResult('Challenges Query', 'success', `✅ Found ${data.result.data.challenges.length} challenges`);
      } else {
        throw new Error('Invalid challenges response');
      }
    } catch (error) {
      addTestResult('Challenges Query', 'error', `❌ Challenges Error: ${String(error)}`);
    }

    setIsRunning(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Connection Fix Test</Text>
          <Text style={styles.subtitle}>Testing backend connection and tRPC endpoints</Text>
        </View>

        <TouchableOpacity 
          style={[styles.retestButton, isRunning && styles.retestButtonDisabled]} 
          onPress={runTests}
          disabled={isRunning}
        >
          <Text style={styles.retestButtonText}>
            {isRunning ? '⏳ Running Tests...' : '🔄 Run Tests'}
          </Text>
        </TouchableOpacity>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Make sure to run: chmod +x start-backend-fix.sh{'\n'}
            2. Start backend: ./start-backend-fix.sh{'\n'}
            3. Wait for &quot;Backend server running&quot; message{'\n'}
            4. Run these tests to verify connection
          </Text>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📊 Test Results:</Text>
          {testResults.length === 0 ? (
            <Text style={styles.noResults}>
              {isRunning ? 'Running tests...' : 'No test results yet. Click "Run Tests" to start.'}
            </Text>
          ) : (
            testResults.map((result) => (
              <View key={`${result.test}-${result.timestamp}`} style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTest}>{result.test}</Text>
                  <Text style={styles.resultTimestamp}>{result.timestamp}</Text>
                </View>
                <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                  {result.message}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If all tests pass, the tRPC connection is working correctly!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  retestButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  retestButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  retestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  noResults: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  resultItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultTest: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  footerText: {
    fontSize: 14,
    color: '#065F46',
    textAlign: 'center',
  },
});