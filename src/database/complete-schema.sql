-- BDBT Complete Database Schema
-- This script creates all necessary tables for the BDBT application
-- It includes checks to avoid errors if objects already exist

-- 1. Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('health', 'wealth', 'happiness')),
    status VARCHAR(50) CHECK (status IN ('scheduled', 'published', 'draft')),
    date DATE NOT NULL,
    time TIME NOT NULL,
    type VARCHAR(50) CHECK (type IN ('tip', 'idea', 'campaign', 'review')),
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    assignee VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Daily Wins Table
CREATE TABLE IF NOT EXISTS daily_wins (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    category VARCHAR(50) CHECK (category IN ('health', 'wealth', 'happiness')),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Win Likes Table
CREATE TABLE IF NOT EXISTS win_likes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    win_id INTEGER REFERENCES daily_wins(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, win_id)
);

-- 4. Win Comments Table
CREATE TABLE IF NOT EXISTS win_comments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    win_id INTEGER REFERENCES daily_wins(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    streak_count INTEGER DEFAULT 0,
    last_win_date DATE,
    goals TEXT[],
    experience_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Podcast Episodes Table
CREATE TABLE IF NOT EXISTS podcast_episodes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    published_date DATE,
    category VARCHAR(50),
    views_count INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    youtube_url TEXT,
    spotify_url TEXT,
    apple_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    partnership_type VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'responded', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID,
    tip_id INTEGER REFERENCES tips(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. API Keys Table (for settings)
CREATE TABLE IF NOT EXISTS user_api_keys (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    service_name VARCHAR(100),
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_category ON calendar_events(category);
CREATE INDEX IF NOT EXISTS idx_calendar_events_status ON calendar_events(status);
CREATE INDEX IF NOT EXISTS idx_daily_wins_user_id ON daily_wins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_wins_created_at ON daily_wins(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_wins_category ON daily_wins(category);
CREATE INDEX IF NOT EXISTS idx_win_likes_user_id ON win_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_win_likes_win_id ON win_likes(win_id);
CREATE INDEX IF NOT EXISTS idx_win_comments_win_id ON win_comments(win_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_category ON podcast_episodes(category);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_date ON podcast_episodes(published_date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Create updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calendar_events_updated_at') THEN
        CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_wins_updated_at') THEN
        CREATE TRIGGER update_daily_wins_updated_at BEFORE UPDATE ON daily_wins
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_podcast_episodes_updated_at') THEN
        CREATE TRIGGER update_podcast_episodes_updated_at BEFORE UPDATE ON podcast_episodes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_api_keys_updated_at') THEN
        CREATE TRIGGER update_user_api_keys_updated_at BEFORE UPDATE ON user_api_keys
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;