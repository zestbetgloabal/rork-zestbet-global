#!/usr/bin/env node

// Database migration script
// Run this to create tables in your Supabase PostgreSQL database

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file');
  process.exit(1);
}

console.log('🔄 Connecting to database...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

async function main() {
  try {
    console.log('🔄 Running migrations...');
    
    // Create tables manually since we don't have migration files yet
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        avatar TEXT,
        bio TEXT,
        phone TEXT,
        password TEXT,
        provider TEXT DEFAULT 'email',
        zest_coins DECIMAL(10,2) DEFAULT 1000.00,
        preferences JSONB DEFAULT '{"notifications": true, "privacy": "public", "language": "en"}',
        email_verified BOOLEAN DEFAULT false,
        email_verification_code TEXT,
        verification_code_expiry TIMESTAMP,
        phone_verified BOOLEAN DEFAULT false,
        phone_verification_code TEXT,
        phone_verification_expiry TIMESTAMP,
        status TEXT DEFAULT 'active',
        password_reset_code TEXT,
        password_reset_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Bets table
      CREATE TABLE IF NOT EXISTS bets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        end_date TIMESTAMP NOT NULL,
        is_public BOOLEAN DEFAULT true,
        participants JSONB DEFAULT '[]',
        created_by UUID NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'active',
        winner UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Challenges table
      CREATE TABLE IF NOT EXISTS challenges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        reward DECIMAL(10,2),
        is_public BOOLEAN DEFAULT true,
        max_participants INTEGER,
        participants JSONB DEFAULT '[]',
        created_by UUID NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'active',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Transactions table
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        related_id UUID,
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Live Events table
      CREATE TABLE IF NOT EXISTS live_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming',
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        participants JSONB DEFAULT '[]',
        current_data JSONB,
        betting_odds JSONB DEFAULT '{}',
        total_bets INTEGER DEFAULT 0,
        viewers INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Live Bet Markets table
      CREATE TABLE IF NOT EXISTS live_bet_markets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID NOT NULL REFERENCES live_events(id),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Live Bet Wagers table
      CREATE TABLE IF NOT EXISTS live_bet_wagers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        market_id UUID NOT NULL REFERENCES live_bet_markets(id),
        event_id UUID NOT NULL REFERENCES live_events(id),
        user_id UUID NOT NULL REFERENCES users(id),
        option_key TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        odds_at_placement DECIMAL(10,2) NOT NULL,
        potential_win DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Social Posts table
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        images JSONB DEFAULT '[]',
        type TEXT NOT NULL,
        related_id UUID,
        likes JSONB DEFAULT '[]',
        comments JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_bets_created_by ON bets(created_by);
      CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
      CREATE INDEX IF NOT EXISTS idx_challenges_created_by ON challenges(created_by);
      CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_live_events_status ON live_events(status);
      CREATE INDEX IF NOT EXISTS idx_live_bet_markets_event_id ON live_bet_markets(event_id);
      CREATE INDEX IF NOT EXISTS idx_live_bet_wagers_user_id ON live_bet_wagers(user_id);
      CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
    `);

    console.log('✅ Database tables created successfully!');
    
    // Insert test data
    console.log('🔄 Inserting test data...');
    
    await pool.query(`
      INSERT INTO users (email, name, password, status, zest_coins) 
      VALUES 
        ('test@example.com', 'Test User', 'password123', 'active', 1000.00),
        ('pinkpistachio72@gmail.com', 'Apple Review', 'zestapp2025#', 'active', 1000.00),
        ('admin@zestbet.com', 'ZestBet Admin', 'admin2025!', 'active', 10000.00)
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✅ Test data inserted successfully!');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();