#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
const envPath = path.join(__dirname, '../.env');
let supabaseUrl = '';
let supabaseKey = '';
let isConfigured = false;

try {
  const envContent = await fs.readFile(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1].trim();
    }
  }
  
  if (supabaseUrl && supabaseKey && 
      supabaseUrl !== 'your-supabase-project-url' && 
      supabaseKey !== 'your-supabase-anon-key') {
    isConfigured = true;
  }
} catch (error) {
  console.error('Could not load .env file:', error.message);
}

// Initialize Supabase client if configured
let supabase = null;
if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.error('✅ Supabase MCP Server connected');
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
} else {
  console.error('⚠️ Supabase not configured, MCP server running in read-only mode');
}

// Mock data for when Supabase is not available
const mockData = {
  tips: [
    {
      id: 1,
      title: 'Morning Gratitude Practice',
      subtitle: 'Start your day with positivity',
      category: 'happiness',
      subcategory: 'mental-wellness',
      difficulty: 'Easy',
      description: 'Begin each day by writing down three things youre grateful for.',
      primary_benefit: 'Improved mental clarity and positive outlook',
      secondary_benefit: 'Better stress management throughout the day',
      tertiary_benefit: 'Enhanced appreciation for lifes small moments',
      implementation_time: '5 minutes',
      frequency: 'Daily',
      cost: 'Free',
      scientific_backing: true,
      tags: ['gratitude', 'mindfulness', 'morning-routine'],
      status: 'published',
      view_count: 1250,
      download_count: 340,
      rating: 4.8,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Cold Shower Challenge',
      subtitle: 'Build resilience and boost energy',
      category: 'health',
      subcategory: 'physical-wellness',
      difficulty: 'Moderate',
      description: 'End your shower with 30-60 seconds of cold water.',
      primary_benefit: 'Increased energy and alertness',
      secondary_benefit: 'Improved immune system function',
      tertiary_benefit: 'Greater mental resilience and willpower',
      implementation_time: '1-2 minutes',
      frequency: 'Daily',
      cost: 'Free',
      scientific_backing: true,
      tags: ['cold-therapy', 'energy', 'resilience'],
      status: 'published',
      view_count: 890,
      download_count: 230,
      rating: 4.6,
      created_at: new Date().toISOString()
    }
  ],
  calendar_events: [
    {
      id: 1,
      title: 'Weekly Content Review',
      category: 'health',
      status: 'scheduled',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'review',
      priority: 'high',
      assignee: 'Content Team',
      description: 'Review and approve pending content'
    }
  ]
};

class SupabaseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'bdbt-supabase-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupResourceHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_tips',
            description: 'List all tips from the database with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  enum: ['health', 'wealth', 'happiness'],
                  description: 'Filter by category'
                },
                difficulty: {
                  type: 'string',
                  enum: ['Easy', 'Moderate', 'Advanced'],
                  description: 'Filter by difficulty'
                },
                status: {
                  type: 'string',
                  enum: ['draft', 'published', 'archived'],
                  description: 'Filter by status'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of tips to return',
                  default: 20
                }
              }
            }
          },
          {
            name: 'get_tip',
            description: 'Get a specific tip by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'The tip ID'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'create_tip',
            description: 'Create a new tip in the database',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Tip title' },
                subtitle: { type: 'string', description: 'Tip subtitle' },
                category: { 
                  type: 'string', 
                  enum: ['health', 'wealth', 'happiness'],
                  description: 'Tip category' 
                },
                difficulty: { 
                  type: 'string', 
                  enum: ['Easy', 'Moderate', 'Advanced'],
                  description: 'Difficulty level' 
                },
                description: { type: 'string', description: 'Detailed description' },
                primary_benefit: { type: 'string', description: 'Primary benefit' },
                secondary_benefit: { type: 'string', description: 'Secondary benefit' },
                tertiary_benefit: { type: 'string', description: 'Tertiary benefit' },
                implementation_time: { type: 'string', description: 'Time to implement' },
                frequency: { type: 'string', description: 'How often to do it' },
                cost: { type: 'string', description: 'Cost involved' },
                tags: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Tags for categorization' 
                }
              },
              required: ['title', 'subtitle', 'category', 'difficulty', 'description', 'primary_benefit']
            }
          },
          {
            name: 'update_tip',
            description: 'Update an existing tip',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'number', description: 'Tip ID to update' },
                updates: {
                  type: 'object',
                  description: 'Fields to update',
                  additionalProperties: true
                }
              },
              required: ['id', 'updates']
            }
          },
          {
            name: 'delete_tip',
            description: 'Delete a tip by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'number', description: 'Tip ID to delete' }
              },
              required: ['id']
            }
          },
          {
            name: 'get_statistics',
            description: 'Get database statistics and metrics',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'list_calendar_events',
            description: 'List calendar events with optional filtering',
            inputSchema: {
              type: 'object',
              properties: {
                start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
                end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
                category: { 
                  type: 'string', 
                  enum: ['health', 'wealth', 'happiness'],
                  description: 'Filter by category' 
                },
                status: { 
                  type: 'string', 
                  enum: ['scheduled', 'published', 'draft'],
                  description: 'Filter by status' 
                }
              }
            }
          },
          {
            name: 'create_calendar_event',
            description: 'Create a new calendar event',
            inputSchema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Event title' },
                category: { 
                  type: 'string', 
                  enum: ['health', 'wealth', 'happiness'],
                  description: 'Event category' 
                },
                status: { 
                  type: 'string', 
                  enum: ['scheduled', 'published', 'draft'],
                  description: 'Event status' 
                },
                date: { type: 'string', description: 'Event date (YYYY-MM-DD)' },
                time: { type: 'string', description: 'Event time (HH:MM)' },
                type: { 
                  type: 'string', 
                  enum: ['tip', 'idea', 'campaign', 'review'],
                  description: 'Event type' 
                },
                priority: { 
                  type: 'string', 
                  enum: ['low', 'medium', 'high'],
                  description: 'Priority level' 
                },
                description: { type: 'string', description: 'Event description' }
              },
              required: ['title', 'category', 'status', 'date', 'time', 'type', 'priority']
            }
          },
          {
            name: 'test_connection',
            description: 'Test the Supabase connection and return status',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_tips':
            return await this.listTips(args);
          case 'get_tip':
            return await this.getTip(args);
          case 'create_tip':
            return await this.createTip(args);
          case 'update_tip':
            return await this.updateTip(args);
          case 'delete_tip':
            return await this.deleteTip(args);
          case 'get_statistics':
            return await this.getStatistics();
          case 'list_calendar_events':
            return await this.listCalendarEvents(args);
          case 'create_calendar_event':
            return await this.createCalendarEvent(args);
          case 'test_connection':
            return await this.testConnection();
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  setupResourceHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'supabase://tips',
            mimeType: 'application/json',
            name: 'BDBT Tips Database',
            description: 'All tips stored in the database'
          },
          {
            uri: 'supabase://calendar-events',
            mimeType: 'application/json',
            name: 'BDBT Calendar Events',
            description: 'All calendar events and scheduling data'
          },
          {
            uri: 'supabase://statistics',
            mimeType: 'application/json',
            name: 'BDBT Database Statistics',
            description: 'Database statistics and metrics'
          },
          {
            uri: 'supabase://connection-status',
            mimeType: 'application/json',
            name: 'Supabase Connection Status',
            description: 'Current connection status and configuration'
          }
        ]
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'supabase://tips':
          const tips = await this.listTips({});
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(tips.content, null, 2)
            }]
          };

        case 'supabase://calendar-events':
          const events = await this.listCalendarEvents({});
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(events.content, null, 2)
            }]
          };

        case 'supabase://statistics':
          const stats = await this.getStatistics();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(stats.content, null, 2)
            }]
          };

        case 'supabase://connection-status':
          const status = await this.testConnection();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(status.content, null, 2)
            }]
          };

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${uri}`);
      }
    });
  }

  // Tool implementations
  async listTips(args) {
    if (!supabase) {
      // Return mock data
      let filteredTips = mockData.tips;
      
      if (args.category) {
        filteredTips = filteredTips.filter(tip => tip.category === args.category);
      }
      if (args.difficulty) {
        filteredTips = filteredTips.filter(tip => tip.difficulty === args.difficulty);
      }
      if (args.status) {
        filteredTips = filteredTips.filter(tip => tip.status === args.status);
      }
      
      const limit = args.limit || 20;
      const results = filteredTips.slice(0, limit);
      
      return {
        content: [{
          type: 'text',
          text: `Found ${results.length} tips (using mock data):\n\n${JSON.stringify(results, null, 2)}`
        }]
      };
    }

    try {
      let query = supabase.from('bdbt_tips').select('*');
      
      if (args.category) query = query.eq('category', args.category);
      if (args.difficulty) query = query.eq('difficulty', args.difficulty);
      if (args.status) query = query.eq('status', args.status);
      
      const limit = args.limit || 20;
      query = query.limit(limit);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Found ${data.length} tips:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list tips: ${error.message}`);
    }
  }

  async getTip(args) {
    if (!supabase) {
      const tip = mockData.tips.find(t => t.id === args.id);
      if (!tip) {
        return {
          content: [{
            type: 'text',
            text: `Tip with ID ${args.id} not found in mock data`
          }]
        };
      }
      return {
        content: [{
          type: 'text',
          text: `Tip details (mock data):\n\n${JSON.stringify(tip, null, 2)}`
        }]
      };
    }

    try {
      const { data, error } = await supabase
        .from('bdbt_tips')
        .select('*')
        .eq('id', args.id)
        .single();
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Tip details:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get tip: ${error.message}`);
    }
  }

  async createTip(args) {
    if (!supabase) {
      return {
        content: [{
          type: 'text',
          text: 'Cannot create tip: Supabase not configured. This would create a new tip with the provided data in a real database.'
        }]
      };
    }

    try {
      const tipData = {
        title: args.title,
        subtitle: args.subtitle,
        category: args.category,
        subcategory: args.subcategory || 'general',
        difficulty: args.difficulty,
        description: args.description,
        primary_benefit: args.primary_benefit,
        secondary_benefit: args.secondary_benefit || '',
        tertiary_benefit: args.tertiary_benefit || '',
        implementation_time: args.implementation_time || '5-10 minutes',
        frequency: args.frequency || 'Daily',
        cost: args.cost || 'Free',
        scientific_backing: args.scientific_backing || false,
        tags: args.tags || [],
        status: 'draft'
      };

      const { data, error } = await supabase
        .from('bdbt_tips')
        .insert([tipData])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Successfully created tip:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to create tip: ${error.message}`);
    }
  }

  async updateTip(args) {
    if (!supabase) {
      return {
        content: [{
          type: 'text',
          text: `Cannot update tip: Supabase not configured. This would update tip ID ${args.id} with the provided data.`
        }]
      };
    }

    try {
      const { data, error } = await supabase
        .from('bdbt_tips')
        .update(args.updates)
        .eq('id', args.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Successfully updated tip:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to update tip: ${error.message}`);
    }
  }

  async deleteTip(args) {
    if (!supabase) {
      return {
        content: [{
          type: 'text',
          text: `Cannot delete tip: Supabase not configured. This would delete tip ID ${args.id}.`
        }]
      };
    }

    try {
      const { error } = await supabase
        .from('bdbt_tips')
        .delete()
        .eq('id', args.id);
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Successfully deleted tip ID ${args.id}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to delete tip: ${error.message}`);
    }
  }

  async getStatistics() {
    if (!supabase) {
      const stats = {
        total_tips: mockData.tips.length,
        tips_by_category: {
          health: mockData.tips.filter(t => t.category === 'health').length,
          wealth: mockData.tips.filter(t => t.category === 'wealth').length,
          happiness: mockData.tips.filter(t => t.category === 'happiness').length
        },
        tips_by_difficulty: {
          Easy: mockData.tips.filter(t => t.difficulty === 'Easy').length,
          Moderate: mockData.tips.filter(t => t.difficulty === 'Moderate').length,
          Advanced: mockData.tips.filter(t => t.difficulty === 'Advanced').length
        },
        total_calendar_events: mockData.calendar_events.length,
        data_source: 'mock_data'
      };
      
      return {
        content: [{
          type: 'text',
          text: `Database Statistics (Mock Data):\n\n${JSON.stringify(stats, null, 2)}`
        }]
      };
    }

    try {
      const { data: tips, error: tipsError } = await supabase
        .from('bdbt_tips')
        .select('category, difficulty, status');
      
      if (tipsError) throw tipsError;

      const { data: events, error: eventsError } = await supabase
        .from('calendar_events')
        .select('category, status, type');
      
      if (eventsError) throw eventsError;

      const stats = {
        total_tips: tips.length,
        tips_by_category: {
          health: tips.filter(t => t.category === 'health').length,
          wealth: tips.filter(t => t.category === 'wealth').length,
          happiness: tips.filter(t => t.category === 'happiness').length
        },
        tips_by_difficulty: {
          Easy: tips.filter(t => t.difficulty === 'Easy').length,
          Moderate: tips.filter(t => t.difficulty === 'Moderate').length,
          Advanced: tips.filter(t => t.difficulty === 'Advanced').length
        },
        tips_by_status: {
          draft: tips.filter(t => t.status === 'draft').length,
          published: tips.filter(t => t.status === 'published').length,
          archived: tips.filter(t => t.status === 'archived').length
        },
        total_calendar_events: events.length,
        events_by_category: {
          health: events.filter(e => e.category === 'health').length,
          wealth: events.filter(e => e.category === 'wealth').length,
          happiness: events.filter(e => e.category === 'happiness').length
        },
        data_source: 'supabase'
      };
      
      return {
        content: [{
          type: 'text',
          text: `Database Statistics:\n\n${JSON.stringify(stats, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get statistics: ${error.message}`);
    }
  }

  async listCalendarEvents(args) {
    if (!supabase) {
      let filteredEvents = mockData.calendar_events;
      
      if (args.category) {
        filteredEvents = filteredEvents.filter(e => e.category === args.category);
      }
      if (args.status) {
        filteredEvents = filteredEvents.filter(e => e.status === args.status);
      }
      
      return {
        content: [{
          type: 'text',
          text: `Found ${filteredEvents.length} calendar events (mock data):\n\n${JSON.stringify(filteredEvents, null, 2)}`
        }]
      };
    }

    try {
      let query = supabase.from('calendar_events').select('*');
      
      if (args.start_date) query = query.gte('date', args.start_date);
      if (args.end_date) query = query.lte('date', args.end_date);
      if (args.category) query = query.eq('category', args.category);
      if (args.status) query = query.eq('status', args.status);
      
      query = query.order('date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Found ${data.length} calendar events:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list calendar events: ${error.message}`);
    }
  }

  async createCalendarEvent(args) {
    if (!supabase) {
      return {
        content: [{
          type: 'text',
          text: 'Cannot create calendar event: Supabase not configured. This would create a new calendar event with the provided data.'
        }]
      };
    }

    try {
      const eventData = {
        title: args.title,
        category: args.category,
        status: args.status,
        date: args.date,
        time: args.time,
        type: args.type,
        priority: args.priority,
        description: args.description || ''
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([eventData])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        content: [{
          type: 'text',
          text: `Successfully created calendar event:\n\n${JSON.stringify(data, null, 2)}`
        }]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to create calendar event: ${error.message}`);
    }
  }

  async testConnection() {
    const status = {
      configured: isConfigured,
      connected: false,
      supabase_url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not set',
      has_anon_key: !!supabaseKey,
      tables_accessible: false,
      error: null
    };

    if (!supabase) {
      status.error = 'Supabase client not initialized';
      return {
        content: [{
          type: 'text',
          text: `Connection Status:\n\n${JSON.stringify(status, null, 2)}`
        }]
      };
    }

    try {
      // Test with a simple query
      const { data, error } = await supabase
        .from('bdbt_tips')
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        status.error = error.message;
      } else {
        status.connected = true;
        status.tables_accessible = true;
      }
    } catch (error) {
      status.error = error.message;
    }

    return {
      content: [{
        type: 'text',
        text: `Connection Status:\n\n${JSON.stringify(status, null, 2)}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 BDBT Supabase MCP Server running on stdio');
  }
}

const server = new SupabaseMCPServer();
server.run().catch(console.error);