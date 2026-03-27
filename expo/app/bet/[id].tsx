import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, Href } from 'expo-router';
import { Clock, Coins, Heart, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import ZestCurrency from '@/components/ZestCurrency';
import { useBetStore } from '@/store/betStore';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { getCategoryEmoji, getStatusLabel, getStatusColor, formatTimeRemaining, formatDate } from '@/utils/helpers';
import { CHARITY_PERCENTAGE } from '@/constants/app';

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { bets, acceptBet, submitResult, confirmResult, cancelBet } = useBetStore();
  const { userId } = useAuthStore();
  const { user, addCoins, removeCoins, incrementWins, incrementLosses, addCharity } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const bet = useMemo(() => bets.find(b => b.id === id), [bets, id]);

  const isCreator = bet?.creatorId === userId;
  const isOpponent = bet?.opponentId === userId;
  const isParticipant = isCreator || isOpponent;

  const handleAcceptBet = useCallback(() => {
    if (!bet || !userId || !user) return;
    if ((user.zestCoins ?? 0) < bet.amount) {
      Alert.alert('Nicht genug Coins', 'Du brauchst mehr Zest-Coins um diese Wette anzunehmen.', [
        { text: 'Wallet öffnen', onPress: () => router.push('/wallet' as Href) },
        { text: 'OK' },
      ]);
      return;
    }

    Alert.alert(
      'Wette annehmen?',
      `Du setzt ${bet.amount} Zest-Coins auf diese Wette.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Annehmen',
          onPress: () => {
            removeCoins(bet.amount);
            acceptBet(bet.id, userId, user.username, user.avatar);
          },
        },
      ]
    );
  }, [bet, userId, user, removeCoins, acceptBet, router]);

  const handleSubmitResult = useCallback((result: 'creator_won' | 'opponent_won') => {
    if (!bet || !userId) return;
    const winnerLabel = result === 'creator_won' ? bet.creatorName : bet.opponentName;

    Alert.alert(
      'Ergebnis eintragen',
      `${winnerLabel} hat gewonnen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Bestätigen',
          onPress: () => {
            submitResult(bet.id, userId, result);
          },
        },
      ]
    );
  }, [bet, userId, submitResult]);

  const handleConfirmResult = useCallback(() => {
    if (!bet || !userId) return;
    setIsProcessing(true);

    confirmResult(bet.id, userId);

    const totalPool = bet.amount * 2;
    const charityAmount = Math.floor(totalPool * CHARITY_PERCENTAGE);
    const winAmount = totalPool - charityAmount;

    if (bet.result === 'creator_won') {
      if (isCreator) {
        addCoins(winAmount);
        incrementWins();
      } else {
        incrementLosses();
      }
    } else {
      if (isOpponent) {
        addCoins(winAmount);
        incrementWins();
      } else {
        incrementLosses();
      }
    }
    addCharity(charityAmount);

    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert('Wette abgeschlossen!', `${charityAmount} Coins gingen an Charity 💜`);
    }, 500);
  }, [bet, userId, isCreator, isOpponent, confirmResult, addCoins, incrementWins, incrementLosses, addCharity]);

  const handleCancel = useCallback(() => {
    if (!bet) return;
    Alert.alert('Wette stornieren?', 'Dein Einsatz wird zurückerstattet.', [
      { text: 'Nein', style: 'cancel' },
      {
        text: 'Stornieren',
        style: 'destructive',
        onPress: () => {
          cancelBet(bet.id);
          addCoins(bet.amount);
          router.back();
        },
      },
    ]);
  }, [bet, cancelBet, addCoins, router]);

  if (!bet) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Wette' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🤷</Text>
          <Text style={styles.emptyTitle}>Wette nicht gefunden</Text>
        </View>
      </View>
    );
  }

  const statusColor = getStatusColor(bet.status);
  const hasSubmittedResult = (isCreator && bet.creatorConfirmed) || (isOpponent && bet.opponentConfirmed);
  const needsConfirmation = bet.status === 'waiting_result' && bet.result && !hasSubmittedResult;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Wette Details' }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(bet.category)}</Text>
          <Text style={styles.categoryText}>{bet.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(bet.status)}</Text>
          </View>
        </View>

        <Text style={styles.title}>{bet.title}</Text>
        <Text style={styles.description}>{bet.description}</Text>

        <View style={styles.playersSection}>
          <View style={styles.playerCard}>
            <Image source={{ uri: bet.creatorAvatar }} style={styles.playerAvatar} />
            <Text style={styles.playerName}>{bet.creatorName}</Text>
            {isCreator && <Text style={styles.youBadge}>DU</Text>}
            {bet.creatorConfirmed && <CheckCircle size={16} color={colors.success} />}
          </View>

          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          {bet.opponentId ? (
            <View style={styles.playerCard}>
              <Image source={{ uri: bet.opponentAvatar ?? '' }} style={styles.playerAvatar} />
              <Text style={styles.playerName}>{bet.opponentName}</Text>
              {isOpponent && <Text style={styles.youBadge}>DU</Text>}
              {bet.opponentConfirmed && <CheckCircle size={16} color={colors.success} />}
            </View>
          ) : (
            <View style={[styles.playerCard, styles.emptyPlayer]}>
              <Text style={styles.emptyPlayerEmoji}>❓</Text>
              <Text style={styles.emptyPlayerText}>Wartet auf Gegner</Text>
            </View>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Coins size={18} color={colors.zest} />
            <Text style={styles.infoLabel}>Einsatz</Text>
            <ZestCurrency amount={bet.amount} size="medium" />
          </View>
          <View style={styles.infoItem}>
            <Coins size={18} color={colors.success} />
            <Text style={styles.infoLabel}>Pool</Text>
            <ZestCurrency amount={bet.opponentId ? bet.amount * 2 : bet.amount} size="medium" />
          </View>
          <View style={styles.infoItem}>
            <Heart size={18} color={colors.charity} />
            <Text style={styles.infoLabel}>Charity</Text>
            <Text style={styles.infoValue}>{CHARITY_PERCENTAGE * 100}%</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={18} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Ablauf</Text>
            <Text style={styles.infoValue}>{formatTimeRemaining(bet.expiresAt)}</Text>
          </View>
        </View>

        {bet.status === 'completed' && bet.winnerId && (
          <View style={styles.resultCard}>
            <Text style={styles.resultEmoji}>{bet.winnerId === userId ? '🏆' : '😔'}</Text>
            <Text style={styles.resultTitle}>
              {bet.winnerId === userId ? 'Du hast gewonnen!' : 'Leider verloren'}
            </Text>
            {bet.charityAmount > 0 && (
              <Text style={styles.resultCharity}>
                💜 {bet.charityAmount} Coins gingen an Charity
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          {bet.status === 'pending' && !isCreator && userId && (
            <Button title="Wette annehmen" onPress={handleAcceptBet} size="large" />
          )}

          {bet.status === 'pending' && isCreator && (
            <Button title="Wette stornieren" onPress={handleCancel} variant="danger" size="large" />
          )}

          {bet.status === 'active' && isParticipant && (
            <View style={styles.resultActions}>
              <Text style={styles.resultActionTitle}>Wer hat gewonnen?</Text>
              <View style={styles.resultButtons}>
                <Button
                  title={bet.creatorName}
                  onPress={() => handleSubmitResult('creator_won')}
                  variant="outline"
                  style={styles.resultButton}
                />
                <Button
                  title={bet.opponentName ?? 'Gegner'}
                  onPress={() => handleSubmitResult('opponent_won')}
                  variant="outline"
                  style={styles.resultButton}
                />
              </View>
            </View>
          )}

          {needsConfirmation && (
            <View style={styles.confirmSection}>
              <AlertTriangle size={20} color={colors.warning} />
              <Text style={styles.confirmText}>
                Dein Gegner hat ein Ergebnis eingetragen. Bitte bestätige:
              </Text>
              <Text style={styles.confirmResult}>
                Gewinner: {bet.result === 'creator_won' ? bet.creatorName : bet.opponentName}
              </Text>
              <View style={styles.confirmButtons}>
                <Button title="Bestätigen" onPress={handleConfirmResult} loading={isProcessing} />
                <Button title="Ablehnen" onPress={() => Alert.alert('Streitfall', 'Diese Funktion kommt bald!')} variant="outline" />
              </View>
            </View>
          )}

          {hasSubmittedResult && bet.status === 'waiting_result' && (
            <View style={styles.waitingCard}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={styles.waitingText}>Warte auf Bestätigung des Gegners...</Text>
            </View>
          )}
        </View>

        <Text style={styles.createdAt}>Erstellt {formatDate(bet.createdAt)}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 14,
    textTransform: 'capitalize' as const,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 30,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  playersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  playerCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceLight,
  },
  playerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  youBadge: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900' as const,
  },
  emptyPlayer: {
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
  },
  emptyPlayerEmoji: {
    fontSize: 28,
  },
  emptyPlayerText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%' as unknown as number,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultEmoji: {
    fontSize: 40,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  resultCharity: {
    fontSize: 13,
    color: colors.charity,
  },
  actions: {
    gap: 16,
    marginBottom: 24,
  },
  resultActions: {
    gap: 12,
  },
  resultActionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resultButton: {
    flex: 1,
  },
  confirmSection: {
    backgroundColor: colors.warning + '10',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  confirmText: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center' as const,
  },
  confirmResult: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  waitingCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  waitingText: {
    color: colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  createdAt: {
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontSize: 12,
  },
});
