import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import colors from '@/constants/colors';
import ZestCurrency from '@/components/ZestCurrency';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, forceLogout } = useAuthStore();
  const { user } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Try normal logout first
      logout();
      
      // Give time for cleanup and navigation
      setTimeout(() => {
        setIsLoggingOut(false);
        // The navigation will be handled by the root layout
      }, 1000);
      
    } catch (error) {
      console.error('Normal logout error, trying force logout:', error);
      
      try {
        // Try force logout as fallback
        forceLogout();
        setTimeout(() => {
          setIsLoggingOut(false);
        }, 500);
      } catch (forceError) {
        console.error('Force logout error:', forceError);
        setIsLoggingOut(false);
        Alert.alert('Logout Failed', 'There was an error logging out. Please restart the app.');
      }
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: handleLogout, 
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
            onPress={() => router.push('/legal')}
          >
            <FontAwesome5 name="file-contract" size={18} color={colors.primary} />
            <Text style={styles.menuItemText}>Legal Information</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={confirmLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
        
        {/* Debug button for testing force logout */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.warning, marginTop: 8 }]} 
          onPress={() => {
            Alert.alert(
              'Force Logout',
              'This will force logout immediately. Use only if normal logout fails.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Force Logout', 
                  onPress: () => {
                    setIsLoggingOut(true);
                    forceLogout();
                    setTimeout(() => setIsLoggingOut(false), 500);
                  }, 
                  style: 'destructive' 
                }
              ]
            );
          }}
          disabled={isLoggingOut}
        >
          <Text style={styles.logoutText}>Force Logout (Debug)</Text>
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