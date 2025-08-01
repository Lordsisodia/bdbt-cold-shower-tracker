-- BDBT Activity Tracking Schema Migration
-- Migration: 008_activity_tracking
-- Created: 2025-08-01
-- Purpose: Track user activities, views, downloads, and analytics

-- Create activity types enum
CREATE TYPE activity_type AS ENUM (
    'page_view',
    'tip_view',
    'tip_complete',
    'tip_download',
    'resource_click',
    'pdf_generate',
    'pdf_download',
    'share',
    'bookmark',
    'search',
    'filter_apply',
    'user_signup',
    'user_login',
    'profile_update',
    'streak_update'
);

-- Main activity tracking table
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    activity_type activity_type NOT NULL,
    
    -- Activity details
    entity_type VARCHAR(50), -- 'tip', 'resource', 'profile', etc.
    entity_id TEXT, -- ID of the entity being acted upon
    action_details JSONB DEFAULT '{}'::jsonb,
    
    -- Context information
    page_url TEXT,
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    
    -- Device and location info
    device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
    browser VARCHAR(50),
    os VARCHAR(50),
    country_code CHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance metrics
    load_time_ms INTEGER,
    interaction_time_ms INTEGER
);

-- Analytics aggregation tables for faster dashboard queries
CREATE TABLE IF NOT EXISTS public.analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Activity counts
    page_views INTEGER DEFAULT 0,
    tip_views INTEGER DEFAULT 0,
    tips_completed INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    
    -- Engagement metrics
    total_time_seconds INTEGER DEFAULT 0,
    unique_tips_viewed INTEGER DEFAULT 0,
    unique_resources_clicked INTEGER DEFAULT 0,
    
    -- Session info
    sessions_count INTEGER DEFAULT 0,
    avg_session_duration_seconds INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date, user_id)
);

-- Real-time activity feed table for recent activities
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Popular content tracking
CREATE TABLE IF NOT EXISTS public.content_popularity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'tip', 'resource', etc.
    content_id TEXT NOT NULL,
    
    -- Metrics (updated periodically)
    view_count INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    avg_time_spent_seconds INTEGER DEFAULT 0,
    
    -- Time windows
    last_hour_views INTEGER DEFAULT 0,
    last_day_views INTEGER DEFAULT 0,
    last_week_views INTEGER DEFAULT 0,
    last_month_views INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_type, content_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX idx_user_activities_activity_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_entity ON public.user_activities(entity_type, entity_id);
CREATE INDEX idx_user_activities_session ON public.user_activities(session_id);

CREATE INDEX idx_analytics_daily_date ON public.analytics_daily(date DESC);
CREATE INDEX idx_analytics_daily_user_date ON public.analytics_daily(user_id, date DESC);

CREATE INDEX idx_activity_feed_user ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_public ON public.activity_feed(is_public, created_at DESC) WHERE is_public = true;

CREATE INDEX idx_content_popularity_type_id ON public.content_popularity(content_type, content_id);
CREATE INDEX idx_content_popularity_views ON public.content_popularity(view_count DESC);

