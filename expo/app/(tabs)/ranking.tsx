import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { useAuthStore } from '@/store/authStore';
import LeaderboardItem from '@/components/LeaderboardItem';
import { LeaderboardEntry } from '@/types';

export default function RankingScreen() {
  const { entries, isLoading, fetchLeaderboard } = useLeaderboardStore();
  const { userId } = useAuthStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const totalCharity = entries.reduce((sum, e) => sum + e.charityContributed, 0);

  const renderItem = useCallback(({ item }: { item: LeaderboardEntry }) => (
    <LeaderboardItem entry={item} isCurrentUser={item.userId === userId} />
  ), [userId]);

  const renderHeader = useCallback(() => (
    <View style={styles.headerSection}>
      <View style={styles.charityCard}>
        <Heart size={24} color={colors.charity} />
        <View>
          <Text style={styles.charityLabel}>Gemeinsam gespendet</Text>
          <Text style={styles.charityAmount}>{totalCharity.toLocaleString('de-DE')} 🪙</Text>
        </View>
      </View>
      <Text style={styles.info}>
        10% jeder Wette gehen an wohltätige Zwecke 💜
      </Text>
    </View>
  ), [totalCharity]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🏆</Text>
      <Text style={styles.emptyTitle}>Noch keine Rangliste</Text>
      <Text style={styles.emptySub}>Starte Wetten um auf dem Leaderboard zu erscheinen!</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerSection: {
    paddingVertical: 16,
    gap: 12,
  },
  charityCard: {
    backgroundColor: colors.charity + '12',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.charity + '25',
  },
  charityLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  charityAmount: {
    color: colors.charity,
    fontSize: 22,
    fontWeight: '800' as const,
    marginTop: 2,
  },
  info: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
});
