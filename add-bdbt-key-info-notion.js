import { Client } from '@notionhq/client';

// Initialize Notion client
const notion = new Client({
  auth: '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'
});

function createRichText(text, annotations = {}) {
  return [{
    type: 'text',
    text: { content: text },
    annotations
  }];
}

async function addKeyInformation() {
  try {
    console.log('🔑 Adding key BDBT information to Notion...\n');

    // Find the main dashboard
    const searchResults = await notion.search({
      query: 'BDBT Platform Hub',
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    const mainDashboard = searchResults.results[0];
    if (!mainDashboard) {
      throw new Error('Main dashboard not found');
    }

    console.log('✅ Found main dashboard, adding key information...');

    // Create comprehensive information blocks
    const keyInfoBlocks = [
      {
        object: 'block',
        type: 'divider',
        divider: {}
      },
      {
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: createRichText('🔑 Key Project Information')
        }
      },
      
      // Project Overview
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('📋 Project Overview')
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('BDBT (Business Development & Business Tips) is a revolutionary wellness platform that combines health, wealth, and happiness into one integrated solution. Built with AI-powered technology using Claude Code, achieving 97% cost savings and 5x faster development.'),
          icon: { emoji: '🚀' },
          color: 'blue_background'
        }
      },
      
      // Key Metrics
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('📊 Key Metrics & Achievements')
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('💰 Development Cost Savings: $1.66 million (97% reduction)'),
          icon: { emoji: '💵' },
          color: 'green_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('⏱️ Time to Market: 6 weeks (vs 11 months traditional)'),
          icon: { emoji: '🏃' },
          color: 'yellow_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('📚 Tips Database: 619+ scientifically-backed wellness tips'),
          icon: { emoji: '📖' },
          color: 'purple_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('💻 Tech Stack: React + TypeScript + Supabase + AI Integration'),
          icon: { emoji: '🛠️' },
          color: 'gray_background'
        }
      },
      
      // Revenue Model
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('💎 Revenue Model')
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: createRichText('Projected Annual Recurring Revenue: $8.7M+ across multiple streams:'),
          color: 'default'
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: createRichText('Tiered Subscriptions: $5.2M ARR ($47-497/month)')
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: createRichText('Corporate Wellness: $2M+ ARR (Enterprise packages)')
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: createRichText('Digital Marketplace: $1M+ GMV (30% platform fee)')
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: createRichText('Data Licensing: $500K+ ARR (Analytics & insights)')
        }
      },
      
      // Technical Details
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('🔧 Technical Implementation')
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('Database: Supabase URL: https://fnkdtnmlyxcwrptdbmqy.supabase.co'),
          icon: { emoji: '🗄️' },
          color: 'gray_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('AI Integration: Groq API for fast inference, GPT-4 ready'),
          icon: { emoji: '🤖' },
          color: 'purple_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('Deployment: Vercel with auto-scaling and global CDN'),
          icon: { emoji: '☁️' },
          color: 'blue_background'
        }
      },
      
      // Key Documents
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('📄 Key Documents Created')
        }
      },
      {
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: createRichText('💼 Business Documents'),
          children: [
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('BDBT Feature Showcase & Investment Pitch')
              }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('AI Development Story with Claude Code')
              }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('Value Proposition & Sales Document')
              }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('Project Design Requirements')
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: createRichText('🛠️ Technical Documentation'),
          children: [
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('Complete Database Schema')
              }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('Supabase Setup Guide')
              }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('API Integration Guides')
              }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: {
                rich_text: createRichText('Claude Code Documentation')
              }
            }
          ]
        }
      },
      
      // Current Status
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('🎯 Current Project Status')
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('✅ Phase 1 Complete: Core platform with 619+ tips, gamification, user profiles, progress tracking'),
          icon: { emoji: '🏁' },
          color: 'green_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('🚧 Phase 2 In Progress: AI Coach integration, predictive analytics, smart recommendations'),
          icon: { emoji: '🔨' },
          color: 'yellow_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('📅 Phase 3 Planned: Mobile apps, international expansion, marketplace launch'),
          icon: { emoji: '📱' },
          color: 'gray_background'
        }
      },
      
      // Contact & Resources
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: createRichText('📞 Resources & Support')
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('📧 Support Email: support@bdbt.com'),
          icon: { emoji: '💬' },
          color: 'blue_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('🌐 Live App: app.bdbt.com (deployment pending)'),
          icon: { emoji: '🚀' },
          color: 'green_background'
        }
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: createRichText('💻 GitHub Repository: [Private - Contact for access]'),
          icon: { emoji: '🔐' },
          color: 'gray_background'
        }
      }
    ];

    // Add all blocks to the dashboard
    await notion.blocks.children.append({
      block_id: mainDashboard.id,
      children: keyInfoBlocks
    });

    console.log('✅ Successfully added all key BDBT information!');
    console.log('📄 View your updated dashboard at:', mainDashboard.url);

  } catch (error) {
    console.error('❌ Error adding information:', error);
  }
}

// Run the script
addKeyInformation();