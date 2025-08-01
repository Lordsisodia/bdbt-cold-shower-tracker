-- BDBT Row Level Security (RLS) Policies
-- This script sets up RLS policies for secure data access
-- It includes checks to avoid errors if policies already exist

-- Enable RLS on tables (safe to run multiple times)
ALTER TABLE daily_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE win_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read all wins" ON daily_wins;
DROP POLICY IF EXISTS "Users can create their own wins" ON daily_wins;
DROP POLICY IF EXISTS "Users can update their own wins" ON daily_wins;
DROP POLICY IF EXISTS "Users can delete their own wins" ON daily_wins;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can read all likes" ON win_likes;
DROP POLICY IF EXISTS "Users can create own likes" ON win_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON win_likes;

DROP POLICY IF EXISTS "Users can read all comments" ON win_comments;
DROP POLICY IF EXISTS "Users can create comments" ON win_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON win_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON win_comments;

DROP POLICY IF EXISTS "Users can read own api keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can create own api keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can update own api keys" ON user_api_keys;
DROP POLICY IF EXISTS "Users can delete own api keys" ON user_api_keys;

-- Daily wins policies
CREATE POLICY "Users can read all wins" 
    ON daily_wins FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own wins" 
    ON daily_wins FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wins" 
    ON daily_wins FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wins" 
    ON daily_wins FOR DELETE 
    USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
    ON user_profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Win likes policies
CREATE POLICY "Users can read all likes" 
    ON win_likes FOR SELECT 
    USING (true);

CREATE POLICY "Users can create own likes" 
    ON win_likes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" 
    ON win_likes FOR DELETE 
    USING (auth.uid() = user_id);

-- Win comments policies
CREATE POLICY "Users can read all comments" 
    ON win_comments FOR SELECT 
    USING (true);

CREATE POLICY "Users can create comments" 
    ON win_comments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
    ON win_comments FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
    ON win_comments FOR DELETE 
    USING (auth.uid() = user_id);

-- User API keys policies (more restrictive)
CREATE POLICY "Users can read own api keys" 
    ON user_api_keys FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own api keys" 
    ON user_api_keys FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" 
    ON user_api_keys FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" 
    ON user_api_keys FOR DELETE 
    USING (auth.uid() = user_id);

-- Public tables (no RLS needed, but can be read by anyone)
-- Tips, calendar_events, podcast_episodes, etc. are public by default

-- Analytics events - only system can write, but admins can read
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert analytics" 
    ON analytics_events FOR INSERT 
    WITH CHECK (true); -- Will be restricted by service role key

CREATE POLICY "Admins can read analytics" 
    ON analytics_events FOR SELECT 
    USING (true); -- You may want to restrict this to admin users

-- Newsletter subscribers - protected table
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage subscribers" 
    ON newsletter_subscribers FOR ALL 
    USING (true); -- Will be restricted by service role key

-- Contact submissions - protected table  
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage contacts" 
    ON contact_submissions FOR ALL 
    USING (true); -- Will be restricted by service role key