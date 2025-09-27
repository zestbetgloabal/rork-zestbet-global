import { create } from 'zustand';
import { Challenge, ChallengeParticipant, ChallengePool, ChallengeTeam, PoolContribution } from '@/types';
import { mockChallenges } from '@/constants/mockData';
import { Alert } from 'react-native';
import { trpc } from '@/lib/trpc';

interface ChallengeState {
  challenges: Challenge[];
  userChallenges: string[]; // IDs of challenges the user is participating in
  isLoading: boolean;
  error: string | null;
  fetchChallenges: () => Promise<void>;
  fetchUserChallenges: (userId: string) => Promise<void>;
  createChallenge: (challenge: Partial<Challenge>) => Promise<string | null>;
  joinChallenge: (challengeId: string, userId: string, contribution?: number) => Promise<boolean>;
  leaveChallenge: (challengeId: string, userId: string) => Promise<boolean>;
  updateChallengeScore: (challengeId: string, userId: string, score: number) => Promise<boolean>;
  contributeToPool: (challengeId: string, userId: string, username: string, amount: number) => Promise<boolean>;
  distributePoolRewards: (challengeId: string) => Promise<boolean>;
  createTeam: (challengeId: string, name: string, creatorId: string) => Promise<string | null>;
  joinTeam: (challengeId: string, teamId: string, userId: string) => Promise<boolean>;
  leaveTeam: (challengeId: string, teamId: string, userId: string) => Promise<boolean>;
  updateTeamScore: (challengeId: string, teamId: string, score: number) => Promise<boolean>;
  getChallenge: (challengeId: string) => Challenge | undefined;
  getUserParticipation: (challengeId: string, userId: string) => ChallengeParticipant | undefined;
  reset: () => void;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  userChallenges: [],
  isLoading: false,
  error: null,
  
