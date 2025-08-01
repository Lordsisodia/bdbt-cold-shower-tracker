-- BDBT Tips Database Schema
-- Target Project: fnkdtnmlyxcwrptdbmqy (or correct project ID)
-- 
-- Instructions:
-- 1. Go to https://supabase.com/dashboard/project/fnkdtnmlyxcwrptdbmqy/sql/new
-- 2. Copy and paste this entire SQL script
-- 3. Run the script to create all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Drop existing tables if they exist (careful in production!)
DROP TABLE IF EXISTS bdbt_tip_resources CASCADE;
DROP TABLE IF EXISTS bdbt_tip_includes CASCADE;
DROP TABLE IF EXISTS bdbt_tips CASCADE;

-- Main tips table
CREATE TABLE IF NOT EXISTS bdbt_tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
    subcategory VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
    description TEXT NOT NULL,
    primary_benefit TEXT NOT NULL,
    secondary_benefit TEXT NOT NULL,
    tertiary_benefit TEXT NOT NULL,
    implementation_time VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    cost VARCHAR(50) NOT NULL,
    scientific_backing BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(primary_benefit, '')), 'D')
    ) STORED
);

-- What's included items for each tip
CREATE TABLE IF NOT EXISTS bdbt_tip_includes (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    item_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources/links for each tip
CREATE TABLE IF NOT EXISTS bdbt_tip_resources (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('book', 'article', 'video', 'tool', 'app', 'website', 'other')),
    title VARCHAR(255) NOT NULL,
    url TEXT,
    description TEXT,
    resource_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bdbt_tips_category ON bdbt_tips(category);
CREATE INDEX idx_bdbt_tips_difficulty ON bdbt_tips(difficulty);
CREATE INDEX idx_bdbt_tips_status ON bdbt_tips(status);
CREATE INDEX idx_bdbt_tips_search ON bdbt_tips USING GIN(search_vector);
CREATE INDEX idx_bdbt_tips_tags ON bdbt_tips USING GIN(tags);
CREATE INDEX idx_bdbt_tip_includes_tip_id ON bdbt_tip_includes(tip_id);
CREATE INDEX idx_bdbt_tip_resources_tip_id ON bdbt_tip_resources(tip_id);

-- Row Level Security (RLS)
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

-- Helpful views
CREATE OR REPLACE VIEW bdbt_tips_with_counts AS
SELECT 
    t.*,
    COUNT(DISTINCT i.id) as includes_count,
    COUNT(DISTINCT r.id) as resources_count
FROM bdbt_tips t
LEFT JOIN bdbt_tip_includes i ON t.id = i.tip_id
LEFT JOIN bdbt_tip_resources r ON t.id = r.tip_id
GROUP BY t.id;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update timestamps
CREATE TRIGGER update_bdbt_tips_updated_at BEFORE UPDATE ON bdbt_tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test data
INSERT INTO bdbt_tips (
    title, subtitle, category, subcategory, difficulty, 
    description, primary_benefit, secondary_benefit, tertiary_benefit,
    implementation_time, frequency, cost, scientific_backing, tags, status
) VALUES (
    'Test Tip - Please Delete',
    'This is a test tip to verify database setup',
    'health',
    'Test',
    'Easy',
    'This is a test description to ensure the database is working correctly.',
    'Verifies database functionality',
    'Ensures tables are created properly',
    'Confirms permissions are set',
    '1 minute',
    'Once',
    'Free',
    false,
    ARRAY['test', 'setup', 'verification'],
    'published'
);

-- Add test includes
INSERT INTO bdbt_tip_includes (tip_id, item_text, item_order)
SELECT 
    id,
    'Test include item',
    1
FROM bdbt_tips 
WHERE title = 'Test Tip - Please Delete';

-- Verify installation
SELECT 
    'Tables created successfully!' as status,
    COUNT(*) as test_tips_count
FROM bdbt_tips;