-- Function to increment activity counts
CREATE OR REPLACE FUNCTION public.track_activity(
    p_user_id UUID,
    p_activity_type activity_type,
    p_entity_type VARCHAR,
    p_entity_id TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    -- Insert the activity
    INSERT INTO public.user_activities (
        user_id,
        activity_type,
        entity_type,
        entity_id,
        action_details
    ) VALUES (
        p_user_id,
        p_activity_type,
        p_entity_type,
        p_entity_id,
        p_details
    ) RETURNING id INTO v_activity_id;
    
    -- Update daily analytics
    INSERT INTO public.analytics_daily (
        date,
        user_id,
        page_views,
        tip_views,
        tips_completed,
        downloads,
        shares
    ) VALUES (
        CURRENT_DATE,
        p_user_id,
        CASE WHEN p_activity_type = 'page_view' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type = 'tip_view' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type = 'tip_complete' THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type IN ('tip_download', 'pdf_download') THEN 1 ELSE 0 END,
        CASE WHEN p_activity_type = 'share' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date, user_id) DO UPDATE SET
        page_views = analytics_daily.page_views + EXCLUDED.page_views,
        tip_views = analytics_daily.tip_views + EXCLUDED.tip_views,
        tips_completed = analytics_daily.tips_completed + EXCLUDED.tips_completed,
        downloads = analytics_daily.downloads + EXCLUDED.downloads,
        shares = analytics_daily.shares + EXCLUDED.shares,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Update content popularity if applicable
    IF p_entity_type IS NOT NULL AND p_entity_id IS NOT NULL THEN
        INSERT INTO public.content_popularity (
            content_type,
            content_id,
            view_count,
            completion_count,
            download_count,
            share_count
        ) VALUES (
            p_entity_type,
            p_entity_id,
            CASE WHEN p_activity_type = 'tip_view' THEN 1 ELSE 0 END,
            CASE WHEN p_activity_type = 'tip_complete' THEN 1 ELSE 0 END,
            CASE WHEN p_activity_type IN ('tip_download', 'pdf_download') THEN 1 ELSE 0 END,
            CASE WHEN p_activity_type = 'share' THEN 1 ELSE 0 END
        )
        ON CONFLICT (content_type, content_id) DO UPDATE SET
            view_count = content_popularity.view_count + EXCLUDED.view_count,
            completion_count = content_popularity.completion_count + EXCLUDED.completion_count,
            download_count = content_popularity.download_count + EXCLUDED.download_count,
            share_count = content_popularity.share_count + EXCLUDED.share_count,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard analytics
CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(
    p_user_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_page_views BIGINT,
    total_tip_views BIGINT,
    total_tips_completed BIGINT,
    total_downloads BIGINT,
    total_shares BIGINT,
    unique_days_active INTEGER,
    avg_daily_page_views NUMERIC,
    most_viewed_tips JSONB,
    activity_by_day JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_stats AS (
        SELECT
            SUM(page_views) AS total_pages,
            SUM(tip_views) AS total_tips,
            SUM(tips_completed) AS total_completed,
            SUM(downloads) AS total_down,
            SUM(shares) AS total_shared,
            COUNT(DISTINCT date) AS active_days,
            AVG(page_views) AS avg_pages,
            jsonb_agg(
                jsonb_build_object(
                    'date', date,
                    'page_views', page_views,
                    'tip_views', tip_views,
                    'tips_completed', tips_completed
                ) ORDER BY date
            ) AS daily_data
        FROM public.analytics_daily
        WHERE date BETWEEN p_start_date AND p_end_date
            AND (p_user_id IS NULL OR user_id = p_user_id)
    ),
    popular_content AS (
        SELECT jsonb_agg(
            jsonb_build_object(
                'content_id', content_id,
                'view_count', view_count,
                'completion_count', completion_count
            ) ORDER BY view_count DESC
            LIMIT 10
        ) AS top_tips
        FROM public.content_popularity
        WHERE content_type = 'tip'
    )
    SELECT
        COALESCE(ds.total_pages, 0),
        COALESCE(ds.total_tips, 0),
        COALESCE(ds.total_completed, 0),
        COALESCE(ds.total_down, 0),
        COALESCE(ds.total_shared, 0),
        COALESCE(ds.active_days, 0),
        COALESCE(ds.avg_pages, 0),
        COALESCE(pc.top_tips, '[]'::jsonb),
        COALESCE(ds.daily_data, '[]'::jsonb)
    FROM daily_stats ds
    CROSS JOIN popular_content pc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.user_activities TO authenticated;
GRANT ALL ON public.analytics_daily TO authenticated;
GRANT ALL ON public.activity_feed TO authenticated;
GRANT SELECT ON public.content_popularity TO authenticated;

-- RLS Policies
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_popularity ENABLE ROW LEVEL SECURITY;

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
    ON public.user_activities FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities"
    ON public.user_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics"
    ON public.analytics_daily FOR ALL
    USING (auth.uid() = user_id);

-- Public activity feed
CREATE POLICY "Public activities are viewable"
    ON public.activity_feed FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

-- Users can manage their own feed items
CREATE POLICY "Users can manage own feed"
    ON public.activity_feed FOR ALL
    USING (auth.uid() = user_id);

-- Everyone can view popular content
CREATE POLICY "Popular content is public"
    ON public.content_popularity FOR SELECT
    USING (true);