import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { SocialPost } from '@/types';
import colors from '@/constants/colors';

interface SocialPostCardProps {
  post: SocialPost;
  onLike?: () => void;
}

export default function SocialPostCard({ post, onLike }: SocialPostCardProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const postDate = new Date(date);
    
    // If today, show time
    if (postDate.toDateString() === now.toDateString()) {
      return formatTime(date);
    }
    
    // If this year, show month and day
    if (postDate.getFullYear() === now.getFullYear()) {
      return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    
    // Otherwise show full date
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Get avatar from either post.user?.avatar or post.userAvatar with null checks
  const avatarUrl = post.user?.avatar || post.userAvatar || null;
  
  // Get username with null checks
  const username = post.user?.username || post.username || 'Anonymous';
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {avatarUrl ? (
          <Image 
            source={{ uri: avatarUrl }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.timestamp}>{formatDate(post.timestamp)}</Text>
        </View>
      </View>
      
      <Text style={styles.content}>{post.content}</Text>
      
      <View style={styles.footer}>
        <Pressable style={styles.actionButton} onPress={onLike}>
          <Heart size={18} color={colors.textSecondary} />
          <Text style={styles.actionCount}>{post.likes}</Text>
        </Pressable>
        
        <Pressable style={styles.actionButton}>
          <MessageCircle size={18} color={colors.textSecondary} />
          <Text style={styles.actionCount}>{post.comments}</Text>
        </Pressable>
      </View>
    </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
});