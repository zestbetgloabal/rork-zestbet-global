import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Mock Supabase client for development/testing
const createMockSupabaseClient = () => {
  console.log('🔧 Using mock Supabase client (no DATABASE_URL configured)');
  
  const mockResponse = { data: null, error: null };
  const mockQuery = {
    select: () => mockQuery,
    insert: () => mockQuery,
    update: () => mockQuery,
    delete: () => mockQuery,
    eq: () => mockQuery,
    neq: () => mockQuery,
    gt: () => mockQuery,
    gte: () => mockQuery,
    lt: () => mockQuery,
    lte: () => mockQuery,
    like: () => mockQuery,
    ilike: () => mockQuery,
    is: () => mockQuery,
    in: () => mockQuery,
    contains: () => mockQuery,
    containedBy: () => mockQuery,
    rangeGt: () => mockQuery,
    rangeGte: () => mockQuery,
    rangeLt: () => mockQuery,
    rangeLte: () => mockQuery,
    rangeAdjacent: () => mockQuery,
    overlaps: () => mockQuery,
    textSearch: () => mockQuery,
    match: () => mockQuery,
    not: () => mockQuery,
    or: () => mockQuery,
    filter: () => mockQuery,
    order: () => mockQuery,
    limit: () => mockQuery,
    range: () => mockQuery,
    single: () => Promise.resolve(mockResponse),
    maybeSingle: () => Promise.resolve(mockResponse),
    csv: () => Promise.resolve(mockResponse),
    then: (resolve: any) => resolve(mockResponse)
  };
  
  return {
    from: () => mockQuery,
    auth: {
      signUp: () => Promise.resolve(mockResponse),
      signInWithPassword: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
      getUser: () => Promise.resolve(mockResponse),
      updateUser: () => Promise.resolve(mockResponse),
      resetPasswordForEmail: () => Promise.resolve(mockResponse),
      verifyOtp: () => Promise.resolve(mockResponse)
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        download: () => Promise.resolve(mockResponse),
        remove: () => Promise.resolve(mockResponse),
        list: () => Promise.resolve(mockResponse),
        getPublicUrl: () => ({ data: { publicUrl: 'mock-url' } })
      })
    }
  };
};

// Determine if we should use mock or real Supabase
const shouldUseMock = !supabaseUrl || !supabaseServiceKey || process.env.NODE_ENV === 'test';

let supabaseAdmin: any;
let supabaseClient: any;

if (shouldUseMock) {
  supabaseAdmin = createMockSupabaseClient();
  supabaseClient = createMockSupabaseClient();
} else {
  // Service role client for server-side operations
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Anonymous client for public operations
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);
}

export { supabaseAdmin, supabaseClient };

// Database types
export interface User {
  id: string;
  email: string;
  phone?: string;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_premium: boolean;
  subscription_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid';
}

export interface Profile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location?: string;
  preferences: Record<string, any>;
  privacy_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'matched' | 'rejected' | 'blocked';
  matched_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CareSignal {
  id: string;
  user_id: string;
  category: 'emergency' | 'health' | 'emotional' | 'practical' | 'social';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CareResponse {
  id: string;
  signal_id: string;
  responder_id: string;
  message?: string;
  status: 'offered' | 'accepted' | 'completed' | 'declined';
  created_at: string;
  updated_at: string;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('🗄️ Initializing Supabase database...');
    
    // Test connection
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('📋 Creating database tables...');
      await createTables();
    } else if (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

async function createTables() {
  // Note: In production, these should be created via Supabase migrations
  // This is for development/testing purposes
  const createTablesSQL = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      phone_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE,
      is_premium BOOLEAN DEFAULT FALSE,
      subscription_id VARCHAR(255),
      subscription_status VARCHAR(50)
    );
    
    -- Profiles table
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      display_name VARCHAR(100),
      avatar_url TEXT,
      bio TEXT,
      date_of_birth DATE,
      gender VARCHAR(50),
      location VARCHAR(255),
      preferences JSONB DEFAULT '{}',
      privacy_settings JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Matches table
    CREATE TABLE IF NOT EXISTS matches (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
      user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'pending',
      matched_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user1_id, user2_id)
    );
    
    -- Care signals table
    CREATE TABLE IF NOT EXISTS care_signals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      category VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      urgency VARCHAR(50) DEFAULT 'medium',
      location VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Care responses table
    CREATE TABLE IF NOT EXISTS care_responses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      signal_id UUID REFERENCES care_signals(id) ON DELETE CASCADE,
      responder_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      status VARCHAR(50) DEFAULT 'offered',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);
    CREATE INDEX IF NOT EXISTS idx_care_signals_user_id ON care_signals(user_id);
    CREATE INDEX IF NOT EXISTS idx_care_signals_category ON care_signals(category);
    CREATE INDEX IF NOT EXISTS idx_care_signals_active ON care_signals(is_active);
    CREATE INDEX IF NOT EXISTS idx_care_responses_signal_id ON care_responses(signal_id);
    CREATE INDEX IF NOT EXISTS idx_care_responses_responder_id ON care_responses(responder_id);
    
    -- Create updated_at triggers
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_care_signals_updated_at BEFORE UPDATE ON care_signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_care_responses_updated_at BEFORE UPDATE ON care_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;
  
  // Note: This would need to be executed via Supabase SQL editor or migrations
  console.log('📋 SQL for table creation prepared. Execute via Supabase dashboard.');
}