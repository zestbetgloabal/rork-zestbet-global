import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Image } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Plus, Wallet, ChevronRight, Heart, Zap, Target } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useBetStore } from '@/store/betStore';
import BetCard from '@/components/BetCard';
import ZestCurrency from '@/components/ZestCurrency';

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { user, loadUser } = useUserStore();
  const { bets, fetchBets, isLoading, getBetsByUser } = useBetStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (userId) {
      loadUser(userId);
    }
    fetchBets();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [userId, loadUser, fetchBets, fadeAnim]);

  const onRefresh = useCallback(() => {
    fetchBets();
    if (userId) loadUser(userId);
  }, [fetchBets, loadUser, userId]);

  const myActiveBets = userId ? getBetsByUser(userId).filter(b => b.status === 'active' || b.status === 'waiting_result') : [];
  const openBets = bets.filter(b => b.status === 'pending');
  const totalCharity = bets.reduce((sum, b) => sum + b.charityAmount, 0);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hallo, {user?.username ?? 'Spieler'} 👋</Text>
            <Text style={styles.subGreeting}>Bereit für eine Wette?</Text>
          </View>
          <TouchableOpacity style={styles.walletButton} onPress={() => router.push('/wallet' as Href)}>
            <ZestCurrency amount={user?.zestCoins ?? 0} size="small" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Zap size={18} color={colors.primary} />
            <Text style={styles.statValue}>{myActiveBets.length}</Text>
            <Text style={styles.statLabel}>Aktive Wetten</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={18} color={colors.success} />
            <Text style={styles.statValue}>{user?.totalWins ?? 0}</Text>
            <Text style={styles.statLabel}>Gewonnen</Text>
          </View>
          <View style={styles.statCard}>
            <Heart size={18} color={colors.charity} />
            <Text style={styles.statValue}>{totalCharity}</Text>
            <Text style={styles.statLabel}>Charity</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.createBetBanner} onPress={() => router.push('/propose-bet' as Href)} activeOpacity={0.8}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerIcon}>
              <Plus size={24} color="#000" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Neue Wette erstellen</Text>
              <Text style={styles.bannerSub}>Fordere deine Freunde heraus!</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.primary} />
        </TouchableOpacity>

        {myActiveBets.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Deine aktiven Wetten</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/bets' as Href)}>
                <Text style={styles.seeAll}>Alle →</Text>
              </TouchableOpacity>
            </View>
            {myActiveBets.slice(0, 3).map((bet) => (
              <BetCard key={bet.id} bet={bet} onPress={() => router.push(`/bet/${bet.id}` as Href)} compact />
            ))}
          </View>
        ) : null}

        {openBets.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Offene Wetten 🔥</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/bets' as Href)}>
                <Text style={styles.seeAll}>Alle →</Text>
              </TouchableOpacity>
            </View>
            {openBets.slice(0, 3).map((bet) => (
              <BetCard key={bet.id} bet={bet} onPress={() => router.push(`/bet/${bet.id}` as Href)} />
            ))}
          </View>
        ) : null}

        <TouchableOpacity style={styles.inviteBanner} onPress={() => router.push('/invite' as Href)} activeOpacity={0.8}>
          <Text style={styles.inviteEmoji}>🤝</Text>
          <View style={styles.inviteTextContainer}>
            <Text style={styles.inviteTitle}>Freunde einladen</Text>
            <Text style={styles.inviteSub}>Teile deinen Code & bekomme Bonus-Coins</Text>
          </View>
          <ChevronRight size={18} color={colors.accent} />
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  walletButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  createBetBanner: {
    backgroundColor: colors.primary + '12',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    gap: 2,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
  },
  bannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  inviteBanner: {
    backgroundColor: colors.accent + '12',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  inviteEmoji: {
    fontSize: 28,
  },
  inviteTextContainer: {
    flex: 1,
    gap: 2,
  },
  inviteTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  inviteSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
