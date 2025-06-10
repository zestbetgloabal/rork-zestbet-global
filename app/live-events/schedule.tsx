import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Stack } from 'expo-router';
import { useLiveEventStore } from '@/store/liveEventStore';
import LiveEventCard from '@/components/LiveEventCard';
import colors from '@/constants/colors';
import { Calendar, Sparkles } from 'lucide-react-native';
import Button from '@/components/Button';
import { LiveEvent } from '@/types';

// Define the type for grouped events
interface GroupedEvents {
  [date: string]: LiveEvent[];
}

// Define the type for date section
interface DateSection {
  date: string;
  events: LiveEvent[];
}

export default function ScheduleScreen() {
  const { events, fetchEvents, isLoading } = useLiveEventStore();
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };
  
  // Only show upcoming events
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  
  // Group events by date
  const groupedEvents: GroupedEvents = upcomingEvents.reduce((groups, event) => {
    const date = new Date(event.startTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as GroupedEvents);
  
  // Convert to array for FlatList
  const eventsByDate: DateSection[] = Object.keys(groupedEvents).map(date => ({
    date,
    events: groupedEvents[date]
  }));
  
  const renderDateSection = ({ item }: { item: DateSection }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateHeader}>{item.date}</Text>
      {item.events.map((event: LiveEvent) => (
        <LiveEventCard key={event.id} event={event} />
      ))}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Upcoming Events',
          headerBackTitle: 'Back',
        }}
      />
      
      <FlatList
        data={eventsByDate}
        renderItem={renderDateSection}
        keyExtractor={item => item.date}
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
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Calendar size={24} color={colors.primary} />
            </View>
            <Text style={styles.headerTitle}>Challenge Fieber Live Schedule</Text>
            <Text style={styles.headerDescription}>
              Check out our upcoming live events and mark your calendar!
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Sparkles size={48} color={colors.primary} />
            <Text style={styles.emptyTitle}>No upcoming events</Text>
            <Text style={styles.emptyDescription}>
              There are no events scheduled at the moment. Check back later for new events.
            </Text>
            <Button
              title="Refresh"
              onPress={handleRefresh}
              variant="outline"
              style={styles.emptyButton}
            />
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
  header: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
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
    minWidth: 120,
  },
});