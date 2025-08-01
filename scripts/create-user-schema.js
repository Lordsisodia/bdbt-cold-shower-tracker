#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Schema creator for BDBT user management system
class BdbtSchemaCreator {
  constructor() {
    this.projectUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
    this.serviceRoleKey = 'sb_secret_O-_c-mbsICfrzIcXSBW45Q_lisfrQP2';
    this.supabase = createClient(this.projectUrl, this.serviceRoleKey);
  }

  async createTable(tableName, createSQL) {
    try {
      console.log(`🔧 Creating table: ${tableName}`);
      
      // Test if table exists by trying to select from it
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.log(`❌ Table ${tableName} does not exist. Please create it manually.`);
        console.log(`📋 SQL to run in Supabase SQL Editor:\n`);
        console.log(createSQL);
        console.log(`\n${'='.repeat(80)}\n`);
        return { success: false, needsManualCreation: true, sql: createSQL };
      } else if (error) {
        console.error(`❌ Error checking table ${tableName}:`, error.message);
        return { success: false, error: error.message };
      } else {
        console.log(`✅ Table ${tableName} already exists`);
        return { success: true, exists: true };
      }
    } catch (err) {
      console.error(`❌ Exception with table ${tableName}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  async createAllTables() {
    console.log('🚀 Creating BDBT User Management Schema...\n');

    const tables = [
      {
        name: 'user_profiles',
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
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_user_profiles_level ON user_profiles(level);
CREATE INDEX idx_user_profiles_streak ON user_profiles(streak_count);`
      },

      {
        name: 'user_tip_progress',
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
);

-- Create indexes
CREATE INDEX idx_user_tip_progress_user ON user_tip_progress(user_id);
CREATE INDEX idx_user_tip_progress_tip ON user_tip_progress(tip_id);
CREATE INDEX idx_user_tip_progress_status ON user_tip_progress(status);
CREATE INDEX idx_user_tip_progress_completed ON user_tip_progress(completed_at) WHERE completed_at IS NOT NULL;`
      },

      {
        name: 'user_daily_activity',
        sql: `CREATE TABLE user_daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tips_completed INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 1,
  goal_achieved BOOLEAN DEFAULT false,
  points_earned INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX idx_user_daily_activity_user_date ON user_daily_activity(user_id, date);
CREATE INDEX idx_user_daily_activity_date ON user_daily_activity(date);
CREATE INDEX idx_user_daily_activity_goal_achieved ON user_daily_activity(goal_achieved) WHERE goal_achieved = true;`
      },

      {
        name: 'user_tip_favorites',
        sql: `CREATE TABLE user_tip_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- Create indexes
CREATE INDEX idx_user_tip_favorites_user ON user_tip_favorites(user_id);
CREATE INDEX idx_user_tip_favorites_tip ON user_tip_favorites(tip_id);`
      },

      {
        name: 'user_tip_bookmarks',
        sql: `CREATE TABLE user_tip_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  folder_name VARCHAR(50) DEFAULT 'default',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- Create indexes
CREATE INDEX idx_user_tip_bookmarks_user ON user_tip_bookmarks(user_id);
CREATE INDEX idx_user_tip_bookmarks_folder ON user_tip_bookmarks(user_id, folder_name);`
      },

      {
        name: 'user_collections',
        sql: `CREATE TABLE user_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_collections_user ON user_collections(user_id);
CREATE INDEX idx_user_collections_public ON user_collections(is_public) WHERE is_public = true;`
      },

      {
        name: 'user_collection_tips',
        sql: `CREATE TABLE user_collection_tips (
  collection_id UUID REFERENCES user_collections(id) ON DELETE CASCADE,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, tip_id)
);

-- Create indexes
CREATE INDEX idx_user_collection_tips_collection ON user_collection_tips(collection_id, order_index);`
      },

      {
        name: 'user_achievements',
        sql: `CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  points_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_type)
);

-- Create indexes
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);`
      },

      {
        name: 'tip_reviews',
        sql: `CREATE TABLE tip_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT true,
  helpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tip_id)
);

-- Create indexes
CREATE INDEX idx_tip_reviews_tip ON tip_reviews(tip_id);
CREATE INDEX idx_tip_reviews_user ON tip_reviews(user_id);
CREATE INDEX idx_tip_reviews_public ON tip_reviews(is_public) WHERE is_public = true;
CREATE INDEX idx_tip_reviews_rating ON tip_reviews(rating);`
      },

      {
        name: 'user_activity_events',
        sql: `CREATE TABLE user_activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  tip_id INTEGER REFERENCES bdbt_tips(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_activity_events_user ON user_activity_events(user_id);
CREATE INDEX idx_user_activity_events_type ON user_activity_events(event_type);
CREATE INDEX idx_user_activity_events_created ON user_activity_events(created_at);
CREATE INDEX idx_user_activity_events_session ON user_activity_events(session_id) WHERE session_id IS NOT NULL;`
      }
    ];

    const results = [];
    const sqlStatements = [];

    for (const table of tables) {
      const result = await this.createTable(table.name, table.sql);
      results.push({ table: table.name, ...result });
      
      if (result.needsManualCreation) {
        sqlStatements.push(`-- ${table.name.toUpperCase()}\n${table.sql}\n`);
      }
    }

    // Summary
    console.log('\n🎉 Schema Creation Summary:');
    const existing = results.filter(r => r.exists).length;
    const needsCreation = results.filter(r => r.needsManualCreation).length;
    const errors = results.filter(r => r.error && !r.needsManualCreation).length;

    console.log(`✅ Existing tables: ${existing}`);
    console.log(`📋 Need manual creation: ${needsCreation}`);
    console.log(`❌ Errors: ${errors}`);

    if (sqlStatements.length > 0) {
      console.log('\n📋 COPY THE FOLLOWING SQL TO SUPABASE SQL EDITOR:');
      console.log('='.repeat(80));
      sqlStatements.forEach(sql => console.log(sql));
      console.log('='.repeat(80));
    }

    return {
      success: true,
      summary: { existing, needsCreation, errors },
      results,
      sqlStatements
    };
  }

  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('bdbt_tips')
        .select('count', { count: 'exact', head: true });

      if (error) throw new Error(error.message);
      
      console.log(`✅ Database connection successful! (${data?.length || 0} tips)`);
      return { success: true };
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      return { success: false, error: err.message };
    }
  }
}

// Run the schema creation
async function main() {
  const creator = new BdbtSchemaCreator();
  
  // Test connection first
  await creator.testConnection();
  
  // Create all tables
  const result = await creator.createAllTables();
  
  if (result.summary.needsCreation > 0) {
    console.log('\n🚨 NEXT STEPS:');
    console.log('1. Copy the SQL statements above');
    console.log('2. Go to: https://supabase.com/dashboard/project/fnkdtnmlyxcwrptdbmqy/sql');
    console.log('3. Paste and run the SQL');
    console.log('4. Run this script again to verify creation');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BdbtSchemaCreator;