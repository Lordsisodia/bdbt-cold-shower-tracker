-- Tips Database Schema for BDBT
-- Description: Complete schema for tips management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, display_order)
VALUES 
  ('Health', 'health', 'Tips for physical and mental well-being', 'Heart', '#ef4444', 1),
  ('Wealth', 'wealth', 'Financial wisdom and prosperity tips', 'DollarSign', '#10b981', 2),
  ('Happiness', 'happiness', 'Tips for joy and life satisfaction', 'Smile', '#3b82f6', 3)
ON CONFLICT (slug) DO NOTHING;

-- Tips table
CREATE TABLE IF NOT EXISTS tips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
  read_time INTEGER DEFAULT 5, -- in minutes
  
  -- Content fields
  whats_included JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '{}'::jsonb, -- {primary, secondary, tertiary}
  
  -- Media
  image_url TEXT,
  download_url TEXT,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_tips_category ON tips(category_id);
CREATE INDEX idx_tips_difficulty ON tips(difficulty);
CREATE INDEX idx_tips_published ON tips(is_published, published_at DESC);
CREATE INDEX idx_tips_tags ON tips USING GIN(tags);
CREATE INDEX idx_tips_featured ON tips(featured) WHERE featured = true;

-- Related tips junction table
CREATE TABLE IF NOT EXISTS related_tips (
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  related_tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) DEFAULT 'similar', -- similar, prerequisite, advanced
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tip_id, related_tip_id),
  CHECK (tip_id != related_tip_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_tip_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- User tip progress/tracking
CREATE TABLE IF NOT EXISTS user_tip_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- Tip analytics events
CREATE TABLE IF NOT EXISTS tip_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- view, download, share, complete
  session_id VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analytics queries
CREATE INDEX idx_tip_analytics_tip ON tip_analytics(tip_id, event_type);
CREATE INDEX idx_tip_analytics_user ON tip_analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_tip_analytics_created ON tip_analytics(created_at DESC);

-- Tip collections/bundles
CREATE TABLE IF NOT EXISTS tip_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for tips in collections
CREATE TABLE IF NOT EXISTS collection_tips (
  collection_id UUID NOT NULL REFERENCES tip_collections(id) ON DELETE CASCADE,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, tip_id)
);

-- Functions and triggers

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tip_progress_updated_at BEFORE UPDATE ON user_tip_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tip_collections_updated_at BEFORE UPDATE ON tip_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_tip_view_count(tip_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE tips 
    SET view_count = view_count + 1
    WHERE id = tip_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_tip_download_count(tip_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE tips 
    SET download_count = download_count + 1
    WHERE id = tip_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get related tips
CREATE OR REPLACE FUNCTION get_related_tips(tip_uuid UUID, limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    subtitle VARCHAR,
    category_id UUID,
    difficulty VARCHAR,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        t.id,
        t.title,
        t.subtitle,
        t.category_id,
        t.difficulty,
        t.image_url
    FROM tips t
    WHERE t.id IN (
        -- Direct relations
        SELECT related_tip_id 
        FROM related_tips 
        WHERE tip_id = tip_uuid
        
        UNION
        
        -- Reverse relations
        SELECT tip_id 
        FROM related_tips 
        WHERE related_tip_id = tip_uuid
        
        UNION
        
        -- Same category tips
        SELECT t2.id
        FROM tips t2
        WHERE t2.category_id = (SELECT category_id FROM tips WHERE id = tip_uuid)
        AND t2.id != tip_uuid
        AND t2.is_published = true
        ORDER BY RANDOM()
        LIMIT limit_count
    )
    AND t.is_published = true
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tip_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_tips ENABLE ROW LEVEL SECURITY;

-- Categories: Public read access
CREATE POLICY "Categories are viewable by everyone" 
    ON categories FOR SELECT 
    USING (true);

-- Tips: Public read access for published tips
CREATE POLICY "Published tips are viewable by everyone" 
    ON tips FOR SELECT 
    USING (is_published = true);

-- Related tips: Public read access
CREATE POLICY "Related tips are viewable by everyone" 
    ON related_tips FOR SELECT 
    USING (true);

-- User favorites: Users can manage their own favorites
CREATE POLICY "Users can view their own favorites" 
    ON user_tip_favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
    ON user_tip_favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
    ON user_tip_favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- User progress: Users can manage their own progress
CREATE POLICY "Users can view their own progress" 
    ON user_tip_progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
    ON user_tip_progress FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
    ON user_tip_progress FOR UPDATE 
    USING (auth.uid() = user_id);

-- Analytics: Insert only (for tracking)
CREATE POLICY "Anyone can insert analytics events" 
    ON tip_analytics FOR INSERT 
    WITH CHECK (true);

-- Collections: Public read access for published
CREATE POLICY "Published collections are viewable by everyone" 
    ON tip_collections FOR SELECT 
    USING (is_published = true);

CREATE POLICY "Collection tips are viewable by everyone" 
    ON collection_tips FOR SELECT 
    USING (true);

-- Create views for easier querying

-- Tips with category details
CREATE OR REPLACE VIEW tips_with_category AS
SELECT 
    t.*,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    c.color as category_color
FROM tips t
JOIN categories c ON t.category_id = c.id;

-- User tip statistics
CREATE OR REPLACE VIEW user_tip_stats AS
SELECT 
    user_id,
    COUNT(DISTINCT CASE WHEN status = 'completed' THEN tip_id END) as completed_tips,
    COUNT(DISTINCT CASE WHEN status = 'in_progress' THEN tip_id END) as in_progress_tips,
    COUNT(DISTINCT tip_id) as total_attempted_tips,
    AVG(rating) as average_rating
FROM user_tip_progress
GROUP BY user_id;