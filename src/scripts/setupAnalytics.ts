#!/usr/bin/env ts-node

/**
 * Analytics Setup Script for BDBT
 * 
 * This script sets up the analytics system by:
 * 1. Creating necessary database tables
 * 2. Setting up RLS policies
 * 3. Creating analytics functions
 * 4. Testing the analytics integration
 */

import { supabase } from '../lib/supabase';
import { testAnalyticsIntegration } from '../utils/testAnalytics';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupAnalyticsDatabase() {
  console.log('🚀 Setting up analytics database...');
  
  try {
    // Read the analytics schema SQL file
    const schemaPath = join(__dirname, '../database/analytics-schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️ Warning executing statement ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️ Warning executing statement ${i + 1}:`, err);
        }
      }
    }
    
    console.log('✅ Analytics database setup completed');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup analytics database:', error);
    return false;
  }
}

async function verifyAnalyticsTables() {
  console.log('🔍 Verifying analytics tables...');
  
  try {
    // Check if analytics_events table exists
    const { data: analyticsEvents, error: analyticsError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);
    
    if (analyticsError && analyticsError.code !== 'PGRST116') {
      console.log('📊 analytics_events table not found, will use tip_analytics');
    } else {
      console.log('✅ analytics_events table verified');
    }
    
    // Check if tip_analytics table exists (from main schema)
    const { data: tipAnalytics, error: tipError } = await supabase
      .from('tip_analytics')
      .select('id')
      .limit(1);
    
    if (tipError && tipError.code !== 'PGRST116') {
      console.log('📊 tip_analytics table not found');
    } else {
      console.log('✅ tip_analytics table verified');
    }
    
    // Check if tips table exists
    const { data: tips, error: tipsError } = await supabase
      .from('tips')
      .select('id')
      .limit(1);
    
    if (tipsError) {
      console.error('❌ tips table not found - this is required for analytics');
      return false;
    } else {
      console.log('✅ tips table verified');
    }
    
    // Check if categories table exists
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (categoriesError) {
      console.warn('⚠️ categories table not found - category analytics may not work');
    } else {
      console.log('✅ categories table verified');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to verify analytics tables:', error);
    return false;
  }
}

async function seedTestData() {
  console.log('🌱 Seeding test analytics data...');
  
  try {
    // Insert some test analytics events
    const testEvents = [
      {
        event_type: 'page_view',
        metadata: { page: '/test', from: 'setup-script' },
        created_at: new Date().toISOString()
      },
      {
        event_type: 'view',
        metadata: { title: 'Test Tip View', from: 'setup-script' },
        created_at: new Date().toISOString()
      },
      {
        event_type: 'search',
        metadata: { search_term: 'test search', results: 5, from: 'setup-script' },
        created_at: new Date().toISOString()
      }
    ];
    
    // Try analytics_events table first
    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert(testEvents);
    
    if (analyticsError) {
      // Try tip_analytics table as fallback
      const { error: tipError } = await supabase
        .from('tip_analytics')
        .insert(testEvents);
      
      if (tipError) {
        console.warn('⚠️ Could not insert test data:', tipError.message);
      } else {
        console.log('✅ Test data inserted into tip_analytics table');
      }
    } else {
      console.log('✅ Test data inserted into analytics_events table');
    }
    
    return true;
  } catch (error) {
    console.warn('⚠️ Could not seed test data:', error);
    return false;
  }
}

async function main() {
  console.log('🎯 BDBT Analytics Setup');
  console.log('=======================');
  
  // Step 1: Setup database
  const dbSetup = await setupAnalyticsDatabase();
  if (!dbSetup) {
    console.error('❌ Database setup failed');
    process.exit(1);
  }
  
  // Step 2: Verify tables
  const tablesVerified = await verifyAnalyticsTables();
  if (!tablesVerified) {
    console.error('❌ Table verification failed');
    process.exit(1);
  }
  
  // Step 3: Seed test data
  await seedTestData();
  
  // Step 4: Test analytics integration
  console.log('\n🧪 Testing analytics integration...');
  const testsPassed = await testAnalyticsIntegration();
  
  if (testsPassed) {
    console.log('\n🎉 Analytics setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit your app and navigate around to generate analytics data');
    console.log('2. Check the Analytics page at /admin/analytics');
    console.log('3. Monitor the browser console for any analytics errors');
    console.log('4. View data in your Supabase dashboard');
  } else {
    console.log('\n⚠️ Analytics setup completed with warnings');
    console.log('Some tests failed - check the logs above for details');
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { setupAnalyticsDatabase, verifyAnalyticsTables, seedTestData };