import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Filter } from 'lucide-react-native';
import { useChallengeStore } from '@/store/challengeStore';
import { useUserStore } from '@/store/userStore';
import ChallengeCard from '@/components/ChallengeCard';
import SegmentedControl from '@/components/SegmentedControl';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Challenge } from '@/types';

export default function ChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();
  const { 
    challenges, 
    userChallenges, 
    isLoading, 
    fetchChallenges, 
    fetchUserChallenges 
  } = useChallengeStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');

  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchChallenges();
    if (user?.id) {
      fetchUserChallenges(user.id);
    }
  }, [user?.id, fetchChallenges, fetchUserChallenges]);
  

  
  const handleCreateChallenge = () => {
    router.push('/create-challenge');
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Filter challenges based on active tab and status filter
  const filteredChallenges = (challenges || []).filter(challenge => {
    // Filter by tab
    if (activeTab === 'my' && !(userChallenges || []).includes(challenge.id)) {
      return false;
    }
    
    if (activeTab === 'team' && challenge.type !== 'team') {
      return false;
    }
    
    if (activeTab === 'individual' && challenge.type !== 'individual') {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== 'all' && challenge.status !== statusFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort challenges: active first, then upcoming, then completed
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    if (a.status === 'upcoming' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'upcoming') return 1;
    
    // If same status, sort by start date (newest first)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });
  
  const renderItem = ({ item }: { item: Challenge }) => (
    <ChallengeCard challenge={item} />
  );
  
  const handleSegmentChange = (index: number) => {
    setActiveTab(['all', 'my', 'team', 'individual'][index]);
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <SegmentedControl
          values={['all', 'my', 'team', 'individual']}
          selectedIndex={['all', 'my', 'team', 'individual'].indexOf(activeTab)}
          onChange={handleSegmentChange}
          labels={['All', 'My Challenges', 'Team', 'Individual']}
        />
        
        <Pressable style={styles.filterButton} onPress={toggleFilters}>
          <Filter size={20} color={colors.primary} />
        </Pressable>
      </View>
      
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersTitle}>Filter by Status</Text>
          
          <View style={styles.statusFilters}>
            <Pressable
              style={[
                styles.statusFilter,
                statusFilter === 'all' && styles.activeStatusFilter
              ]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'all' && styles.activeStatusFilterText
              ]}>
                All
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.statusFilter,
                statusFilter === 'active' && styles.activeStatusFilter
              ]}
              onPress={() => setStatusFilter('active')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'active' && styles.activeStatusFilterText
              ]}>
                Active
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.statusFilter,
                statusFilter === 'upcoming' && styles.activeStatusFilter
              ]}
              onPress={() => setStatusFilter('upcoming')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'upcoming' && styles.activeStatusFilterText
              ]}>
                Upcoming
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.statusFilter,
                statusFilter === 'completed' && styles.activeStatusFilter
              ]}
              onPress={() => setStatusFilter('completed')}
            >
              <Text style={[
                styles.statusFilterText,
                statusFilter === 'completed' && styles.activeStatusFilterText
              ]}>
                Completed
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedChallenges}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No challenges found. Try changing your filters or create a new challenge.
              </Text>
              <Button
                title="Create Challenge"
                onPress={handleCreateChallenge}
                variant="primary"
                size="medium"
                style={styles.createButton}
              />
            </View>
          }
        />
      )}
      
      <Pressable
        style={styles.fab}
        onPress={handleCreateChallenge}
      >
        <Plus size={24} color="white" />
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  filtersContainer: {
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeStatusFilter: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  statusFilterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activeStatusFilterText: {
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra space for FAB
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});