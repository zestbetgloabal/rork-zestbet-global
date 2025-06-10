import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { Badge } from '@/types';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';
import { Award, ChevronRight } from 'lucide-react-native';

interface BadgeDisplayProps {
  badge: Badge;
  totalTokens: number;
  nextBadge?: Badge;
  tokensToNextBadge: number;
  onPress?: () => void;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  totalTokens,
  nextBadge,
  tokensToNextBadge,
  onPress
}) => {
  const progress = nextBadge 
    ? Math.min(100, ((nextBadge.requiredTokens - tokensToNextBadge) / nextBadge.requiredTokens) * 100)
    : 100;
  
  return (
    <Pressable 
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Current Rank</Text>
        {onPress && <ChevronRight size={20} color={colors.primary} />}
      </View>
      
      <View style={styles.badgeContainer}>
        <Image 
          source={{ uri: badge.imageUrl }}
          style={styles.badgeImage}
        />
        
        <View style={styles.badgeInfo}>
          <Text style={styles.badgeName}>{badge.name}</Text>
          <Text style={styles.badgeDescription}>{badge.description}</Text>
        </View>
      </View>
      
      {nextBadge ? (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Next Rank: {nextBadge.name}</Text>
            <Text style={styles.progressTokens}>
              <ZestCurrency amount={tokensToNextBadge} size="small" /> to go
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              <ZestCurrency amount={totalTokens} size="small" />
            </Text>
            <Text style={styles.progressLabel}>
              <ZestCurrency amount={nextBadge.requiredTokens} size="small" />
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.maxRankContainer}>
          <Award size={24} color={colors.primary} />
          <Text style={styles.maxRankText}>You've reached the highest rank!</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressTokens: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  maxRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 8,
  },
  maxRankText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
});

export default BadgeDisplay;