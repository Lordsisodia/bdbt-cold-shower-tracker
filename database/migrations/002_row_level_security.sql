-- BDBT Tips Database RLS Migration
-- Migration: 002_row_level_security
-- Created: 2025-07-30

-- Enable Row Level Security (RLS)
ALTER TABLE bdbt_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdbt_tip_includes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdbt_tip_resources ENABLE ROW LEVEL SECURITY;

-- Public read access for published tips
CREATE POLICY "Public can view published tips" ON bdbt_tips
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view includes for published tips" ON bdbt_tip_includes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bdbt_tips 
            WHERE bdbt_tips.id = bdbt_tip_includes.tip_id 
            AND bdbt_tips.status = 'published'
        )
    );

CREATE POLICY "Public can view resources for published tips" ON bdbt_tip_resources
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bdbt_tips 
            WHERE bdbt_tips.id = bdbt_tip_resources.tip_id 
            AND bdbt_tips.status = 'published'
        )
    );

-- Admin policies (for authenticated users with admin role)
-- Note: You'll need to set up authentication and roles separately
CREATE POLICY "Admins can do everything with tips" ON bdbt_tips
    FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Admins can do everything with includes" ON bdbt_tip_includes
    FOR ALL USING (auth.role() = 'admin');

CREATE POLICY "Admins can do everything with resources" ON bdbt_tip_resources
    FOR ALL USING (auth.role() = 'admin');