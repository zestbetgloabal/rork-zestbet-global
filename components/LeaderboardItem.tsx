import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { LeaderboardEntry } from '@/types';
import colors from '@/constants/colors';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  rank: number;
}

export default function LeaderboardItem({ entry, rank }: LeaderboardItemProps) {
  const getTrophyColor = () => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return colors.textSecondary;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.rankContainer}>
        {rank <= 3 ? (
          <Trophy size={20} color={getTrophyColor()} />
        ) : (
          <Text style={styles.rankText}>{rank}</Text>
        )}
      </View>
      
      {entry.avatar ? (
        <Image 
          source={{ uri: entry.avatar }} 
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder} />
      )}
      
      <Text style={styles.username}>{entry.username}</Text>
      
      <Text style={styles.points}>{entry.points.toLocaleString()} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});