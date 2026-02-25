import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import Button from '@/components/Button';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Nicht gefunden' }} />
      <Text style={styles.emoji}>🔍</Text>
      <Text style={styles.title}>Seite nicht gefunden</Text>
      <Text style={styles.sub}>Diese Seite existiert nicht.</Text>
      <Button title="Zurück zur Startseite" onPress={() => router.replace('/')} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
    gap: 12,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
