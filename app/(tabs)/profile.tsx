import React, { useState, useEffect } from 'react';
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
  const { logout, isAuthenticated, token } = useAuthStore();
  const { user, setUser } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize user data if authenticated but no user data exists
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('Profile: Initializing user data', { 
          isAuthenticated, 
          hasToken: !!token, 
          hasUser: !!user,
          userUsername: user?.username 
        });
        
        if (isAuthenticated && token && !user) {
          console.log('Profile: Creating default user data');
          // Create default user data
          const defaultUser = {
            id: 'user-' + Date.now(),
            username: 'ZestBet User',
            zestBalance: 100,
            points: 0,
            inviteCode: 'ZEST' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
            biography: 'Welcome to ZestBet! Ready to make some predictions.',
            socialMedia: {
              instagram: '',
              twitter: '',
              facebook: '',
              linkedin: '',
              tiktok: '',
              youtube: '',
              pinterest: '',
              snapchat: '',
              website: ''
            },
            dailyBetAmount: 0,
            lastBetDate: new Date().toISOString().split('T')[0],
            agbConsent: true,
            privacyConsent: true,
            consentDate: new Date().toISOString()
          };
          
          setUser(defaultUser);
          console.log('Profile: Default user data created', defaultUser.username);
        } else if (user) {
          console.log('Profile: User data already exists', user.username);
        } else if (!isAuthenticated || !token) {
          console.log('Profile: User not authenticated');
        }
      } catch (error) {
        console.error('Profile: Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a small delay to ensure stores are hydrated
    const timer = setTimeout(initializeUser, 200);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, user, setUser]);

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
      
      // For mobile, navigate to auth welcome page
      console.log('Profile: Navigating to auth welcome');
      router.replace('/(auth)/welcome');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout fails, force navigation/reload
      if (typeof window !== 'undefined') {
        console.log('Profile: Error occurred, forcing page reload');
        window.location.href = '/';
        return;
      }
      
      console.log('Profile: Error occurred, forcing navigation');
      router.replace('/(auth)/welcome');
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

  // Show loading while initializing
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }
  
  // If not authenticated, show error state
  if (!isAuthenticated || !token) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  // If no user data, show error state
  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to load profile data</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setIsLoading(true);
            // Trigger re-initialization
            setTimeout(() => setIsLoading(false), 1000);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Debug Info - Remove in production */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug Info:</Text>
            <Text style={styles.debugText}>Auth: {isAuthenticated ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Token: {token ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>User: {user ? user.username : 'None'}</Text>
          </View>
        )}
        <View style={styles.header}>
          <Image 
            source={{ uri: user.avatar }} 
            style={styles.avatar}
            onError={(error) => {
              console.log('Profile: Avatar failed to load', error.nativeEvent?.error);
            }}
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  debugContainer: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  debugText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});