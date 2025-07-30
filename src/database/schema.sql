-- BDBT Tips Database Schema

-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
    subcategory VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
    description TEXT,
    primary_benefit TEXT,
    secondary_benefit TEXT,
    tertiary_benefit TEXT,
    implementation_time VARCHAR(50),
    frequency VARCHAR(50),
    cost VARCHAR(50),
    scientific_backing BOOLEAN DEFAULT false,
    source_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create what's included items table (many-to-one relationship)
CREATE TABLE IF NOT EXISTS tip_includes (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- Create implementation steps table
CREATE TABLE IF NOT EXISTS tip_steps (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title VARCHAR(255),
    description TEXT,
    duration VARCHAR(50),
    tools_needed TEXT[]
);

-- Create tip variations table (for A/B testing different versions)
CREATE TABLE IF NOT EXISTS tip_variations (
    id SERIAL PRIMARY KEY,
    base_tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    variation_type VARCHAR(50),
    title VARCHAR(255),
    subtitle VARCHAR(500),
    description TEXT
);

-- Create tip metrics table
CREATE TABLE IF NOT EXISTS tip_metrics (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    metric_type VARCHAR(50),
    metric_value VARCHAR(100),
    metric_unit VARCHAR(50),
    source VARCHAR(255)
);

-- Create tip resources table
CREATE TABLE IF NOT EXISTS tip_resources (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) CHECK (resource_type IN ('book', 'article', 'video', 'app', 'tool', 'website')),
    title VARCHAR(255),
    url TEXT,
    description TEXT,
    is_free BOOLEAN DEFAULT true
);

-- Create user favorites table
CREATE TABLE IF NOT EXISTS user_tip_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tip_id)
);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_tip_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(user_id, tip_id)
);

-- Create indexes for better performance
CREATE INDEX idx_tips_category ON tips(category);
CREATE INDEX idx_tips_difficulty ON tips(difficulty);
CREATE INDEX idx_tips_subcategory ON tips(subcategory);
CREATE INDEX idx_tips_status ON tips(status);
CREATE INDEX idx_tips_tags ON tips USING GIN(tags);
CREATE INDEX idx_tip_includes_tip_id ON tip_includes(tip_id);
CREATE INDEX idx_tip_steps_tip_id ON tip_steps(tip_id);
CREATE INDEX idx_user_favorites_user_id ON user_tip_favorites(user_id);
CREATE INDEX idx_user_progress_user_id ON user_tip_progress(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tips_updated_at BEFORE UPDATE ON tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();