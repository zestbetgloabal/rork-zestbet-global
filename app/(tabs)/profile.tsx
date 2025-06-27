import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Pressable,
  useWindowDimensions,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Award, Share2, LogOut, MessageSquare, Edit, Instagram, Twitter, Facebook, Globe, Linkedin, FileText, Shield, Info, Youtube, Scissors, MessageCircle } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useMissionStore } from '@/store/missionStore';
import { useLeaderboardStore } from '@/store/leaderboardStore';
import { useImpactStore } from '@/store/impactStore';
import { useBadgeStore } from '@/store/badgeStore';
import ZestCurrency from '@/components/ZestCurrency';
import MissionCard from '@/components/MissionCard';
import LeaderboardItem from '@/components/LeaderboardItem';
import ImpactProjectCard from '@/components/ImpactProjectCard';
import Button from '@/components/Button';
import BadgeDisplay from '@/components/BadgeDisplay';
import colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { user } = useUserStore();
  const { logout, isLoading } = useAuthStore();
  const { missions, fetchMissions } = useMissionStore();
  const { entries, fetchLeaderboard } = useLeaderboardStore();
  const { projects, fetchProjects, weeklyFeaturedProject } = useImpactStore();
  const { userRank, fetchUserRank } = useBadgeStore();
  const [activeTab, setActiveTab] = useState('missions');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    fetchMissions();
    fetchLeaderboard();
    fetchProjects();
    if (user?.id) {
      fetchUserRank(user.id);
    }
  }, [user?.id]);
  
  const handleShare = async () => {
    router.push('/invite');
  };
  
  const handleEditProfile = () => {
    router.push('/profile-edit');
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: () => {
            setIsLoggingOut(true);
            
            // Call logout function
            logout()
              .then(() => {
                // Navigate to auth screen
                router.replace('/(auth)');
              })
              .catch((error) => {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to log out. Please try again.');
              })
              .finally(() => {
                // Always reset the loading state
                setIsLoggingOut(false);
              });
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSuggestion = () => {
    router.push('/suggestion');
  };
  
  const handleOpenSocialMedia = async (platform: string, username: string) => {
    if (!username) return;
    
    let url = '';
    
    switch (platform) {
      case 'instagram':
        url = `https://instagram.com/${username}`;
        break;
      case 'twitter':
        url = `https://twitter.com/${username}`;
        break;
      case 'facebook':
        url = `https://facebook.com/${username}`;
        break;
      case 'linkedin':
        url = `https://linkedin.com/in/${username}`;
        break;
      case 'tiktok':
        url = `https://tiktok.com/@${username}`;
        break;
      case 'youtube':
        url = `https://youtube.com/${username}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/${username}`;
        break;
      case 'snapchat':
        url = `https://snapchat.com/add/${username}`;
        break;
      case 'website':
        // Add https:// if not present
        url = username.startsWith('http') ? username : `https://${username}`;
        break;
      default:
        return;
    }
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${platform}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${platform}`);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'missions':
        return (
          <View style={styles.tabContent}>
            {missions && missions.length > 0 ? (
              missions.map(mission => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            ) : (
              <Text style={styles.emptyStateText}>No missions available at the moment.</Text>
            )}
          </View>
        );
      case 'leaderboard':
        return (
          <View style={styles.tabContent}>
            {entries && entries.length > 0 ? (
              entries.map((entry, index) => (
                <LeaderboardItem key={entry.username} entry={entry} rank={index + 1} />
              ))
            ) : (
              <Text style={styles.emptyStateText}>Leaderboard data is not available.</Text>
            )}
          </View>
        );
      case 'impact':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.impactDescription}>
              Each week we feature a different charity project. 
              Check out our current and past featured projects below.
            </Text>
            
            {/* Show featured project first */}
            {weeklyFeaturedProject && (
              <ImpactProjectCard key={weeklyFeaturedProject.id} project={weeklyFeaturedProject} />
            )}
            
            {/* Show other projects */}
            {projects && projects.length > 0 ? (
              projects
                .filter(project => !project.featured)
                .map(project => (
                  <ImpactProjectCard key={project.id} project={project} />
                ))
            ) : (
              <Text style={styles.emptyStateText}>No impact projects available at the moment.</Text>
            )}
          </View>
        );
      case 'badges':
        return (
          <View style={styles.tabContent}>
            {userRank ? (
              <View style={styles.badgeSection}>
                <BadgeDisplay 
                  badge={userRank.currentBadge} 
                  totalTokens={userRank.totalTokensEarned}
                  nextBadge={userRank.nextBadge}
                  tokensToNextBadge={userRank.tokensToNextBadge}
                />
                
                <Text style={styles.badgeHistoryTitle}>Badge History</Text>
                {userRank.history.length > 0 ? (
                  userRank.history.map((badge, index) => (
                    <View key={index} style={styles.badgeHistoryItem}>
                      <Text style={styles.badgeName}>{badge.badgeName}</Text>
                      <Text style={styles.badgeDate}>
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>No badge history yet.</Text>
                )}
              </View>
            ) : (
              <Text style={styles.emptyStateText}>No badge data available.</Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };
  
  // Check if user has any social media profiles
  const hasSocialMedia = user?.socialMedia && 
    Object.values(user.socialMedia).some(value => value);
  
  if (isLoggingOut) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {user?.avatar ? (
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        
        <Text style={styles.username}>{user?.username}</Text>
        
        {userRank && userRank.currentBadge && (
          <View style={styles.rankBadgeContainer}>
            <Image 
              source={{ uri: userRank.currentBadge.imageUrl }} 
              style={styles.rankBadge}
            />
            <Text style={styles.rankName}>{userRank.currentBadge.name}</Text>
          </View>
        )}
        
        {user?.biography && (
          <Text style={styles.biography}>{user.biography}</Text>
        )}
        
        {/* Social Media Section with Heading */}
        {hasSocialMedia && (
          <View style={styles.socialSection}>
            <Text style={styles.socialSectionTitle}>Connect with me</Text>
            <View style={styles.socialLinks}>
              {user?.socialMedia?.instagram && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('instagram', user.socialMedia?.instagram || '')}
                >
                  <Instagram size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.twitter && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('twitter', user.socialMedia?.twitter || '')}
                >
                  <Twitter size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.facebook && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('facebook', user.socialMedia?.facebook || '')}
                >
                  <Facebook size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.tiktok && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('tiktok', user.socialMedia?.tiktok || '')}
                >
                  <Scissors size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.youtube && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('youtube', user.socialMedia?.youtube || '')}
                >
                  <Youtube size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.snapchat && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('snapchat', user.socialMedia?.snapchat || '')}
                >
                  <MessageCircle size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.linkedin && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('linkedin', user.socialMedia?.linkedin || '')}
                >
                  <Linkedin size={20} color={colors.text} />
                </Pressable>
              )}
              
              {user?.socialMedia?.website && (
                <Pressable 
                  style={styles.socialIcon} 
                  onPress={() => handleOpenSocialMedia('website', user.socialMedia?.website || '')}
                >
                  <Globe size={20} color={colors.text} />
                </Pressable>
              )}
            </View>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}><ZestCurrency amount={user?.zestBalance || 0} size="small" /></Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          {userRank && (
            <>
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}><ZestCurrency amount={userRank.totalTokensEarned || 0} size="small" /></Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <Button
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          
          <Button
            title="Invite Friends"
            onPress={handleShare}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            size="small"
            style={[styles.actionButton, styles.logoutButton]}
            textStyle={styles.logoutButtonText}
            disabled={isLoading || isLoggingOut}
          />
        </View>
      </View>
      
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'missions' && styles.activeTab]} 
          onPress={() => setActiveTab('missions')}
        >
          <Text style={[styles.tabText, activeTab === 'missions' && styles.activeTabText]}>
            Missions
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]} 
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>
            Leaderboard
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'badges' && styles.activeTab]} 
          onPress={() => setActiveTab('badges')}
        >
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
            Badges
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'impact' && styles.activeTab]} 
          onPress={() => setActiveTab('impact')}
        >
          <Text style={[styles.tabText, activeTab === 'impact' && styles.activeTabText]}>
            Impact
          </Text>
        </Pressable>
      </View>
      
      {renderTabContent()}
      
      {/* Legal Section */}
      <View style={styles.legalSection}>
        <Text style={styles.legalSectionTitle}>Legal Information</Text>
        
        <Pressable style={styles.legalItem} onPress={() => router.push('/legal/impressum')}>
          <Info size={20} color={colors.text} style={styles.legalIcon} />
          <Text style={styles.legalItemText}>Impressum</Text>
        </Pressable>
        
        <Pressable style={styles.legalItem} onPress={() => router.push('/legal/agb')}>
          <FileText size={20} color={colors.text} style={styles.legalIcon} />
          <Text style={styles.legalItemText}>Terms and Conditions</Text>
        </Pressable>
        
        <Pressable style={styles.legalItem} onPress={() => router.push('/legal/datenschutz')}>
          <Shield size={20} color={colors.text} style={styles.legalIcon} />
          <Text style={styles.legalItemText}>Privacy Policy</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  rankBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  biography: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  socialSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 24,
  },
  impactDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  badgeSection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  badgeHistoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  badgeHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badgeName: {
    fontSize: 16,
    color: colors.text,
  },
  badgeDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  legalSection: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  legalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legalIcon: {
    marginRight: 12,
  },
  legalItemText: {
    fontSize: 16,
    color: colors.text,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});