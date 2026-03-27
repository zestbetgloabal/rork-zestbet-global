import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Trophy, Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { LeaderboardEntry } from '@/types';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const getRankDecoration = (rank: number): { emoji: string; color: string } => {
  if (rank === 1) return { emoji: '🥇', color: '#FFD700' };
  if (rank === 2) return { emoji: '🥈', color: '#C0C0C0' };
  if (rank === 3) return { emoji: '🥉', color: '#CD7F32' };
  return { emoji: '', color: colors.textSecondary };
};

const LeaderboardItem = React.memo(({ entry, isCurrentUser }: LeaderboardItemProps) => {
  const { emoji, color } = getRankDecoration(entry.rank);

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUser]} testID={`leaderboard-item-${entry.rank}`}>
      <View style={styles.rankContainer}>
        {emoji ? (
          <Text style={styles.rankEmoji}>{emoji}</Text>
        ) : (
          <Text style={[styles.rankNumber, { color }]}>#{entry.rank}</Text>
        )}
      </View>

      <Image source={{ uri: entry.avatar }} style={styles.avatar} />

      <View style={styles.info}>
        <Text style={styles.username} numberOfLines={1}>{entry.username}</Text>
        <View style={styles.statsRow}>
          <Trophy size={12} color={colors.success} />
          <Text style={styles.statText}>{entry.wins}W / {entry.totalBets}G</Text>
          <Text style={styles.winRate}>{entry.winRate.toFixed(0)}%</Text>
        </View>
      </View>

      <View style={styles.charityContainer}>
        <Heart size={12} color={colors.charity} />
        <Text style={styles.charityText}>{entry.charityContributed}</Text>
      </View>
    </View>
  );
});

LeaderboardItem.displayName = 'LeaderboardItem';

export default LeaderboardItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  currentUser: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 22,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceLight,
  },
  info: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 3,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  winRate: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700' as const,
  },
  charityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.charity + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  charityText: {
    color: colors.charity,
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
