# Custom Notion MCP Server

A robust Notion MCP (Model Context Protocol) server that provides reliable access to Notion API.

## Features

- Search pages and databases
- Get page content and blocks
- Create new pages with content
- Update existing pages
- Query databases with filters and sorts
- Error handling and recovery

## Setup

1. Install dependencies:
```bash
npm install
```

2. Get your Notion API key:
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the Internal Integration Token

3. Set up environment:
```bash
cp .env.example .env
# Edit .env and add your NOTION_API_KEY
```

4. Add to Claude configuration:
```json
{
  "notion-custom": {
    "command": "node",
    "args": ["/path/to/notion-mcp-server/server.js"],
    "env": {
      "NOTION_API_KEY": "your_notion_api_key_here"
    }
  }
}
```

## Available Tools

- `notion_search` - Search for pages and databases
- `notion_get_page` - Get a specific page by ID
- `notion_create_page` - Create a new page
- `notion_update_page` - Update an existing page
- `notion_query_database` - Query a database with filters

## Usage

The server automatically starts when Claude connects to it. Make sure your Notion integration has access to the pages/databases you want to interact with.