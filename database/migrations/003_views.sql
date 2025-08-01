-- BDBT Tips Database Views Migration
-- Migration: 003_views
-- Created: 2025-07-30

-- View with counts for includes and resources
CREATE OR REPLACE VIEW bdbt_tips_with_counts AS
SELECT 
    t.*,
    COUNT(DISTINCT i.id) as includes_count,
    COUNT(DISTINCT r.id) as resources_count
FROM bdbt_tips t
LEFT JOIN bdbt_tip_includes i ON t.id = i.tip_id
LEFT JOIN bdbt_tip_resources r ON t.id = r.tip_id
GROUP BY t.id;

-- View for category statistics
CREATE OR REPLACE VIEW bdbt_category_stats AS
SELECT 
    category,
    COUNT(*) as total_tips,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_tips,
    COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy_tips,
    COUNT(CASE WHEN difficulty = 'Moderate' THEN 1 END) as moderate_tips,
    COUNT(CASE WHEN difficulty = 'Advanced' THEN 1 END) as advanced_tips
FROM bdbt_tips
GROUP BY category;

-- View for popular tips (can be customized based on actual usage data)
CREATE OR REPLACE VIEW bdbt_popular_tips AS
SELECT 
    t.*,
    COUNT(DISTINCT i.id) as includes_count,
    COUNT(DISTINCT r.id) as resources_count
FROM bdbt_tips t
LEFT JOIN bdbt_tip_includes i ON t.id = i.tip_id
LEFT JOIN bdbt_tip_resources r ON t.id = r.tip_id
WHERE t.status = 'published'
GROUP BY t.id
ORDER BY t.created_at DESC
LIMIT 10;