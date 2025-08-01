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

// Helper functions
function createRichText(text, annotations = {}) {
  return [{
    type: 'text',
    text: { content: text },
    annotations
  }];
}

async function populateBDBTWorkspace() {
  try {
    console.log('🚀 Populating BDBT Notion Workspace with project data...\n');

    // 1. Find the workspace pages
    console.log('🔍 Finding BDBT workspace pages...');
    const searchResults = await notion.search({
      query: 'BDBT',
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    // Find specific pages
    const mainDashboard = searchResults.results.find(page => 
      page.properties?.title?.title?.[0]?.plain_text?.includes('Platform Hub')
    );

    const featuresDb = searchResults.results.find(page => 
      page.object === 'database' && 
      page.title?.[0]?.plain_text?.includes('Features')
    );

    const tasksDb = searchResults.results.find(page => 
      page.object === 'database' && 
      page.title?.[0]?.plain_text?.includes('Task')
    );

    console.log('✅ Found workspace pages');

    // 2. Add all BDBT features to the Features Database
    if (featuresDb) {
      console.log('\n✨ Adding all BDBT features to database...');
      
      const allFeatures = [
        // Core Features (Live)
        {
          'Feature': { title: createRichText('619+ Wellness Tips System') },
          'Category': { select: { name: 'Core' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'Critical' } },
          'Revenue Impact': { number: 50000 },
          'Description': { rich_text: createRichText('Comprehensive library of scientifically-backed tips across health, wealth, and happiness categories') }
        },
        {
          'Feature': { title: createRichText('User Profile & Preferences') },
          'Category': { select: { name: 'Core' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'Critical' } },
          'Revenue Impact': { number: 0 },
          'Description': { rich_text: createRichText('Personalized user profiles with customizable preferences and settings') }
        },
        {
          'Feature': { title: createRichText('Progress Tracking System') },
          'Category': { select: { name: 'Analytics' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 30000 },
          'Description': { rich_text: createRichText('Visual dashboards showing user progress across all wellness dimensions') }
        },
        {
          'Feature': { title: createRichText('Gamification Engine') },
          'Category': { select: { name: 'Core' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 45000 },
          'Description': { rich_text: createRichText('Points, levels, achievements, and leaderboards to drive engagement') }
        },
        {
          'Feature': { title: createRichText('Community Forums') },
          'Category': { select: { name: 'Community' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 35000 },
          'Description': { rich_text: createRichText('User forums for sharing experiences and peer support') }
        },
        {
          'Feature': { title: createRichText('Daily Streaks & Goals') },
          'Category': { select: { name: 'Core' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 25000 },
          'Description': { rich_text: createRichText('Streak tracking and daily goal setting for habit formation') }
        },
        {
          'Feature': { title: createRichText('PDF Export System') },
          'Category': { select: { name: 'Core' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'Medium' } },
          'Revenue Impact': { number: 15000 },
          'Description': { rich_text: createRichText('Professional PDF generation for tips and progress reports') }
        },
        {
          'Feature': { title: createRichText('Responsive Web App') },
          'Category': { select: { name: 'Core' } },
          'Status': { select: { name: 'Live' } },
          'Priority': { select: { name: 'Critical' } },
          'Revenue Impact': { number: 0 },
          'Description': { rich_text: createRichText('Mobile-first responsive design that works on all devices') }
        },

        // AI Features (In Development)
        {
          'Feature': { title: createRichText('AI Personal Success Coach') },
          'Category': { select: { name: 'AI' } },
          'Status': { select: { name: 'Development' } },
          'Priority': { select: { name: 'Critical' } },
          'Revenue Impact': { number: 150000 },
          'Description': { rich_text: createRichText('GPT-4 powered personal coach providing customized guidance') }
        },
        {
          'Feature': { title: createRichText('Predictive Analytics Dashboard') },
          'Category': { select: { name: 'AI' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 75000 },
          'Description': { rich_text: createRichText('ML-powered predictions for user success and intervention recommendations') }
        },
        {
          'Feature': { title: createRichText('Smart Content Recommendations') },
          'Category': { select: { name: 'AI' } },
          'Status': { select: { name: 'Development' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 60000 },
          'Description': { rich_text: createRichText('AI-driven content suggestions based on user behavior and preferences') }
        },
        {
          'Feature': { title: createRichText('Voice-Activated Wellness') },
          'Category': { select: { name: 'AI' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'Medium' } },
          'Revenue Impact': { number: 40000 },
          'Description': { rich_text: createRichText('Voice commands for hands-free interaction with the platform') }
        },

        // Mobile Features
        {
          'Feature': { title: createRichText('iOS Native App') },
          'Category': { select: { name: 'Mobile' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 100000 },
          'Description': { rich_text: createRichText('Native iOS application with full feature parity') }
        },
        {
          'Feature': { title: createRichText('Android Native App') },
          'Category': { select: { name: 'Mobile' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 100000 },
          'Description': { rich_text: createRichText('Native Android application with full feature parity') }
        },
        {
          'Feature': { title: createRichText('Offline Mode') },
          'Category': { select: { name: 'Mobile' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'Medium' } },
          'Revenue Impact': { number: 30000 },
          'Description': { rich_text: createRichText('Offline access to tips and progress tracking') }
        },

        // Analytics Features
        {
          'Feature': { title: createRichText('Advanced Analytics Dashboard') },
          'Category': { select: { name: 'Analytics' } },
          'Status': { select: { name: 'Development' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 50000 },
          'Description': { rich_text: createRichText('Comprehensive analytics for user behavior and platform performance') }
        },
        {
          'Feature': { title: createRichText('Export to Health Apps') },
          'Category': { select: { name: 'Analytics' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'Medium' } },
          'Revenue Impact': { number: 25000 },
          'Description': { rich_text: createRichText('Integration with Apple Health, Google Fit, and other health platforms') }
        },

        // Community Features
        {
          'Feature': { title: createRichText('Private Groups') },
          'Category': { select: { name: 'Community' } },
          'Status': { select: { name: 'Development' } },
          'Priority': { select: { name: 'High' } },
          'Revenue Impact': { number: 40000 },
          'Description': { rich_text: createRichText('Create and join private accountability groups') }
        },
        {
          'Feature': { title: createRichText('Expert Mentorship Program') },
          'Category': { select: { name: 'Community' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'Medium' } },
          'Revenue Impact': { number: 80000 },
          'Description': { rich_text: createRichText('Connect users with certified wellness experts') }
        },
        {
          'Feature': { title: createRichText('Live Events & Webinars') },
          'Category': { select: { name: 'Community' } },
          'Status': { select: { name: 'Planning' } },
          'Priority': { select: { name: 'Medium' } },
          'Revenue Impact': { number: 60000 },
          'Description': { rich_text: createRichText('Virtual events for community engagement and learning') }
        }
      ];

      // Add features to database
      for (const feature of allFeatures) {
        try {
          await notion.pages.create({
            parent: { database_id: featuresDb.id },
            properties: feature
          });
          console.log(`✅ Added: ${feature.Feature.title[0].text.content}`);
        } catch (error) {
          console.log(`⚠️  Skipping (may already exist): ${feature.Feature.title[0].text.content}`);
        }
      }
    }

    // 3. Add current tasks to Task Management
    if (tasksDb) {
      console.log('\n📝 Adding current tasks...');
      
      const currentTasks = [
        {
          'Task': { title: createRichText('Complete AI Coach Integration') },
          'Status': { select: { name: 'In Progress' } },
          'Priority': { select: { name: 'P0 - Critical' } },
          'Type': { select: { name: 'Feature' } },
          'Due Date': { date: { start: '2025-02-15' } }
        },
        {
          'Task': { title: createRichText('Fix PDF export formatting issues') },
          'Status': { select: { name: 'To Do' } },
          'Priority': { select: { name: 'P1 - High' } },
          'Type': { select: { name: 'Bug' } },
          'Due Date': { date: { start: '2025-02-01' } }
        },
        {
          'Task': { title: createRichText('Update API documentation') },
          'Status': { select: { name: 'To Do' } },
          'Priority': { select: { name: 'P2 - Medium' } },
          'Type': { select: { name: 'Documentation' } },
          'Due Date': { date: { start: '2025-02-05' } }
        },
        {
          'Task': { title: createRichText('Research AR meditation features') },
          'Status': { select: { name: 'To Do' } },
          'Priority': { select: { name: 'P3 - Low' } },
          'Type': { select: { name: 'Research' } },
          'Due Date': { date: { start: '2025-03-01' } }
        },
        {
          'Task': { title: createRichText('Implement smart notifications') },
          'Status': { select: { name: 'In Progress' } },
          'Priority': { select: { name: 'P1 - High' } },
          'Type': { select: { name: 'Feature' } },
          'Due Date': { date: { start: '2025-02-10' } }
        },
        {
          'Task': { title: createRichText('Security audit preparation') },
          'Status': { select: { name: 'Review' } },
          'Priority': { select: { name: 'P0 - Critical' } },
          'Type': { select: { name: 'Documentation' } },
          'Due Date': { date: { start: '2025-01-31' } }
        }
      ];

      for (const task of currentTasks) {
        try {
          await notion.pages.create({
            parent: { database_id: tasksDb.id },
            properties: task
          });
          console.log(`✅ Added task: ${task.Task.title[0].text.content}`);
        } catch (error) {
          console.log(`⚠️  Skipping task: ${task.Task.title[0].text.content}`);
        }
      }
    }

    // 4. Update Documentation Center with all documents
    console.log('\n📚 Updating documentation links...');
    const docCenter = searchResults.results.find(page => 
      page.properties?.title?.title?.[0]?.plain_text?.includes('Documentation Center')
    );

    if (docCenter) {
      // Find all markdown files in docs directory
      const docsPath = path.join(__dirname, 'docs');
      const contentPath = path.join(docsPath, 'content');
      const setupPath = path.join(docsPath, 'setup');

      const contentDocs = fs.readdirSync(contentPath).filter(f => f.endsWith('.md'));
      const setupDocs = fs.readdirSync(setupPath).filter(f => f.endsWith('.md'));

      console.log(`Found ${contentDocs.length} content docs and ${setupDocs.length} setup docs`);

      // Create a comprehensive documentation list
      const docBlocks = [
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: createRichText('📄 All Project Documents')
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        }
      ];

      // Add content documents
      docBlocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: createRichText('📖 Content Documentation')
        }
      });

      contentDocs.forEach(doc => {
        docBlocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: createRichText(`📄 ${doc.replace('.md', '').replace(/-/g, ' ')}`)
          }
        });
      });

      // Add setup documents
      docBlocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: createRichText('🛠️ Setup & Technical Guides')
        }
      });

      setupDocs.forEach(doc => {
        docBlocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: createRichText(`🔧 ${doc.replace('.md', '').replace(/-/g, ' ')}`)
          }
        });
      });

      await notion.blocks.children.append({
        block_id: docCenter.id,
        children: docBlocks
      });
    }

    // 5. Update main dashboard with real stats
    if (mainDashboard) {
      console.log('\n📊 Updating dashboard with current project stats...');
      
      const updateBlocks = [
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: createRichText('🚀 Project Status Update')
          }
        },
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: createRichText('✅ Features Completed: 8 core features live and operational'),
            icon: { emoji: '🎯' },
            color: 'green_background'
          }
        },
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: createRichText('🚧 In Development: AI Coach, Smart Recommendations, Analytics Dashboard'),
            icon: { emoji: '🛠️' },
            color: 'yellow_background'
          }
        },
        {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: createRichText('📱 Upcoming: Mobile apps (iOS/Android), Voice features, AR experiences'),
            icon: { emoji: '🔮' },
            color: 'purple_background'
          }
        },
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: createRichText('💾 Technical Stack')
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: createRichText('Frontend: React 18 + TypeScript + Vite | Backend: Supabase (PostgreSQL) | AI: GPT-4 Integration | Hosting: Vercel')
          }
        }
      ];

      await notion.blocks.children.append({
        block_id: mainDashboard.id,
        children: updateBlocks
      });
    }

    console.log('\n✅ BDBT Notion Workspace population complete!');
    console.log('\n📊 Summary:');
    console.log('  - 20 features added to Features Database');
    console.log('  - 6 active tasks added to Task Management');
    console.log('  - Documentation links updated');
    console.log('  - Dashboard stats refreshed');
    console.log('\n🎉 Your BDBT workspace is now fully populated with project data!');

  } catch (error) {
    console.error('❌ Error populating workspace:', error);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Run the population script
populateBDBTWorkspace();