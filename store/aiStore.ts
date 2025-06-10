import { create } from 'zustand';
import { AIRecommendation, Bet, Mission, User } from '@/types';
import { mockBets, mockMissions } from '@/constants/mockData';

interface AIState {
  recommendations: AIRecommendation[];
  isLoading: boolean;
  error: string | null;
  fetchRecommendations: (type: 'bet' | 'mission' | 'friend', limit?: number) => Promise<void>;
  markRecommendationShown: (id: string) => Promise<void>;
  markRecommendationClicked: (id: string) => Promise<void>;
  trackUserBehavior: (
    behaviorType: string, 
    value?: number, 
    relatedBetId?: string, 
    relatedMissionId?: string
  ) => Promise<void>;
  getPersonalizedBets: (limit?: number) => Promise<Bet[]>;
  getPersonalizedMissions: (limit?: number) => Promise<Mission[]>;
  getSimilarUsers: (limit?: number) => Promise<User[]>;
}

export const useAIStore = create<AIState>((set, get) => ({
  recommendations: [],
  isLoading: false,
  error: null,
  
  fetchRecommendations: async (type = 'bet', limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock recommendations based on type
      let recommendations: AIRecommendation[] = [];
      
      if (type === 'bet') {
        // Get random bets as recommendations
        const randomBets = [...mockBets]
          .sort(() => 0.5 - Math.random())
          .slice(0, limit);
        
        recommendations = randomBets.map(bet => ({
          id: `rec_${bet.id}`,
          type: 'bet',
          score: Math.random() * 0.5 + 0.5, // Score between 0.5 and 1.0
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isShown: false,
          isClicked: false,
          relatedBet: bet,
          relatedMission: null,
          relatedUser: null
        }));
      } else if (type === 'mission') {
        // Get random missions as recommendations
        const randomMissions = [...mockMissions]
          .filter(mission => mission.status === 'open')
          .sort(() => 0.5 - Math.random())
          .slice(0, limit);
        
        recommendations = randomMissions.map(mission => ({
          id: `rec_${mission.id}`,
          type: 'mission',
          score: Math.random() * 0.3 + 0.7, // Score between 0.7 and 1.0
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isShown: false,
          isClicked: false,
          relatedBet: null,
          relatedMission: mission,
          relatedUser: null
        }));
      } else if (type === 'friend') {
        // Mock friend recommendations
        recommendations = Array(limit).fill(0).map((_, i) => ({
          id: `rec_friend_${i}`,
          type: 'friend',
          score: Math.random() * 0.4 + 0.6, // Score between 0.6 and 1.0
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          isShown: false,
          isClicked: false,
          relatedBet: null,
          relatedMission: null,
          relatedUser: {
            id: `user_${i}`,
            username: `user_${i}`,
            avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
            zestBalance: Math.floor(Math.random() * 1000),
            points: Math.floor(Math.random() * 500),
            inviteCode: `ZEST${Math.floor(Math.random() * 10000)}`
          }
        }));
      }
      
      set({ 
        recommendations: [...recommendations], 
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch recommendations', isLoading: false });
    }
  },
  
  markRecommendationShown: async (id: string) => {
    set(state => ({
      recommendations: state.recommendations.map(rec => 
        rec.id === id ? { ...rec, isShown: true } : rec
      )
    }));
    
    // In a real app, this would be an API call to update the server
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to mark recommendation as shown:', error);
    }
  },
  
  markRecommendationClicked: async (id: string) => {
    set(state => ({
      recommendations: state.recommendations.map(rec => 
        rec.id === id ? { ...rec, isClicked: true } : rec
      )
    }));
    
    // In a real app, this would be an API call to update the server
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to mark recommendation as clicked:', error);
    }
  },
  
  trackUserBehavior: async (behaviorType, value = 1, relatedBetId, relatedMissionId) => {
    // In a real app, this would be an API call to track user behavior
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Tracked behavior:', {
        behaviorType,
        value,
        relatedBetId,
        relatedMissionId
      });
    } catch (error) {
      console.error('Failed to track user behavior:', error);
    }
  },
  
  getPersonalizedBets: async (limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, just return random bets
      const personalizedBets = [...mockBets]
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
      
      set({ isLoading: false });
      return personalizedBets;
    } catch (error) {
      set({ error: 'Failed to fetch personalized bets', isLoading: false });
      return [];
    }
  },
  
  getPersonalizedMissions: async (limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, just return random open missions
      const personalizedMissions = [...mockMissions]
        .filter(mission => mission.status === 'open')
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
      
      set({ isLoading: false });
      return personalizedMissions;
    } catch (error) {
      set({ error: 'Failed to fetch personalized missions', isLoading: false });
      return [];
    }
  },
  
  getSimilarUsers: async (limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock similar users
      const similarUsers: User[] = Array(limit).fill(0).map((_, i) => ({
        id: `user_${i}`,
        username: `similar_user_${i}`,
        avatar: `https://i.pravatar.cc/150?img=${i + 20}`,
        zestBalance: Math.floor(Math.random() * 1000),
        points: Math.floor(Math.random() * 500),
        inviteCode: `ZEST${Math.floor(Math.random() * 10000)}`
      }));
      
      set({ isLoading: false });
      return similarUsers;
    } catch (error) {
      set({ error: 'Failed to fetch similar users', isLoading: false });
      return [];
    }
  }
}));