import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useBetStore } from '@/store/betStore';
import BetCard from '@/components/BetCard';
import Button from '@/components/Button';
import SegmentedControl from '@/components/SegmentedControl';
import DemoModeIndicator from '@/components/DemoModeIndicator';
import colors from '@/constants/colors';
import { Bet } from '@/types';

export default function BetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, fetchBets, likeBet, setVisibilityFilter, getFilteredBets, visibilityFilter } = useBetStore();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchBets();
  }, [fetchBets]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBets();
    setRefreshing(false);
  };
  
  const handleFilterChange = (index: number) => {
    setVisibilityFilter(index === 0 ? 'all' : index === 1 ? 'public' : 'private');
  };
  
  const renderItem = ({ item }: { item: Bet }) => (
    <BetCard 
      bet={item} 
      onLike={() => likeBet(item.id)}
    />
  );
  
  const filteredBets = getFilteredBets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending Bets</Text>
        <Button
          title="Propose Bet"
          onPress={() => router.push('/propose-bet')}
          variant="primary"
          size="small"
          style={styles.proposeButton}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <SegmentedControl
          values={['All Bets', 'Public', 'Private']}
          selectedIndex={visibilityFilter === 'all' ? 0 : visibilityFilter === 'public' ? 1 : 2}
          onChange={handleFilterChange}
          style={styles.segmentedControl}
          tintColor={colors.primary}
        />
      </View>
      
      {!isLoading && filteredBets.length > 0 && (
        <DemoModeIndicator message="🎭 Demo Mode - Showing sample bets" />
      )}
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBets}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {visibilityFilter === 'private' 
                  ? "You don't have any private bets yet. Create one or get invited!" 
                  : "No bets found. Try a different filter or create a new bet!"}
              </Text>
            </View>
          }
        />
      )}
      
      <Pressable 
        style={styles.fabContainer}
        onPress={() => router.push('/propose-bet')}
      >
        <View style={styles.fab}>
          <Plus size={24} color="white" />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  proposeButton: {
    paddingHorizontal: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  segmentedControl: {
    height: 36,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});