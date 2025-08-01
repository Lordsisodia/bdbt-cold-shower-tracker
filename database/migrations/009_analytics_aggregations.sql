-- BDBT Analytics Aggregations & Performance Optimization
-- Migration: 009_analytics_aggregations
-- Created: 2025-08-01
-- Purpose: Create optimized aggregation queries and materialized views for dashboard performance

-- Create materialized view for hourly analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_hourly AS
SELECT 
    date_trunc('hour', created_at) as hour,
    user_id,
    COUNT(*) FILTER (WHERE activity_type = 'page_view') as page_views,
    COUNT(*) FILTER (WHERE activity_type = 'tip_view') as tip_views,
    COUNT(*) FILTER (WHERE activity_type = 'tip_complete') as tips_completed,
    COUNT(*) FILTER (WHERE activity_type IN ('tip_download', 'pdf_download')) as downloads,
    COUNT(*) FILTER (WHERE activity_type = 'share') as shares,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(DISTINCT entity_id) FILTER (WHERE entity_type = 'tip') as unique_tips_viewed,
    AVG(interaction_time_ms) as avg_interaction_time
FROM user_activities
GROUP BY date_trunc('hour', created_at), user_id;

-- Create index for fast refresh
CREATE INDEX idx_analytics_hourly_hour ON analytics_hourly(hour DESC);
CREATE INDEX idx_analytics_hourly_user ON analytics_hourly(user_id, hour DESC);

-- Create materialized view for daily rollups
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_daily_rollup AS
SELECT 
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) as total_activities,
    COUNT(*) FILTER (WHERE activity_type = 'page_view') as total_page_views,
    COUNT(*) FILTER (WHERE activity_type = 'tip_view') as total_tip_views,
    COUNT(*) FILTER (WHERE activity_type = 'tip_complete') as total_tips_completed,
    COUNT(*) FILTER (WHERE activity_type IN ('tip_download', 'pdf_download')) as total_downloads,
    COUNT(*) FILTER (WHERE activity_type = 'share') as total_shares,
    COUNT(DISTINCT session_id) as total_sessions,
    AVG(CASE WHEN interaction_time_ms > 0 THEN interaction_time_ms END) as avg_interaction_time,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY interaction_time_ms) as median_interaction_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY interaction_time_ms) as p95_interaction_time
FROM user_activities
GROUP BY DATE(created_at);

CREATE INDEX idx_analytics_daily_rollup_date ON analytics_daily_rollup(date DESC);

-- Create aggregation functions for common queries
CREATE OR REPLACE FUNCTION get_analytics_summary(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    metric_name TEXT,
    current_value BIGINT,
    previous_value BIGINT,
    change_percentage NUMERIC,
    trend TEXT
) AS $$
DECLARE
    v_period_days INTEGER;
BEGIN
    v_period_days := p_end_date - p_start_date;
    
    RETURN QUERY
    WITH current_period AS (
        SELECT
            COUNT(*) FILTER (WHERE activity_type = 'page_view') as page_views,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(*) FILTER (WHERE activity_type IN ('tip_download', 'pdf_download')) as downloads,
            COUNT(*) FILTER (WHERE activity_type = 'tip_complete') as completions,
            COUNT(*) FILTER (WHERE activity_type = 'share') as shares
        FROM user_activities
        WHERE created_at::date BETWEEN p_start_date AND p_end_date
            AND (p_user_id IS NULL OR user_id = p_user_id)
    ),
    previous_period AS (
        SELECT
            COUNT(*) FILTER (WHERE activity_type = 'page_view') as page_views,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(*) FILTER (WHERE activity_type IN ('tip_download', 'pdf_download')) as downloads,
            COUNT(*) FILTER (WHERE activity_type = 'tip_complete') as completions,
            COUNT(*) FILTER (WHERE activity_type = 'share') as shares
        FROM user_activities
        WHERE created_at::date BETWEEN (p_start_date - v_period_days * INTERVAL '1 day')::date 
            AND (p_end_date - v_period_days * INTERVAL '1 day')::date
            AND (p_user_id IS NULL OR user_id = p_user_id)
    )
    SELECT 
        metric.name,
        metric.current_val,
        metric.previous_val,
        CASE 
            WHEN metric.previous_val = 0 THEN 
                CASE WHEN metric.current_val > 0 THEN 100 ELSE 0 END
            ELSE 
                ROUND(((metric.current_val - metric.previous_val)::numeric / metric.previous_val) * 100, 2)
        END as change_pct,
        CASE 
            WHEN metric.current_val > metric.previous_val THEN 'up'
            WHEN metric.current_val < metric.previous_val THEN 'down'
            ELSE 'stable'
        END as trend_direction
    FROM (
        VALUES 
            ('Page Views', current_period.page_views, previous_period.page_views),
            ('Unique Users', current_period.unique_users, previous_period.unique_users),
            ('Downloads', current_period.downloads, previous_period.downloads),
            ('Completions', current_period.completions, previous_period.completions),
            ('Shares', current_period.shares, previous_period.shares)
    ) AS metric(name, current_val, previous_val)
    FROM current_period, previous_period;
