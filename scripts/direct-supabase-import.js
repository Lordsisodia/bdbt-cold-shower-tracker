import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Direct connection to BDBT Supabase project
const supabaseUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2R0bm1seXhjd3JwdGRibXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzg3NjYxMSwiZXhwIjoyMDY5NDUyNjExfQ.RX_NbtQhUONbgfJfvokJikHoktuiourypLVSgaVyHZk';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testConnection() {
  console.log('🔗 Testing Supabase connection...');
  
  try {
    // Test with a simple table creation to verify permissions
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);
    
    // This should fail with "relation does not exist" if connection works
    // but succeed if table exists
    if (error && error.message.includes('does not exist')) {
      console.log('✅ Connection successful! (table does not exist yet)');
      return true;
    } else if (error) {
      console.error('❌ Connection error:', error.message); 
      return false;
    } else {
      console.log('✅ Connection successful!');
      return true;
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

async function createSchema() {
  console.log('🔧 Creating database schema...');
  
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
      status VARCHAR(20) DEFAULT 'published'
    );
  `;
  
  try {
    const { error } = await supabase.rpc('query', { query: createTableSQL });
    if (error) {
      console.error('❌ Error creating schema:', error.message);
      return false;
    }
    console.log('✅ Schema created successfully!');
    return true;
  } catch (err) {
    console.error('❌ Schema creation failed:', err.message);
    return false;
  }
}

async function importTips() {
  console.log('📚 Starting BDBT tips import...');
  
  // First create the schema
  const schemaCreated = await createSchema();
  if (!schemaCreated) {
    console.error('❌ Cannot proceed without schema');
    return;
  }
  
  // Load tips data
  const tipsDataPath = path.join(__dirname, 'data', 'bdbt-1000-tips.json');
  if (!fs.existsSync(tipsDataPath)) {
    console.error('❌ Tips data not found at:', tipsDataPath);
    return;
  }
  
  const tipsData = JSON.parse(fs.readFileSync(tipsDataPath, 'utf8'));
  const tips = tipsData.tips;
  
  console.log(`📊 Found ${tips.length} tips to import`);
  
  // Check current tip count
  const { data: existingTips, error: countError } = await supabase
    .from('bdbt_tips')
    .select('id', { count: 'exact' });
  
  if (countError) {
    console.error('❌ Error checking existing tips:', countError.message);
    return;
  }
  
  console.log(`📈 Current tips in database: ${existingTips?.length || 0}`);
  
  // Import first 5 tips as test
  const testTips = tips.slice(0, 5);
  console.log(`🧪 Importing first ${testTips.length} tips as test...`);
  
  for (const [index, tip] of testTips.entries()) {
    try {
      console.log(`⏳ Importing tip ${index + 1}: ${tip.title}`);
      
      const tipData = {
        title: tip.title,
        subtitle: tip.subtitle || '',
        category: tip.category,
        subcategory: tip.subcategory || '',
        difficulty: tip.difficulty,
        description: tip.description || '',
        primary_benefit: tip.primaryBenefit || '',
        secondary_benefit: tip.secondaryBenefit || '',
        tertiary_benefit: tip.tertiaryBenefit || '',
        implementation_time: tip.implementationTime || '',
        frequency: tip.frequency || '',
        cost: tip.cost || '',
        scientific_backing: tip.scientificBacking || false,
        tags: tip.tags || [],
        status: 'published',
        view_count: 0,
        download_count: 0,
        is_featured: false
      };
      
      const { data, error } = await supabase
        .from('bdbt_tips')
        .insert(tipData)
        .select();
      
      if (error) {
        console.error(`❌ Error importing tip ${index + 1}:`, error.message);
      } else {
        console.log(`✅ Successfully imported tip ${index + 1}: ${tip.title}`);
      }
    } catch (err) {
      console.error(`❌ Exception importing tip ${index + 1}:`, err.message);
    }
  }
  
  console.log('🎉 Import test completed!');
}

async function main() {
  const connected = await testConnection();
  if (connected) {
    await importTips();
  }
}

main().catch(console.error);