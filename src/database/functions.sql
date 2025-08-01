-- Functions for Daily Wins Feature

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count(win_id INT)
RETURNS void AS $$
BEGIN
  UPDATE daily_wins 
  SET likes_count = likes_count + 1 
  WHERE id = win_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count(win_id INT)
RETURNS void AS $$
BEGIN
  UPDATE daily_wins 
  SET likes_count = GREATEST(likes_count - 1, 0) 
  WHERE id = win_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment comments count
CREATE OR REPLACE FUNCTION increment_comments_count(win_id INT)
RETURNS void AS $$
BEGIN
  UPDATE daily_wins 
  SET comments_count = comments_count + 1 
  WHERE id = win_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get streak data
CREATE OR REPLACE FUNCTION get_streak_data(user_id UUID)
RETURNS TABLE (
  current_streak INT,
  longest_streak INT,
  total_completed INT
) AS $$
BEGIN
  -- This is a placeholder implementation
  -- You would need to implement the actual streak calculation logic
  RETURN QUERY
  SELECT 
    COALESCE((SELECT streak_count FROM user_profiles WHERE id = user_id), 0) as current_streak,
    COALESCE((SELECT streak_count FROM user_profiles WHERE id = user_id), 0) as longest_streak,
    COALESCE((SELECT COUNT(*)::INT FROM daily_wins WHERE daily_wins.user_id = get_streak_data.user_id), 0) as total_completed;
END;
$$ LANGUAGE plpgsql;

-- Functions for Podcast Feature

-- Function to increment episode views
CREATE OR REPLACE FUNCTION increment_episode_views(episode_id INT)
RETURNS void AS $$
BEGIN
  UPDATE podcast_episodes 
  SET views_count = views_count + 1 
  WHERE id = episode_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamps

-- Trigger for daily_wins
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_wins_updated_at
  BEFORE UPDATE ON daily_wins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_podcast_episodes_updated_at
  BEFORE UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();