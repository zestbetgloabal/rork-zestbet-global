import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LiveChallenge } from '@/types';
import colors from '@/constants/colors';
import { Clock, Users, Zap } from 'lucide-react-native';

interface LiveChallengeCardProps {
  challenge: LiveChallenge;
  onPress?: () => void;
}

export default function LiveChallengeCard({ challenge, onPress }: LiveChallengeCardProps) {
  const isActive = challenge.status === 'active';
  const isCompleted = challenge.status === 'completed';
  
  // Format duration to minutes
  const durationMinutes = Math.floor(challenge.duration / 60);
  
  // Get difficulty color
  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };
  
  return (
    <Pressable 
      style={[
        styles.container,
        isActive && styles.activeContainer,
        isCompleted && styles.completedContainer
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{challenge.title}</Text>
          {challenge.aiGenerated && (
            <View style={styles.aiTag}>
              <Zap size={12} color={colors.primary} />
              <Text style={styles.aiTagText}>AI</Text>
            </View>
          )}
        </View>
        <View 
          style={[
            styles.difficultyTag,
            { backgroundColor: `${getDifficultyColor()}20`, borderColor: getDifficultyColor() }
          ]}
        >
          <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
            {challenge.difficulty}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.infoItem}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>{durationMinutes} min</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Users size={14} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            {challenge.participants.length} {challenge.type === 'team' ? 'teams' : 'players'}
          </Text>
        </View>
        
        {isActive && (
          <View style={styles.statusTag}>
            <Text style={styles.statusText}>LIVE NOW</Text>
          </View>
        )}
        
        {isCompleted && challenge.winner && (
          <View style={styles.winnerTag}>
            <Text style={styles.winnerText}>
              Winner: {challenge.winner.username}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  completedContainer: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTagText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  statusTag: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  winnerTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  winnerText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
});