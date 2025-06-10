import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Mission } from '@/types';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';

interface MissionCardProps {
  mission: Mission;
  onPress?: () => void;
}

export default function MissionCard({ mission, onPress }: MissionCardProps) {
  const isCompleted = mission.status === 'completed';
  
  return (
    <Pressable 
      style={[styles.card, isCompleted && styles.completedCard]} 
      onPress={onPress}
      disabled={isCompleted}
    >
      <View style={styles.content}>
        <View style={styles.statusContainer}>
          {isCompleted ? (
            <CheckCircle2 size={24} color={colors.success} />
          ) : (
            <Circle size={24} color={colors.primary} />
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{mission.title}</Text>
          <Text style={styles.description}>{mission.description}</Text>
        </View>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <ZestCurrency amount={mission.reward} size="small" />
        </View>
      </View>
      
      {isCompleted && (
        <View style={styles.completedBanner}>
          <Text style={styles.completedText}>COMPLETED</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  completedCard: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rewardContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  rewardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  completedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.success,
    paddingVertical: 4,
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});