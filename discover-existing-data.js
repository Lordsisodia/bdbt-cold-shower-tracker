#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Discovering existing Supabase data...\n');

async function discoverTables() {
  // Common table names to check
  const possibleTableNames = [
    'tips', 'tip', 'tips_ideas', 'ideas', 'life_tips', 'bdbt_tips',
    'better_day_tips', 'content', 'articles', 'suggestions', 'advice',
    'daily_tips', 'wellness_tips', 'self_improvement'
  ];

  console.log('📋 Checking for existing tables...\n');

  for (const tableName of possibleTableNames) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ Found table: "${tableName}" with ${count} records`);
        
        if (count > 0) {
          // Get a sample record to see the structure
          const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
            
          if (sample && sample[0]) {
            console.log(`📄 Sample record structure:`);
            console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`);
            
            // Show first few values for key fields
            const record = sample[0];
            if (record.title) console.log(`   Title: "${record.title}"`);
            if (record.name) console.log(`   Name: "${record.name}"`);
            if (record.description) console.log(`   Description: "${record.description.substring(0, 100)}..."`);
            if (record.category) console.log(`   Category: "${record.category}"`);
            if (record.type) console.log(`   Type: "${record.type}"`);
          }
          console.log('');
        }
      }
    } catch (err) {
      // Table doesn't exist or no access, skip silently
    }
  }

  // Also check if we can access information_schema (might need service role)
  try {
    console.log('🔍 Trying to get complete table list...\n');
    
    // This might not work with anon key, but worth trying
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (!error && data) {
      console.log('📊 All public tables:');
      data.forEach(table => console.log(`   - ${table.table_name}`));
    }
  } catch (err) {
    console.log('ℹ️  Could not access information_schema (need higher permissions)');
  }

  console.log('\n💡 If you know the exact table name, let me know and I can help connect to it!');
}

discoverTables().catch(console.error);