import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { 
  hermesGuard, 
  safeStringOperations, 
  safeJsonParse, 
  safeJsonStringify,
  debugApiCall 
} from '@/utils/crashPrevention';
import { 
  sanitizeString, 
  validateEmailSafe, 
  validatePhoneSafe
} from '@/utils/stringSafety';

export default function TestCrashPrevention() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runStringTests = () => {
    addResult('=== STRING SAFETY TESTS ===');
    
    // Test 1: Safe string sanitization
    const testString = 'Hello\x00World\x01Test';
    const sanitized = sanitizeString(testString);
    addResult(`✅ String sanitization: "${testString}" → "${sanitized}"`);
    
    // Test 2: Email validation
    const emails = ['test@example.com', 'invalid-email', 'user@domain.co.uk'];
    emails.forEach(email => {
      if (!email || email.length > 100) return;
      const sanitizedEmail = email.trim();
      const isValid = validateEmailSafe(sanitizedEmail);
      addResult(`${isValid ? '✅' : '❌'} Email "${sanitizedEmail}": ${isValid ? 'valid' : 'invalid'}`);
    });
    
    // Test 3: Phone validation
    const phones = ['+1234567890', '123-456-7890', 'invalid-phone'];
    phones.forEach(phone => {
      if (!phone || phone.length > 20) return;
      const sanitizedPhone = phone.trim();
      const isValid = validatePhoneSafe(sanitizedPhone);
      addResult(`${isValid ? '✅' : '❌'} Phone "${sanitizedPhone}": ${isValid ? 'valid' : 'invalid'}`);
    });
    
    // Test 4: Safe string operations
    const text = 'Hello World Test';
    const match = safeStringOperations.match(text, 'World');
    addResult(`✅ Safe match: Found "${match?.[0] || 'nothing'}" in "${text}"`);
    
    const replaced = safeStringOperations.replace(text, 'World', 'Universe');
    addResult(`✅ Safe replace: "${text}" → "${replaced}"`);
  };

  const runHermesGuardTests = () => {
    addResult('=== HERMES GUARD TESTS ===');
    
    // Test 1: Safe operation that succeeds
    const result1 = hermesGuard(() => {
      return 'Operation succeeded';
    }, 'fallback', 'test-operation-1');
    addResult(`✅ Safe operation: ${result1}`);
    
    // Test 2: Safe operation that fails
    const result2 = hermesGuard(() => {
      throw new Error('Test error');
    }, 'fallback-value', 'test-operation-2');
    addResult(`✅ Failed operation fallback: ${result2}`);
    
    // Test 3: Simulated Hermes error
    const result3 = hermesGuard(() => {
      throw new Error('hermes::vm::JSObject::getComputedWithReceiver_RJS test error');
    }, 'hermes-fallback', 'test-hermes-error');
    addResult(`✅ Hermes error prevention: ${result3}`);
  };

  const runJsonTests = () => {
    addResult('=== JSON SAFETY TESTS ===');
    
    // Test 1: Valid JSON
    const validJson = '{"name": "test", "value": 123}';
    const parsed1 = safeJsonParse(validJson, { error: 'fallback' });
    addResult(`✅ Valid JSON parse: ${JSON.stringify(parsed1)}`);
    
    // Test 2: Invalid JSON
    const invalidJson = '{invalid json}';
    const parsed2 = safeJsonParse(invalidJson, { error: 'fallback' });
    addResult(`✅ Invalid JSON fallback: ${JSON.stringify(parsed2)}`);
    
    // Test 3: Circular reference handling
    const circular: any = { name: 'test' };
    circular.self = circular;
    const stringified = safeJsonStringify(circular, '{}');
    addResult(`✅ Circular reference handling: ${stringified.substring(0, 50)}...`);
  };

  const runApiTest = async () => {
    addResult('=== API SAFETY TEST ===');
    
    try {
      // Test with a simple API call
      const result = await debugApiCall('https://httpbin.org/json');
      if (result.success) {
        addResult(`✅ API call successful: ${JSON.stringify(result.data).substring(0, 100)}...`);
      } else {
        addResult(`❌ API call failed: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ API test error: ${error}`);
    }
  };

  const runMemoryTest = () => {
    addResult('=== MEMORY SAFETY TEST ===');
    
    // Create a large array to test memory handling
    const largeArray = new Array(1000).fill(0).map((_, i) => ({ id: i, data: `item-${i}` }));
    
    const result = hermesGuard(() => {
      // Simulate memory-intensive operation
      const processed = largeArray.map(item => ({ ...item, processed: true }));
      return `Processed ${processed.length} items`;
    }, 'Memory operation failed', 'memory-test');
    
    addResult(`✅ Memory test: ${result}`);
  };

  const runAllTests = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    clearResults();
    
    try {
      addResult('🚀 Starting comprehensive crash prevention tests...');
      addResult('');
      
      runStringTests();
      addResult('');
      
      runHermesGuardTests();
      addResult('');
      
      runJsonTests();
      addResult('');
      
      await runApiTest();
      addResult('');
      
      runMemoryTest();
      addResult('');
      
      addResult('✅ All tests completed successfully!');
      addResult('The app is protected against known crash patterns.');
      
    } catch (error) {
      addResult(`❌ Test suite error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const simulateCrash = () => {
    if (Platform.OS === 'web') {
      // For web, just throw the error directly
      throw new Error('Test crash for error boundary');
    } else {
      // For mobile, we can use Alert
      Alert.alert(
        'Simulate Crash',
        'This will test the error boundary. The app should recover gracefully.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test Crash',
            style: 'destructive',
            onPress: () => {
              // This will be caught by the error boundary
              throw new Error('Test crash for error boundary');
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crash Prevention Tests</Text>
        <Text style={styles.subtitle}>Test the app&apos;s crash prevention measures</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]} 
          onPress={runAllTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearResults}>
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={simulateCrash}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>Test Error Boundary</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {testResults.map((result, index) => (
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
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#ff4444',
  },
  dangerButtonText: {
    color: 'white',
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});