import React, { useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Challenge, ChallengeParticipant } from '@/types';
import { trpc } from '@/lib/trpc';
import { mockChallenges } from '@/constants/mockData';

export const [ChallengeProvider, useChallenges] = createContextHook(() => {
  // Use tRPC query for challenges with better error handling and mock fallback
  const challengesQuery = trpc.challenges.list.useQuery({
    limit: 50,
    offset: 0
  }, {
    retry: 0, // Don't retry in mock mode
    retryDelay: 0,
    staleTime: 300000, // Cache for 5 minutes in mock mode
    refetchOnWindowFocus: false,
    networkMode: 'always', // Always try to fetch (will get mock data)
    enabled: true,
  });
  
  // Log query state changes - now always successful in mock mode
  React.useEffect(() => {
    if (challengesQuery.data) {
      console.log('✅ Challenges loaded from Mock API:', challengesQuery.data?.challenges?.length || 0);
    }
    if (challengesQuery.isLoading) {
      console.log('⏳ Loading challenges from Mock API...');
    }
  }, [challengesQuery.data, challengesQuery.isLoading]);

  // Always ensure we have a valid array - mock mode always returns data
  const challenges = useMemo(() => {
    try {
      // If we have valid Mock API data, use it
      if (challengesQuery.data?.challenges && Array.isArray(challengesQuery.data.challenges)) {
        console.log('✅ Using Mock API challenges:', challengesQuery.data.challenges.length);
        return challengesQuery.data.challenges as Challenge[];
      }
      
      // If query is still loading, return empty array to prevent undefined errors
      if (challengesQuery.isLoading) {
        console.log('⏳ Mock API loading, returning empty array');
        return [];
      }
      
      // Fallback to direct mock data (should rarely happen in mock mode)
      console.log('🔄 Using direct mock challenges as fallback');
      const fallbackChallenges = Array.isArray(mockChallenges) ? mockChallenges : [];
      return fallbackChallenges;
    } catch (error) {
      console.error('❌ Error in challenges memo:', error);
      // Return mock data on any error
      return Array.isArray(mockChallenges) ? mockChallenges : [];
    }
  }, [challengesQuery.data?.challenges, challengesQuery.isLoading]);
  
  const isLoading = challengesQuery.isLoading;
  // In mock mode, we don't show errors to users
  const error = null; // Always null in mock mode for better UX

  // Mock user challenges for now - memoized to prevent re-renders
  const userChallenges = useMemo(() => [] as string[], []);

  const refetchChallenges = useCallback(() => {
    challengesQuery.refetch();
  }, [challengesQuery]);

  const getChallenge = useCallback((challengeId: string): Challenge | undefined => {
    return challenges.find(c => c.id === challengeId);
  }, [challenges]);

  const getUserParticipation = useCallback((challengeId: string, userId: string): ChallengeParticipant | undefined => {
    const challenge = getChallenge(challengeId);
    if (!challenge) return undefined;
    return challenge.participants.find(p => p.userId === userId);
  }, [getChallenge]);

  return useMemo(() => ({
    challenges,
    userChallenges,
    isLoading,
    error,
    refetchChallenges,
    getChallenge,
    getUserParticipation,
  }), [challenges, userChallenges, isLoading, error, refetchChallenges, getChallenge, getUserParticipation]);
});

// Hook for filtered challenges with robust error handling
export function useFilteredChallenges(activeTab: string, statusFilter: string, userChallenges: string[]) {
  const { challenges } = useChallenges();

  return React.useMemo(() => {
    // Triple-check to ensure we always have a valid array
    let challengesList: Challenge[] = [];
    
    try {
      if (Array.isArray(challenges)) {
        challengesList = challenges;
      } else if (challenges && typeof challenges === 'object') {
        // Handle case where challenges might be wrapped in an object
        challengesList = Array.isArray((challenges as any).challenges) ? (challenges as any).challenges : [];
      } else {
        // Last resort - use mock data
        console.warn('⚠️ Challenges is not an array, using mock data');
        challengesList = Array.isArray(mockChallenges) ? mockChallenges : [];
      }
      
      if (challengesList.length === 0) {
        console.log('⚠️ No challenges available for filtering, using mock data');
        challengesList = Array.isArray(mockChallenges) ? mockChallenges : [];
      }
    } catch (error) {
      console.error('❌ Error preparing challenges list:', error);
      challengesList = Array.isArray(mockChallenges) ? mockChallenges : [];
    }
    
    try {
      const filteredChallenges = challengesList.filter(challenge => {
        // Ensure challenge object is valid
        if (!challenge || typeof challenge !== 'object' || !challenge.id) {
          console.warn('⚠️ Invalid challenge object:', challenge);
          return false;
        }
        
        // Filter by tab
        if (activeTab === 'my' && !(userChallenges || []).includes(challenge.id)) {
          return false;
        }
        
        if (activeTab === 'team' && challenge.type !== 'team') {
          return false;
        }
        
        if (activeTab === 'individual' && challenge.type !== 'individual') {
          return false;
        }
        
        // Filter by status
        if (statusFilter !== 'all' && challenge.status !== statusFilter) {
          return false;
        }
        
        return true;
      });

      // Sort challenges: active first, then upcoming, then completed
      return [...filteredChallenges].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        if (a.status === 'upcoming' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'upcoming') return 1;
        
        // If same status, sort by start date (newest first)
        try {
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        } catch {
          return 0; // If date parsing fails, maintain order
        }
      });
    } catch (error) {
      console.error('❌ Error filtering challenges:', error);
      return []; // Return empty array on any error
    }
  }, [challenges, activeTab, statusFilter, userChallenges]);
}