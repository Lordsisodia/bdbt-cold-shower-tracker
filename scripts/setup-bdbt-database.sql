-- BDBT Tips Database Setup
-- Copy and paste this into your Supabase SQL Editor

-- Create the main tips table
CREATE TABLE IF NOT EXISTS bdbt_tips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),  
  difficulty VARCHAR(20),
  description TEXT,
  primary_benefit TEXT,
  secondary_benefit TEXT,
  tertiary_benefit TEXT,
  implementation_time VARCHAR(100),
  frequency VARCHAR(100),
  cost VARCHAR(100),
  scientific_backing BOOLEAN DEFAULT false,
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'published'
);

-- Create supporting tables
CREATE TABLE IF NOT EXISTS bdbt_tip_includes (
  id SERIAL PRIMARY KEY,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bdbt_tip_resources (
  id SERIAL PRIMARY KEY,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  description TEXT,
  is_free BOOLEAN DEFAULT true,
  author VARCHAR(255),
  platform VARCHAR(100)
);

-- Create useful views
CREATE OR REPLACE VIEW bdbt_category_stats AS
SELECT 
  category,
  COUNT(*) as tip_count,
  AVG(rating) as avg_rating
FROM bdbt_tips 
WHERE status = 'published'
GROUP BY category;

CREATE OR REPLACE VIEW bdbt_tips_with_counts AS
SELECT 
  t.*,
  COALESCE(ti.include_count, 0) as include_count,
  COALESCE(tr.resource_count, 0) as resource_count
FROM bdbt_tips t
LEFT JOIN (
  SELECT tip_id, COUNT(*) as include_count 
  FROM bdbt_tip_includes 
  GROUP BY tip_id
) ti ON t.id = ti.tip_id
LEFT JOIN (
  SELECT tip_id, COUNT(*) as resource_count 
  FROM bdbt_tip_resources 
  GROUP BY tip_id
) tr ON t.id = tr.tip_id;

CREATE OR REPLACE VIEW bdbt_popular_tips AS
SELECT *
FROM bdbt_tips
WHERE status = 'published'
ORDER BY view_count DESC, rating DESC NULLS LAST;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bdbt_tips_category ON bdbt_tips(category);
CREATE INDEX IF NOT EXISTS idx_bdbt_tips_status ON bdbt_tips(status);
CREATE INDEX IF NOT EXISTS idx_bdbt_tips_featured ON bdbt_tips(is_featured) WHERE is_featured = true;

-- Success message
SELECT 'BDBT Tips database schema created successfully!' as message;