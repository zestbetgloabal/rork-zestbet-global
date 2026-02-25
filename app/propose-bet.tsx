import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter, Href } from 'expo-router';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import { useBetStore } from '@/store/betStore';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { betCategories } from '@/constants/mockData';
import { BetCategory } from '@/types';

export default function ProposeBetScreen() {
  const router = useRouter();
  const { createBet } = useBetStore();
  const { userId } = useAuthStore();
  const { user, removeCoins } = useUserStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BetCategory>('fun');
  const [daysUntilExpiry, setDaysUntilExpiry] = useState('7');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!userId || !user) return;

    if (!title.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Titel ein.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Beschreibung ein.');
      return;
    }

    const betAmount = parseInt(amount, 10);
    if (isNaN(betAmount) || betAmount < 5) {
      Alert.alert('Fehler', 'Mindestens 5 Zest-Coins erforderlich.');
      return;
    }
    if (betAmount > (user.zestCoins ?? 0)) {
      Alert.alert('Nicht genug Coins', 'Du hast nicht genug Zest-Coins.', [
        { text: 'Wallet öffnen', onPress: () => router.push('/wallet' as Href) },
        { text: 'OK' },
      ]);
      return;
    }

    setIsSubmitting(true);

    const days = parseInt(daysUntilExpiry, 10) || 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const success = removeCoins(betAmount);
    if (!success) {
      Alert.alert('Fehler', 'Nicht genug Coins.');
      setIsSubmitting(false);
      return;
    }

    await createBet({
      title: title.trim(),
      description: description.trim(),
      creatorId: userId,
      creatorName: user.username,
      creatorAvatar: user.avatar,
      opponentId: null,
      opponentName: null,
      opponentAvatar: null,
      amount: betAmount,
      category,
      expiresAt,
    });

    setIsSubmitting(false);
    Alert.alert('Wette erstellt! 🎯', 'Teile sie mit deinen Freunden.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [title, description, amount, category, daysUntilExpiry, userId, user, removeCoins, createBet, router]);

  const quickAmounts = [10, 25, 50, 100, 250];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Neue Wette' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Kategorie</Text>
          <View style={styles.categoriesGrid}>
            {betCategories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
                onPress={() => setCategory(cat.key as BetCategory)}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, category === cat.key && styles.categoryLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Titel</Text>
          <TextInput
            style={styles.input}
            placeholder="z.B. Wer gewinnt das Spiel?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={80}
            testID="bet-title"
          />

          <Text style={styles.sectionTitle}>Beschreibung</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Beschreibe deine Wette..."
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={300}
            testID="bet-description"
          />

          <Text style={styles.sectionTitle}>Einsatz (Zest-Coins)</Text>
          <View style={styles.amountSection}>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              testID="bet-amount"
            />
            <Text style={styles.balanceHint}>Guthaben: {user?.zestCoins ?? 0} 🪙</Text>
          </View>

          <View style={styles.quickAmounts}>
            {quickAmounts.map((qa) => (
              <TouchableOpacity
                key={qa}
                style={[styles.quickChip, amount === String(qa) && styles.quickChipActive]}
                onPress={() => setAmount(String(qa))}
              >
                <Text style={[styles.quickText, amount === String(qa) && styles.quickTextActive]}>{qa}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Laufzeit (Tage)</Text>
          <View style={styles.quickAmounts}>
            {['1', '3', '7', '14', '30'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.quickChip, daysUntilExpiry === d && styles.quickChipActive]}
                onPress={() => setDaysUntilExpiry(d)}
              >
                <Text style={[styles.quickText, daysUntilExpiry === d && styles.quickTextActive]}>{d}d</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.charityNote}>
            <Text style={styles.charityIcon}>💜</Text>
            <Text style={styles.charityText}>10% des Gewinns gehen automatisch an Charity</Text>
          </View>

          <Button
            title="Wette erstellen"
            onPress={handleCreate}
            loading={isSubmitting}
            size="large"
            testID="bet-submit"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  categoryLabelActive: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  amountSection: {
    gap: 6,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  balanceHint: {
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontSize: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  quickChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  quickTextActive: {
    color: '#000',
  },
  charityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.charity + '10',
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.charity + '25',
  },
  charityIcon: {
    fontSize: 18,
  },
  charityText: {
    color: colors.charity,
    fontSize: 13,
    flex: 1,
  },
});
