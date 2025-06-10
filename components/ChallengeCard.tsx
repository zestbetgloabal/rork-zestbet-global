import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Challenge } from '@/types';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';
import { Users, Trophy, Calendar } from 'lucide-react-native';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress?: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onPress }) => {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/challenge/${challenge.id}`);
    }
  };
  
  // Calculate time remaining
  const now = new Date();
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';
  const isUpcoming = challenge.status === 'upcoming';
  
  const timeRemaining = isActive 
    ? new Date(challenge.endDate).getTime() - now.getTime()
    : isUpcoming
      ? new Date(challenge.startDate).getTime() - now.getTime()
      : 0;
  
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  // Format time remaining text
  let timeRemainingText = '';
  
  if (isCompleted) {
    timeRemainingText = 'Completed';
  } else if (isUpcoming) {
    timeRemainingText = days > 0 
      ? `Starts in ${days}d ${hours}h`
      : `Starts in ${hours}h`;
  } else if (isActive) {
    timeRemainingText = days > 0 
      ? `${days}d ${hours}h remaining`
      : `${hours}h remaining`;
  }
  
  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {challenge.image && (
        <Image 
          source={{ uri: challenge.image }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{challenge.title}</Text>
          
          <View style={[
            styles.statusBadge,
            isActive ? styles.activeBadge : 
            isCompleted ? styles.completedBadge : 
            styles.upcomingBadge
          ]}>
            <Text style={[
              styles.statusText,
              isActive ? styles.activeText : 
              isCompleted ? styles.completedText : 
              styles.upcomingText
            ]}>
              {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {challenge.participants.length} participants
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {timeRemainingText}
            </Text>
          </View>
        </View>
        
        {challenge.hasPool && challenge.pool && (
          <View style={styles.poolContainer}>
            <Trophy size={16} color={colors.primary} />
            <Text style={styles.poolText}>
              Prize Pool: <ZestCurrency amount={challenge.pool.totalAmount} size="small" />
            </Text>
          </View>
        )}
        
        {challenge.type === 'team' && (
          <View style={styles.teamBadge}>
            <Users size={14} color={colors.primary} />
            <Text style={styles.teamText}>Team Challenge</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
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
    height: 120,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: `${colors.success}20`,
  },
  completedBadge: {
    backgroundColor: `${colors.primary}20`,
  },
  upcomingBadge: {
    backgroundColor: `${colors.warning}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: colors.success,
  },
  completedText: {
    color: colors.primary,
  },
  upcomingText: {
    color: colors.warning,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  poolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  poolText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  teamBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
});

export default ChallengeCard;