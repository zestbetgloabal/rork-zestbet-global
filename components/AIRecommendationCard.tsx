import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AIRecommendation } from '@/types';
import { useAIStore } from '@/store/aiStore';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';
import { Award, Brain, Clock, Users } from 'lucide-react-native';

interface AIRecommendationCardProps {
  recommendation: AIRecommendation;
}

export default function AIRecommendationCard({ recommendation }: AIRecommendationCardProps) {
  const router = useRouter();
  const { markRecommendationShown, markRecommendationClicked } = useAIStore();
  
  // Mark as shown when rendered
  React.useEffect(() => {
    if (!recommendation.isShown) {
      markRecommendationShown(recommendation.id);
    }
  }, [recommendation.id, recommendation.isShown]);
  
  const handlePress = () => {
    markRecommendationClicked(recommendation.id);
    
    // Navigate based on recommendation type
    if (recommendation.type === 'bet' && recommendation.relatedBet) {
      router.push(`/bet/${recommendation.relatedBet.id}`);
    } else if (recommendation.type === 'mission' && recommendation.relatedMission) {
      router.push('/profile');
    } else if (recommendation.type === 'friend' && recommendation.relatedUser) {
      // In a real app, this would navigate to the user's profile
      console.log('Navigate to user profile:', recommendation.relatedUser.username);
    }
  };
  
  // Render different content based on recommendation type
  const renderContent = () => {
    if (recommendation.type === 'bet' && recommendation.relatedBet) {
      const bet = recommendation.relatedBet;
      return (
        <>
          {bet.image && (
            <Image 
              source={{ uri: bet.image }} 
              style={styles.image} 
              resizeMode="cover"
            />
          )}
          <View style={styles.content}>
            <Text style={styles.title}>{bet.title}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {bet.description}
            </Text>
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Users size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{bet.participants}</Text>
              </View>
              <View style={styles.detailItem}>
                <ZestCurrency amount={bet.totalPool} size="small" />
              </View>
              <View style={styles.detailItem}>
                <Clock size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(bet.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </>
      );
    } else if (recommendation.type === 'mission' && recommendation.relatedMission) {
      const mission = recommendation.relatedMission;
      return (
        <>
          <View style={styles.iconContainer}>
            <Award size={32} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{mission.title}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {mission.description}
            </Text>
            <View style={styles.reward}>
              <Text style={styles.rewardText}>Reward: </Text>
              <ZestCurrency amount={mission.reward} size="small" />
            </View>
          </View>
        </>
      );
    } else if (recommendation.type === 'friend' && recommendation.relatedUser) {
      const user = recommendation.relatedUser;
      return (
        <>
          {user.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.content}>
            <Text style={styles.title}>{user.username}</Text>
            <Text style={styles.description}>
              Similar betting interests to you
            </Text>
            <View style={styles.userStats}>
              <Text style={styles.statText}>
                Points: {user.points}
              </Text>
            </View>
          </View>
        </>
      );
    }
    
    return (
      <View style={styles.content}>
        <Text style={styles.title}>Recommendation</Text>
        <Text style={styles.description}>No details available</Text>
      </View>
    );
  };
  
  return (
    <Pressable 
      style={styles.container}
      onPress={handlePress}
    >
      <View style={styles.aiIndicator}>
        <Brain size={16} color={colors.primary} />
        <Text style={styles.aiText}>AI Recommended</Text>
      </View>
      <View style={styles.cardContent}>
        {renderContent()}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  aiText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userStats: {
    marginTop: 8,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});