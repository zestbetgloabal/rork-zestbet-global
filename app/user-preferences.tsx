import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import { Brain, ChevronRight, Clock, Lightbulb, Target, Users } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

export default function UserPreferencesScreen() {
  const { user, updateUserProfile } = useUserStore();
  
  // Initialize with user preferences or defaults
  const [strategic, setStrategic] = useState(user?.prefersStrategic || 0.5);
  const [creative, setCreative] = useState(user?.prefersCreative || 0.5);
  const [social, setSocial] = useState(user?.prefersSocial || 0.5);
  const [competitive, setCompetitive] = useState(user?.prefersCompetitive || 0.5);
  const [quick, setQuick] = useState(user?.prefersQuick || 0.5);
  
  const handleSave = () => {
    updateUserProfile({
      prefersStrategic: strategic,
      prefersCreative: creative,
      prefersSocial: social,
      prefersCompetitive: competitive,
      prefersQuick: quick
    });
    
    // Go back after saving
    // In a real app, you might want to show a success message
    // or handle errors
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'AI Preferences',
          headerRight: () => (
            <Button
              title="Save"
              onPress={handleSave}
              variant="outline"
            />
          )
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Brain size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Personalize Your Experience</Text>
        </View>
        
        <Text style={styles.description}>
          Adjust these preferences to help our AI better understand your betting style and interests.
          This will improve your recommendations and personalized content.
        </Text>
        
        <View style={styles.preferencesContainer}>
          {/* Strategic Preference */}
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <Target size={20} color={colors.text} />
              <Text style={styles.preferenceTitle}>Strategic</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={strategic}
              onValueChange={setStrategic}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Less</Text>
              <Text style={styles.sliderValue}>{Math.round(strategic * 100)}%</Text>
              <Text style={styles.sliderLabel}>More</Text>
            </View>
          </View>
          
          {/* Creative Preference */}
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <Lightbulb size={20} color={colors.text} />
              <Text style={styles.preferenceTitle}>Creative</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={creative}
              onValueChange={setCreative}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Less</Text>
              <Text style={styles.sliderValue}>{Math.round(creative * 100)}%</Text>
              <Text style={styles.sliderLabel}>More</Text>
            </View>
          </View>
          
          {/* Social Preference */}
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <Users size={20} color={colors.text} />
              <Text style={styles.preferenceTitle}>Social</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={social}
              onValueChange={setSocial}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Less</Text>
              <Text style={styles.sliderValue}>{Math.round(social * 100)}%</Text>
              <Text style={styles.sliderLabel}>More</Text>
            </View>
          </View>
          
          {/* Competitive Preference */}
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <ChevronRight size={20} color={colors.text} />
              <Text style={styles.preferenceTitle}>Competitive</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={competitive}
              onValueChange={setCompetitive}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Less</Text>
              <Text style={styles.sliderValue}>{Math.round(competitive * 100)}%</Text>
              <Text style={styles.sliderLabel}>More</Text>
            </View>
          </View>
          
          {/* Quick Preference */}
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceHeader}>
              <Clock size={20} color={colors.text} />
              <Text style={styles.preferenceTitle}>Quick</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              value={quick}
              onValueChange={setQuick}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>Less</Text>
              <Text style={styles.sliderValue}>{Math.round(quick * 100)}%</Text>
              <Text style={styles.sliderLabel}>More</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How This Works</Text>
          <Text style={styles.infoText}>
            Our AI learns from your betting behavior and adjusts these preferences automatically over time.
            You can manually adjust them here to get better recommendations right away.
          </Text>
          <Text style={styles.infoText}>
            The more you use the app, the better our AI will understand your preferences.
          </Text>
        </View>
        
        <Button
          title="Save Preferences"
          onPress={handleSave}
          variant="primary"
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  preferencesContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 24,
  },
  preferenceItem: {
    marginBottom: 20,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sliderValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoContainer: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  saveButton: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
});