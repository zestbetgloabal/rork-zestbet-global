import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useMissionStore } from '@/store/missionStore';
import { useAIStore } from '@/store/aiStore';
import Button from '@/components/Button';
import MissionCard from '@/components/MissionCard';
import ZestCurrency from '@/components/ZestCurrency';
import colors from '@/constants/colors';
import { Award, Brain, Edit, Instagram, LogOut, Settings, Twitter } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const { missions, fetchMissions } = useMissionStore();
  const { recommendations, fetchRecommendations } = useAIStore();
  
  useEffect(() => {
    fetchMissions();
    fetchRecommendations('mission', 1);
  }, []);
  
  // Get active missions
  const activeMissions = missions.filter(mission => mission.status === 'open').slice(0, 3);
  const completedMissions = missions.filter(mission => mission.status === 'completed').length;
  
  const handleEditProfile = () => {
    router.push('/profile-edit');
  };
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)');
  };
  
  const handleAIPreferences = () => {
    router.push('/user-preferences');
  };
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerRight: () => (
            <Button
              title="Edit"
              onPress={handleEditProfile}
              variant="outline"
              icon={<Edit size={18} color={colors.primary} />}
            />
          )
        }}
      />
      
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.inviteCode}>Invite Code: {user?.inviteCode}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}><ZestCurrency amount={user?.zestBalance || 0} size="small" /></Text>
                <Text style={styles.statLabel}>Balance</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.points || 0}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedMissions}</Text>
                <Text style={styles.statLabel}>Missions</Text>
              </View>
            </View>
          </View>
        </View>
        
        {user?.biography && (
          <Text style={styles.biography}>{user.biography}</Text>
        )}
        
        {/* Social Media Links */}
        {(user?.socialMedia?.instagram || user?.socialMedia?.twitter || user?.socialMedia?.tiktok) && (
          <View style={styles.socialLinks}>
            {user?.socialMedia?.instagram && (
              <Pressable style={styles.socialButton}>
                <Instagram size={20} color={colors.text} />
              </Pressable>
            )}
            
            {user?.socialMedia?.twitter && (
              <Pressable style={styles.socialButton}>
                <Twitter size={20} color={colors.text} />
              </Pressable>
            )}
          </View>
        )}
      </View>
      
      {/* AI Preferences */}
      <Pressable 
        style={styles.aiPreferencesCard}
        onPress={handleAIPreferences}
      >
        <View style={styles.aiPreferencesHeader}>
          <Brain size={20} color={colors.primary} />
          <Text style={styles.aiPreferencesTitle}>AI Preferences</Text>
        </View>
        <Text style={styles.aiPreferencesDescription}>
          Customize your AI recommendations and personalize your experience
        </Text>
        <Button
          title="Adjust Preferences"
          onPress={handleAIPreferences}
          variant="outline"
          size="small"
          style={styles.aiPreferencesButton}
        />
      </Pressable>
      
      {/* Missions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Award size={20} color={colors.text} />
            <Text style={styles.sectionTitle}>Your Missions</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            {completedMissions} completed
          </Text>
        </View>
        
        {activeMissions.map(mission => (
          <MissionCard 
            key={mission.id} 
            mission={mission}
          />
        ))}
        
        {activeMissions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active missions</Text>
          </View>
        )}
      </View>
      
      {/* Settings and Logout */}
      <View style={styles.actionsContainer}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push('/legal')}
        >
          <Settings size={20} color={colors.text} />
          <Text style={styles.actionText}>Settings & Legal</Text>
        </Pressable>
        
        <Pressable 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
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
  header: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  biography: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${colors.text}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  aiPreferencesCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  aiPreferencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiPreferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  aiPreferencesDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  aiPreferencesButton: {
    alignSelf: 'flex-start',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
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
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionsContainer: {
    padding: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: `${colors.error}30`,
  },
  logoutText: {
    color: colors.error,
  },
});