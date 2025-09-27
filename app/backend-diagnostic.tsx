import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vanillaTrpcClient } from '@/lib/trpc';

export default function BackendDiagnosticScreen() {
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any[] = [];

    // Test 1: Environment variables
    results.push({
      test: 'Environment Variables',
      status: 'info',
      details: {
        EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL,
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        NODE_ENV: process.env.NODE_ENV,
      }
    });

    // Test 2: Basic fetch to API endpoints
    const endpoints = [
      'http://localhost:3001/api',
      'http://localhost:3001/api/status',
      'http://localhost:3001/api/trpc',
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        const contentType = response.headers.get('content-type');
        let data: any = null;

        try {
          if (contentType?.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }
        } catch (parseError) {
          data = `Parse error: ${parseError}`;
        }

        results.push({
          test: `Fetch ${endpoint}`,
          status: response.ok ? 'success' : 'error',
          details: {
            status: response.status,
            statusText: response.statusText,
            contentType,
            data: typeof data === 'string' ? data.substring(0, 200) : data,
          }
        });
      } catch (error) {
        results.push({
          test: `Fetch ${endpoint}`,
          status: 'error',
          details: {
            error: String(error),
          }
        });
      }
    }

    // Test 3: tRPC Hello endpoint
    try {
      const helloResult = await vanillaTrpcClient.example.hi.query({ name: 'Diagnostic Test' });
      results.push({
        test: 'tRPC example.hi',
        status: 'success',
        details: helloResult,
      });
    } catch (error) {
      results.push({
        test: 'tRPC example.hi',
        status: 'error',
        details: {
          error: String(error),
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      });
    }

    // Test 4: tRPC Challenges list
    try {
      const challengesResult = await vanillaTrpcClient.challenges.list.query({});
      results.push({
        test: 'tRPC challenges.list',
        status: 'success',
        details: {
          challengesCount: challengesResult.challenges?.length || 0,
          total: challengesResult.total,
          hasMore: challengesResult.hasMore,
        }
      });
    } catch (error) {
      results.push({
        test: 'tRPC challenges.list',
        status: 'error',
        details: {
          error: String(error),
          message: error instanceof Error ? error.message : 'Unknown error',
        }
      });
    }

    setDiagnostics(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '⚪';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backend Diagnostics</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={runDiagnostics}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Running...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {diagnostics.map((diagnostic) => (
        <View key={`${diagnostic.test}-${diagnostic.status}`} style={styles.diagnosticCard}>
          <View style={styles.diagnosticHeader}>
            <Text style={styles.diagnosticIcon}>
              {getStatusIcon(diagnostic.status)}
            </Text>
            <Text style={styles.diagnosticTitle}>{diagnostic.test}</Text>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(diagnostic.status) }
              ]}
            >
              <Text style={styles.statusText}>{diagnostic.status}</Text>
            </View>
          </View>
          
          <View style={styles.diagnosticDetails}>
            <Text style={styles.detailsText}>
              {JSON.stringify(diagnostic.details, null, 2)}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>🔧 Backend Fix Instructions</Text>
        <Text style={styles.instructionsText}>
          If you see errors above, follow these steps:
        </Text>
        <Text style={styles.instructionsText}>
          1. Open a new terminal window
        </Text>
        <Text style={styles.instructionsText}>
          2. Run: ./fix-backend-now.sh
        </Text>
        <Text style={styles.instructionsText}>
          3. Wait for &quot;✅ Backend is working!&quot; message
        </Text>
        <Text style={styles.instructionsText}>
          4. Keep that terminal open (don&apos;t close it)
        </Text>
        <Text style={styles.instructionsText}>
          5. Come back here and tap &quot;Refresh&quot; button
        </Text>
        <Text style={styles.instructionsText}>
          6. All tests should show ✅ success
        </Text>
        <Text style={styles.instructionsText}>
          
        </Text>
        <Text style={styles.instructionsText}>
          Alternative: Run &quot;./start-backend.sh&quot; or &quot;bun run dev-server.ts&quot;
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  diagnosticCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnosticIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  diagnosticTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  diagnosticDetails: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  detailsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#374151',
  },
  instructions: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});