  fetchChallenges: async () => {
    set({ isLoading: true, error: null });
    try {
      // Try to fetch from API first, fallback to mock data
      try {
        // This would use tRPC in a real implementation
        // const result = await trpc.challenges.list.query({});
        // set({ challenges: result.challenges, isLoading: false });
        
        // For now, use mock data with a delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        set({ challenges: mockChallenges, isLoading: false });
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
        // Fallback to mock data
        set({ challenges: mockChallenges, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
      set({ error: 'Failed to fetch challenges', isLoading: false });
    }
  },
  
  fetchUserChallenges: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find challenges where the user is a participant
      const userChallengeIds = mockChallenges
        .filter(challenge => 
          challenge.participants.some(participant => participant.userId === userId)
        )
        .map(challenge => challenge.id);
      
      set({ userChallenges: userChallengeIds, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch user challenges', isLoading: false });
    }
  },
  
  createChallenge: async (challenge: Partial<Challenge>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newChallengeId = `challenge_${Date.now()}`;
      
      // Create a new challenge with default values for missing fields
      const newChallenge: Challenge = {
        id: newChallengeId,
        title: challenge.title || 'New Challenge',
        description: challenge.description || 'No description provided',
        creator: challenge.creator || 'unknown',
        startDate: challenge.startDate || new Date(),
        endDate: challenge.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        category: challenge.category || 'other',
        image: challenge.image,
        status: challenge.status || 'upcoming',
        participants: challenge.participants || [],
        type: challenge.type || 'individual',
        visibility: challenge.visibility || 'public',
        invitedFriends: challenge.invitedFriends,
        hasPool: challenge.hasPool || false,
        pool: challenge.pool,
        teams: challenge.teams || []
      };
      
      // If the challenge has a pool, initialize it
      if (newChallenge.hasPool && !newChallenge.pool) {
        newChallenge.pool = {
          id: `pool_${Date.now()}`,
          challengeId: newChallengeId,
          totalAmount: 0,
          minContribution: challenge.pool?.minContribution || 10,
          maxContribution: challenge.pool?.maxContribution || 1000,
          distributionStrategy: challenge.pool?.distributionStrategy || 'standard',
          customDistribution: challenge.pool?.customDistribution,
          contributions: [],
          isDistributed: false
        };
      }
      
      set(state => ({
        challenges: [...state.challenges, newChallenge],
        isLoading: false
      }));
      
      return newChallengeId;
    } catch (error) {
      set({ error: 'Failed to create challenge', isLoading: false });
      return null;
    }
  },
  
  joinChallenge: async (challengeId: string, userId: string, contribution?: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if user is already a participant
      if (challenge.participants.some(p => p.userId === userId)) {
        throw new Error('User is already a participant');
      }
      
      // Create a new participant
      const newParticipant: ChallengeParticipant = {
        id: `participant_${Date.now()}`,
        userId,
        username: 'User', // In a real app, you would get the username from the user object
        joinedAt: new Date(),
        score: 0,
        contribution: contribution || 0
      };
      
      // If there's a contribution, add it to the pool
      if (contribution && contribution > 0 && challenge.hasPool && challenge.pool) {
        // Check if contribution is within limits
        if (contribution < challenge.pool.minContribution) {
          throw new Error(`Minimum contribution is ${challenge.pool.minContribution}`);
        }
        
        if (contribution > challenge.pool.maxContribution) {
          throw new Error(`Maximum contribution is ${challenge.pool.maxContribution}`);
        }
        
        // Add the contribution to the pool
        const newContribution: PoolContribution = {
          id: `contribution_${Date.now()}`,
          userId,
          username: 'User', // In a real app, you would get the username from the user object
          amount: contribution,
          timestamp: new Date()
        };
        
        // Update the pool
        const updatedPool: ChallengePool = {
          ...challenge.pool,
          totalAmount: challenge.pool.totalAmount + contribution,
          contributions: [...challenge.pool.contributions, newContribution]
        };
        
        // Update the challenge with the new participant and updated pool
        const updatedChallenge: Challenge = {
          ...challenge,
          participants: [...challenge.participants, newParticipant],
          pool: updatedPool
        };
        
        // Update the challenges array
        const updatedChallenges = [...challenges];
        updatedChallenges[challengeIndex] = updatedChallenge;
        
        set(state => ({
          challenges: updatedChallenges,
          userChallenges: [...state.userChallenges, challengeId],
          isLoading: false
        }));
      } else {
        // Update the challenge with the new participant
        const updatedChallenge: Challenge = {
          ...challenge,
          participants: [...challenge.participants, newParticipant]
        };
        
        // Update the challenges array
        const updatedChallenges = [...challenges];
        updatedChallenges[challengeIndex] = updatedChallenge;
        
        set(state => ({
          challenges: updatedChallenges,
          userChallenges: [...state.userChallenges, challengeId],
          isLoading: false
        }));
      }
      
      return true;
    } catch (error) {
      set({ error: 'Failed to join challenge', isLoading: false });
      return false;
    }
  },
  
  leaveChallenge: async (challengeId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if user is a participant
      const participantIndex = challenge.participants.findIndex(p => p.userId === userId);
      
      if (participantIndex === -1) {
        throw new Error('User is not a participant');
      }
      
      // Check if the challenge has already started
      if (challenge.status === 'active') {
        throw new Error('Cannot leave an active challenge');
      }
      
      // Remove the participant
      const updatedParticipants = [...challenge.participants];
      updatedParticipants.splice(participantIndex, 1);
      
      // If there's a pool, remove the user's contribution
      let updatedPool = challenge.pool;
      
      if (challenge.hasPool && challenge.pool) {
        // Find the user's contribution
        const contributionIndex = challenge.pool.contributions.findIndex(c => c.userId === userId);
        
        if (contributionIndex !== -1) {
          const contribution = challenge.pool.contributions[contributionIndex];
          
          // Update the pool
          const updatedContributions = [...challenge.pool.contributions];
          updatedContributions.splice(contributionIndex, 1);
          
          updatedPool = {
            ...challenge.pool,
            totalAmount: challenge.pool.totalAmount - contribution.amount,
            contributions: updatedContributions
          };
        }
      }
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        participants: updatedParticipants,
        pool: updatedPool
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set(state => ({
        challenges: updatedChallenges,
        userChallenges: state.userChallenges.filter(id => id !== challengeId),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Failed to leave challenge', isLoading: false });
      return false;
    }
  },
  
  updateChallengeScore: async (challengeId: string, userId: string, score: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if user is a participant
      const participantIndex = challenge.participants.findIndex(p => p.userId === userId);
      
      if (participantIndex === -1) {
        throw new Error('User is not a participant');
      }
      
      // Update the participant's score
      const updatedParticipants = [...challenge.participants];
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        score
      };
      
      // Recalculate ranks for all participants
      const sortedParticipants = [...updatedParticipants]
        .sort((a, b) => (b.score || 0) - (a.score || 0));
      
      sortedParticipants.forEach((participant, index) => {
        participant.rank = index + 1;
      });
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        participants: sortedParticipants
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update challenge score', isLoading: false });
      return false;
    }
  },
  
  contributeToPool: async (challengeId: string, userId: string, username: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if the challenge has a pool
      if (!challenge.hasPool || !challenge.pool) {
        throw new Error('Challenge does not have a pool');
      }
      
      // Check if the contribution is within limits
      if (amount < challenge.pool.minContribution) {
        throw new Error(`Minimum contribution is ${challenge.pool.minContribution}`);
      }
      
      if (amount > challenge.pool.maxContribution) {
        throw new Error(`Maximum contribution is ${challenge.pool.maxContribution}`);
      }
      
      // Create a new contribution
      const newContribution: PoolContribution = {
        id: `contribution_${Date.now()}`,
        userId,
        username,
        amount,
        timestamp: new Date()
      };
      
      // Update the pool
      const updatedPool: ChallengePool = {
        ...challenge.pool,
        totalAmount: challenge.pool.totalAmount + amount,
        contributions: [...challenge.pool.contributions, newContribution]
      };
      
      // Update the participant's contribution amount
      const updatedParticipants = [...challenge.participants];
      const participantIndex = updatedParticipants.findIndex(p => p.userId === userId);
      
      if (participantIndex !== -1) {
        updatedParticipants[participantIndex] = {
          ...updatedParticipants[participantIndex],
          contribution: (updatedParticipants[participantIndex].contribution || 0) + amount
        };
      }
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        pool: updatedPool,
        participants: updatedParticipants
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ error: 'Failed to contribute to pool', isLoading: false });
      return false;
    }
  },
  
  distributePoolRewards: async (challengeId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if the challenge has a pool
      if (!challenge.hasPool || !challenge.pool) {
        throw new Error('Challenge does not have a pool');
      }
      
      // Check if the pool has already been distributed
      if (challenge.pool.isDistributed) {
        throw new Error('Pool has already been distributed');
      }
      
      // Check if the challenge has ended
      if (challenge.status !== 'completed') {
        throw new Error('Challenge has not ended yet');
      }
      
      // Calculate the rewards
      const totalAmount = challenge.pool.totalAmount;
      let rewards: { userId: string; amount: number }[] = [];
      
      if (challenge.type === 'individual') {
        // Individual challenge
        if (challenge.pool.distributionStrategy === 'standard') {
          // Standard distribution: 80% to winners, 10% to participants, 10% to platform
          const winnerAmount = totalAmount * 0.8;
          const participationAmount = totalAmount * 0.1;
          const platformAmount = totalAmount * 0.1;
          
          // Sort participants by rank
          const sortedParticipants = [...challenge.participants]
            .sort((a, b) => (a.rank || 999) - (b.rank || 999));
          
          // Distribute to winners (top 3)
          if (sortedParticipants.length >= 1 && sortedParticipants[0].rank === 1) {
            rewards.push({
              userId: sortedParticipants[0].userId,
              amount: winnerAmount * 0.5 // 50% to first place
            });
          }
          
          if (sortedParticipants.length >= 2 && sortedParticipants[1].rank === 2) {
            rewards.push({
              userId: sortedParticipants[1].userId,
              amount: winnerAmount * 0.3 // 30% to second place
            });
          }
          
          if (sortedParticipants.length >= 3 && sortedParticipants[2].rank === 3) {
            rewards.push({
              userId: sortedParticipants[2].userId,
              amount: winnerAmount * 0.2 // 20% to third place
            });
          }
          
          // Distribute participation rewards
          const participationReward = participationAmount / sortedParticipants.length;
          
          sortedParticipants.forEach(participant => {
            // Find if the participant already has a reward
            const existingRewardIndex = rewards.findIndex(r => r.userId === participant.userId);
            
            if (existingRewardIndex !== -1) {
              // Add to existing reward
              rewards[existingRewardIndex].amount += participationReward;
            } else {
              // Create new reward
              rewards.push({
                userId: participant.userId,
                amount: participationReward
              });
            }
          });
          
          // Platform fee is automatically deducted
        } else if (challenge.pool.distributionStrategy === 'custom' && challenge.pool.customDistribution) {
          // Custom distribution
          const { customDistribution } = challenge.pool;
          
          // Sort participants by rank
          const sortedParticipants = [...challenge.participants]
            .sort((a, b) => (a.rank || 999) - (b.rank || 999));
          
          // Distribute to first place
          if (customDistribution.firstPlace && sortedParticipants.length >= 1 && sortedParticipants[0].rank === 1) {
            rewards.push({
              userId: sortedParticipants[0].userId,
              amount: totalAmount * (customDistribution.firstPlace / 100)
            });
          }
          
          // Distribute to second place
          if (customDistribution.secondPlace && sortedParticipants.length >= 2 && sortedParticipants[1].rank === 2) {
            rewards.push({
              userId: sortedParticipants[1].userId,
              amount: totalAmount * (customDistribution.secondPlace / 100)
            });
          }
          
          // Distribute to third place
          if (customDistribution.thirdPlace && sortedParticipants.length >= 3 && sortedParticipants[2].rank === 3) {
            rewards.push({
              userId: sortedParticipants[2].userId,
              amount: totalAmount * (customDistribution.thirdPlace / 100)
            });
          }
          
          // Distribute participation rewards
          if (customDistribution.participation) {
            const participationAmount = totalAmount * (customDistribution.participation / 100);
            const participationReward = participationAmount / sortedParticipants.length;
            
            sortedParticipants.forEach(participant => {
              // Find if the participant already has a reward
              const existingRewardIndex = rewards.findIndex(r => r.userId === participant.userId);
              
              if (existingRewardIndex !== -1) {
                // Add to existing reward
                rewards[existingRewardIndex].amount += participationReward;
              } else {
                // Create new reward
                rewards.push({
                  userId: participant.userId,
                  amount: participationReward
                });
              }
            });
          }
          
          // Platform fee is automatically deducted
        }
      } else if (challenge.type === 'team') {
        // Team challenge
        if (!challenge.teams || challenge.teams.length === 0) {
          throw new Error('Challenge has no teams');
        }
        
        if (challenge.pool.distributionStrategy === 'standard') {
          // Standard distribution: 80% to winning team, 10% to participants, 10% to platform
          const winnerAmount = totalAmount * 0.8;
          const participationAmount = totalAmount * 0.1;
          const platformAmount = totalAmount * 0.1;
          
          // Sort teams by rank
          const sortedTeams = [...challenge.teams]
            .sort((a, b) => (a.rank || 999) - (b.rank || 999));
          
          // Distribute to winning teams (top 2)
          if (sortedTeams.length >= 1 && sortedTeams[0].rank === 1) {
            // Distribute equally among team members
            const teamReward = winnerAmount * 0.7; // 70% to first place team
            const memberReward = teamReward / sortedTeams[0].members.length;
            
            sortedTeams[0].members.forEach(member => {
              rewards.push({
                userId: member.userId,
                amount: memberReward
              });
            });
          }
          
          if (sortedTeams.length >= 2 && sortedTeams[1].rank === 2) {
            // Distribute equally among team members
            const teamReward = winnerAmount * 0.3; // 30% to second place team
            const memberReward = teamReward / sortedTeams[1].members.length;
            
            sortedTeams[1].members.forEach(member => {
              // Find if the member already has a reward
              const existingRewardIndex = rewards.findIndex(r => r.userId === member.userId);
              
              if (existingRewardIndex !== -1) {
                // Add to existing reward
                rewards[existingRewardIndex].amount += memberReward;
              } else {
                // Create new reward
                rewards.push({
                  userId: member.userId,
                  amount: memberReward
                });
              }
            });
          }
          
          // Distribute participation rewards
          const allParticipants = challenge.participants;
          const participationReward = participationAmount / allParticipants.length;
          
          allParticipants.forEach(participant => {
            // Find if the participant already has a reward
            const existingRewardIndex = rewards.findIndex(r => r.userId === participant.userId);
            
            if (existingRewardIndex !== -1) {
              // Add to existing reward
              rewards[existingRewardIndex].amount += participationReward;
            } else {
              // Create new reward
              rewards.push({
                userId: participant.userId,
                amount: participationReward
              });
            }
          });
          
          // Platform fee is automatically deducted
        } else if (challenge.pool.distributionStrategy === 'custom' && challenge.pool.customDistribution) {
          // Custom distribution
          const { customDistribution } = challenge.pool;
          
          // Sort teams by rank
          const sortedTeams = [...challenge.teams]
            .sort((a, b) => (a.rank || 999) - (b.rank || 999));
          
          // Distribute to first place team
          if (customDistribution.firstPlace && sortedTeams.length >= 1 && sortedTeams[0].rank === 1) {
            // Distribute equally among team members
            const teamReward = totalAmount * (customDistribution.firstPlace / 100);
            const memberReward = teamReward / sortedTeams[0].members.length;
            
            sortedTeams[0].members.forEach(member => {
              rewards.push({
                userId: member.userId,
                amount: memberReward
              });
            });
          }
          
          // Distribute to second place team
          if (customDistribution.secondPlace && sortedTeams.length >= 2 && sortedTeams[1].rank === 2) {
            // Distribute equally among team members
            const teamReward = totalAmount * (customDistribution.secondPlace / 100);
            const memberReward = teamReward / sortedTeams[1].members.length;
            
            sortedTeams[1].members.forEach(member => {
              // Find if the member already has a reward
              const existingRewardIndex = rewards.findIndex(r => r.userId === member.userId);
              
              if (existingRewardIndex !== -1) {
                // Add to existing reward
                rewards[existingRewardIndex].amount += memberReward;
              } else {
                // Create new reward
                rewards.push({
                  userId: member.userId,
                  amount: memberReward
                });
              }
            });
          }
          
          // Distribute participation rewards
          if (customDistribution.participation) {
            const participationAmount = totalAmount * (customDistribution.participation / 100);
            const allParticipants = challenge.participants;
            const participationReward = participationAmount / allParticipants.length;
            
            allParticipants.forEach(participant => {
              // Find if the participant already has a reward
              const existingRewardIndex = rewards.findIndex(r => r.userId === participant.userId);
              
              if (existingRewardIndex !== -1) {
                // Add to existing reward
                rewards[existingRewardIndex].amount += participationReward;
              } else {
                // Create new reward
                rewards.push({
                  userId: participant.userId,
                  amount: participationReward
                });
              }
            });
          }
          
          // Platform fee is automatically deducted
        }
      }
      
      // Mark the pool as distributed
      const updatedPool: ChallengePool = {
        ...challenge.pool,
        isDistributed: true,
        distributedAt: new Date()
      };
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        pool: updatedPool
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      // In a real app, you would call an API to distribute the rewards to users
      // For now, we'll just log the rewards
      console.log('Rewards distributed:', rewards);
      
      // Show a success message
      Alert.alert(
        'Rewards Distributed',
        `The pool of ${totalAmount} Zest tokens has been distributed to ${rewards.length} participants.`,
        [{ text: 'OK' }]
      );
      
      return true;
    } catch (error) {
      set({ error: 'Failed to distribute pool rewards', isLoading: false });
      return false;
    }
  },
  
  createTeam: async (challengeId: string, name: string, creatorId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if the challenge is a team challenge
      if (challenge.type !== 'team') {
        throw new Error('Challenge is not a team challenge');
      }
      
      // Check if the creator is a participant
      const creatorParticipant = challenge.participants.find(p => p.userId === creatorId);
      
      if (!creatorParticipant) {
        throw new Error('Creator is not a participant');
      }
      
      // Check if the creator is already in a team
      if (creatorParticipant.teamId) {
        throw new Error('Creator is already in a team');
      }
      
      // Create a new team ID
      const teamId = `team_${Date.now()}`;
      
      // Create a new team
      const newTeam: ChallengeTeam = {
        id: teamId,
        name,
        challengeId,
        members: [
          {
            ...creatorParticipant,
            teamId
          }
        ],
        score: 0,
        rank: 0
      };
      
      // Update the creator's participant record
      const updatedParticipants = [...challenge.participants];
      const creatorIndex = updatedParticipants.findIndex(p => p.userId === creatorId);
      
      updatedParticipants[creatorIndex] = {
        ...updatedParticipants[creatorIndex],
        teamId
      };
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        participants: updatedParticipants,
        teams: [...(challenge.teams || []), newTeam]
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      return teamId;
    } catch (error) {
      set({ error: 'Failed to create team', isLoading: false });
      return null;
    }
  },
  
  joinTeam: async (challengeId: string, teamId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if the challenge is a team challenge
      if (challenge.type !== 'team') {
        throw new Error('Challenge is not a team challenge');
      }
      
      // Check if the team exists
      if (!challenge.teams || !challenge.teams.some(t => t.id === teamId)) {
        throw new Error('Team not found');
      }
      
      // Check if the user is a participant
      const participantIndex = challenge.participants.findIndex(p => p.userId === userId);
      
      if (participantIndex === -1) {
        throw new Error('User is not a participant');
      }
      
      const participant = challenge.participants[participantIndex];
      
      // Check if the user is already in a team
      if (participant.teamId) {
        throw new Error('User is already in a team');
      }
      
      // Update the participant's team ID
      const updatedParticipants = [...challenge.participants];
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        teamId
      };
      
      // Update the team's members
      const updatedTeams = [...(challenge.teams || [])];
      const teamIndex = updatedTeams.findIndex(t => t.id === teamId);
      
      updatedTeams[teamIndex] = {
        ...updatedTeams[teamIndex],
        members: [...updatedTeams[teamIndex].members, {
          ...participant,
          teamId
        }]
      };
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        participants: updatedParticipants,
        teams: updatedTeams
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ error: 'Failed to join team', isLoading: false });
      return false;
    }
  },
  
  leaveTeam: async (challengeId: string, teamId: string, userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if the challenge is a team challenge
      if (challenge.type !== 'team') {
        throw new Error('Challenge is not a team challenge');
      }
      
      // Check if the team exists
      if (!challenge.teams || !challenge.teams.some(t => t.id === teamId)) {
        throw new Error('Team not found');
      }
      
      // Check if the user is a participant
      const participantIndex = challenge.participants.findIndex(p => p.userId === userId);
      
      if (participantIndex === -1) {
        throw new Error('User is not a participant');
      }
      
      const participant = challenge.participants[participantIndex];
      
      // Check if the user is in the specified team
      if (participant.teamId !== teamId) {
        throw new Error('User is not in the specified team');
      }
      
      // Update the participant's team ID
      const updatedParticipants = [...challenge.participants];
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        teamId: undefined
      };
      
      // Update the team's members
      const updatedTeams = [...(challenge.teams || [])];
      const teamIndex = updatedTeams.findIndex(t => t.id === teamId);
      
      updatedTeams[teamIndex] = {
        ...updatedTeams[teamIndex],
        members: updatedTeams[teamIndex].members.filter(m => m.userId !== userId)
      };
      
      // If the team is now empty, remove it
      if (updatedTeams[teamIndex].members.length === 0) {
        updatedTeams.splice(teamIndex, 1);
      }
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        participants: updatedParticipants,
        teams: updatedTeams
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ error: 'Failed to leave team', isLoading: false });
      return false;
    }
  },
  
  updateTeamScore: async (challengeId: string, teamId: string, score: number) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { challenges } = get();
      const challengeIndex = challenges.findIndex(c => c.id === challengeId);
      
      if (challengeIndex === -1) {
        throw new Error('Challenge not found');
      }
      
      const challenge = challenges[challengeIndex];
      
      // Check if the challenge is a team challenge
      if (challenge.type !== 'team') {
        throw new Error('Challenge is not a team challenge');
      }
      
      // Check if the team exists
      if (!challenge.teams || !challenge.teams.some(t => t.id === teamId)) {
        throw new Error('Team not found');
      }
      
      // Update the team's score
      const updatedTeams = [...(challenge.teams || [])];
      const teamIndex = updatedTeams.findIndex(t => t.id === teamId);
      
      updatedTeams[teamIndex] = {
        ...updatedTeams[teamIndex],
        score
      };
      
      // Recalculate ranks for all teams
      const sortedTeams = [...updatedTeams]
        .sort((a, b) => (b.score || 0) - (a.score || 0));
      
      sortedTeams.forEach((team, index) => {
        team.rank = index + 1;
      });
      
      // Update the challenge
      const updatedChallenge: Challenge = {
        ...challenge,
        teams: sortedTeams
      };
      
      // Update the challenges array
      const updatedChallenges = [...challenges];
      updatedChallenges[challengeIndex] = updatedChallenge;
      
      set({
        challenges: updatedChallenges,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ error: 'Failed to update team score', isLoading: false });
      return false;
    }
  },
  
  getChallenge: (challengeId: string) => {
    const { challenges } = get();
    return challenges.find(c => c.id === challengeId);
  },
  
  getUserParticipation: (challengeId: string, userId: string) => {
    const challenge = get().getChallenge(challengeId);
    
    if (!challenge) {
      return undefined;
    }
    
    return challenge.participants.find(p => p.userId === userId);
  },
  
  reset: () => {
    set({
      challenges: [],
      userChallenges: [],
      isLoading: false,
      error: null
    });
  }
}));