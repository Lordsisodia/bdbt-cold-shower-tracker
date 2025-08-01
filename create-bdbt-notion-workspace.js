import { Client } from '@notionhq/client';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Notion client
const notion = new Client({
  auth: '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'
});

// Helper function to create rich text
function createRichText(text, annotations = {}) {
  return [{
    type: 'text',
    text: { content: text },
    annotations
  }];
}

// Helper function to create a heading block
function createHeading(text, level = 1) {
  const type = `heading_${level}`;
  return {
    object: 'block',
    type,
    [type]: {
      rich_text: createRichText(text)
    }
  };
}

// Helper function to create a paragraph
function createParagraph(text, color = 'default') {
  return {
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: createRichText(text),
      color
    }
  };
}

// Helper function to create a callout
function createCallout(text, emoji, color = 'gray_background') {
  return {
    object: 'block',
    type: 'callout',
    callout: {
      rich_text: createRichText(text),
      icon: { emoji },
      color
    }
  };
}

// Helper function to create a divider
function createDivider() {
  return {
    object: 'block',
    type: 'divider',
    divider: {}
  };
}

// Helper function to create columns
function createColumns(columnContents) {
  return {
    object: 'block',
    type: 'column_list',
    column_list: {
      children: columnContents.map(content => ({
        object: 'block',
        type: 'column',
        column: {
          children: content
        }
      }))
    }
  };
}

