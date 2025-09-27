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
  creatorId: string;
  creatorUsername: string;
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
  mediaFiles?: {uri: string, type: 'image' | 'video', name?: string}[];
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

// Chat-related types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'system';
  edited?: boolean;
  editedAt?: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'group';
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
}

export interface ChatParticipant {
  id: string;
  username: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  lastSeen?: Date;
  isOnline: boolean;
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

// AI Recommendation types
export interface AIRecommendation {
  id: string;
  type: 'bet' | 'mission' | 'friend';
  score: number; // 0-1, higher is better
  createdAt: Date;
  expiresAt: Date;
  isShown: boolean;
  isClicked: boolean;
  relatedBet?: Bet;
  relatedMission?: Mission;
  relatedUser?: User;
}

// Mission types
export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'open' | 'completed';
  progress?: number; // 0-100
  maxProgress?: number;
  deadline?: Date;
  requirements?: string[];
}

// Impact Project types
export interface ImpactProject {
  id: string;
  title: string;
  description: string;
  organization: string;
  amount: number;
  goal?: number;
  category: string;
  image?: string;
  featured?: boolean;
  endDate?: Date;
  location?: string;
  website?: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  change?: number; // Position change from last period
  badge?: Badge;
}

// Social Post types
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
  tags?: string[];
  attachments?: SocialPostAttachment[];
}

export interface SocialPostAttachment {
  type: 'image' | 'video' | 'link';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}

// Language types
export type Language = 'en' | 'de' | 'es';

export interface LanguageState {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// Challenge types
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
  joinedAt: Date;
  score: number;
  rank?: number;
  contribution?: number;
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
    firstPlace?: number;
    secondPlace?: number;
    thirdPlace?: number;
    participation?: number;
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
  score: number;
  rank?: number;
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