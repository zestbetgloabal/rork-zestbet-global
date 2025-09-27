import React, { useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Challenge, ChallengeParticipant } from '@/types';
import { trpc } from '@/lib/trpc';
import { mockChallenges } from '@/constants/mockData';

export const [ChallengeProvider, useChallenges] = createContextHook(() => {
  // Use tRPC query for challenges
  const challengesQuery = trpc.challenges.list.useQuery({
    limit: 50,
    offset: 0
  }, {
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fallback to mock data if API fails
  const challenges = useMemo(() => {
    return (challengesQuery.data?.challenges as Challenge[]) || mockChallenges;
  }, [challengesQuery.data?.challenges]);
  
  const isLoading = challengesQuery.isLoading;
  const error = challengesQuery.error?.message || null;

  // Mock user challenges for now
  const userChallenges: string[] = [];

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

// Hook for filtered challenges
export function useFilteredChallenges(activeTab: string, statusFilter: string, userChallenges: string[]) {
  const { challenges } = useChallenges();

  return React.useMemo(() => {
    const filteredChallenges = (challenges || []).filter(challenge => {
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
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [challenges, activeTab, statusFilter, userChallenges]);
}