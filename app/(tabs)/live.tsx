import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useLiveEventStore } from '@/store/liveEventStore';
import LiveEventCard from '@/components/LiveEventCard';
import colors from '@/constants/colors';
import { Calendar, Sparkles, Video } from 'lucide-react-native';
import Button from '@/components/Button';

export default function LiveEventsScreen() {
  const router = useRouter();
  const { events, fetchEvents, isLoading } = useLiveEventStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };
  
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'live') return event.status === 'live';
    if (filter === 'upcoming') return event.status === 'upcoming';
    return true;
  });
  
  const liveEvents = events.filter(event => event.status === 'live');
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Challenge Fieber Live',
          headerRight: () => (
            <Button
              title="Schedule"
              onPress={() => router.push('/live-events/schedule')}
              variant="outline"
              icon={<Calendar size={18} color={colors.primary} />}
            />
          )
        }}
      />
      
      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, filter === 'live' && styles.activeFilterButton]}
          onPress={() => setFilter('live')}
        >
          <Text style={[styles.filterText, filter === 'live' && styles.activeFilterText]}>Live Now</Text>
        </Pressable>
        
        <Pressable
          style={[styles.filterButton, filter === 'upcoming' && styles.activeFilterButton]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}>Upcoming</Text>
        </Pressable>
      </View>
      
      {liveEvents.length > 0 && filter === 'all' && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Video size={20} color={colors.error} />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
            <Text style={styles.liveCount}>{liveEvents.length} live</Text>
          </View>
          
          <FlatList
            data={liveEvents}
            renderItem={({ item }) => <LiveEventCard event={item} />}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListContent}
          />
        </View>
      )}
      
      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <LiveEventCard event={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          filter === 'all' && upcomingEvents.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Calendar size={20} color={colors.text} />
                <Text style={styles.sectionTitle}>Upcoming Events</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Sparkles size={48} color={colors.primary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptyDescription}>
              {filter === 'live' 
                ? "There are no live events right now. Check back later or explore upcoming events."
                : filter === 'upcoming'
                ? "There are no upcoming events scheduled yet. Check back later."
                : "There are no events to display. Pull down to refresh."}
            </Text>
            {filter !== 'all' && (
              <Button
                title="Show All Events"
                onPress={() => setFilter('all')}
                variant="outline"
                style={styles.emptyButton}
              />
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '600',
  },
  featuredSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
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
  liveCount: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '600',
  },
  horizontalListContent: {
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 160,
  },
});