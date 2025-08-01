import { createClient } from '@supabase/supabase-js';

// Direct connection to BDBT Supabase project
const supabaseUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2R0bm1seXhjd3JwdGRibXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg3NjYxMSwiZXhwIjoyMDY5NDUyNjExfQ.RX_NbtQhUONbgfJfvokJikHoktuiourypLVSgaVyHZk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBdbtTipsSchema() {
  console.log('🔧 Creating BDBT tips schema...');
  
  // Create the main tips table based on the structure we found working
  const createTableSQL = `
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
      status VARCHAR(20) DEFAULT 'published',
      search_vector TSVECTOR
    );
  `;
  
  try {
    const { data, error } = await supabase.rpc('sql', { query: createTableSQL });
    
    if (error) {
      console.error('❌ Error creating table:', error.message);
      return false;
    }
    
    console.log('✅ Table bdbt_tips created successfully!');
    
    // Create supporting tables
    const createIncludesTable = `
      CREATE TABLE IF NOT EXISTS bdbt_tip_includes (
        id SERIAL PRIMARY KEY,
        tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE CASCADE,
        item TEXT NOT NULL,
        order_index INTEGER DEFAULT 0
      );
    `;
    
    const createResourcesTable = `
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
    `;
    
    // Create supporting tables
    await supabase.rpc('sql', { query: createIncludesTable });
    await supabase.rpc('sql', { query: createResourcesTable });
    
    console.log('✅ Supporting tables created successfully!');
    
    // Create some useful views
    const createViewsSQL = `
      -- View with tip counts for categories
      CREATE OR REPLACE VIEW bdbt_category_stats AS
      SELECT 
        category,
        COUNT(*) as tip_count,
        AVG(rating) as avg_rating
      FROM bdbt_tips 
      WHERE status = 'published'
      GROUP BY category;
      
      -- View for tips with includes
      CREATE OR REPLACE VIEW bdbt_tips_with_counts AS
      SELECT 
        t.*,
        COUNT(ti.id) as include_count,
        COUNT(tr.id) as resource_count
      FROM bdbt_tips t
      LEFT JOIN bdbt_tip_includes ti ON t.id = ti.tip_id
      LEFT JOIN bdbt_tip_resources tr ON t.id = tr.tip_id
      GROUP BY t.id;
      
      -- View for popular tips
      CREATE OR REPLACE VIEW bdbt_popular_tips AS
      SELECT *
      FROM bdbt_tips
      WHERE status = 'published'
      ORDER BY view_count DESC, rating DESC;
    `;
    
    await supabase.rpc('sql', { query: createViewsSQL });
    console.log('✅ Views created successfully!');
    
    return true;
  } catch (err) {
    console.error('❌ Error creating schema:', err.message);
    return false;
  }
}

async function testTableCreation() {
  const created = await createBdbtTipsSchema();
  
  if (created) {
    // Test that we can query the new table
    try {
      const { data, error } = await supabase
        .from('bdbt_tips')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Error testing table:', error.message);
      } else {
        console.log('✅ Table is ready! Current count:', data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Error testing table:', err.message);
    }
  }
}

testTableCreation().catch(console.error);