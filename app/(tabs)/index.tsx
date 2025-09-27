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
import { hermesGuard, safeArrayOperation } from '@/utils/crashPrevention';
import DemoModeIndicator from '@/components/DemoModeIndicator';

export default function HomeScreen() {
  const router = useRouter();
  const { bets, fetchBets, likeBet } = useBetStore();
  const { missions, fetchMissions } = useMissionStore();
  const { user, getRemainingDailyLimit, resetDailyBetAmountIfNewDay } = useUserStore();
  const { fetchProjects, weeklyFeaturedProject, getTimeUntilNextProject } = useImpactStore();
  const { fetchRecommendations, recommendations, trackUserBehavior } = useAIStore();
  
  // Fetch data on component mount with crash protection
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchBets(),
          fetchMissions(),
          fetchProjects(),
          fetchRecommendations('bet', 2)
        ]);
        
        // Track app opened behavior
        trackUserBehavior('app_opened');
        
        // Reset daily bet amount if it's a new day
        resetDailyBetAmountIfNewDay();
      } catch (error) {
        console.warn('Failed to initialize home screen data:', error);
      }
    };
    
    // Execute the initialization with crash protection
    hermesGuard(() => {
      initializeData();
    }, undefined, 'execute initialization');
    
    // Start tracking time spent in app
    const startTime = Date.now();
    
    return () => {
      // Track time spent when component unmounts
      hermesGuard(() => {
        const timeSpent = (Date.now() - startTime) / 1000; // in seconds
        trackUserBehavior('time_spent', timeSpent);
      }, undefined, 'time tracking cleanup');
    };
  }, [fetchBets, fetchMissions, fetchProjects, fetchRecommendations, trackUserBehavior, resetDailyBetAmountIfNewDay]);
  
  // Set current user in a separate useEffect to avoid state updates during render
  useEffect(() => {
    hermesGuard(() => {
      if (user?.username) {
        // Import setCurrentUser from betStore to avoid using it during render
        const { setCurrentUser } = useBetStore.getState();
        setCurrentUser(user.username);
      }
    }, undefined, 'set current user');
  }, [user?.username]);
  
  // Get public bets for the featured section with crash protection
  const publicBets = safeArrayOperation(
    bets,
    (safeBets) => safeBets.filter(bet => bet?.visibility === 'public').slice(0, 2),
    []
  );
  
  // Get active missions with crash protection
  const activeMissions = safeArrayOperation(
    missions,
    (safeMissions) => safeMissions.filter(mission => mission?.status === 'open').slice(0, 2),
    []
  );
  
  // Get time remaining for weekly charity project
  const timeRemaining = hermesGuard(() => {
    const result = getTimeUntilNextProject();
    // Convert to expected format if needed
    if (typeof result === 'string') {
      return result;
    }
    // If it's an object with days, hours, minutes, format it
    if (result && typeof result === 'object' && 'hours' in result && 'minutes' in result) {
      return `${result.hours}:${result.minutes.toString().padStart(2, '0')}`;
    }
    return '0:00';
  }, '0:00', 'time remaining calculation');
  
  // Use useMemo to calculate remaining daily limit to avoid state updates during render
  const remainingDailyLimit = useMemo(() => {
    return hermesGuard(() => {
      // Only call this once during initial render and when user changes
      return getRemainingDailyLimit();
    }, 0, 'daily limit calculation');
  }, [user?.dailyBetAmount, user?.lastBetDate, getRemainingDailyLimit]);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Demo Mode Indicator */}
      <DemoModeIndicator 
        message="🎭 Production Demo - Experience all features with sample data" 
        variant="info"
      />
      
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={styles.welcomeText}>Welcome back! 🎯</Text>
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
            style={styles.primaryActionButton}
          />
        </View>
      </View>
      
      {/* AI Recommendations Section - Simplified */}
      {recommendations.length > 0 && (
        <View style={styles.compactSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Brain size={18} color={colors.primary} />
              <Text style={styles.compactSectionTitle}>Recommended</Text>
            </View>
          </View>
          
          {safeArrayOperation(
            recommendations,
            (safeRecommendations) => safeRecommendations.slice(0, 1).map(recommendation => (
              <AIRecommendationCard 
                key={recommendation?.id || Math.random()} 
                recommendation={recommendation} 
              />
            )),
            []
          )}
        </View>
      )}
      
      {/* Weekly Charity Feature */}
      {weeklyFeaturedProject && (
        <WeeklyCharityFeature 
          project={weeklyFeaturedProject}
          timeRemaining={{ days: 0, hours: 0, minutes: 0 }}
        />
      )}
      
      {/* Featured Bets Section - Simplified */}
      <View style={styles.compactSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.compactSectionTitle}>Popular Bets</Text>
          <Pressable onPress={() => router.push('/bets')}>
            <Text style={styles.seeAllText}>View All</Text>
          </Pressable>
        </View>
        
        {safeArrayOperation(
          publicBets,
          (safeBets) => safeBets.slice(0, 1).map(bet => (
            <BetCard 
              key={bet?.id || Math.random()} 
              bet={bet} 
              onLike={() => hermesGuard(() => likeBet(bet?.id), undefined, 'like bet')}
            />
          )),
          []
        )}
      </View>
      
      {/* Missions Section - Compact */}
      {activeMissions.length > 0 && (
        <View style={styles.compactSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.compactSectionTitle}>Active Mission</Text>
            <Pressable onPress={() => router.push('/profile')}>
              <Text style={styles.seeAllText}>View All</Text>
            </Pressable>
          </View>
          
          {safeArrayOperation(
            activeMissions,
            (safeMissions) => safeMissions.slice(0, 1).map(mission => (
              <MissionCard 
                key={mission?.id || Math.random()} 
                mission={mission}
              />
            )),
            []
          )}
        </View>
      )}
      
      {/* Quick Access to Wallet */}
      <View style={styles.walletQuickAccess}>
        <Text style={styles.walletAccessText}>Need more Zest?</Text>
        <Pressable 
          style={styles.walletAccessButton}
          onPress={() => router.push('/wallet')}
        >
          <Text style={styles.walletAccessButtonText}>Go to Wallet</Text>
        </Pressable>
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
    paddingTop: 20,
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
  primaryActionButton: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  compactSection: {
    marginBottom: 20,
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
  compactSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 6,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
  },
  walletQuickAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.primary}08`,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  walletAccessText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  walletAccessButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  walletAccessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});