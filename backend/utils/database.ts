// Database connection and utilities
// This file provides database connection and common operations

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config/environment';
import * as schema from '../database/schema';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
});

// Drizzle database instance
export const db = drizzle(pool, { schema });

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Mock database for fallback (when real DB is not available)
interface MockDatabase {
  users: any[];
  bets: any[];
  challenges: any[];
  transactions: any[];
  liveEvents: any[];
  socialPosts: any[];
  liveBetMarkets: any[];
  liveBetWagers: any[];
}

// In-memory mock database as fallback
const mockDB: MockDatabase = {
  users: [],
  bets: [],
  challenges: [],
  transactions: [],
  liveEvents: [],
  socialPosts: [],
  liveBetMarkets: [],
  liveBetWagers: [],
};

// Database operations with real PostgreSQL + fallback to mock
export class Database {
  private static useRealDB = true;

  static async init() {
    this.useRealDB = await testConnection();
    if (!this.useRealDB) {
      console.warn('⚠️  Using mock database as fallback');
      // Initialize mock data
      this.initMockData();
    }
  }

  private static initMockData() {
    // Initialize with approved accounts only
    this.createUser({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      status: 'active',
    });

    // Seed: Apple review test account
    this.createUser({
      email: 'pinkpistachio72@gmail.com',
      name: 'Apple Review',
      password: 'zestapp2025#',
      phone: undefined,
      isTestAccount: true,
      status: 'active',
    });

    // Add admin account
    this.createUser({
      email: 'admin@zestbet.com',
      name: 'ZestBet Admin',
      password: 'admin2025!',
      status: 'active',
      role: 'admin',
    });
  }
  // User operations
  static async createUser(userData: any) {
    const user = {
      id: Date.now().toString(),
      ...userData,
      zestCoins: userData.zestCoins || 1000, // Starting bonus
      status: userData.status || 'active', // active, pending_verification, suspended
      provider: userData.provider || 'email',
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified !== undefined ? userData.phoneVerified : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.useRealDB) {
      try {
        // TODO: Implement real database insert with Drizzle
        // const result = await db.insert(schema.users).values(user).returning();
        // For now, use mock as fallback
        mockDB.users.push(user);
        console.log(`User created in database:`, { id: user.id, email: user.email, status: user.status });
        return user;
      } catch (error) {
        console.error('Database error, falling back to mock:', error);
        this.useRealDB = false;
      }
    }
    
    // Fallback to mock
    mockDB.users.push(user);
    console.log(`User created in mock database:`, { id: user.id, email: user.email, status: user.status });
    return user;
  }

  static async getUserByEmail(email: string) {
    if (this.useRealDB) {
      try {
        // TODO: Implement real database query with Drizzle
        // const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
        // return result[0] || null;
        
        // For now, use mock as fallback
        return mockDB.users.find(user => user.email === email);
      } catch (error) {
        console.error('Database error, falling back to mock:', error);
        this.useRealDB = false;
      }
    }
    
    // Fallback to mock
    return mockDB.users.find(user => user.email === email);
  }

  static async getUserByPhone(phone: string) {
    return mockDB.users.find(user => user.phone === phone);
  }

  static async getUserById(id: string) {
    return mockDB.users.find(user => user.id === id);
  }

  static async updateUser(id: string, updates: any) {
    const userIndex = mockDB.users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      mockDB.users[userIndex] = {
        ...mockDB.users[userIndex],
        ...updates,
        updatedAt: new Date(),
      };
      return mockDB.users[userIndex];
    }
    return null;
  }

  // Bet operations
  static async createBet(betData: any) {
    const bet = {
      id: Date.now().toString(),
      ...betData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDB.bets.push(bet);
    return bet;
  }

  static async getBets(filters: any = {}) {
    let bets = [...mockDB.bets];
    
    if (filters.category) {
      bets = bets.filter(bet => bet.category === filters.category);
    }
    if (filters.status) {
      bets = bets.filter(bet => bet.status === filters.status);
    }
    
    return bets;
  }

  // Challenge operations
  static async createChallenge(challengeData: any) {
    const challenge = {
      id: Date.now().toString(),
      ...challengeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDB.challenges.push(challenge);
    return challenge;
  }

  static async getChallenges(filters: any = {}) {
    let challenges = [...mockDB.challenges];
    
    if (filters.type) {
      challenges = challenges.filter(challenge => challenge.type === filters.type);
    }
    if (filters.status) {
      challenges = challenges.filter(challenge => challenge.status === filters.status);
    }
    
    return challenges;
  }

  // Transaction operations
  static async createTransaction(transactionData: any) {
    const transaction = {
      id: Date.now().toString(),
      ...transactionData,
      createdAt: new Date(),
    };
    mockDB.transactions.push(transaction);
    return transaction;
  }

  static async getUserTransactions(userId: string) {
    return mockDB.transactions.filter(tx => tx.userId === userId);
  }

  // Live events operations
  static async getLiveEvents(filters: any = {}) {
    let events = [...mockDB.liveEvents];
    
    if (filters.category) {
      events = events.filter(event => event.category === filters.category);
    }
    if (filters.status) {
      events = events.filter(event => event.status === filters.status);
    }
    
    return events;
  }

  // Live betting markets
  static async listLiveBetMarkets(eventId: string) {
    return mockDB.liveBetMarkets.filter((m) => m.eventId === eventId && m.status === 'open');
  }

  static async getMarketById(marketId: string) {
    return mockDB.liveBetMarkets.find(m => m.id === marketId);
  }

  static async updateMarket(marketId: string, updates: any) {
    const idx = mockDB.liveBetMarkets.findIndex(m => m.id === marketId);
    if (idx === -1) return null;
    mockDB.liveBetMarkets[idx] = { ...mockDB.liveBetMarkets[idx], ...updates, updatedAt: new Date() };
    return mockDB.liveBetMarkets[idx];
  }

  static async createLiveBetMarket(marketData: any) {
    const market = {
      id: `market_${Date.now()}`,
      ...marketData,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDB.liveBetMarkets.push(market);
    return market;
  }

  static async placeLiveBet(wagerData: any) {
    const wager = {
      id: `wager_${Date.now()}`,
      ...wagerData,
      status: 'active',
      createdAt: new Date(),
    };
    mockDB.liveBetWagers.push(wager);
    return wager;
  }

  static async getWagersByMarket(marketId: string) {
    return mockDB.liveBetWagers.filter(w => w.marketId === marketId);
  }

  static async updateWagerStatus(wagerId: string, status: 'active'|'won'|'lost'|'void') {
    const idx = mockDB.liveBetWagers.findIndex(w => w.id === wagerId);
    if (idx === -1) return null;
    mockDB.liveBetWagers[idx].status = status;
    return mockDB.liveBetWagers[idx];
  }

  static async adjustUserBalance(userId: string, delta: number) {
    const user = await this.getUserById(userId);
    if (!user) return null;
    user.zestCoins = (user.zestCoins ?? 0) + delta;
    user.updatedAt = new Date();
    return user;
  }
}

// Initialize database on startup
Database.init().catch(console.error);

export default Database;