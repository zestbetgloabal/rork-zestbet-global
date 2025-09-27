import { pgTable, text, integer, boolean, timestamp, jsonb, decimal, uuid, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  phone: varchar('phone', { length: 20 }),
  provider: varchar('provider', { length: 20 }).default('email'),
  zestCoins: decimal('zest_coins', { precision: 10, scale: 2 }).default('0'),
  preferences: jsonb('preferences').default({
    notifications: true,
    privacy: 'public',
    language: 'en'
  }),
  emailVerified: boolean('email_verified').default(false),
  emailVerificationCode: varchar('email_verification_code', { length: 10 }),
  verificationCodeExpiry: timestamp('verification_code_expiry'),
  phoneVerified: boolean('phone_verified').default(false),
  phoneVerificationCode: varchar('phone_verification_code', { length: 10 }),
  phoneVerificationExpiry: timestamp('phone_verification_expiry'),
  status: varchar('status', { length: 20 }).default('pending_verification'),
  passwordResetCode: varchar('password_reset_code', { length: 10 }),
  passwordResetExpiry: timestamp('password_reset_expiry'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Bets table
export const bets = pgTable('bets', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  endDate: timestamp('end_date').notNull(),
  isPublic: boolean('is_public').default(true),
  participants: jsonb('participants').default([]),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).default('active'),
  winner: uuid('winner').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Challenges table
export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  duration: integer('duration').notNull(),
  reward: decimal('reward', { precision: 10, scale: 2 }),
  isPublic: boolean('is_public').default(true),
  maxParticipants: integer('max_participants'),
  participants: jsonb('participants').default([]),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  status: varchar('status', { length: 20 }).default('upcoming'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 20 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  relatedId: uuid('related_id'),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow()
});

// Live Events table
export const liveEvents = pgTable('live_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('upcoming'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  participants: jsonb('participants').default([]),
  currentData: jsonb('current_data'),
  bettingOdds: jsonb('betting_odds'),
  totalBets: integer('total_bets').default(0),
  viewers: integer('viewers').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Live Bet Markets table
export const liveBetMarkets = pgTable('live_bet_markets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => liveEvents.id),
  question: text('question').notNull(),
  options: jsonb('options').notNull(),
  status: varchar('status', { length: 20 }).default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Live Bet Wagers table
export const liveBetWagers = pgTable('live_bet_wagers', {
  id: uuid('id').primaryKey().defaultRandom(),
  marketId: uuid('market_id').notNull().references(() => liveBetMarkets.id),
  eventId: uuid('event_id').notNull().references(() => liveEvents.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  optionKey: varchar('option_key', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  oddsAtPlacement: decimal('odds_at_placement', { precision: 5, scale: 2 }).notNull(),
  potentialWin: decimal('potential_win', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow()
});

// Social Posts table
export const socialPosts = pgTable('social_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  images: jsonb('images').default([]),
  type: varchar('type', { length: 20 }).notNull(),
  relatedId: uuid('related_id'),
  likes: jsonb('likes').default([]),
  comments: jsonb('comments').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bets: many(bets),
  challenges: many(challenges),
  transactions: many(transactions),
  socialPosts: many(socialPosts),
  liveBetWagers: many(liveBetWagers)
}));

export const betsRelations = relations(bets, ({ one }) => ({
  creator: one(users, {
    fields: [bets.createdBy],
    references: [users.id]
  }),
  winner: one(users, {
    fields: [bets.winner],
    references: [users.id]
  })
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  creator: one(users, {
    fields: [challenges.createdBy],
    references: [users.id]
  })
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  })
}));

export const liveEventsRelations = relations(liveEvents, ({ many }) => ({
  markets: many(liveBetMarkets),
  wagers: many(liveBetWagers)
}));

export const liveBetMarketsRelations = relations(liveBetMarkets, ({ one, many }) => ({
  event: one(liveEvents, {
    fields: [liveBetMarkets.eventId],
    references: [liveEvents.id]
  }),
  wagers: many(liveBetWagers)
}));

export const liveBetWagersRelations = relations(liveBetWagers, ({ one }) => ({
  market: one(liveBetMarkets, {
    fields: [liveBetWagers.marketId],
    references: [liveBetMarkets.id]
  }),
  event: one(liveEvents, {
    fields: [liveBetWagers.eventId],
    references: [liveEvents.id]
  }),
  user: one(users, {
    fields: [liveBetWagers.userId],
    references: [users.id]
  })
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  user: one(users, {
    fields: [socialPosts.userId],
    references: [users.id]
  })
}));

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