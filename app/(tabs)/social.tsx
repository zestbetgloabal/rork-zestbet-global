import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  ActivityIndicator,
  Keyboard,
  Platform,
  Switch,
  Alert
} from 'react-native';
import { Send, Facebook, Instagram, Video } from 'lucide-react-native';
import { useSocialStore } from '@/store/socialStore';
import SocialPostCard from '@/components/SocialPostCard';
import colors from '@/constants/colors';
import { SocialPost } from '@/types';

export default function SocialScreen() {
  const { posts, isLoading, fetchPosts, createPost, likePost, crossPostToSocialMedia } = useSocialStore();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Social media cross-posting states
  const [postToFacebook, setPostToFacebook] = useState(false);
  const [postToInstagram, setPostToInstagram] = useState(false);
  const [postToTikTok, setPostToTikTok] = useState(false);
  const [showCrossPostOptions, setShowCrossPostOptions] = useState(false);
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };
  
  const handlePost = async () => {
    if (!content.trim()) return;
    
    setIsPosting(true);
    
    try {
      // Create post in the app
      const success = await createPost(content);
      
      if (success) {
        // Cross-post to selected social media platforms
        if (postToFacebook || postToInstagram || postToTikTok) {
          const platforms = [];
          if (postToFacebook) platforms.push('facebook');
          if (postToInstagram) platforms.push('instagram');
          if (postToTikTok) platforms.push('tiktok');
          
          await crossPostToSocialMedia(content, platforms);
        }
        
        setContent('');
        setShowCrossPostOptions(false);
        setPostToFacebook(false);
        setPostToInstagram(false);
        setPostToTikTok(false);
        Keyboard.dismiss();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };
  
  const toggleCrossPostOptions = () => {
    setShowCrossPostOptions(!showCrossPostOptions);
  };
  
  const renderItem = ({ item }: { item: SocialPost }) => (
    <SocialPostCard 
      post={item} 
      onLike={() => likePost(item.id)}
    />
  );
  
  return (
    <View style={styles.container}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      
      <View style={styles.inputContainer}>
        {showCrossPostOptions && (
          <View style={styles.crossPostContainer}>
            <Text style={styles.crossPostTitle}>Cross-post to:</Text>
            
            <View style={styles.socialOption}>
              <Facebook size={20} color={postToFacebook ? colors.primary : colors.textSecondary} />
              <Text style={styles.socialOptionText}>Facebook</Text>
              <Switch
                value={postToFacebook}
                onValueChange={setPostToFacebook}
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={postToFacebook ? colors.primary : colors.card}
              />
            </View>
            
            <View style={styles.socialOption}>
              <Instagram size={20} color={postToInstagram ? colors.primary : colors.textSecondary} />
              <Text style={styles.socialOptionText}>Instagram</Text>
              <Switch
                value={postToInstagram}
                onValueChange={setPostToInstagram}
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={postToInstagram ? colors.primary : colors.card}
              />
            </View>
            
            <View style={styles.socialOption}>
              <Video size={20} color={postToTikTok ? colors.primary : colors.textSecondary} />
              <Text style={styles.socialOptionText}>TikTok</Text>
              <Switch
                value={postToTikTok}
                onValueChange={setPostToTikTok}
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={postToTikTok ? colors.primary : colors.card}
              />
            </View>
          </View>
        )}
        
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Share your betting story..."
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={280}
          />
          
          <Pressable 
            style={styles.shareButton}
            onPress={toggleCrossPostOptions}
          >
            <Text style={[
              styles.shareButtonText, 
              { color: showCrossPostOptions ? colors.primary : colors.textSecondary }
            ]}>
              {showCrossPostOptions ? 'Hide' : 'Share'}
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.sendButton,
              (!content.trim() || isPosting) && styles.disabledSendButton
            ]}
            onPress={handlePost}
            disabled={!content.trim() || isPosting}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Send size={20} color="white" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for input
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, // Extra padding for iOS
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: colors.border,
  },
  crossPostContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  crossPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  socialOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  socialOptionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
});