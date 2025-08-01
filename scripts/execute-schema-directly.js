#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Direct schema execution using Supabase client
class DirectSchemaExecutor {
  constructor() {
    this.projectUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
    this.serviceRoleKey = 'sb_secret_O-_c-mbsICfrzIcXSBW45Q_lisfrQP2';
    this.supabase = createClient(this.projectUrl, this.serviceRoleKey);
  }

  async executeSQL(sql, description) {
    try {
      console.log(`🔧 Executing: ${description}`);
      
      // Try using the REST API directly for DDL operations
      const response = await fetch(`${this.projectUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'apikey': this.serviceRoleKey,
          'Authorization': `Bearer ${this.serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ query: sql })
      });

      if (response.ok) {
        console.log(`✅ ${description} - SUCCESS`);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.log(`❌ ${description} - FAILED: ${errorText}`);
        return { success: false, error: errorText };
      }
    } catch (err) {
      console.log(`❌ ${description} - ERROR: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async createAllTables() {
    console.log('🚀 Executing BDBT Schema Creation via Direct API...\n');

    const tables = [
      {
        name: 'user_profiles',
        description: 'User Profiles Table',
        sql: `CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{
    "categories": ["health", "wealth", "happiness"],
    "difficulty_level": "Easy",
    "daily_goal": 1,
    "notifications": true,
    "timezone": "UTC"
  }'::jsonb,
  streak_count INTEGER DEFAULT 0,
  total_tips_completed INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`
      },
      {
        name: 'user_profiles_indexes',
        description: 'User Profiles Indexes',
        sql: `CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_streak ON user_profiles(streak_count);`
      },
      {
        name: 'user_tip_progress',
        description: 'User Tip Progress Table',
        sql: `CREATE TABLE user_tip_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'skipped')
  ),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  difficulty_feedback VARCHAR(20) CHECK (
    difficulty_feedback IN ('too_easy', 'just_right', 'too_hard')
  ),
  would_recommend BOOLEAN,
  time_spent_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);`
      },
      {
        name: 'user_tip_progress_indexes',
        description: 'User Tip Progress Indexes',
        sql: `CREATE INDEX IF NOT EXISTS idx_user_tip_progress_user ON user_tip_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_progress_tip ON user_tip_progress(tip_id);
CREATE INDEX IF NOT EXISTS idx_user_tip_progress_status ON user_tip_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_tip_progress_completed ON user_tip_progress(completed_at) WHERE completed_at IS NOT NULL;`
      },
      {
        name: 'user_tip_favorites',
        description: 'User Favorites Table',
        sql: `CREATE TABLE user_tip_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);`
      }
    ];

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const table of tables) {
      const result = await this.executeSQL(table.sql, table.description);
      results.push({ table: table.name, ...result });
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Schema Execution Summary:');
    console.log(`✅ Successful operations: ${successCount}`);
    console.log(`❌ Failed operations: ${errorCount}`);

    return { success: successCount > 0, successCount, errorCount, results };
  }
}

// Run the direct execution
async function main() {
  const executor = new DirectSchemaExecutor();
  const result = await executor.createAllTables();
  
  if (result.successCount > 0) {
    console.log('\n🎉 Some tables created successfully!');
  } else {
    console.log('\n❌ Schema creation failed. Manual SQL execution required.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DirectSchemaExecutor;