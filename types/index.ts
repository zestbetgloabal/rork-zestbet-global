export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  bio: string;
  zestCoins: number;
  totalWins: number;
  totalLosses: number;
  totalBets: number;
  charityContributed: number;
  inviteCode: string;
  friends: string[];
  createdAt: string;
}

export interface Bet {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  opponentId: string | null;
  opponentName: string | null;
  opponentAvatar: string | null;
  amount: number;
  category: BetCategory;
  status: BetStatus;
  result: BetResult | null;
  creatorConfirmed: boolean;
  opponentConfirmed: boolean;
  winnerId: string | null;
  charityAmount: number;
  createdAt: string;
  expiresAt: string;
}

export type BetCategory =
  | 'sports'
  | 'gaming'
  | 'fitness'
  | 'knowledge'
  | 'fun'
  | 'custom';

export type BetStatus =
  | 'pending'
  | 'active'
  | 'waiting_result'
  | 'disputed'
  | 'completed'
  | 'expired'
  | 'cancelled';

export type BetResult = 'creator_won' | 'opponent_won' | 'draw';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'bet_placed' | 'bet_won' | 'bet_lost' | 'charity' | 'bonus' | 'refund';
  amount: number;
  description: string;
  relatedBetId?: string;
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus: number;
  popular?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  wins: number;
  totalBets: number;
  winRate: number;
  rank: number;
  charityContributed: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'bet_invite' | 'bet_accepted' | 'bet_result' | 'coins_received' | 'friend_joined';
  title: string;
  message: string;
  read: boolean;
  relatedBetId?: string;
  createdAt: string;
}
