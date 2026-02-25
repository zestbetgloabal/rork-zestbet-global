import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ShoppingCart, ArrowDownLeft, ArrowUpRight, Heart, Gift, RefreshCw } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import ZestCurrency from '@/components/ZestCurrency';
import { useUserStore } from '@/store/userStore';
import { useBetStore } from '@/store/betStore';
import { useAuthStore } from '@/store/authStore';
import { coinPackages } from '@/constants/mockData';
import { WalletTransaction, CoinPackage } from '@/types';
import { formatDate } from '@/utils/helpers';

export default function WalletScreen() {
  const router = useRouter();
  const { user, addCoins } = useUserStore();
  const { userId } = useAuthStore();
  const { transactions } = useBetStore();

  const myTransactions = transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handlePurchase = useCallback((pkg: CoinPackage) => {
    Alert.alert(
      `${pkg.name} Paket kaufen?`,
      `${pkg.coins + pkg.bonus} Zest-Coins für ${pkg.price.toFixed(2)}€${pkg.bonus > 0 ? ` (inkl. ${pkg.bonus} Bonus!)` : ''}`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Kaufen',
          onPress: () => {
            addCoins(pkg.coins + pkg.bonus);
            Alert.alert('Gekauft! 🎉', `${pkg.coins + pkg.bonus} Zest-Coins hinzugefügt!`);
          },
        },
      ]
    );
  }, [addCoins]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ShoppingCart size={16} color={colors.success} />;
      case 'bet_won': return <ArrowDownLeft size={16} color={colors.success} />;
      case 'bet_placed':
      case 'bet_lost': return <ArrowUpRight size={16} color={colors.error} />;
      case 'charity': return <Heart size={16} color={colors.charity} />;
      case 'bonus': return <Gift size={16} color={colors.primary} />;
      case 'refund': return <RefreshCw size={16} color={colors.accent} />;
      default: return <ArrowDownLeft size={16} color={colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Wallet' }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Dein Guthaben</Text>
          <ZestCurrency amount={user?.zestCoins ?? 0} size="large" />
          <Text style={styles.balanceSub}>
            {user?.charityContributed ?? 0} 🪙 an Charity gespendet 💜
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Coins kaufen</Text>
        <View style={styles.packagesGrid}>
          {coinPackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}
              onPress={() => handlePurchase(pkg)}
              activeOpacity={0.7}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Beliebt</Text>
                </View>
              )}
              <Text style={styles.packageEmoji}>🪙</Text>
              <Text style={styles.packageCoins}>{pkg.coins}</Text>
              {pkg.bonus > 0 && (
                <Text style={styles.packageBonus}>+{pkg.bonus} Bonus</Text>
              )}
              <Text style={styles.packageName}>{pkg.name}</Text>
              <View style={styles.packagePriceTag}>
                <Text style={styles.packagePrice}>{pkg.price.toFixed(2)}€</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Transaktionen</Text>
        {myTransactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Text style={styles.emptyText}>Noch keine Transaktionen</Text>
          </View>
        ) : (
          myTransactions.slice(0, 20).map((tx) => (
            <View key={tx.id} style={styles.transactionRow}>
              <View style={styles.txIconContainer}>
                {getTransactionIcon(tx.type)}
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDescription} numberOfLines={1}>{tx.description}</Text>
                <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount >= 0 ? colors.success : colors.error }]}>
                {tx.amount >= 0 ? '+' : ''}{tx.amount}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  balanceSub: {
    fontSize: 12,
    color: colors.charity,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 14,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  packageCard: {
    width: '48%' as unknown as number,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    flexGrow: 1,
    flexBasis: '47%' as unknown as number,
  },
  packageCardPopular: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 10,
  },
  popularText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700' as const,
  },
  packageEmoji: {
    fontSize: 28,
  },
  packageCoins: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.zest,
  },
  packageBonus: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.success,
    backgroundColor: colors.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  packageName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  packagePriceTag: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.text,
  },
  emptyTransactions: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  txDate: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
