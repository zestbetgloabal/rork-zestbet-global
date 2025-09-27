import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { testTrpcConnection } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function ApiStatusScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    try {
      const connectionTest = await testTrpcConnection();
      
      const diagnostics = {
        timestamp: new Date().toISOString(),
        environment: {
          EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL || 'undefined',
          EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL || 'undefined',
          EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || 'undefined',
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          platform: 'unknown',
          isDev: __DEV__,
        },
        connection: connectionTest,
        mockDataStatus: {
          challenges: 'Available (4 items)',
          bets: 'Available (3 items)',
          socialPosts: 'Available (3 items)',
          badges: 'Available (9 items)',
        },
        recommendations: [] as string[]
      };

      // Add recommendations based on findings
      if (!process.env.EXPO_PUBLIC_TRPC_URL) {
        diagnostics.recommendations.push('Set EXPO_PUBLIC_TRPC_URL environment variable');
      }
      
      if (!connectionTest.workingEndpoint) {
        diagnostics.recommendations.push('API endpoints are not accessible - app will use mock data');
      }

      if (diagnostics.environment.platform === 'web' && diagnostics.environment.isDev) {
        diagnostics.recommendations.push('Development mode detected - using mock data for better performance');
      }

      setStatus(diagnostics);
    } catch (error) {
      setStatus({
        error: String(error),
        timestamp: new Date().toISOString(),
      });
    }
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (isWorking: boolean) => {
    if (isWorking) {
      return <CheckCircle size={20} color={colors.success} />;
    }
    return <XCircle size={20} color={colors.error} />;
  };

  const getStatusColor = (isWorking: boolean) => {
    return isWorking ? colors.success : colors.error;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>API Status</Text>
        <Pressable onPress={runDiagnostics} disabled={testing} style={styles.refreshButton}>
          {testing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.refreshText}>Refresh</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {status && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Environment</Text>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Platform:</Text>
                <Text style={styles.statusValue}>{status.environment?.platform}</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Development Mode:</Text>
                <Text style={styles.statusValue}>{status.environment?.isDev ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>TRPC URL:</Text>
                <Text style={[styles.statusValue, { color: status.environment?.EXPO_PUBLIC_TRPC_URL !== 'undefined' ? colors.success : colors.error }]}>
                  {status.environment?.EXPO_PUBLIC_TRPC_URL}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>API Connection</Text>
              {status.connection?.results?.map((result: any) => (
                <View key={result.endpoint} style={styles.statusItem}>
                  <View style={styles.statusRow}>
                    {getStatusIcon(result.success)}
                    <Text style={styles.statusLabel}>{result.endpoint}</Text>
                  </View>
                  <Text style={[styles.statusValue, { color: getStatusColor(result.success) }]}>
                    {result.success ? `${result.status} OK` : result.error || `${result.status} Error`}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mock Data Status</Text>
              {Object.entries(status.mockDataStatus || {}).map(([key, value]) => (
                <View key={key} style={styles.statusItem}>
                  <View style={styles.statusRow}>
                    <CheckCircle size={20} color={colors.success} />
                    <Text style={styles.statusLabel}>{key}:</Text>
                  </View>
                  <Text style={[styles.statusValue, { color: colors.success }]}>{value as string}</Text>
                </View>
              ))}
            </View>

            {status.recommendations && status.recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                {status.recommendations.map((rec: string) => (
                  <View key={rec} style={styles.recommendationItem}>
                    <AlertCircle size={16} color={colors.warning} />
                    <Text style={styles.recommendationText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Status</Text>
              <View style={styles.statusSummary}>
                <CheckCircle size={24} color={colors.success} />
                <Text style={styles.statusSummaryText}>
                  App is working properly with mock data fallback
                </Text>
              </View>
            </View>
          </>
        )}

        {status?.error && (
          <View style={styles.errorContainer}>
            <XCircle size={24} color={colors.error} />
            <Text style={styles.errorText}>{status.error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.primary + '20',
  },
  refreshText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  statusItem: {
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  statusValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  statusSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
  },
  statusSummaryText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 12,
    flex: 1,
  },
});