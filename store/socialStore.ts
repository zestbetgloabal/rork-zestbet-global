import { create } from 'zustand';
import { SocialPost } from '@/types';
import { mockSocialPosts } from '@/constants/mockData';
import { Alert } from 'react-native';

interface SocialState {
  posts: SocialPost[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  createPost: (content: string) => Promise<boolean>;
  likePost: (postId: string) => void;
  crossPostToSocialMedia: (content: string, platforms: string[]) => Promise<boolean>;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add user field to each post for compatibility with SocialPostCard
      const postsWithUserField = mockSocialPosts.map(post => ({
        ...post,
        user: {
          id: post.userId,
          username: post.username,
          avatar: post.userAvatar
        }
      }));
      
      set({ posts: postsWithUserField, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch social posts', isLoading: false });
    }
  },
  createPost: async (content: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPost: SocialPost = {
        id: `${Date.now()}`,
        userId: 'user123',
        username: 'zest_user',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww',
        content,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        user: {
          id: 'user123',
          username: 'zest_user',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXZhdGFyfGVufDB8fDB8fHww'
        }
      };
      
      set((state) => ({
        posts: [newPost, ...state.posts],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Failed to create post', isLoading: false });
      return false;
    }
  },
  likePost: (postId: string) => {
    set((state) => ({
      posts: state.posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 } 
          : post
      )
    }));
  },
  crossPostToSocialMedia: async (content: string, platforms: string[]) => {
    try {
      // In a real app, this would make API calls to each platform's API
      // For now, we'll simulate the API calls with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log which platforms we're posting to
      console.log(`Cross-posting to: ${platforms.join(', ')}`);
      
      // In a real implementation, you would:
      // 1. Check if the user has authenticated with each platform
      // 2. Use each platform's SDK or API to post the content
      // 3. Handle success/failure for each platform
      
      // For demonstration purposes, we'll show a success message
      if (platforms.length > 0) {
        Alert.alert(
          'Cross-Posted Successfully',
          `Your post has been shared on ${platforms.join(', ')}.`,
          [{ text: 'OK' }]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error cross-posting:', error);
      Alert.alert(
        'Cross-Posting Failed',
        'There was an error sharing your post to other platforms. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }
}));