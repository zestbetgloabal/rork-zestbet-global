import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { Plus, Filter } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useBetStore } from '@/store/betStore';
import { useAuthStore } from '@/store/authStore';
import BetCard from '@/components/BetCard';
import { Bet, BetStatus } from '@/types';

type FilterType = 'all' | 'mine' | 'pending' | 'active' | 'completed';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'mine', label: 'Meine' },
  { key: 'pending', label: 'Offen' },
  { key: 'active', label: 'Aktiv' },
  { key: 'completed', label: 'Fertig' },
];

export default function BetsScreen() {
  const router = useRouter();
  const { bets, fetchBets, isLoading } = useBetStore();
  const { userId } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    fetchBets();
  }, [fetchBets]);

  const onRefresh = useCallback(() => {
    fetchBets();
  }, [fetchBets]);

  const filteredBets = bets.filter((bet) => {
    switch (filter) {
      case 'mine':
        return bet.creatorId === userId || bet.opponentId === userId;
      case 'pending':
        return bet.status === 'pending';
      case 'active':
        return bet.status === 'active' || bet.status === 'waiting_result';
      case 'completed':
        return bet.status === 'completed';
      default:
        return true;
    }
  });

  const renderBet = useCallback(({ item }: { item: Bet }) => (
    <BetCard bet={item} onPress={() => router.push(`/bet/${item.id}` as Href)} />
  ), [router]);

  const renderHeader = useCallback(() => (
    <View style={styles.filtersContainer}>
      {FILTERS.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          onPress={() => setFilter(f.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  ), [filter]);

  const renderEmpty = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>Keine Wetten gefunden</Text>
      <Text style={styles.emptySub}>Erstelle eine neue Wette oder ändere den Filter.</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredBets}
        renderItem={renderBet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/propose-bet' as Href)}
        activeOpacity={0.8}
        testID="create-bet-fab"
      >
        <Plus size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  filterTextActive: {
    color: '#000',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
