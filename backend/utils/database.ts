// Database connection and utilities
// This file provides database connection and common operations

// Mock database implementation
// In production, replace with actual database connection (PostgreSQL, MongoDB, etc.)

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

// In-memory mock database
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

// Database operations
export class Database {
  // User operations
  static async createUser(userData: any) {
    const user = {
      id: Date.now().toString(),
      ...userData,
      zestCoins: 1000, // Starting bonus
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockDB.users.push(user);
    return user;
  }

  static async getUserByEmail(email: string) {
    return mockDB.users.find(user => user.email === email);
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

  static async adjustUserBalance(userId: string, delta: number) {
    const user = await this.getUserById(userId);
    if (!user) return null;
    user.zestCoins = (user.zestCoins ?? 0) + delta;
    user.updatedAt = new Date();
    return user;
  }
}

// Initialize with some mock data
Database.createUser({
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
});

// Seed: Apple review test account
Database.createUser({
  email: 'pinkpistachio72@gmail.com',
  name: 'Apple Review',
  password: 'zestapp2025#',
  phone: undefined,
  isTestAccount: true,
});

export default Database;