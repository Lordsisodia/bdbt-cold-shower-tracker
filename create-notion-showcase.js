import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Notion client
const notion = new Client({
  auth: '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'
});

async function createShowcasePage() {
  try {
    // Read the showcase content
    const showcaseContent = fs.readFileSync(
      path.join(__dirname, 'docs/content/BDBT-NOTION-READY-SHOWCASE.md'),
      'utf-8'
    );

    // First, let's search for a suitable parent page or create in root
    console.log('Searching for workspace...');
    const searchResponse = await notion.search({
      query: 'BDBT',
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    let parentId;
    if (searchResponse.results.length > 0) {
      parentId = searchResponse.results[0].id;
      console.log('Found existing BDBT page, will create as subpage');
    } else {
      // Get the first available page as parent
      const allPages = await notion.search({
        filter: {
          property: 'object',
          value: 'page'
        },
        page_size: 1
      });
      
      if (allPages.results.length > 0) {
        parentId = allPages.results[0].id;
        console.log('Using first available page as parent');
      }
    }

    // Create the page
    console.log('Creating showcase page...');
    const response = await notion.pages.create({
      parent: parentId ? { page_id: parentId } : { workspace: true },
      icon: {
        emoji: '🚀'
      },
      cover: {
        external: {
          url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200'
        }
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: 'BDBT Platform - Feature Showcase & Investment Opportunity'
              }
            }
          ]
        }
      }
    });

    console.log('Page created successfully!');
    console.log('Page URL:', response.url);
    console.log('Page ID:', response.id);

    // Now add content blocks
    console.log('Adding content blocks...');
    
    // Convert markdown to Notion blocks (simplified version)
    const lines = showcaseContent.split('\n');
    const blocks = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        blocks.push({
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(2) }
            }]
          }
        });
      } else if (line.startsWith('## ')) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(3) }
            }]
          }
        });
      } else if (line.startsWith('### ')) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(4) }
            }]
          }
        });
      } else if (line.startsWith('- ')) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(2) }
            }]
          }
        });
      } else if (line.startsWith('> ')) {
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{
              type: 'text',
              text: { content: line.substring(2) }
            }]
          }
        });
      } else if (line.trim() !== '') {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{
              type: 'text',
              text: { content: line }
            }]
          }
        });
      }
    }

    // Add blocks in batches (Notion has a limit of 100 blocks per request)
    for (let i = 0; i < blocks.length; i += 100) {
      const batch = blocks.slice(i, i + 100);
      await notion.blocks.children.append({
        block_id: response.id,
        children: batch
      });
      console.log(`Added ${Math.min(i + 100, blocks.length)} of ${blocks.length} blocks...`);
    }

    console.log('\n✅ Showcase page created successfully!');
    console.log(`📄 View your page at: ${response.url}`);
    console.log('\nNext steps:');
    console.log('1. Open the page in Notion');
    console.log('2. Share it with your team or investors');
    console.log('3. Customize formatting as needed');
    
  } catch (error) {
    console.error('Error creating Notion page:', error);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Run the script
createShowcasePage();