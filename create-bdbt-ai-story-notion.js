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

async function createBDBTAIStoryPage() {
  try {
    // Read the AI development story content
    const storyContent = fs.readFileSync(
      path.join(__dirname, 'docs/content/BDBT-AI-DEVELOPMENT-STORY.md'),
      'utf-8'
    );

    console.log('Searching for BDBT client documentation area...');
    
    // Search for existing BDBT pages to add this as related documentation
    const searchResponse = await notion.search({
      query: 'BDBT Platform Feature Showcase',
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    let parentId;
    if (searchResponse.results.length > 0) {
      parentId = searchResponse.results[0].id;
      console.log('Found BDBT showcase page, creating AI story as related doc');
    } else {
      // Search for any BDBT page
      const bdbtsearch = await notion.search({
        query: 'BDBT',
        filter: {
          property: 'object',
          value: 'page'
        },
        page_size: 1
      });
      
      if (bdbtsearch.results.length > 0) {
        parentId = bdbtsearch.results[0].id;
      }
    }

    // Create the page with BDBT branding
    console.log('Creating BDBT AI Development Story page...');
    const response = await notion.pages.create({
      parent: parentId ? { page_id: parentId } : { workspace: true },
      icon: {
        emoji: '🤖'
      },
      cover: {
        external: {
          url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200'
        }
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: 'BDBT AI Development Story - How We Built the Future with Claude Code'
              }
            }
          ]
        }
      }
    });

    console.log('Page created successfully!');
    console.log('Page URL:', response.url);

    // Convert markdown to Notion blocks
    console.log('Adding content blocks...');
    const lines = storyContent.split('\n');
    const blocks = [];
    let inCodeBlock = false;
    let codeContent = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeContent = [];
        } else {
          inCodeBlock = false;
          if (codeContent.length > 0) {
            blocks.push({
              object: 'block',
              type: 'code',
              code: {
                rich_text: [{
                  type: 'text',
                  text: { content: codeContent.join('\n') }
                }],
                language: 'plain text'
              }
            });
          }
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }
      
      // Handle different markdown elements
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
        // Handle bullet points with special formatting
        const bulletContent = line.substring(2);
        const richText = [];
        
        // Check for bold text
        if (bulletContent.includes('**')) {
          const parts = bulletContent.split('**');
          for (let j = 0; j < parts.length; j++) {
            if (j % 2 === 1) {
              richText.push({
                type: 'text',
                text: { content: parts[j] },
                annotations: { bold: true }
              });
            } else if (parts[j]) {
              richText.push({
                type: 'text',
                text: { content: parts[j] }
              });
            }
          }
        } else {
          richText.push({
            type: 'text',
            text: { content: bulletContent }
          });
        }
        
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: richText
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
      } else if (line === '---') {
        blocks.push({
          object: 'block',
          type: 'divider',
          divider: {}
        });
      } else if (line.trim() !== '') {
        // Handle regular paragraphs with formatting
        const richText = [];
        let text = line;
        
        // Simple bold text handling
        if (text.includes('**')) {
          const parts = text.split('**');
          for (let j = 0; j < parts.length; j++) {
            if (j % 2 === 1) {
              richText.push({
                type: 'text',
                text: { content: parts[j] },
                annotations: { bold: true }
              });
            } else if (parts[j]) {
              richText.push({
                type: 'text',
                text: { content: parts[j] }
              });
            }
          }
        } else {
          richText.push({
            type: 'text',
            text: { content: text }
          });
        }
        
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: richText
          }
        });
      }
    }

    // Add blocks in batches
    for (let i = 0; i < blocks.length; i += 100) {
      const batch = blocks.slice(i, i + 100);
      await notion.blocks.children.append({
        block_id: response.id,
        children: batch
      });
      console.log(`Added ${Math.min(i + 100, blocks.length)} of ${blocks.length} blocks...`);
    }

    // Add a final callout block
    await notion.blocks.children.append({
      block_id: response.id,
      children: [{
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{
            type: 'text',
            text: { 
              content: 'This document was created using Claude Code to demonstrate the power of AI-assisted development. BDBT is proud to be at the forefront of the AI revolution in wellness technology.' 
            }
          }],
          icon: {
            emoji: '🚀'
          },
          color: 'blue_background'
        }
      }]
    });

    console.log('\n✅ BDBT AI Development Story created successfully!');
    console.log(`📄 View your page at: ${response.url}`);
    console.log('\n🎯 Next steps for BDBT team:');
    console.log('1. Review the AI development story');
    console.log('2. Share with investors and stakeholders');
    console.log('3. Use for marketing and PR materials');
    console.log('4. Add to company documentation');
    
  } catch (error) {
    console.error('Error creating Notion page:', error);
    if (error.body) {
      console.error('Error details:', JSON.stringify(error.body, null, 2));
    }
  }
}

// Run the script
createBDBTAIStoryPage();