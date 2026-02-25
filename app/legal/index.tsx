import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { FileText, Shield, ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function LegalIndexScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => router.push('/legal/impressum' as Href)}>
        <FileText size={20} color={colors.primary} />
        <Text style={styles.label}>Impressum</Text>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => router.push('/legal/datenschutz' as Href)}>
        <Shield size={20} color={colors.accent} />
        <Text style={styles.label}>Datenschutzerklärung</Text>
        <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.footer}>ZestBet v1.0 — Alle Rechte vorbehalten</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  footer: {
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 40,
  },
});
