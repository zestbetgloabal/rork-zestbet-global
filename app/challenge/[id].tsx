import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Clock, 
  ChevronRight, 
  DollarSign,
  Award,
  Share2
} from 'lucide-react-native';
import { useChallengeStore } from '@/store/challengeStore';
import { useUserStore } from '@/store/userStore';
import { useBadgeStore } from '@/store/badgeStore';
import Button from '@/components/Button';
import ZestCurrency from '@/components/ZestCurrency';
import colors from '@/constants/colors';
import { Challenge, ChallengeParticipant } from '@/types';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUserStore();
  const { 
    getChallenge, 
    getUserParticipation,
    joinChallenge,
    leaveChallenge,
    contributeToPool,
    distributePoolRewards,
    isLoading
  } = useChallengeStore();
  const { updateUserRank } = useBadgeStore();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userParticipation, setUserParticipation] = useState<ChallengeParticipant | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const [showContributionOptions, setShowContributionOptions] = useState(false);
  
  useEffect(() => {
    if (id) {
      const challengeData = getChallenge(id);
      setChallenge(challengeData || null);
      
      if (challengeData && user?.id) {
        const participation = getUserParticipation(id, user.id);
        setUserParticipation(participation || null);
      }
    }
  }, [id, user?.id]);
  
  const handleJoinChallenge = async () => {
    if (!user?.id || !challenge) return;
    
    // If the challenge has a pool, show contribution options
    if (challenge.hasPool && challenge.pool) {
      setShowContributionOptions(true);
      setContributionAmount(challenge.pool.minContribution);
    } else {
      // Join without contribution
      try {
        const success = await joinChallenge(challenge.id, user.id);
        
        if (success) {
          // Refresh challenge data
          const updatedChallenge = getChallenge(challenge.id);
          setChallenge(updatedChallenge || null);
          
          if (updatedChallenge) {
            const participation = getUserParticipation(updatedChallenge.id, user.id);
            setUserParticipation(participation || null);
          }
          
          Alert.alert('Success', 'You have joined the challenge!');
        } else {
          Alert.alert('Error', 'Failed to join the challenge. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        console.error(error);
      }
    }
  };
  
  const handleContribute = async () => {
    if (!user?.id || !challenge || !challenge.pool) return;
    
    // Validate contribution amount
    if (contributionAmount < challenge.pool.minContribution) {
      Alert.alert('Error', `Minimum contribution is ${challenge.pool.minContribution} Zest`);
      return;
    }
    
    if (contributionAmount > challenge.pool.maxContribution) {
      Alert.alert('Error', `Maximum contribution is ${challenge.pool.maxContribution} Zest`);
      return;
    }
    
    try {
      // If user is not a participant yet, join with contribution
      if (!userParticipation) {
        const success = await joinChallenge(challenge.id, user.id, contributionAmount);
        
        if (success) {
          // Refresh challenge data
          const updatedChallenge = getChallenge(challenge.id);
          setChallenge(updatedChallenge || null);
          
          if (updatedChallenge) {
            const participation = getUserParticipation(updatedChallenge.id, user.id);
            setUserParticipation(participation || null);
          }
          
          setShowContributionOptions(false);
          Alert.alert('Success', `You have joined the challenge with a contribution of ${contributionAmount} Zest!`);
        } else {
          Alert.alert('Error', 'Failed to join the challenge. Please try again.');
        }
      } else {
        // User is already a participant, just contribute
        const success = await contributeToPool(
          challenge.id, 
          user.id, 
          user.username || 'User', 
          contributionAmount
        );
        
        if (success) {
          // Refresh challenge data
          const updatedChallenge = getChallenge(challenge.id);
          setChallenge(updatedChallenge || null);
          
          if (updatedChallenge) {
            const participation = getUserParticipation(updatedChallenge.id, user.id);
            setUserParticipation(participation || null);
          }
          
          setShowContributionOptions(false);
          Alert.alert('Success', `You have contributed ${contributionAmount} Zest to the pool!`);
        } else {
          Alert.alert('Error', 'Failed to contribute to the pool. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error(error);
    }
  };
  
  const handleLeaveChallenge = async () => {
    if (!user?.id || !challenge) return;
    
    Alert.alert(
      'Leave Challenge',
      'Are you sure you want to leave this challenge? Any contributions to the pool will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await leaveChallenge(challenge.id, user.id);
              
              if (success) {
                // Refresh challenge data
                const updatedChallenge = getChallenge(challenge.id);
                setChallenge(updatedChallenge || null);
                setUserParticipation(null);
                
                Alert.alert('Success', 'You have left the challenge.');
              } else {
                Alert.alert('Error', 'Failed to leave the challenge. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const handleDistributeRewards = async () => {
    if (!challenge) return;
    
    Alert.alert(
      'Distribute Rewards',
      'Are you sure you want to distribute the rewards? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Distribute',
          onPress: async () => {
            try {
              const success = await distributePoolRewards(challenge.id);
              
              if (success) {
                // Refresh challenge data
                const updatedChallenge = getChallenge(challenge.id);
                setChallenge(updatedChallenge || null);
                
                // Update user ranks based on rewards
                // In a real app, this would be handled by the backend
                if (user?.id) {
                  await updateUserRank(user.id, 100); // Example: award 100 tokens for completing a challenge
                }
                
                Alert.alert('Success', 'Rewards have been distributed!');
              } else {
                Alert.alert('Error', 'Failed to distribute rewards. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const handleShareChallenge = () => {
    // In a real app, this would use the Share API
    Alert.alert(
      'Share Challenge',
      'This would open the share dialog in a real app.',
      [{ text: 'OK' }]
    );
  };
  
  const handleViewParticipants = () => {
    if (challenge) {
      router.push(`/challenge/${challenge.id}/participants`);
    }
  };
  
  const handleViewTeams = () => {
    if (challenge) {
      router.push(`/challenge/${challenge.id}/teams`);
    }
  };
  
  if (!challenge) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {challenge.image && (
        <Image 
          source={{ uri: challenge.image }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}
      
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
      
      <Text style={styles.description}>{challenge.description}</Text>
      
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Calendar size={20} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Start Date</Text>
            <Text style={styles.infoValue}>
              {new Date(challenge.startDate).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Clock size={20} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>End Date</Text>
            <Text style={styles.infoValue}>
              {new Date(challenge.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Users size={20} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Participants</Text>
            <Text style={styles.infoValue}>
              {challenge.participants.length}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Trophy size={20} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {challenge.type === 'team' ? 'Team Challenge' : 'Individual Challenge'}
            </Text>
          </View>
        </View>
        
        <View style={styles.timeRemainingContainer}>
          <Clock size={20} color={colors.primary} />
          <Text style={styles.timeRemainingText}>{timeRemainingText}</Text>
        </View>
      </View>
      
      {challenge.hasPool && challenge.pool && (
        <View style={styles.poolSection}>
          <View style={styles.poolHeader}>
            <Trophy size={24} color={colors.primary} />
            <Text style={styles.poolTitle}>Prize Pool</Text>
          </View>
          
          <View style={styles.poolAmountContainer}>
            <Text style={styles.poolAmountLabel}>Total Pool</Text>
            <Text style={styles.poolAmount}>
              <ZestCurrency amount={challenge.pool.totalAmount} size="large" />
            </Text>
          </View>
          
          <View style={styles.poolInfoContainer}>
            <View style={styles.poolInfoItem}>
              <Text style={styles.poolInfoLabel}>Min Contribution</Text>
              <Text style={styles.poolInfoValue}>
                <ZestCurrency amount={challenge.pool.minContribution} size="small" />
              </Text>
            </View>
            
            <View style={styles.poolInfoItem}>
              <Text style={styles.poolInfoLabel}>Max Contribution</Text>
              <Text style={styles.poolInfoValue}>
                <ZestCurrency amount={challenge.pool.maxContribution} size="small" />
              </Text>
            </View>
            
            <View style={styles.poolInfoItem}>
              <Text style={styles.poolInfoLabel}>Contributors</Text>
              <Text style={styles.poolInfoValue}>
                {challenge.pool.contributions.length}
              </Text>
            </View>
          </View>
          
          {userParticipation && (
            <View style={styles.userContributionContainer}>
              <Text style={styles.userContributionLabel}>Your Contribution</Text>
              <Text style={styles.userContributionValue}>
                <ZestCurrency amount={userParticipation.contribution || 0} size="medium" />
              </Text>
            </View>
          )}
          
          {isActive && userParticipation && (
            <Button
              title="Add to Pool"
              onPress={() => setShowContributionOptions(true)}
              variant="outline"
              size="medium"
              style={styles.contributeButton}
            />
          )}
          
          {showContributionOptions && (
            <View style={styles.contributionOptionsContainer}>
              <Text style={styles.contributionOptionsTitle}>
                Choose Contribution Amount
              </Text>
              
              <View style={styles.contributionButtonsContainer}>
                {[
                  challenge.pool.minContribution,
                  challenge.pool.minContribution * 2,
                  challenge.pool.minContribution * 5,
                  challenge.pool.maxContribution
                ].map((amount) => (
                  <Pressable
                    key={amount}
                    style={[
                      styles.contributionButton,
                      contributionAmount === amount && styles.selectedContributionButton
                    ]}
                    onPress={() => setContributionAmount(amount)}
                  >
                    <Text style={[
                      styles.contributionButtonText,
                      contributionAmount === amount && styles.selectedContributionButtonText
                    ]}>
                      <ZestCurrency amount={amount} size="small" />
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              <View style={styles.contributionActionButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowContributionOptions(false)}
                  variant="outline"
                  size="small"
                  style={styles.contributionActionButton}
                />
                
                <Button
                  title="Contribute"
                  onPress={handleContribute}
                  variant="primary"
                  size="small"
                  style={styles.contributionActionButton}
                />
              </View>
            </View>
          )}
          
          {isCompleted && challenge.creator === user?.id && !challenge.pool.isDistributed && (
            <Button
              title="Distribute Rewards"
              onPress={handleDistributeRewards}
              variant="primary"
              size="medium"
              style={styles.distributeButton}
            />
          )}
        </View>
      )}
      
      <View style={styles.actionsSection}>
        <Pressable 
          style={styles.actionButton}
          onPress={handleViewParticipants}
        >
          <View style={styles.actionButtonContent}>
            <Users size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>View Participants</Text>
          </View>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
        
        {challenge.type === 'team' && (
          <Pressable 
            style={styles.actionButton}
            onPress={handleViewTeams}
          >
            <View style={styles.actionButtonContent}>
              <Users size={20} color={colors.text} />
              <Text style={styles.actionButtonText}>View Teams</Text>
            </View>
            <ChevronRight size={20} color={colors.primary} />
          </Pressable>
        )}
        
        <Pressable 
          style={styles.actionButton}
          onPress={handleShareChallenge}
        >
          <View style={styles.actionButtonContent}>
            <Share2 size={20} color={colors.text} />
            <Text style={styles.actionButtonText}>Share Challenge</Text>
          </View>
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
      </View>
      
      <View style={styles.joinSection}>
        {!userParticipation ? (
          <Button
            title={isLoading ? 'Processing...' : 'Join Challenge'}
            onPress={handleJoinChallenge}
            variant="primary"
            size="large"
            disabled={isLoading || isCompleted}
            icon={isLoading ? <ActivityIndicator size="small" color="white" /> : null}
          />
        ) : (
          <Button
            title={isLoading ? 'Processing...' : 'Leave Challenge'}
            onPress={handleLeaveChallenge}
            variant="outline"
            size="large"
            disabled={isLoading || isCompleted}
            icon={isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    fontSize: 14,
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
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timeRemainingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  poolSection: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  poolTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  poolAmountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  poolAmountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  poolAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  poolInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  poolInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  poolInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  poolInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userContributionContainer: {
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userContributionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userContributionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  contributeButton: {
    marginTop: 8,
  },
  contributionOptionsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  contributionOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  contributionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contributionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedContributionButton: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  contributionButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  selectedContributionButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  contributionActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contributionActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  distributeButton: {
    marginTop: 8,
  },
  actionsSection: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  joinSection: {
    padding: 16,
    marginBottom: 16,
  },
});