async function createBDBTWorkspace() {
  try {
    console.log('🚀 Creating BDBT Notion Workspace...\n');

    // First, find a suitable parent page
    console.log('🔍 Finding suitable parent location...');
    const searchResults = await notion.search({
      filter: {
        property: 'object',
        value: 'page'
      },
      page_size: 5
    });

    let parentPageId;
    
    // Look for existing BDBT pages
    const bdbPage = searchResults.results.find(page => 
      page.properties?.title?.title?.[0]?.plain_text?.includes('BDBT')
    );
    
    if (bdbPage) {
      parentPageId = bdbPage.id;
      console.log('✅ Found existing BDBT page, using as parent');
    } else if (searchResults.results.length > 0) {
      parentPageId = searchResults.results[0].id;
      console.log('✅ Using first available page as parent');
    } else {
      throw new Error('No pages found to create workspace under. Please create a page in Notion first.');
    }

    // 1. Create Main Dashboard Page
    console.log('📊 Creating Main Dashboard...');
    const mainDashboard = await notion.pages.create({
      parent: { page_id: parentPageId },
      icon: { emoji: '🚀' },
      cover: {
        external: {
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop'
        }
      },
      properties: {
        title: {
          title: createRichText('BDBT Platform Hub')
        }
      }
    });

    // Add content to main dashboard
    const dashboardBlocks = [
      createHeading('🎯 Welcome to BDBT Platform Hub', 1),
      createParagraph('Your central command center for the revolutionary wellness platform that combines health, wealth, and happiness.'),
      
      createDivider(),
      
      createHeading('📊 Platform Statistics', 2),
      createCallout('👥 Active Users: 1,247', '📈', 'blue_background'),
      createCallout('💰 MRR: $47,329', '💵', 'green_background'),
      createCallout('✨ Features Live: 47', '🚀', 'purple_background'),
      createCallout('🎯 User Retention: 92%', '🏆', 'yellow_background'),
      
      createDivider(),
      
      createHeading('🔗 Quick Navigation', 2),
      createParagraph('Access all areas of your BDBT workspace:')
    ];

    await notion.blocks.children.append({
      block_id: mainDashboard.id,
      children: dashboardBlocks
    });

    // 2. Create Documentation Center
    console.log('📋 Creating Documentation Center...');
    const docCenter = await notion.pages.create({
      parent: { page_id: mainDashboard.id },
      icon: { emoji: '📋' },
      properties: {
        title: {
          title: createRichText('Documentation Center')
        }
      }
    });

    // Add existing documents links
    const docBlocks = [
      createHeading('📚 BDBT Documentation Library', 1),
      createParagraph('All project documentation organized and accessible in one place.'),
      
      createDivider(),
      
      createHeading('💼 Business Documents', 2),
      createCallout('📊 Feature Showcase & Investment Pitch', '💎', 'blue_background'),
      createCallout('🤖 AI Development Story with Claude Code', '🚀', 'purple_background'),
      createCallout('💰 Revenue Projections & Business Model', '📈', 'green_background'),
      
      createHeading('🛠️ Technical Documentation', 2),
      createCallout('🗄️ Database Schema & Architecture', '💾', 'gray_background'),
      createCallout('🔌 API Documentation & Integration Guides', '🔗', 'orange_background'),
      createCallout('🚀 Deployment & DevOps Guides', '☁️', 'blue_background'),
      
      createHeading('📱 Product Guides', 2),
      createCallout('📖 User Manual & Tutorials', '👤', 'yellow_background'),
      createCallout('🎮 Feature Guides & Best Practices', '✨', 'purple_background'),
      createCallout('❓ FAQ & Troubleshooting', '💡', 'red_background')
    ];

    await notion.blocks.children.append({
      block_id: docCenter.id,
      children: docBlocks
    });

    // 3. Create Product Roadmap
    console.log('🗺️ Creating Product Roadmap...');
    const roadmap = await notion.pages.create({
      parent: { page_id: mainDashboard.id },
      icon: { emoji: '🗺️' },
      properties: {
        title: {
          title: createRichText('Product Roadmap & Planning')
        }
      }
    });

    const roadmapBlocks = [
      createHeading('🚀 BDBT Product Roadmap 2025', 1),
      createParagraph('Our journey to transform the wellness industry'),
      
      createDivider(),
      
      createHeading('Q1 2025: Foundation Phase ✅', 2),
      createCallout('✅ Core platform launch', '🎯', 'green_background'),
      createCallout('✅ 619+ wellness tips integrated', '📚', 'green_background'),
      createCallout('✅ Gamification engine', '🎮', 'green_background'),
      createCallout('✅ Community features', '👥', 'green_background'),
      
      createHeading('Q2 2025: Intelligence Phase 🚧', 2),
      createCallout('🚧 AI Personal Coach launch', '🤖', 'yellow_background'),
      createCallout('📅 Predictive analytics', '📊', 'gray_background'),
      createCallout('📅 Voice integration', '🎤', 'gray_background'),
      createCallout('📅 Mobile apps (iOS/Android)', '📱', 'gray_background'),
      
      createHeading('Q3 2025: Scale Phase 📅', 2),
      createCallout('📅 Enterprise features', '🏢', 'gray_background'),
      createCallout('📅 International expansion', '🌍', 'gray_background'),
      createCallout('📅 Marketplace launch', '🛒', 'gray_background'),
      createCallout('📅 AR/VR experiences', '🥽', 'gray_background'),
      
      createHeading('Q4 2025: Innovation Phase 🔮', 2),
      createCallout('🔮 Blockchain integration', '🔗', 'purple_background'),
      createCallout('🔮 Metaverse wellness spaces', '🌐', 'purple_background'),
      createCallout('🔮 Advanced AI features', '🧠', 'purple_background'),
      createCallout('🔮 IPO preparation', '📈', 'purple_background')
    ];

    await notion.blocks.children.append({
      block_id: roadmap.id,
      children: roadmapBlocks
    });

    // 4. Create Features Database
    console.log('✨ Creating Features Database...');
    const featuresDb = await notion.databases.create({
      parent: { page_id: mainDashboard.id },
      icon: { emoji: '✨' },
      title: createRichText('Features & Development'),
      properties: {
        'Feature': {
          title: {}
        },
        'Category': {
          select: {
            options: [
              { name: 'Core', color: 'blue' },
              { name: 'AI', color: 'purple' },
              { name: 'Community', color: 'green' },
              { name: 'Analytics', color: 'orange' },
              { name: 'Mobile', color: 'pink' }
            ]
          }
        },
        'Status': {
          select: {
            options: [
              { name: 'Live', color: 'green' },
              { name: 'Testing', color: 'yellow' },
              { name: 'Development', color: 'orange' },
              { name: 'Planning', color: 'gray' },
              { name: 'Idea', color: 'default' }
            ]
          }
        },
        'Priority': {
          select: {
            options: [
              { name: 'Critical', color: 'red' },
              { name: 'High', color: 'orange' },
              { name: 'Medium', color: 'yellow' },
              { name: 'Low', color: 'gray' }
            ]
          }
        },
        'Launch Date': {
          date: {}
        },
        'Revenue Impact': {
          number: {
            format: 'dollar'
          }
        },
        'Description': {
          rich_text: {}
        }
      }
    });

    // Add sample features
    const sampleFeatures = [
      {
        'Feature': { title: createRichText('Smart Daily Tips System') },
        'Category': { select: { name: 'Core' } },
        'Status': { select: { name: 'Live' } },
        'Priority': { select: { name: 'Critical' } },
        'Revenue Impact': { number: 50000 }
      },
      {
        'Feature': { title: createRichText('AI Personal Coach') },
        'Category': { select: { name: 'AI' } },
        'Status': { select: { name: 'Development' } },
        'Priority': { select: { name: 'High' } },
        'Revenue Impact': { number: 100000 }
      },
      {
        'Feature': { title: createRichText('Community Forums') },
        'Category': { select: { name: 'Community' } },
        'Status': { select: { name: 'Live' } },
        'Priority': { select: { name: 'High' } },
        'Revenue Impact': { number: 30000 }
      }
    ];

    for (const feature of sampleFeatures) {
      await notion.pages.create({
        parent: { database_id: featuresDb.id },
        properties: feature
      });
    }

    // 5. Create Task Management Board
    console.log('✅ Creating Task Management System...');
    const tasksDb = await notion.databases.create({
      parent: { page_id: mainDashboard.id },
      icon: { emoji: '✅' },
      title: createRichText('Task Management'),
      properties: {
        'Task': {
          title: {}
        },
        'Status': {
          select: {
            options: [
              { name: 'To Do', color: 'gray' },
              { name: 'In Progress', color: 'yellow' },
              { name: 'Review', color: 'orange' },
              { name: 'Done', color: 'green' },
              { name: 'Blocked', color: 'red' }
            ]
          }
        },
        'Assignee': {
          people: {}
        },
        'Due Date': {
          date: {}
        },
        'Priority': {
          select: {
            options: [
              { name: 'P0 - Critical', color: 'red' },
              { name: 'P1 - High', color: 'orange' },
              { name: 'P2 - Medium', color: 'yellow' },
              { name: 'P3 - Low', color: 'gray' }
            ]
          }
        },
        'Type': {
          select: {
            options: [
              { name: 'Feature', color: 'blue' },
              { name: 'Bug', color: 'red' },
              { name: 'Documentation', color: 'purple' },
              { name: 'Research', color: 'green' }
            ]
          }
        }
      }
    });

    // 6. Create Analytics Dashboard
    console.log('📈 Creating Analytics Dashboard...');
    const analytics = await notion.pages.create({
      parent: { page_id: mainDashboard.id },
      icon: { emoji: '📈' },
      properties: {
        title: {
          title: createRichText('Analytics & Metrics')
        }
      }
    });

    const analyticsBlocks = [
      createHeading('📊 BDBT Analytics Dashboard', 1),
      createParagraph('Real-time insights into platform performance and growth'),
      
      createDivider(),
      
      createHeading('💰 Revenue Metrics', 2),
      createCallout('MRR: $47,329 (+23% MoM)', '📈', 'green_background'),
      createCallout('ARR: $567,948 (projected)', '💵', 'blue_background'),
      createCallout('Average Revenue Per User: $67', '👤', 'yellow_background'),
      createCallout('LTV:CAC Ratio: 3.2:1', '🎯', 'purple_background'),
      
      createHeading('👥 User Metrics', 2),
      createCallout('Total Users: 1,247', '👥', 'blue_background'),
      createCallout('Daily Active Users: 892 (71%)', '📱', 'green_background'),
      createCallout('7-Day Retention: 82%', '🔄', 'yellow_background'),
      createCallout('NPS Score: 72', '⭐', 'purple_background'),
      
      createHeading('🚀 Platform Performance', 2),
      createCallout('Uptime: 99.99%', '✅', 'green_background'),
      createCallout('Average Load Time: 0.8s', '⚡', 'blue_background'),
      createCallout('Error Rate: 0.01%', '🛡️', 'green_background'),
      createCallout('API Response Time: <100ms', '🔌', 'yellow_background')
    ];

    await notion.blocks.children.append({
      block_id: analytics.id,
      children: analyticsBlocks
    });

    // 7. Create Team Resources
    console.log('🤝 Creating Team Resources...');
    const teamResources = await notion.pages.create({
      parent: { page_id: mainDashboard.id },
      icon: { emoji: '🤝' },
      properties: {
        title: {
          title: createRichText('Team Resources')
        }
      }
    });

    // 8. Add navigation back to main dashboard
    console.log('🔗 Adding navigation links...');
    const navigationBlocks = [
      createHeading('📍 Workspace Navigation', 3),
      createCallout(`📋 Documentation Center`, '📚', 'gray_background'),
      createCallout(`🗺️ Product Roadmap`, '🚀', 'gray_background'),
      createCallout(`✨ Features Database`, '💡', 'gray_background'),
      createCallout(`✅ Task Management`, '📝', 'gray_background'),
      createCallout(`📈 Analytics Dashboard`, '📊', 'gray_background'),
      createCallout(`🤝 Team Resources`, '👥', 'gray_background'),
      
      createDivider(),
      
      createHeading('🔗 External Links', 3),
      createCallout('🌐 Live App: app.bdbt.com', '🚀', 'blue_background'),
      createCallout('💻 GitHub Repository', '🔧', 'gray_background'),
      createCallout('🗄️ Supabase Dashboard', '💾', 'green_background'),
      createCallout('📧 Support: support@bdbt.com', '💬', 'yellow_background')
    ];

    await notion.blocks.children.append({
      block_id: mainDashboard.id,
      children: navigationBlocks
    });

    // Final success message
    console.log('\n✅ BDBT Notion Workspace created successfully!');
    console.log('📄 Main Dashboard URL:', mainDashboard.url);
    console.log('\n🎯 Workspace Structure Created:');
    console.log('  ├── 🚀 Main Dashboard');
    console.log('  ├── 📋 Documentation Center');
    console.log('  ├── 🗺️ Product Roadmap');
    console.log('  ├── ✨ Features Database');
    console.log('  ├── ✅ Task Management');
    console.log('  ├── 📈 Analytics Dashboard');
    console.log('  └── 🤝 Team Resources');
    console.log('\n🚀 Next Steps:');
    console.log('1. Visit your new workspace in Notion');
    console.log('2. Customize the pages with your specific content');
    console.log('3. Invite team members and set permissions');
    console.log('4. Start tracking progress and documenting your journey!');

  } catch (error) {
    console.error('❌ Error creating workspace:', error);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Run the workspace creation
createBDBTWorkspace();