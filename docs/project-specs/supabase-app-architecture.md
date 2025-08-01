# BDBT Supabase App Architecture Plan

## 🎯 Overview
Complete backend architecture for BDBT (Blue Day, Better Tomorrow) app with user management, progress tracking, and analytics.

## 📊 Current State
- ✅ **bdbt_tips** table with 619 tips imported
- ✅ OAuth MCP integration working
- ✅ Categories: health, wealth, happiness

## 🏗️ Required Database Schema

### 1. User Management & Authentication

#### User Profiles (extends auth.users)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{
    "categories": ["health", "wealth", "happiness"],
    "difficulty_level": "Easy",
    "daily_goal": 1,
    "notifications": true,
    "timezone": "UTC"
  }'::jsonb,
  streak_count INTEGER DEFAULT 0,
  total_tips_completed INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. User Progress & Tracking

#### User Tip Progress
```sql
CREATE TABLE user_tip_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'skipped')
  ),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  difficulty_feedback VARCHAR(20) CHECK (
    difficulty_feedback IN ('too_easy', 'just_right', 'too_hard')
  ),
  would_recommend BOOLEAN,
  time_spent_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);
```

#### Daily Streaks & Goals
```sql
CREATE TABLE user_daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tips_completed INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 1,
  goal_achieved BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### 3. User Engagement

#### Favorites & Bookmarks
```sql
CREATE TABLE user_tip_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

CREATE TABLE user_tip_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  folder_name VARCHAR(50) DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);
```

#### User Collections (Custom Tip Lists)
```sql
CREATE TABLE user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_collection_tips (
  collection_id UUID REFERENCES user_collections(id) ON DELETE CASCADE,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, tip_id)
);
```

### 4. Analytics & Engagement Tracking

#### User Activity Events
```sql
CREATE TABLE user_activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'tip_view', 'tip_start', 'tip_complete', 'login', 'search', etc.
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### App Analytics (Global)
```sql
CREATE TABLE app_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb, -- category, difficulty, etc.
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Social Features

#### User Achievements
```sql
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL, -- 'first_tip', 'week_streak', 'category_master', etc.
  achievement_data JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_type)
);
```

#### User Feedback & Reviews
```sql
CREATE TABLE tip_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

CREATE TABLE review_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id UUID NOT NULL REFERENCES tip_reviews(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_id)
);
```

## 🔐 Row Level Security (RLS) Policies

### User Data Protection
```sql
-- Users can only see/edit their own data
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_events ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_tip_progress
  FOR ALL USING (auth.uid() = user_id);
```

### Public Data Access
```sql
-- Tips are publicly readable
CREATE POLICY "Tips are viewable by everyone" ON bdbt_tips
  FOR SELECT USING (status = 'published');

-- Public reviews are viewable by everyone
CREATE POLICY "Public reviews are viewable" ON tip_reviews
  FOR SELECT USING (is_public = true);
```

## 🔧 Database Functions & Triggers

### Automatic Profile Creation
```sql
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

### Streak Calculation
```sql
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  -- Calculate current streak
  WHILE EXISTS (
    SELECT 1 FROM user_daily_activity 
    WHERE user_id = user_uuid 
    AND date = check_date 
    AND goal_achieved = true
  ) LOOP
    current_streak := current_streak + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  -- Update user profile
  UPDATE user_profiles 
  SET streak_count = current_streak 
  WHERE id = user_uuid;
  
  RETURN current_streak;
END;
$$ LANGUAGE plpgsql;
```

### Tip Completion Handler
```sql
CREATE OR REPLACE FUNCTION handle_tip_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update user totals
    UPDATE user_profiles 
    SET total_tips_completed = total_tips_completed + 1,
        total_points = total_points + 10
    WHERE id = NEW.user_id;
    
    -- Update daily activity
    INSERT INTO user_daily_activity (user_id, date, tips_completed, points_earned)
    VALUES (NEW.user_id, CURRENT_DATE, 1, 10)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      tips_completed = user_daily_activity.tips_completed + 1,
      points_earned = user_daily_activity.points_earned + 10,
      goal_achieved = (user_daily_activity.tips_completed + 1) >= user_daily_activity.daily_goal;
    
    -- Update tip view count
    UPDATE bdbt_tips 
    SET download_count = download_count + 1 
    WHERE id = NEW.tip_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tip_completion_trigger
  AFTER UPDATE ON user_tip_progress
  FOR EACH ROW EXECUTE FUNCTION handle_tip_completion();
```

## 📱 API Endpoints (Supabase Auto-Generated)

### Authentication
- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/signin` - User login
- `POST /auth/v1/signout` - User logout
- `POST /auth/v1/recovery` - Password reset

### Tips & Content
- `GET /rest/v1/bdbt_tips` - Get tips (with filters)
- `GET /rest/v1/bdbt_tips?id=eq.{id}` - Get specific tip
- `GET /rest/v1/user_tip_progress` - Get user progress
- `POST /rest/v1/user_tip_progress` - Track tip progress

### User Management
- `GET /rest/v1/user_profiles` - Get user profile
- `PATCH /rest/v1/user_profiles` - Update profile
- `GET /rest/v1/user_tip_favorites` - Get favorites
- `POST /rest/v1/user_tip_favorites` - Add favorite

## 🚀 Implementation Priority

### Phase 1: Core User System
1. ✅ Tips table (done)
2. User profiles table
3. Basic authentication
4. User tip progress tracking

### Phase 2: Engagement Features
1. Favorites & bookmarks
2. Daily streaks & goals
3. Basic analytics

### Phase 3: Social Features
1. Reviews & ratings
2. User collections
3. Achievements system

### Phase 4: Advanced Analytics
1. Detailed user behavior tracking
2. A/B testing infrastructure
3. Performance optimization

## 💾 Storage Requirements

### File Storage (Supabase Storage)
```sql
-- Buckets for different content types
CREATE BUCKET user_avatars;
CREATE BUCKET tip_images;
CREATE BUCKET user_content;

-- Storage policies
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_avatars' AND auth.uid()::text = owner);
```

This architecture provides a complete foundation for your BDBT app with scalable user management, progress tracking, and engagement features.