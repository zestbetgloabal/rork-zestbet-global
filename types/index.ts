// Add these types to your existing types/index.ts file

export interface User {
  id: string;
  username: string;
  avatar: string;
  zestBalance: number;
  points: number;
  inviteCode: string;
  dailyBetAmount: number;
  lastBetDate: string;
  biography: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
    pinterest?: string;
    snapchat?: string;
    website?: string;
  };
  agbConsent: boolean;
  privacyConsent: boolean;
  consentDate: string;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'live' | 'ended';
  startTime: Date;
  endTime?: Date;
  thumbnailUrl: string;
  streamUrl?: string;
  participants: LiveParticipant[];
  viewerCount: number;
  fundingGoal?: number;
  fundingRaised?: number;
  sponsors?: LiveSponsor[];
  challenges: LiveChallenge[];
}

export interface LiveParticipant {
  id: string;
  username: string;
  avatar?: string;
  role?: 'host' | 'participant' | 'viewer';
}

export interface LiveSponsor {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface LiveChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in seconds
  status: 'upcoming' | 'active' | 'completed';
  participants: {
    id: string;
    username: string;
  }[];
  type: 'solo' | 'team' | 'all';
  aiGenerated?: boolean;
  winner?: {
    id: string;
    username: string;
  };
}

export interface LiveInteraction {
  id: string;
  type: 'comment' | 'reaction' | 'donation' | 'join' | 'leave';
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  content?: string;
  amount?: number;
  targetChallenge?: string;
}

// Add Bet and BetPlacement interfaces
export interface Bet {
  id: string;
  title: string;
  description: string;
  creator: string;
  likes: number;
  participants: number;
  totalPool: number;
  minBet: number;
  maxBet: number;
  endDate: Date;
  category: string;
  image?: string;
  mediaFiles?: Array<{uri: string, type: 'image' | 'video', name?: string}>;
  visibility: 'public' | 'private';
  invitedFriends?: string[];
}

export interface BetPlacement {
  id?: string;
  betId: string;
  userId?: string;
  amount: number;
  platformFee?: number;
  timestamp?: Date;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

// Add SocialPost interface
export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  attachments?: Array<{
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string;
  }>;
  tags?: string[];
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

// Add Challenge and ChallengePool interfaces for the betting pool system
export interface Challenge {
  id: string;
  title: string;
  description: string;
  creator: string;
  startDate: Date;
  endDate: Date;
  category: string;
  image?: string;
  status: 'upcoming' | 'active' | 'completed';
  participants: ChallengeParticipant[];
  type: 'individual' | 'team';
  visibility: 'public' | 'private';
  invitedFriends?: string[];
  hasPool: boolean;
  pool?: ChallengePool;
  teams?: ChallengeTeam[];
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  joinedAt: Date;
  score?: number;
  rank?: number;
  contribution?: number; // Amount contributed to the pool
  teamId?: string;
}

export interface ChallengePool {
  id: string;
  challengeId: string;
  totalAmount: number;
  minContribution: number;
  maxContribution: number;
  distributionStrategy: 'standard' | 'custom';
  customDistribution?: {
    firstPlace?: number; // Percentage for first place (e.g., 50)
    secondPlace?: number; // Percentage for second place (e.g., 20)
    thirdPlace?: number; // Percentage for third place (e.g., 10)
    participation?: number; // Percentage for participation (e.g., 10)
    platform?: number; // Percentage for platform (e.g., 10)
  };
  contributions: PoolContribution[];
  isDistributed: boolean;
  distributedAt?: Date;
}

export interface PoolContribution {
  id: string;
  userId: string;
  username: string;
  amount: number;
  timestamp: Date;
}

export interface ChallengeTeam {
  id: string;
  name: string;
  challengeId: string;
  members: ChallengeParticipant[];
  score?: number;
  rank?: number;
}

// Add Badge and UserRank interfaces for the rank-based badge system
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  animationUrl?: string;
  requiredTokens: number;
  isTeamBadge: boolean;
}

export interface UserRank {
  id: string;
  userId: string;
  username: string;
  currentBadge: Badge;
  totalTokensEarned: number;
  tokensToNextBadge: number;
  nextBadge?: Badge;
  history: {
    badgeId: string;
    badgeName: string;
    earnedAt: Date;
  }[];
}

// Add this helper function to utils/helpers.ts if it doesn't exist
export function getTimeRemaining(date: Date) {
  const total = new Date(date).getTime() - new Date().getTime();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  
  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}