import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Lock, Globe } from 'lucide-react-native';
import { Bet } from '@/types';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';

interface BetCardProps {
  bet: Bet;
  onLike?: () => void;
}

export default function BetCard({ bet, onLike }: BetCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/bet/${bet.id}`);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <Pressable style={styles.card} onPress={handlePress}>
      {bet.image && (
        <Image 
          source={{ uri: bet.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
            <Text style={styles.category}>{bet.category.toUpperCase()}</Text>
            {bet.visibility === 'private' ? (
              <View style={styles.visibilityBadge}>
                <Lock size={12} color={colors.textSecondary} />
                <Text style={styles.visibilityText}>Private</Text>
              </View>
            ) : (
              <View style={styles.visibilityBadge}>
                <Globe size={12} color={colors.textSecondary} />
                <Text style={styles.visibilityText}>Public</Text>
              </View>
            )}
          </View>
          <Pressable style={styles.likeButton} onPress={onLike}>
            <Heart size={18} color={colors.textSecondary} />
            <Text style={styles.likeCount}>{bet.likes}</Text>
          </Pressable>
        </View>
        
        <Text style={styles.title}>{bet.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{bet.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Pool</Text>
            <ZestCurrency amount={bet.totalPool} size="small" />
          </View>
          
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Participants</Text>
            <Text style={styles.footerValue}>{bet.participants}</Text>
          </View>
          
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Ends</Text>
            <Text style={styles.footerValue}>{formatDate(bet.endDate)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginRight: 8,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  visibilityText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});