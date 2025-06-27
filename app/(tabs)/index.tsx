import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useBetStore } from '@/store/betStore';
import { useMissionStore } from '@/store/missionStore';
import { useUserStore } from '@/store/userStore';
import { useImpactStore } from '@/store/impactStore';
import { useAIStore } from '@/store/aiStore';
import BetCard from '@/components/BetCard';
import MissionCard from '@/components/MissionCard';
import ZestCurrency from '@/components/ZestCurrency';
import Button from '@/components/Button';
import WeeklyCharityFeature from '@/components/WeeklyCharityFeature';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import colors from '@/constants/colors';
import { DAILY_BET_LIMIT } from '@/constants/app';
import { Brain } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { bets, fetchBets, likeBet } = useBetStore();
  const { missions, fetchMissions } = useMissionStore();
  const { user, getRemainingDailyLimit, resetDailyBetAmountIfNewDay } = useUserStore();
  const { fetchProjects, weeklyFeaturedProject, getTimeUntilNextProject } = useImpactStore();
  const { fetchRecommendations, recommendations, trackUserBehavior } = useAIStore();
  
  // Fetch data on component mount
  useEffect(() => {
    fetchBets();
    fetchMissions();
    fetchProjects();
    fetchRecommendations('bet', 2);
    
    // Track app opened behavior
    trackUserBehavior('app_opened');
    
    // Reset daily bet amount if it's a new day
    resetDailyBetAmountIfNewDay();
    
    // Start tracking time spent in app
    const startTime = Date.now();
    
    return () => {
      // Track time spent when component unmounts
      const timeSpent = (Date.now() - startTime) / 1000; // in seconds
      trackUserBehavior('time_spent', timeSpent);
    };
  }, []);
  
  // Set current user in a separate useEffect to avoid state updates during render
  useEffect(() => {
    if (user?.username) {
      // Import setCurrentUser from betStore to avoid using it during render
      const { setCurrentUser } = useBetStore.getState();
      setCurrentUser(user.username);
    }
  }, [user?.username]);
  
  // Get public bets for the featured section
  const publicBets = bets.filter(bet => bet.visibility === 'public').slice(0, 2);
  
  // Get active missions
  const activeMissions = missions.filter(mission => mission.status === 'open').slice(0, 2);
  
  // Get time remaining for weekly charity project
  const timeRemaining = getTimeUntilNextProject();
  
  // Use useMemo to calculate remaining daily limit to avoid state updates during render
  const remainingDailyLimit = useMemo(() => {
    // Only call this once during initial render and when user changes
    return getRemainingDailyLimit();
  }, [user?.dailyBetAmount, user?.lastBetDate]);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <ZestCurrency amount={user?.zestBalance || 0} size="medium" />
          </View>
        </View>
        
        <View style={styles.dailyLimitContainer}>
          <Text style={styles.dailyLimitLabel}>Daily Free Zest:</Text>
          <Text style={styles.dailyLimitValue}>
            <ZestCurrency amount={remainingDailyLimit} size="small" /> remaining
          </Text>
        </View>
        
        <View style={styles.quickActions}>
          <Button 
            title="Place a Bet" 
            onPress={() => router.push('/bets')}
            variant="primary"
            size="medium"
            style={styles.actionButton}
          />
          <Button 
            title="Get Zest" 
            onPress={() => router.push('/wallet')}
            variant="outline"
            size="medium"
            style={styles.actionButton}
          />
        </View>
      </View>
      
      {/* AI Recommendations Section */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Brain size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>For You</Text>
            </View>
            <Pressable onPress={() => fetchRecommendations('bet', 2)}>
              <Text style={styles.seeAllText}>Refresh</Text>
            </Pressable>
          </View>
          
          {recommendations.map(recommendation => (
            <AIRecommendationCard 
              key={recommendation.id} 
              recommendation={recommendation} 
            />
          ))}
        </View>
      )}
      
      {/* Weekly Charity Feature */}
      {weeklyFeaturedProject && (
        <WeeklyCharityFeature 
          project={weeklyFeaturedProject}
          timeRemaining={timeRemaining}
        />
      )}
      
      {/* Featured Bets Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Bets</Text>
          <Pressable onPress={() => router.push('/bets')}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>
        
        {publicBets.map(bet => (
          <BetCard 
            key={bet.id} 
            bet={bet} 
            onLike={() => likeBet(bet.id)}
          />
        ))}
      </View>
      
      {/* Missions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Missions</Text>
          <Pressable onPress={() => router.push('/profile')}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>
        
        {activeMissions.map(mission => (
          <MissionCard 
            key={mission.id} 
            mission={mission}
          />
        ))}
      </View>
      
      {/* Purchase Zest Promo */}
      <View style={styles.purchasePromo}>
        <Text style={styles.purchasePromoTitle}>Need More Zest?</Text>
        <Text style={styles.purchasePromoText}>
          You can get Ƶ{DAILY_BET_LIMIT} free Zest daily, or purchase more to keep betting!
        </Text>
        <Button 
          title="Purchase Zest" 
          onPress={() => router.push('/wallet')}
          variant="primary"
          size="medium"
          style={styles.purchaseButton}
        />
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
    padding: 16,
    paddingTop: 56, // Added 1cm (approximately 38px) of padding to move content down
  },
  welcomeSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dailyLimitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  dailyLimitLabel: {
    fontSize: 14,
    color: colors.text,
  },
  dailyLimitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 6,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  purchasePromo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  purchasePromoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  purchasePromoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  purchaseButton: {
    alignSelf: 'flex-start',
  },
});