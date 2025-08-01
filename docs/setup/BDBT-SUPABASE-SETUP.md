# BDBT Supabase Setup Guide

This guide will help you set up a dedicated Supabase project for BDBT with its own MCP connection.

## Option 1: Create New Supabase Project for BDBT

### Step 1: Create New Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it: "BDBT Tips Database"
4. Choose your region (preferably same as your other projects)
5. Set a strong database password
6. Click "Create new project"
7. Wait for project to initialize (~2 minutes)

### Step 2: Get Project Credentials
Once created, go to Settings > API:
- Copy the Project URL
- Copy the anon/public key
- Copy the service_role key

### Step 3: Get Project ID
The project ID is in the URL: `https://supabase.com/dashboard/project/[PROJECT_ID]/`

## Option 2: Use Existing Project (fnkdtnmlyxcwrptdbmqy)

If you already have a BDBT project:
1. Ensure you have owner/admin access
2. Get the API keys from Settings > API

## Setting Up MCP Connection

### Step 1: Get Management API Key
1. Go to https://supabase.com/dashboard/account/tokens
2. Create new token with permissions:
   - `projects:read`
   - `projects:write`
   - `organizations:read`
3. Copy the token immediately

### Step 2: Configure BDBT MCP

#### Automatic Setup (macOS/Linux):
```bash
cd /Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt
./setup-bdbt-mcp.sh
```

#### Manual Setup:
1. Open `.mcp/bdbt-supabase-mcp.json`
2. Replace `YOUR_SUPABASE_MANAGEMENT_API_KEY_HERE` with your token

3. Add to Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Add this section:
```json
{
  "mcpServers": {
    "bdbt-supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase@latest"],
      "env": {
        "SUPABASE_MANAGEMENT_API_KEY": "your-key-here"
      }
    }
  }
}
```

### Step 3: Create Database Tables

1. Go to your Supabase project SQL Editor
2. Copy the entire contents of `setup-bdbt-correct-project.sql`
3. Paste and run in SQL Editor
4. Verify tables created:
   - bdbt_tips
   - bdbt_tip_includes
   - bdbt_tip_resources

## Importing Tips Data

### Using MCP in Claude:
```bash
# First, update the project ID in import script
node import-tips-mcp.cjs

# Then in Claude, use:
mcp__bdbt-supabase__execute_sql project_id="YOUR_PROJECT_ID" query="INSERT INTO bdbt_tips..."
```

### Using SQL Editor:
1. Open `bdbt-tips-import.sql`
2. Copy all INSERT statements
3. Paste in Supabase SQL Editor
4. Run to import all 619 tips

### Using Supabase Client (programmatic):
```javascript
// Update .env with your credentials
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

// Run import script
npm run import-tips
```

## Verifying Setup

### In Claude (with MCP):
```
mcp__bdbt-supabase__list_projects
mcp__bdbt-supabase__execute_sql project_id="YOUR_PROJECT_ID" query="SELECT COUNT(*) FROM bdbt_tips"
```

### In Supabase Dashboard:
1. Go to Table Editor
2. Check bdbt_tips table
3. Verify tips are imported

## Security Setup

### Row Level Security (RLS):
- Already configured in setup script
- Public can read published tips only
- Admin operations require service role key

### API Access:
- Use anon key for public read operations
- Use service role key for admin operations
- Never expose service role key to client

## Next Steps

1. ✅ Create/Configure Supabase project
2. ✅ Set up MCP connection
3. ✅ Create database tables
4. ✅ Import tips data
5. 🔄 Test PDF generation with live data
6. 🔄 Implement Canva API integration
7. 🔄 Build admin interface for tip management

## Troubleshooting

### MCP Not Working:
- Restart Claude Desktop completely
- Check API key permissions
- Verify project ID is correct
- Look for errors in Claude logs

### Import Failing:
- Check you have correct project ID
- Verify tables exist
- Check for SQL syntax errors
- Try importing smaller batches

### Access Denied:
- Verify API keys are correct
- Check RLS policies
- Ensure using correct project

## Project Structure
```
bdbt/
├── .mcp/                    # MCP configuration (git ignored)
├── data/                    # Tips data exports
├── src/
│   ├── database/           # Database schemas
│   ├── services/           # API services
│   └── types/              # TypeScript types
├── setup-bdbt-correct-project.sql
├── bdbt-tips-import.sql
└── import-tips-mcp.cjs
```