import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useAIStore } from '@/store/aiStore';
import AIRecommendationCard from '@/components/AIRecommendationCard';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Brain, RefreshCw } from 'lucide-react-native';
import SegmentedControl from '@/components/SegmentedControl';

export default function AIRecommendationsScreen() {
  const router = useRouter();
  const { recommendations, fetchRecommendations, isLoading } = useAIStore();
  const [activeTab, setActiveTab] = useState<'bet' | 'mission' | 'friend'>('bet');
  
  useEffect(() => {
    fetchRecommendations(activeTab, 10);
  }, [activeTab]);
  
  const handleRefresh = () => {
    fetchRecommendations(activeTab, 10);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'AI Recommendations',
          headerRight: () => (
            <Button
              title="Refresh"
              onPress={handleRefresh}
              variant="outline"
              icon={<RefreshCw size={18} color={colors.primary} />}
            />
          )
        }}
      />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Brain size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Personalized For You</Text>
        </View>
        <Text style={styles.headerDescription}>
          Discover bets, missions, and people that match your interests and playing style.
        </Text>
      </View>
      
      <SegmentedControl
        values={['Bets', 'Missions', 'People']}
        selectedIndex={activeTab === 'bet' ? 0 : activeTab === 'mission' ? 1 : 2}
        onChange={(index) => {
          const selectedIndex = typeof index === 'number' ? index : index.nativeEvent.selectedSegmentIndex;
          setActiveTab(selectedIndex === 0 ? 'bet' : selectedIndex === 1 ? 'mission' : 'friend');
        }}
        style={styles.segmentedControl}
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding the best recommendations for you...</Text>
        </View>
      ) : recommendations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recommendations available.</Text>
          <Text style={styles.emptySubtext}>Try refreshing or check back later.</Text>
          <Button
            title="Refresh"
            onPress={handleRefresh}
            variant="primary"
            style={styles.refreshButton}
          />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {recommendations.map(recommendation => (
            <AIRecommendationCard 
              key={recommendation.id} 
              recommendation={recommendation} 
            />
          ))}
        </ScrollView>
      )}
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
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  segmentedControl: {
    margin: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    minWidth: 120,
  },
});