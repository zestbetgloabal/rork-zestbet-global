import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Users, Coins } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Bet } from '@/types';
import { getCategoryEmoji, getStatusLabel, getStatusColor, formatTimeRemaining } from '@/utils/helpers';

interface BetCardProps {
  bet: Bet;
  onPress: () => void;
  compact?: boolean;
}

const BetCard = React.memo(({ bet, onPress, compact }: BetCardProps) => {
  const statusColor = getStatusColor(bet.status);

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7} testID={`bet-card-${bet.id}`}>
        <View style={styles.compactLeft}>
          <Text style={styles.compactEmoji}>{getCategoryEmoji(bet.category)}</Text>
          <View style={styles.compactInfo}>
            <Text style={styles.compactTitle} numberOfLines={1}>{bet.title}</Text>
            <Text style={styles.compactSub}>{bet.creatorName} {bet.opponentName ? `vs ${bet.opponentName}` : '• Offen'}</Text>
          </View>
        </View>
        <View style={styles.compactRight}>
          <Text style={styles.compactAmount}>{bet.amount} 🪙</Text>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} testID={`bet-card-${bet.id}`}>
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(bet.category)}</Text>
          <Text style={styles.categoryText}>{bet.category}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(bet.status)}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>{bet.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{bet.description}</Text>

      <View style={styles.players}>
        <View style={styles.player}>
          <Image source={{ uri: bet.creatorAvatar }} style={styles.avatar} />
          <Text style={styles.playerName} numberOfLines={1}>{bet.creatorName}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        {bet.opponentId ? (
          <View style={styles.player}>
            <Image source={{ uri: bet.opponentAvatar ?? '' }} style={styles.avatar} />
            <Text style={styles.playerName} numberOfLines={1}>{bet.opponentName}</Text>
          </View>
        ) : (
          <View style={styles.player}>
            <View style={[styles.avatar, styles.emptyAvatar]}>
              <Users size={16} color={colors.textMuted} />
            </View>
            <Text style={[styles.playerName, { color: colors.primary }]}>Beitreten</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Coins size={14} color={colors.zest} />
          <Text style={styles.footerText}>{bet.amount} Coins</Text>
        </View>
        <View style={styles.footerItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.footerText}>{formatTimeRemaining(bet.expiresAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

BetCard.displayName = 'BetCard';

export default BetCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize' as const,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 4,
    lineHeight: 22,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 12,
  },
  player: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  emptyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  playerName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  vsContainer: {
    backgroundColor: colors.primary + '20',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800' as const,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  compactCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  compactEmoji: {
    fontSize: 24,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  compactSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  compactRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  compactAmount: {
    color: colors.zest,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