END;
$$ LANGUAGE plpgsql;

-- Function to get top performing content
CREATE OR REPLACE FUNCTION get_top_content(
    p_limit INTEGER DEFAULT 10,
    p_days INTEGER DEFAULT 30,
    p_metric TEXT DEFAULT 'views'
)
RETURNS TABLE (
    content_id TEXT,
    content_type TEXT,
    view_count BIGINT,
    unique_viewers BIGINT,
    completion_rate NUMERIC,
    download_count BIGINT,
    share_count BIGINT,
    engagement_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ua.entity_id,
        ua.entity_type,
        COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view') as views,
        COUNT(DISTINCT ua.user_id) as unique_users,
        CASE 
            WHEN COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view') > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE ua.activity_type = 'tip_complete')::numeric / 
                       COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view')) * 100, 2)
            ELSE 0
        END as completion_pct,
        COUNT(*) FILTER (WHERE ua.activity_type IN ('tip_download', 'pdf_download')) as downloads,
        COUNT(*) FILTER (WHERE ua.activity_type = 'share') as shares,
        -- Engagement score calculation
        (
            COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view') * 1 +
            COUNT(*) FILTER (WHERE ua.activity_type = 'tip_complete') * 5 +
            COUNT(*) FILTER (WHERE ua.activity_type IN ('tip_download', 'pdf_download')) * 3 +
            COUNT(*) FILTER (WHERE ua.activity_type = 'share') * 4
        )::numeric as engagement
    FROM user_activities ua
    WHERE ua.created_at >= CURRENT_DATE - (p_days || ' days')::interval
        AND ua.entity_type IS NOT NULL
        AND ua.entity_id IS NOT NULL
    GROUP BY ua.entity_id, ua.entity_type
    ORDER BY 
        CASE p_metric
            WHEN 'views' THEN COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view')
            WHEN 'downloads' THEN COUNT(*) FILTER (WHERE ua.activity_type IN ('tip_download', 'pdf_download'))
            WHEN 'shares' THEN COUNT(*) FILTER (WHERE ua.activity_type = 'share')
            WHEN 'engagement' THEN (
                COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view') * 1 +
                COUNT(*) FILTER (WHERE ua.activity_type = 'tip_complete') * 5 +
                COUNT(*) FILTER (WHERE ua.activity_type IN ('tip_download', 'pdf_download')) * 3 +
                COUNT(*) FILTER (WHERE ua.activity_type = 'share') * 4
            )
            ELSE COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view')
        END DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function for time-series data
CREATE OR REPLACE FUNCTION get_activity_timeseries(
    p_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP - INTERVAL '7 days',
    p_end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    p_interval TEXT DEFAULT 'hour',
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    time_bucket TIMESTAMP,
    page_views BIGINT,
    tip_views BIGINT,
    downloads BIGINT,
    unique_users BIGINT,
    sessions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc(p_interval, ua.created_at) as bucket,
        COUNT(*) FILTER (WHERE ua.activity_type = 'page_view'),
        COUNT(*) FILTER (WHERE ua.activity_type = 'tip_view'),
        COUNT(*) FILTER (WHERE ua.activity_type IN ('tip_download', 'pdf_download')),
        COUNT(DISTINCT ua.user_id),
        COUNT(DISTINCT ua.session_id)
    FROM user_activities ua
    WHERE ua.created_at BETWEEN p_start_date AND p_end_date
        AND (p_user_id IS NULL OR ua.user_id = p_user_id)
    GROUP BY date_trunc(p_interval, ua.created_at)
    ORDER BY bucket;
END;
$$ LANGUAGE plpgsql;

-- Function for user cohort analysis
CREATE OR REPLACE FUNCTION get_user_cohorts(
    p_cohort_period TEXT DEFAULT 'week'
)
RETURNS TABLE (
    cohort_date DATE,
    users_count INTEGER,
    week_1_retention NUMERIC,
    week_2_retention NUMERIC,
    week_4_retention NUMERIC,
    month_1_retention NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH first_activity AS (
        SELECT 
            user_id,
            DATE_TRUNC(p_cohort_period, MIN(created_at))::date as cohort_date
        FROM user_activities
        WHERE user_id IS NOT NULL
        GROUP BY user_id
    ),
    cohort_sizes AS (
        SELECT 
            cohort_date,
            COUNT(DISTINCT user_id) as cohort_size
        FROM first_activity
        GROUP BY cohort_date
    ),
    retention_data AS (
        SELECT 
            fa.cohort_date,
            COUNT(DISTINCT CASE 
                WHEN ua.created_at::date BETWEEN fa.cohort_date + 7 AND fa.cohort_date + 13 
                THEN ua.user_id 
            END) as week_1_users,
            COUNT(DISTINCT CASE 
                WHEN ua.created_at::date BETWEEN fa.cohort_date + 14 AND fa.cohort_date + 20 
                THEN ua.user_id 
            END) as week_2_users,
            COUNT(DISTINCT CASE 
                WHEN ua.created_at::date BETWEEN fa.cohort_date + 28 AND fa.cohort_date + 34 
                THEN ua.user_id 
            END) as week_4_users,
            COUNT(DISTINCT CASE 
                WHEN ua.created_at::date BETWEEN fa.cohort_date + 30 AND fa.cohort_date + 37 
                THEN ua.user_id 
            END) as month_1_users
        FROM first_activity fa
        LEFT JOIN user_activities ua ON fa.user_id = ua.user_id
        GROUP BY fa.cohort_date
    )
    SELECT 
        cs.cohort_date,
        cs.cohort_size,
        ROUND((rd.week_1_users::numeric / NULLIF(cs.cohort_size, 0)) * 100, 2),
        ROUND((rd.week_2_users::numeric / NULLIF(cs.cohort_size, 0)) * 100, 2),
        ROUND((rd.week_4_users::numeric / NULLIF(cs.cohort_size, 0)) * 100, 2),
        ROUND((rd.month_1_users::numeric / NULLIF(cs.cohort_size, 0)) * 100, 2)
    FROM cohort_sizes cs
    JOIN retention_data rd ON cs.cohort_date = rd.cohort_date
    WHERE cs.cohort_date <= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY cs.cohort_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_hourly;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_daily_rollup;
    
    -- Update content popularity time windows
    UPDATE content_popularity cp
    SET 
        last_hour_views = (
            SELECT COUNT(*) 
            FROM user_activities ua 
            WHERE ua.entity_id = cp.content_id 
                AND ua.entity_type = cp.content_type
                AND ua.activity_type = 'tip_view'
                AND ua.created_at >= NOW() - INTERVAL '1 hour'
        ),
        last_day_views = (
            SELECT COUNT(*) 
            FROM user_activities ua 
            WHERE ua.entity_id = cp.content_id 
                AND ua.entity_type = cp.content_type
                AND ua.activity_type = 'tip_view'
                AND ua.created_at >= NOW() - INTERVAL '1 day'
        ),
        last_week_views = (
            SELECT COUNT(*) 
            FROM user_activities ua 
            WHERE ua.entity_id = cp.content_id 
                AND ua.entity_type = cp.content_type
                AND ua.activity_type = 'tip_view'
                AND ua.created_at >= NOW() - INTERVAL '7 days'
        ),
        last_month_views = (
            SELECT COUNT(*) 
            FROM user_activities ua 
            WHERE ua.entity_id = cp.content_id 
                AND ua.entity_type = cp.content_type
                AND ua.activity_type = 'tip_view'
                AND ua.created_at >= NOW() - INTERVAL '30 days'
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create cron job to refresh views every hour (requires pg_cron extension)
-- SELECT cron.schedule('refresh-analytics', '0 * * * *', 'SELECT refresh_analytics_views();');

-- Grant permissions
GRANT SELECT ON analytics_hourly TO authenticated;
GRANT SELECT ON analytics_daily_rollup TO authenticated;
GRANT EXECUTE ON FUNCTION get_analytics_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_timeseries TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_cohorts TO authenticated;