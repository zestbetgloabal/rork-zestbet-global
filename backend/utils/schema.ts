// Drizzle ORM Schema for PostgreSQL
// This file defines the database tables using Drizzle ORM

import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  phone: text('phone'),
  password: text('password'),
  provider: text('provider').default('email'), // 'email' | 'google' | 'facebook' | 'apple'
  zestCoins: decimal('zest_coins', { precision: 10, scale: 2 }).default('1000.00'),
  preferences: jsonb('preferences').default({
    notifications: true,
    privacy: 'public',
    language: 'en'
  }),
  // Email verification
  emailVerified: boolean('email_verified').default(false),
  emailVerificationCode: text('email_verification_code'),
  verificationCodeExpiry: timestamp('verification_code_expiry'),
  // Phone verification
  phoneVerified: boolean('phone_verified').default(false),
  phoneVerificationCode: text('phone_verification_code'),
  phoneVerificationExpiry: timestamp('phone_verification_expiry'),
  // Account status
  status: text('status').default('active'), // 'pending_verification' | 'active' | 'suspended' | 'banned'
  // Password reset
  passwordResetCode: text('password_reset_code'),
  passwordResetExpiry: timestamp('password_reset_expiry'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bets table
export const bets = pgTable('bets', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  endDate: timestamp('end_date').notNull(),
  isPublic: boolean('is_public').default(true),
  participants: jsonb('participants').default([]), // User IDs array
  createdBy: uuid('created_by').notNull().references(() => users.id),
  status: text('status').default('active'), // 'active' | 'completed' | 'cancelled'
  winner: uuid('winner').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Challenges table
export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'fitness' | 'learning' | 'habit' | 'creative' | 'social'
  duration: integer('duration').notNull(), // in days
  reward: decimal('reward', { precision: 10, scale: 2 }),
  isPublic: boolean('is_public').default(true),
  maxParticipants: integer('max_participants'),
  participants: jsonb('participants').default([]), // User IDs array
  createdBy: uuid('created_by').notNull().references(() => users.id),
  status: text('status').default('active'), // 'active' | 'completed' | 'upcoming'
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'deposit' | 'withdrawal' | 'bet' | 'win' | 'reward'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  relatedId: uuid('related_id'), // Bet ID, Challenge ID, etc.
  status: text('status').default('completed'), // 'pending' | 'completed' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
});

// Live Events table
export const liveEvents = pgTable('live_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  status: text('status').default('upcoming'), // 'upcoming' | 'live' | 'finished'
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  participants: jsonb('participants').default([]),
  currentData: jsonb('current_data'), // Real-time data
  bettingOdds: jsonb('betting_odds').default({}),
  totalBets: integer('total_bets').default(0),
  viewers: integer('viewers').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Live Bet Markets table
export const liveBetMarkets = pgTable('live_bet_markets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => liveEvents.id),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // Array of market options
  status: text('status').default('open'), // 'open' | 'settled' | 'void'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Live Bet Wagers table
export const liveBetWagers = pgTable('live_bet_wagers', {
  id: uuid('id').primaryKey().defaultRandom(),
  marketId: uuid('market_id').notNull().references(() => liveBetMarkets.id),
  eventId: uuid('event_id').notNull().references(() => liveEvents.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  optionKey: text('option_key').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  oddsAtPlacement: decimal('odds_at_placement', { precision: 10, scale: 2 }).notNull(),
  potentialWin: decimal('potential_win', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('active'), // 'active' | 'won' | 'lost' | 'void'
  createdAt: timestamp('created_at').defaultNow(),
});

// Social Posts table
export const socialPosts = pgTable('social_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  images: jsonb('images').default([]), // Array of image URLs
  type: text('type').notNull(), // 'bet' | 'challenge' | 'achievement' | 'general'
  relatedId: uuid('related_id'),
  likes: jsonb('likes').default([]), // Array of user IDs
  comments: jsonb('comments').default([]), // Array of comment objects
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bets: many(bets),
  challenges: many(challenges),
  transactions: many(transactions),
  socialPosts: many(socialPosts),
  liveBetWagers: many(liveBetWagers),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  creator: one(users, {
    fields: [bets.createdBy],
    references: [users.id],
  }),
  winnerUser: one(users, {
    fields: [bets.winner],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  creator: one(users, {
    fields: [challenges.createdBy],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const liveEventsRelations = relations(liveEvents, ({ many }) => ({
  markets: many(liveBetMarkets),
  wagers: many(liveBetWagers),
}));

export const liveBetMarketsRelations = relations(liveBetMarkets, ({ one, many }) => ({
  event: one(liveEvents, {
    fields: [liveBetMarkets.eventId],
    references: [liveEvents.id],
  }),
  wagers: many(liveBetWagers),
}));

export const liveBetWagersRelations = relations(liveBetWagers, ({ one }) => ({
  market: one(liveBetMarkets, {
    fields: [liveBetWagers.marketId],
    references: [liveBetMarkets.id],
  }),
  event: one(liveEvents, {
    fields: [liveBetWagers.eventId],
    references: [liveEvents.id],
  }),
  user: one(users, {
    fields: [liveBetWagers.userId],
    references: [users.id],
  }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  user: one(users, {
    fields: [socialPosts.userId],
    references: [users.id],
  }),
}));