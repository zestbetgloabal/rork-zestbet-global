import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LiveEvent } from '@/types';
import colors from '@/constants/colors';
import { Calendar, Clock, Users, User } from 'lucide-react-native';
import { formatDate, formatTime, getTimeRemaining, formatCompactNumber } from '@/utils/helpers';

interface LiveEventCardProps {
  event: LiveEvent;
  compact?: boolean;
}

export default function LiveEventCard({ event, compact = false }: LiveEventCardProps) {
  const router = useRouter();
  
  const isUpcoming = event.status === 'upcoming';
  const isLive = event.status === 'live';
  const isUserCreated = event.participants.some(p => p.role === 'host' && p.username !== 'ZestHost');
  
  const timeRemaining = isUpcoming ? getTimeRemaining(event.startTime) : null;
  
  const handlePress = () => {
    router.push(`/live-events/${event.id}`);
  };
  
  // Format date and time manually instead of using formatDateTime
  const formattedDateTime = (date: Date | string) => {
    return `${formatDate(date)} at ${formatTime(date)}`;
  };
  
  if (compact) {
    return (
      <Pressable 
        style={styles.compactContainer}
        onPress={handlePress}
      >
        <View style={styles.compactImageContainer}>
          <Image 
            source={{ uri: event.thumbnailUrl }} 
            style={styles.compactImage}
          />
          {isLive && <View style={styles.liveIndicator}><Text style={styles.liveText}>LIVE</Text></View>}
          {isUserCreated && (
            <View style={[styles.userCreatedIndicator, styles.compactUserCreated]}>
              <User size={12} color="white" />
            </View>
          )}
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.compactInfo}>
            {isUpcoming ? (
              <View style={styles.infoItem}>
                <Calendar size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>{formatDate(event.startTime)}</Text>
              </View>
            ) : (
              <View style={styles.infoItem}>
                <Users size={14} color={colors.textSecondary} />
                <Text style={styles.infoText}>{formatCompactNumber(event.viewerCount)} viewers</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  }
  
  return (
    <Pressable 
      style={styles.container}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: event.thumbnailUrl }} 
          style={styles.image}
        />
        {isLive && <View style={styles.liveIndicator}><Text style={styles.liveText}>LIVE</Text></View>}
        {isUserCreated && (
          <View style={styles.userCreatedIndicator}>
            <User size={14} color="white" />
            <Text style={styles.userCreatedText}>User Event</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{event.description}</Text>
        
        <View style={styles.infoContainer}>
          {isUpcoming ? (
            <>
              <View style={styles.infoItem}>
                <Calendar size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{formattedDateTime(event.startTime)}</Text>
              </View>
              
              {timeRemaining && timeRemaining.total > 0 && (
                <View style={styles.countdownContainer}>
                  <Clock size={16} color={colors.primary} />
                  <Text style={styles.countdownText}>
                    {timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}
                    {timeRemaining.hours}h {timeRemaining.minutes}m
                  </Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.infoItem}>
              <Users size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{formatCompactNumber(event.viewerCount)} viewers</Text>
            </View>
          )}
        </View>
        
        {event.fundingGoal && (
          <View style={styles.fundingContainer}>
            <View style={styles.fundingBar}>
              <View 
                style={[
                  styles.fundingProgress, 
                  { width: `${event.fundingGoal && event.fundingGoal > 0 ? Math.min(100, (((event.fundingRaised ?? 0) / event.fundingGoal) * 100)) : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.fundingText}>
              {`${event.fundingRaised ?? 0} of ${event.fundingGoal ?? 0} raised`}
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
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  countdownText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  fundingContainer: {
    marginTop: 4,
  },
  fundingBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  fundingProgress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  fundingText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 72,
  },
  compactImageContainer: {
    position: 'relative',
    width: 72,
    height: '100%',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  compactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCreatedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCreatedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    marginLeft: 4,
  },
  compactUserCreated: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
});