import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { ImpactProject } from '@/types';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';

interface WeeklyCharityFeatureProps {
  project: ImpactProject;
  timeRemaining: { days: number; hours: number; minutes: number } | null;
}

export default function WeeklyCharityFeature({ project, timeRemaining }: WeeklyCharityFeatureProps) {
  const router = useRouter();
  
  const handlePress = () => {
    router.push('/profile?tab=impact');
  };
  
  const formatTimeRemaining = () => {
    if (!timeRemaining) return "Ending soon";
    
    const { days, hours, minutes } = timeRemaining;
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };
  
  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Featured Charity</Text>
        <View style={styles.timeContainer}>
          <Clock size={14} color={colors.textSecondary} />
          <Text style={styles.timeText}>{formatTimeRemaining()}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        {project.image && (
          <Image 
            source={{ uri: project.image }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.projectInfo}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
          
          <View style={styles.donationInfo}>
            <Text style={styles.donationLabel}>Donated so far</Text>
            <ZestCurrency amount={project.amount} size="medium" />
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Support this week's featured charity project
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.success,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  content: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  donationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footer: {
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  footerText: {
    fontSize: 12,
    color: colors.success,
    textAlign: 'center',
    fontWeight: '500',
  },
});