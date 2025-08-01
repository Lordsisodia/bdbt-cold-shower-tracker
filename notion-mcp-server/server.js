import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client } from '@notionhq/client';
import { config } from 'dotenv';

config();

class NotionMCPServer {
  constructor() {
    this.server = new Server({
      name: 'notion-mcp-server',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.notion = null;
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('initialize', async (request) => {
      const apiKey = process.env.NOTION_API_KEY || request.params?.apiKey;
      
      if (!apiKey) {
        throw new Error('Notion API key is required. Set NOTION_API_KEY environment variable or pass apiKey in params.');
      }

      this.notion = new Client({ auth: apiKey });
      
      return {
        protocolVersion: '1.0.0',
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: 'notion-mcp-server',
          version: '1.0.0',
        },
      };
    });

    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'notion_search',
            description: 'Search for pages and databases in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query',
                },
                filter: {
                  type: 'object',
                  properties: {
                    property: {
                      type: 'string',
                      description: 'Filter by object type: page or database',
                      enum: ['page', 'database'],
                    },
                  },
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'notion_get_page',
            description: 'Get a specific page by ID',
            inputSchema: {
              type: 'object',
              properties: {
                pageId: {
                  type: 'string',
                  description: 'Notion page ID',
                },
              },
              required: ['pageId'],
            },
          },
          {
            name: 'notion_create_page',
            description: 'Create a new page in Notion',
            inputSchema: {
              type: 'object',
              properties: {
                parentId: {
                  type: 'string',
                  description: 'Parent page or database ID',
                },
                title: {
                  type: 'string',
                  description: 'Page title',
                },
                content: {
                  type: 'string',
                  description: 'Page content (markdown)',
                },
                properties: {
                  type: 'object',
                  description: 'Additional page properties',
                },
              },
              required: ['parentId', 'title'],
            },
          },
          {
            name: 'notion_update_page',
            description: 'Update an existing Notion page',
            inputSchema: {
              type: 'object',
              properties: {
                pageId: {
                  type: 'string',
                  description: 'Page ID to update',
                },
                properties: {
                  type: 'object',
                  description: 'Properties to update',
                },
              },
              required: ['pageId', 'properties'],
            },
          },
          {
            name: 'notion_query_database',
            description: 'Query a Notion database',
            inputSchema: {
              type: 'object',
              properties: {
                databaseId: {
                  type: 'string',
                  description: 'Database ID',
                },
                filter: {
                  type: 'object',
                  description: 'Filter conditions',
                },
                sorts: {
                  type: 'array',
                  description: 'Sort conditions',
                },
              },
              required: ['databaseId'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      if (!this.notion) {
        throw new Error('Notion client not initialized. Please initialize first.');
      }

      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'notion_search':
            return await this.searchNotion(args);
          case 'notion_get_page':
            return await this.getPage(args);
          case 'notion_create_page':
            return await this.createPage(args);
          case 'notion_update_page':
            return await this.updatePage(args);
          case 'notion_query_database':
            return await this.queryDatabase(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error: ${error.message}`,
          }],
          isError: true,
        };
      }
    });
  }

  async searchNotion({ query, filter }) {
    const response = await this.notion.search({
      query,
      filter,
      page_size: 10,
    });

    const results = response.results.map(item => ({
      id: item.id,
      type: item.object,
      title: this.getTitle(item),
      url: item.url,
      lastEdited: item.last_edited_time,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(results, null, 2),
      }],
    };
  }

  async getPage({ pageId }) {
    const page = await this.notion.pages.retrieve({ page_id: pageId });
    const blocks = await this.notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          page,
          blocks: blocks.results,
        }, null, 2),
      }],
    };
  }

  async createPage({ parentId, title, content, properties = {} }) {
    const newPage = await this.notion.pages.create({
      parent: { page_id: parentId },
      properties: {
        title: {
          title: [{
            text: { content: title },
          }],
        },
        ...properties,
      },
    });

    if (content) {
      // Convert markdown to Notion blocks (simplified)
      const blocks = content.split('\\n\\n').map(paragraph => ({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: paragraph },
          }],
        },
      }));

      await this.notion.blocks.children.append({
        block_id: newPage.id,
        children: blocks,
      });
    }

    return {
      content: [{
        type: 'text',
        text: `Page created successfully: ${newPage.url}`,
      }],
    };
  }

  async updatePage({ pageId, properties }) {
    const updated = await this.notion.pages.update({
      page_id: pageId,
      properties,
    });

    return {
      content: [{
        type: 'text',
        text: `Page updated successfully: ${updated.url}`,
      }],
    };
  }

  async queryDatabase({ databaseId, filter, sorts }) {
    const response = await this.notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
      page_size: 100,
    });

    const results = response.results.map(page => ({
      id: page.id,
      properties: page.properties,
      url: page.url,
      created: page.created_time,
      lastEdited: page.last_edited_time,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(results, null, 2),
      }],
    };
  }

  getTitle(item) {
    if (item.properties?.title) {
      return item.properties.title.title?.[0]?.plain_text || 'Untitled';
    }
    if (item.properties?.Name) {
      return item.properties.Name.title?.[0]?.plain_text || 'Untitled';
    }
    return 'Untitled';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Notion MCP server running...');
  }
}

const server = new NotionMCPServer();
server.run().catch(console.error);