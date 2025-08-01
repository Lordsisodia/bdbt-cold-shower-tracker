#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MCP Server for BDBT Supabase with OAuth
class BdbtSupabaseMCP {
  constructor() {
    this.projectUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
    this.serviceRoleKey = 'sb_secret_O-_c-mbsICfrzIcXSBW45Q_lisfrQP2';
    this.anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2R0bm1seXhjd3JwdGRibXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzY2MTEsImV4cCI6MjA2OTQ1MjYxMX0.ptZKi5h00D3faXVpuUJlLEeue-j418NMIwaOWcVlPZA';
    
    // Initialize Supabase client with service role key for admin operations
    this.supabase = createClient(this.projectUrl, this.serviceRoleKey);
  }

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('_test_connection')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        return { success: true, message: 'Connection successful' };
      } else if (error) {
        throw new Error(error.message);
      }
      
      return { success: true, message: 'Connection successful' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Execute SQL using direct table operations instead of raw SQL
  async createTipsTable() {
    try {
      // Since we can't execute raw DDL, let's try to create the table by inserting a dummy record
      // and catching the "table doesn't exist" error, then handle it appropriately
      
      // First, let's check if the table exists by trying to select from it
      const { data: existingData, error: selectError } = await this.supabase
        .from('bdbt_tips')
        .select('id')
        .limit(1);
      
      if (selectError && selectError.message.includes('does not exist')) {
        // Table doesn't exist - we need to create it manually
        console.log('❌ Table does not exist. Need to create it via Supabase dashboard.');
        return { 
          success: false, 
          error: 'Table bdbt_tips does not exist. Please create it manually in Supabase dashboard.',
          needsManualCreation: true,
          sql: `CREATE TABLE IF NOT EXISTS bdbt_tips (
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
);`
        };
      } else if (selectError) {
        throw new Error(selectError.message);
      } else {
        // Table exists!
        return { success: true, message: 'Table bdbt_tips already exists' };
      }
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Create the tips schema
  async createSchema() {
    return await this.createTipsTable();
  }

  // Import tips from JSON file
  async importTips() {
    try {
      const tipsDataPath = path.join(__dirname, 'data', 'bdbt-1000-tips.json');
      if (!fs.existsSync(tipsDataPath)) {
        throw new Error('Tips data not found');
      }

      const tipsData = JSON.parse(fs.readFileSync(tipsDataPath, 'utf8'));
      const tips = tipsData.tips.slice(0, 5); // Import first 5 as test

      const results = [];
      for (const tip of tips) {
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
          status: 'published'
        };

        const { data, error } = await this.supabase
          .from('bdbt_tips')
          .insert(tipData)
          .select();

        if (error) {
          results.push({ success: false, tip: tip.title, error: error.message });
        } else {
          results.push({ success: true, tip: tip.title, id: data[0].id });
        }
      }

      return { success: true, results };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Test the custom MCP
async function main() {
  console.log('🚀 Starting BDBT Supabase MCP...');
  
  const mcp = new BdbtSupabaseMCP();
  
  // Test connection
  console.log('🔗 Testing connection...');
  const connectionTest = await mcp.testConnection();
  console.log('Connection result:', connectionTest);
  
  if (connectionTest.success) {
    // Create schema
    console.log('🔧 Creating schema...');
    const schemaResult = await mcp.createSchema();
    console.log('Schema result:', schemaResult);
    
    if (schemaResult.success) {
      // Import tips
      console.log('📚 Importing tips...');
      const importResult = await mcp.importTips();
      console.log('Import result:', importResult);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BdbtSupabaseMCP;