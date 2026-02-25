import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Settings, Edit3, Wallet, UserPlus, Shield, LogOut, ChevronRight, Trophy, Target, Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useBetStore } from '@/store/betStore';
import ZestCurrency from '@/components/ZestCurrency';

export default function ProfileScreen() {
  const router = useRouter();
  const { userId, logout } = useAuthStore();
  const { user, loadUser } = useUserStore();
  const { getBetsByUser } = useBetStore();

  useEffect(() => {
    if (userId) loadUser(userId);
  }, [userId, loadUser]);

  const myBets = userId ? getBetsByUser(userId) : [];
  const activeBets = myBets.filter(b => b.status === 'active' || b.status === 'waiting_result').length;

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login' as Href);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user?.avatar ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username ?? 'Spieler'}</Text>
        <Text style={styles.bio}>{user?.bio ?? 'ZestBet Spieler'}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile-edit' as Href)}>
          <Edit3 size={14} color={colors.primary} />
          <Text style={styles.editText}>Profil bearbeiten</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Trophy size={18} color={colors.primary} />
          <Text style={styles.statValue}>{user?.totalWins ?? 0}</Text>
          <Text style={styles.statLabel}>Siege</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Target size={18} color={colors.accent} />
          <Text style={styles.statValue}>{user?.totalBets ?? 0}</Text>
          <Text style={styles.statLabel}>Wetten</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Heart size={18} color={colors.charity} />
          <Text style={styles.statValue}>{user?.charityContributed ?? 0}</Text>
          <Text style={styles.statLabel}>Charity</Text>
        </View>
      </View>

      <View style={styles.walletCard}>
        <View style={styles.walletLeft}>
          <Text style={styles.walletLabel}>Dein Guthaben</Text>
          <ZestCurrency amount={user?.zestCoins ?? 0} size="large" />
        </View>
        <TouchableOpacity style={styles.walletAction} onPress={() => router.push('/wallet' as Href)}>
          <Wallet size={18} color="#000" />
          <Text style={styles.walletActionText}>Aufladen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menuSection}>
        <MenuItem icon={<Wallet size={20} color={colors.primary} />} label="Wallet & Coins" onPress={() => router.push('/wallet' as Href)} />
        <MenuItem icon={<UserPlus size={20} color={colors.accent} />} label="Freunde einladen" onPress={() => router.push('/invite' as Href)} />
        <MenuItem icon={<Shield size={20} color={colors.textSecondary} />} label="Impressum & Datenschutz" onPress={() => router.push('/legal' as Href)} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} testID="logout-button">
        <LogOut size={18} color={colors.error} />
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ZestBet v1.0 — Made with 🎯</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      {icon}
      <Text style={styles.menuLabel}>{label}</Text>
      <ChevronRight size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: 14,
  },
  username: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
  },
  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  walletCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletLeft: {
    gap: 6,
  },
  walletLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  walletAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  walletActionText: {
    color: '#000',
    fontWeight: '700' as const,
    fontSize: 14,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '25',
    marginBottom: 16,
  },
  logoutText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  version: {
    textAlign: 'center' as const,
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
});
