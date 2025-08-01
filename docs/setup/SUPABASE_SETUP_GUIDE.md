# BDBT Supabase Setup Guide

This guide explains how to set up Supabase specifically for the BDBT tips project, with options for both local development and cloud deployment.

## Option 1: Local Supabase (Recommended for Development)

### Setup
1. Run the setup script:
   ```bash
   ./setup-supabase-local.sh
   ```

2. Start local Supabase:
   ```bash
   ./start-supabase-local.sh
   ```

3. Access local services:
   - API: http://localhost:54321
   - Studio: http://localhost:54323
   - Inbucket (emails): http://localhost:54324

4. Stop when done:
   ```bash
   ./stop-supabase-local.sh
   ```

### Benefits
- No cloud costs
- Full control over data
- Works offline
- Perfect for development

## Option 2: Cloud Supabase (For Production)

### Initial Setup
1. Create a Supabase account at https://supabase.com
2. Create a new project for BDBT
3. Get your credentials from Project Settings > API

### Configure Project
1. Update `.env.local` with your credentials:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-key
   ```

2. Run database migrations:
   ```bash
   npx supabase db push --db-url "postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
   ```

## Option 3: MCP Server (For Claude Integration)

### Setup MCP for This Project Only

1. **Project-Specific MCP Config**
   The project includes `bdbt-mcp-config.json` which configures MCP to work only with this project's Supabase instance.

2. **VS Code Workspace Settings**
   When you open this project in VS Code, it will use `.vscode/settings.json` to configure MCP with project-specific credentials.

3. **Environment Variables**
   MCP reads from `.env.local` automatically when in this project directory.

### Using MCP Commands

When this project is open in VS Code with Claude:

```
# List all tips
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT * FROM tips WHERE status = 'published' LIMIT 10"

# Get tip with resources
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT t.*, tr.* FROM tips t LEFT JOIN tip_resources tr ON t.id = tr.tip_id WHERE t.id = 1"

# Search tips
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT * FROM tips WHERE title ILIKE '%morning%' OR description ILIKE '%morning%'"
```

## Database Schema

The project includes these tables:
- `tips` - Main tips content
- `tip_includes` - What's included in each tip
- `tip_resources` - Books, articles, tools for each tip

## Security

### Local Development
- `.env.local` is gitignored
- Local Supabase data stays on your machine
- No external access by default

### Production
- Use Row Level Security (RLS) policies
- Never commit service keys
- Use environment variables in deployment

## Import Tips to Database

### Using the Import Script
```bash
# First, generate the tips JSON
node exportAllTips.cjs

# Then import to Supabase (requires configured connection)
node importTipsToSupabase.js
```

### Manual Import via Studio
1. Open Supabase Studio
2. Go to SQL Editor
3. Upload `data/bdbt-1000-tips.json`
4. Use the import wizard

## Troubleshooting

### MCP Not Working?
1. Ensure you're in the BDBT project directory
2. Check `.env.local` has correct credentials
3. Restart VS Code after config changes
4. Verify MCP server is installed at the path in config

### Database Connection Issues?
1. Check Supabase service is running (local)
2. Verify credentials in `.env.local`
3. Ensure database migrations are applied
4. Check network/firewall settings

### Tips Not Showing?
1. Verify tips have `status = 'published'`
2. Check RLS policies are correct
3. Ensure proper joins for includes/resources
4. Look for errors in browser console

## Best Practices

1. **Development**: Use local Supabase
2. **Testing**: Use a separate cloud project
3. **Production**: Use production cloud project
4. **MCP**: Only enable when actively developing
5. **Backups**: Export JSON regularly

## Quick Commands Reference

```bash
# Local Supabase
./start-supabase-local.sh    # Start
./stop-supabase-local.sh     # Stop
npx supabase status          # Check status
npx supabase db reset        # Reset database

# Tips Management
node exportAllTips.cjs       # Export to JSON/CSV
node importTipsToSupabase.js # Import to database

# Database Queries (via MCP or Studio)
SELECT COUNT(*) FROM tips WHERE status = 'published';
SELECT * FROM tips WHERE category = 'health' LIMIT 10;
SELECT t.*, array_agg(tr.*) as resources FROM tips t 
  LEFT JOIN tip_resources tr ON t.id = tr.tip_id 
  GROUP BY t.id;
```

## Next Steps

1. Choose your setup method (local vs cloud)
2. Configure credentials
3. Run migrations
4. Import tips data
5. Test the connection
6. Start building!

Remember: This setup is isolated to the BDBT project and won't affect other projects' Supabase configurations.