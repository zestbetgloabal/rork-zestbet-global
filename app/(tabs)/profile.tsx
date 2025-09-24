import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '@/constants/colors';
import ZestCurrency from '@/components/ZestCurrency';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { user } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Profile: Starting logout process');
      
      // Call logout function - this now clears state immediately
      await logout();
      console.log('Profile: Logout function completed');
      
      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // For web, force a complete page reload to ensure all state is cleared
      if (typeof window !== 'undefined') {
        console.log('Profile: Forcing page reload for web');
        window.location.href = '/';
        return;
      }
      
      // For mobile, navigate to auth
      console.log('Profile: Navigating to auth');
      router.replace('/(auth)/register');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails, force navigation/reload
      if (typeof window !== 'undefined') {
        console.log('Profile: Error occurred, forcing page reload');
        window.location.href = '/';
        return;
      }
      
      console.log('Profile: Error occurred, forcing navigation');
      router.replace('/(auth)/register');
    } finally {
      // Reset loading state in case component doesn't unmount
      setTimeout(() => setIsLoggingOut(false), 1000);
    }
  };

  const confirmLogout = () => {
    console.log('Profile: Logout button pressed');

    if (Platform.OS === 'web') {
      try {
        const ok = typeof window !== 'undefined' ? window.confirm('Möchtest du dich wirklich abmelden?') : true;
        if (ok) {
          console.log('Profile: Web confirm accepted');
          handleLogout();
        } else {
          console.log('Profile: Web confirm cancelled');
        }
      } catch (e) {
        console.warn('Profile: Web confirm failed, proceeding with logout', e);
        handleLogout();
      }
      return;
    }

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            console.log('Profile: Logout confirmed');
            handleLogout();
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.username}>{user.username}</Text>
          
          {/* Bio Section - Always show if exists, with better styling */}
          {user.biography && user.biography.trim() !== '' && (
            <Text style={styles.bio}>{user.biography}</Text>
          )}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ZestCurrency amount={user.zestBalance} size="large" />
              <Text style={styles.statLabel}>Balance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.points}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.inviteCode}</Text>
              <Text style={styles.statLabel}>Invite Code</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/profile-edit')}
          >
            <Feather name="edit" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/wallet')}
          >
            <Feather name="credit-card" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Wallet</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/invite')}
          >
            <Feather name="users" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Invite Friends</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/user-preferences')}
          >
            <Feather name="settings" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Preferences</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/suggestion')}
          >
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Suggest Improvement</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/test-crash-prevention')}
          >
            <MaterialCommunityIcons name="bug-check" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Test Crash Prevention</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/legal')}
          >
            <FontAwesome5 name="file-contract" size={18} color={colors.primary} />
            <Text style={styles.menuItemText}>Legal Information</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/legal/datenschutz')}
            testID="privacy-link"
          >
            <Feather name="shield" size={20} color={colors.primary} />
            <Text style={styles.menuItemText}>Datenschutz</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={confirmLogout}
          disabled={isLoggingOut}
          testID="logout-button"
          accessibilityLabel="Logout"
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 24,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});