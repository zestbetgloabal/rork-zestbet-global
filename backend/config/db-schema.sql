-- ZestApp Database Schema for Supabase
-- This file contains the complete database schema for the ZestApp application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  location VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Privacy settings
  profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_email BOOLEAN DEFAULT FALSE,
  show_phone BOOLEAN DEFAULT FALSE,
  
  -- Notification preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  
  -- App-specific fields
  zest_balance INTEGER DEFAULT 1000, -- Starting balance in Zest coins
  daily_bet_amount INTEGER DEFAULT 0,
  last_bet_date DATE,
  total_bets_placed INTEGER DEFAULT 0,
  total_bets_won INTEGER DEFAULT 0,
  win_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  
  -- Gamification
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]'::jsonb,
  
  -- GDPR compliance
  data_processing_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  analytics_consent BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_username_check CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$'),
  CONSTRAINT users_zest_balance_check CHECK (zest_balance >= 0)
);

-- Profiles table (additional user information)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  tagline VARCHAR(200),
  interests TEXT[],
  favorite_categories TEXT[],
  social_links JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Care Signals table (main feature)
CREATE TABLE IF NOT EXISTS public.care_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('emergency', 'health', 'emotional', 'practical', 'social')),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  tags TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  
  -- Response tracking
  response_count INTEGER DEFAULT 0,
  helper_count INTEGER DEFAULT 0,
  
  CONSTRAINT care_signals_title_length CHECK (LENGTH(title) >= 3),
  CONSTRAINT care_signals_description_length CHECK (LENGTH(description) >= 10)
);

-- Matches table (connections between users)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_type VARCHAR(50) NOT NULL CHECK (match_type IN ('friend', 'helper', 'care_recipient', 'mentor', 'mentee')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  initiated_by UUID NOT NULL REFERENCES public.users(id),
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  last_interaction TIMESTAMP WITH TIME ZONE,
  
  -- Match metadata
  match_score DECIMAL(3,2), -- 0.00 to 1.00
  common_interests TEXT[],
  compatibility_factors JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(user1_id, user2_id, match_type),
  CONSTRAINT matches_different_users CHECK (user1_id != user2_id),
  CONSTRAINT matches_user_order CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Bets table (for the betting feature)
CREATE TABLE IF NOT EXISTS public.bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  bet_type VARCHAR(50) DEFAULT 'binary' CHECK (bet_type IN ('binary', 'multiple_choice', 'prediction')),
  
  -- Betting details
  stake_amount INTEGER NOT NULL CHECK (stake_amount > 0),
  total_pool INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Status and resolution
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'resolved', 'cancelled')),
  winning_option VARCHAR(255),
  resolution_source TEXT,
  
  -- Visibility and rules
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  rules TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  tags TEXT[],
  charity_percentage DECIMAL(3,2) DEFAULT 0.10, -- 10% to charity by default
  featured BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT bets_valid_dates CHECK (ends_at > created_at),
  CONSTRAINT bets_charity_percentage CHECK (charity_percentage >= 0 AND charity_percentage <= 1)
);

-- Bet Participants table
CREATE TABLE IF NOT EXISTS public.bet_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bet_id UUID NOT NULL REFERENCES public.bets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chosen_option VARCHAR(255) NOT NULL,
  stake_amount INTEGER NOT NULL CHECK (stake_amount > 0),
  potential_winnings INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_winner BOOLEAN,
  payout_amount INTEGER DEFAULT 0,
  payout_processed BOOLEAN DEFAULT FALSE,
  payout_processed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(bet_id, user_id)
);

-- Live Events table (for real-time betting)
CREATE TABLE IF NOT EXISTS public.live_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  
  -- Timing
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'paused', 'ended', 'cancelled')),
  
  -- Live data
  current_data JSONB DEFAULT '{}'::jsonb,
  participant_count INTEGER DEFAULT 0,
  viewer_count INTEGER DEFAULT 0,
  
  -- Metadata
  tags TEXT[],
  external_id VARCHAR(255), -- For integration with external APIs
  data_source VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (for financial tracking)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'bet_stake', 'bet_winnings', 'daily_bonus', 'referral_bonus', 'charity_donation')),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'ZEST',
  
  -- References
  bet_id UUID REFERENCES public.bets(id),
  related_user_id UUID REFERENCES public.users(id), -- For referrals, etc.
  
  -- Payment details
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  external_transaction_id VARCHAR(255),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT transactions_amount_check CHECK (amount != 0)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Delivery
  channels VARCHAR(50)[] DEFAULT ARRAY['push'], -- push, email, sms
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- References
  related_id UUID, -- Generic reference to related entity
  related_type VARCHAR(50), -- Type of related entity
  
  -- Metadata
  data JSONB DEFAULT '{}'::jsonb,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log table (for compliance and debugging)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  
  -- Change tracking
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

CREATE INDEX IF NOT EXISTS idx_care_signals_user_id ON public.care_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_care_signals_category ON public.care_signals(category);
CREATE INDEX IF NOT EXISTS idx_care_signals_urgency ON public.care_signals(urgency);
CREATE INDEX IF NOT EXISTS idx_care_signals_is_active ON public.care_signals(is_active);
CREATE INDEX IF NOT EXISTS idx_care_signals_created_at ON public.care_signals(created_at);

CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_type ON public.matches(match_type);

CREATE INDEX IF NOT EXISTS idx_bets_creator_id ON public.bets(creator_id);
CREATE INDEX IF NOT EXISTS idx_bets_category ON public.bets(category);
CREATE INDEX IF NOT EXISTS idx_bets_status ON public.bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_ends_at ON public.bets(ends_at);
CREATE INDEX IF NOT EXISTS idx_bets_visibility ON public.bets(visibility);

CREATE INDEX IF NOT EXISTS idx_bet_participants_bet_id ON public.bet_participants(bet_id);
CREATE INDEX IF NOT EXISTS idx_bet_participants_user_id ON public.bet_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_signals_updated_at BEFORE UPDATE ON public.care_signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_events_updated_at BEFORE UPDATE ON public.live_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own care signals" ON public.care_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create care signals" ON public.care_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own care signals" ON public.care_signals FOR UPDATE USING (auth.uid() = user_id);

-- Add more policies as needed...