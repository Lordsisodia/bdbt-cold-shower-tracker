-- Analytics Database Schema for BDBT
-- Description: Analytics tables for tracking user interactions and content performance

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analytics events table (fallback if tip_analytics doesn't exist)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tip_id UUID REFERENCES tips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'download', 'share', 'complete', 'page_view', 'search', 'filter')),
  session_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_tip ON analytics_events(tip_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id) WHERE session_id IS NOT NULL;

-- Daily aggregations table for faster reporting
CREATE TABLE IF NOT EXISTS daily_analytics_summary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  tip_id UUID REFERENCES tips(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, tip_id, event_type)
);

-- Create indexes for daily summary
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_analytics_summary(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summary_tip ON daily_analytics_summary(tip_id);
CREATE INDEX IF NOT EXISTS idx_daily_summary_type ON daily_analytics_summary(event_type);

-- User sessions table for tracking user journeys
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  page_views INTEGER DEFAULT 0,
  tip_views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  searches INTEGER DEFAULT 0,
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for user sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(start_time DESC);

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day')
RETURNS void AS $$
BEGIN
  -- Aggregate analytics events into daily summary
  INSERT INTO daily_analytics_summary (date, tip_id, event_type, event_count, unique_users)
  SELECT 
    DATE(created_at) as date,
    tip_id,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM analytics_events 
  WHERE DATE(created_at) = target_date
    AND tip_id IS NOT NULL
  GROUP BY DATE(created_at), tip_id, event_type
  ON CONFLICT (date, tip_id, event_type) 
  DO UPDATE SET 
    event_count = EXCLUDED.event_count,
    unique_users = EXCLUDED.unique_users;
  
  -- Also aggregate page views and other non-tip events
  INSERT INTO daily_analytics_summary (date, tip_id, event_type, event_count, unique_users)
  SELECT 
    DATE(created_at) as date,
    NULL as tip_id,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM analytics_events 
  WHERE DATE(created_at) = target_date
    AND tip_id IS NULL
  GROUP BY DATE(created_at), event_type
  ON CONFLICT (date, tip_id, event_type) 
  DO UPDATE SET 
    event_count = EXCLUDED.event_count,
    unique_users = EXCLUDED.unique_users;
END;
$$ LANGUAGE plpgsql;

-- Function to get analytics summary for date range
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE,
  p_event_type VARCHAR DEFAULT NULL,
  p_tip_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  tip_id UUID,
  event_type VARCHAR,
  event_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    das.date,
    das.tip_id,
    das.event_type,
    das.event_count::BIGINT,
    das.unique_users::BIGINT
  FROM daily_analytics_summary das
  WHERE das.date BETWEEN start_date AND end_date
    AND (p_event_type IS NULL OR das.event_type = p_event_type)
    AND (p_tip_id IS NULL OR das.tip_id = p_tip_id)
  ORDER BY das.date DESC, das.event_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing content
CREATE OR REPLACE FUNCTION get_top_content(
  p_event_type VARCHAR DEFAULT 'view',
  p_limit INTEGER DEFAULT 10,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  tip_id UUID,
  title VARCHAR,
  category VARCHAR,
  total_events BIGINT,
  unique_users BIGINT,
  avg_daily_events NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tip_id,
    t.title,
    c.name as category,
    SUM(das.event_count) as total_events,
    SUM(das.unique_users) as unique_users,
    ROUND(AVG(das.event_count), 2) as avg_daily_events
  FROM daily_analytics_summary das
  JOIN tips t ON das.tip_id = t.id
  JOIN categories c ON t.category_id = c.id
  WHERE das.event_type = p_event_type
    AND das.date >= CURRENT_DATE - (p_days || ' days')::INTERVAL
  GROUP BY t.id, t.title, c.name
  ORDER BY total_events DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Analytics events: Allow inserts for tracking, reads for authenticated users
CREATE POLICY "Allow analytics event inserts" 
  ON analytics_events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow analytics event reads for authenticated users" 
  ON analytics_events FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Daily summary: Read-only for authenticated users
CREATE POLICY "Allow daily summary reads for authenticated users" 
  ON daily_analytics_summary FOR SELECT 
  USING (auth.role() = 'authenticated');

-- User sessions: Users can read their own sessions
CREATE POLICY "Users can read their own sessions" 
  ON user_sessions FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Allow session inserts" 
  ON user_sessions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow session updates" 
  ON user_sessions FOR UPDATE 
  USING (true);

-- Create a scheduled job to run daily aggregation (if pg_cron is available)
-- SELECT cron.schedule('daily-analytics-aggregation', '0 1 * * *', 'SELECT aggregate_daily_analytics();');

-- Grant permissions
GRANT SELECT, INSERT ON analytics_events TO authenticated;
GRANT SELECT ON daily_analytics_summary TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION aggregate_daily_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_content TO authenticated;