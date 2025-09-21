// Database schema definitions
// This file defines the structure of your database tables
// You can use this with Prisma, Drizzle, or any other ORM

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  provider?: 'email' | 'google' | 'facebook' | 'apple';
  zestCoins: number;
  preferences: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    language: string;
  };
  // Email verification fields
  emailVerified: boolean;
  emailVerificationCode?: string;
  verificationCodeExpiry?: Date;
  // Phone verification fields
  phoneVerified: boolean;
  phoneVerificationCode?: string;
  phoneVerificationExpiry?: Date;
  // Account status
  status: 'pending_verification' | 'active' | 'suspended' | 'banned';
  // Password reset fields
  passwordResetCode?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bet {
  id: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  endDate: Date;
  isPublic: boolean;
  participants: string[]; // User IDs
  createdBy: string; // User ID
  status: 'active' | 'completed' | 'cancelled';
  winner?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  type: 'fitness' | 'learning' | 'habit' | 'creative' | 'social';
  duration: number; // in days
  reward?: number;
  isPublic: boolean;
  maxParticipants?: number;
  participants: string[]; // User IDs
  createdBy: string; // User ID
  status: 'active' | 'completed' | 'upcoming';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'reward';
  amount: number;
  description: string;
  relatedId?: string; // Bet ID, Challenge ID, etc.
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface LiveBetMarketOption {
  id: string;
  key: 'home' | 'draw' | 'away' | 'yes' | 'no' | 'over' | 'under' | string;
  label: string;
  odds: number;
}

export interface LiveBetMarket {
  id: string;
  eventId: string;
  question: string; // e.g., "Wer gewinnt die nächste Runde?"
  options: LiveBetMarketOption[];
  status: 'open' | 'settled' | 'void';
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveBetWager {
  id: string;
  marketId: string;
  eventId: string;
  userId: string;
  optionKey: string;
  amount: number;
  oddsAtPlacement: number;
  potentialWin: number;
  status: 'active' | 'won' | 'lost' | 'void';
  createdAt: Date;
}


export interface LiveEvent {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'upcoming' | 'live' | 'finished';
  startTime: Date;
  endTime: Date;
  participants?: string[];
  currentData?: any; // Real-time data (score, price, etc.)
  bettingOdds?: Record<string, number>;
  totalBets: number;
  viewers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPost {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  type: 'bet' | 'challenge' | 'achievement' | 'general';
  relatedId?: string;
  likes: string[]; // User IDs
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}