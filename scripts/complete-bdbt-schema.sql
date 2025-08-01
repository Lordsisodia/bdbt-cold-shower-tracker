-- BDBT Complete Database Schema
-- Copy and paste this entire file into Supabase SQL Editor

-- 1. USER PROFILES TABLE
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

-- 2. USER TIP PROGRESS TABLE
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

-- 3. USER DAILY ACTIVITY TABLE
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

-- 4. USER TIP FAVORITES TABLE
CREATE TABLE user_tip_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- 5. USER TIP BOOKMARKS TABLE
CREATE TABLE user_tip_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  folder_name VARCHAR(50) DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- 6. USER COLLECTIONS TABLE
CREATE TABLE user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER COLLECTION TIPS TABLE
CREATE TABLE user_collection_tips (
  collection_id UUID REFERENCES user_collections(id) ON DELETE CASCADE,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, tip_id)
);

-- 8. USER ACHIEVEMENTS TABLE
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_type)
);

-- 9. TIP REVIEWS TABLE
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

-- 10. USER ACTIVITY EVENTS TABLE
CREATE TABLE user_activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_streak ON user_profiles(streak_count);

CREATE INDEX IF NOT EXISTS idx_user_tip_progress_user ON user_tip_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_progress_tip ON user_tip_progress(tip_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_progress_status ON user_tip_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_tip_progress_completed ON user_tip_progress(completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_daily_activity_user_date ON user_daily_activity(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_daily_activity_date ON user_daily_activity(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_activity_goal_achieved ON user_daily_activity(goal_achieved) WHERE goal_achieved = true;

CREATE INDEX IF NOT EXISTS idx_user_tip_favorites_user ON user_tip_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_favorites_tip ON user_tip_favorites(tip_id);

CREATE INDEX IF NOT EXISTS idx_user_tip_bookmarks_user ON user_tip_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_bookmarks_folder ON user_tip_bookmarks(user_id, folder_name);

CREATE INDEX IF NOT EXISTS idx_user_collections_user ON user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_public ON user_collections(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_user_collection_tips_collection ON user_collection_tips(collection_id, order_index);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_tip_reviews_tip ON tip_reviews(tip_id);
CREATE INDEX IF NOT EXISTS idx_tip_reviews_user ON tip_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_reviews_public ON tip_reviews(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_tip_reviews_rating ON tip_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_user_activity_events_user ON user_activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_events_type ON user_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_events_created ON user_activity_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_events_session ON user_activity_events(session_id) WHERE session_id IS NOT NULL;

-- ROW LEVEL SECURITY POLICIES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_events ENABLE ROW LEVEL SECURITY;

-- User Profile Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Progress Policies
CREATE POLICY "Users can manage own progress" ON user_tip_progress
  FOR ALL USING (auth.uid() = user_id);

-- User Daily Activity Policies
CREATE POLICY "Users can manage own daily activity" ON user_daily_activity
  FOR ALL USING (auth.uid() = user_id);

-- User Favorites Policies
CREATE POLICY "Users can manage own favorites" ON user_tip_favorites
  FOR ALL USING (auth.uid() = user_id);

-- User Bookmarks Policies
CREATE POLICY "Users can manage own bookmarks" ON user_tip_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- User Collections Policies
CREATE POLICY "Users can manage own collections" ON user_collections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public collections are viewable" ON user_collections
  FOR SELECT USING (is_public = true);

-- User Collection Tips Policies
CREATE POLICY "Users can manage own collection tips" ON user_collection_tips
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_collections 
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Public collection tips are viewable" ON user_collection_tips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_collections 
      WHERE id = collection_id AND is_public = true
    )
  );

-- User Achievements Policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Tip Reviews Policies
CREATE POLICY "Users can manage own reviews" ON tip_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public reviews are viewable" ON tip_reviews
  FOR SELECT USING (is_public = true);

-- User Activity Events Policies
CREATE POLICY "Users can insert own activity events" ON user_activity_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity events" ON user_activity_events
  FOR SELECT USING (auth.uid() = user_id);

-- USEFUL DATABASE FUNCTIONS

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile on user signup
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to update user streak
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

-- Function to handle tip completion
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
    
    -- Update tip download count
    UPDATE bdbt_tips 
    SET download_count = download_count + 1 
    WHERE id = NEW.tip_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tip completion
CREATE TRIGGER tip_completion_trigger
  AFTER UPDATE ON user_tip_progress
  FOR EACH ROW EXECUTE FUNCTION handle_tip_completion();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON user_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tip_reviews_updated_at BEFORE UPDATE ON tip_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'BDBT database schema created successfully! 🎉' as message;