import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ImpactProject } from '@/types';
import ZestCurrency from './ZestCurrency';
import colors from '@/constants/colors';

interface ImpactProjectCardProps {
  project: ImpactProject;
}

export default function ImpactProjectCard({ project }: ImpactProjectCardProps) {
  const isFeatured = project.featured;
  
  const formatTimeRemaining = (endDate?: Date) => {
    if (!endDate) return null;
    
    const now = new Date();
    const end = new Date(endDate);
    const timeRemaining = end.getTime() - now.getTime();
    
    if (timeRemaining <= 0) return "Ending soon";
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }
  };
  
  return (
    <View style={[styles.card, isFeatured && styles.featuredCard]}>
      {project.image && (
        <Image 
          source={{ uri: project.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.name}>{project.name}</Text>
        <Text style={styles.description}>{project.description}</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Donated</Text>
          <ZestCurrency amount={project.amount} size="medium" />
        </View>
        
        {isFeatured ? (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Weekly Featured Project</Text>
          </View>
        ) : (
          <View style={styles.impactBadge}>
            <Text style={styles.impactBadgeText}>Past Project</Text>
          </View>
        )}
        
        {isFeatured && project.endDate && (
          <View style={styles.timeRemainingContainer}>
            <Text style={styles.timeRemainingText}>
              {formatTimeRemaining(project.endDate)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  impactBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  impactBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeRemainingContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  timeRemainingText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
});