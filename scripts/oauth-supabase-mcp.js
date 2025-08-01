#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OAuth-based MCP Server for BDBT Supabase
class OAuthSupabaseMCP {
  constructor() {
    // OAuth credentials for BDBT MCP Client
    this.clientId = 'b02b6a5d-50d6-42ef-909a-f23d4c3b3a30';
    this.clientSecret = 'sba_1160f6e6506b518ac1981a7a4204550195d96189';
    this.organizationId = 'nkgijulkbpifizqjybjd';
    
    // BDBT Project details
    this.projectId = 'fnkdtnmlyxcwrptdbmqy';
    this.projectUrl = 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
    this.serviceRoleKey = 'sb_secret_O-_c-mbsICfrzIcXSBW45Q_lisfrQP2';
    
    // Initialize Supabase client
    this.supabase = createClient(this.projectUrl, this.serviceRoleKey);
    
    // OAuth access token (will be obtained through OAuth flow)
    this.accessToken = null;
  }

  // Get OAuth access token using client credentials flow
  async getOAuthToken() {
    try {
      const response = await fetch('https://api.supabase.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
        },
        body: new URLSearchParams({
          'grant_type': 'client_credentials',
          'scope': 'projects:read projects:write'
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        return { success: true, token: data.access_token };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'OAuth token request failed');
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Make authenticated API calls to Supabase Management API
  async callManagementAPI(endpoint, options = {}) {
    if (!this.accessToken) {
      const tokenResult = await this.getOAuthToken();
      if (!tokenResult.success) {
        throw new Error(`OAuth authentication failed: ${tokenResult.error}`);
      }
    }

    const response = await fetch(`https://api.supabase.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API call failed: ${response.status}`);
    }

    return await response.json();
  }

  // Test OAuth connection and project access
  async testOAuthConnection() {
    try {
      // First get OAuth token
      const tokenResult = await this.getOAuthToken();
      if (!tokenResult.success) {
        return { success: false, error: `OAuth failed: ${tokenResult.error}` };
      }

      // Test by listing projects in the organization
      const projects = await this.callManagementAPI(`/organizations/${this.organizationId}/projects`);
      
      // Check if our BDBT project is in the list
      const bdbtProject = projects.find(p => p.id === this.projectId);
      
      if (bdbtProject) {
        return { 
          success: true, 
          message: 'OAuth connection successful',
          project: bdbtProject,
          totalProjects: projects.length
        };
      } else {
        return { 
          success: false, 
          error: 'BDBT project not found in organization',
          availableProjects: projects.map(p => ({ id: p.id, name: p.name }))
        };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Execute SQL using Management API
  async executeSQLViaAPI(query) {
    try {
      const result = await this.callManagementAPI(`/projects/${this.projectId}/database/query`, {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Test direct Supabase client connection (fallback)
  async testDirectConnection() {
    try {
      const { data, error } = await this.supabase
        .from('bdbt_tips')
        .select('id')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        return { success: true, message: 'Connection works, table needs creation' };
      } else if (error) {
        throw new Error(error.message);
      } else {
        return { success: true, message: 'Direct connection and table access successful', tipCount: data?.length || 0 };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Import more tips
  async importMoreTips(count = 10) {
    try {
      const tipsDataPath = path.join(__dirname, 'data', 'bdbt-1000-tips.json');
      if (!fs.existsSync(tipsDataPath)) {
        throw new Error('Tips data not found');
      }

      const tipsData = JSON.parse(fs.readFileSync(tipsDataPath, 'utf8'));
      
      // Skip first 5 (already imported) and get next batch
      const tips = tipsData.tips.slice(5, 5 + count);

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

      return { success: true, results, imported: results.filter(r => r.success).length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // Get tips from database
  async getTips(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('bdbt_tips')
        .select('id, title, category, difficulty, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true, tips: data, count: data.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Test the OAuth MCP
async function main() {
  console.log('🚀 Starting OAuth BDBT Supabase MCP...');
  
  const mcp = new OAuthSupabaseMCP();
  
  // Test OAuth connection
  console.log('🔐 Testing OAuth connection...');
  const oauthTest = await mcp.testOAuthConnection();
  console.log('OAuth result:', oauthTest);
  
  // Test direct connection (fallback)
  console.log('🔗 Testing direct connection...');
  const directTest = await mcp.testDirectConnection();
  console.log('Direct connection result:', directTest);
  
  if (directTest.success) {
    // Get existing tips
    console.log('📚 Getting existing tips...');
    const tipsResult = await mcp.getTips();
    console.log('Tips result:', tipsResult);
    
    // Import more tips
    console.log('📚 Importing more tips...');
    const importResult = await mcp.importMoreTips(5);
    console.log('Import result:', importResult);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default OAuthSupabaseMCP;