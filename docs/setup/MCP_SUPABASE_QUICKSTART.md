# 🚀 BDBT Supabase MCP Quick Start

## Option 1: Local Supabase (Easiest)

### 1. Start Local Supabase
```bash
./start-supabase-local.sh
```

### 2. Get Local Credentials
After starting, you'll see output like:
```
API URL: http://localhost:54321
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Update .env.local
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key-from-above
SUPABASE_SERVICE_KEY=your-service-role-key-from-above
```

### 4. Run MCP Setup
```bash
./setup-mcp-supabase.sh
```

### 5. Restart VS Code
Close and reopen VS Code in this directory.

## Option 2: Cloud Supabase

### 1. Create Supabase Project
Go to https://supabase.com and create a new project

### 2. Get Credentials
In your Supabase dashboard:
- Settings → API
- Copy the URL and keys

### 3. Update .env.local
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### 4. Run MCP Setup
```bash
./setup-mcp-supabase.sh
```

### 5. Push Database Schema
```bash
npx supabase db push --db-url "postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres"
```

### 6. Restart VS Code

## Testing MCP Connection

### In Terminal:
```bash
node test-mcp-connection.js
```

### In Claude (VS Code):
Try this command:
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT 'MCP is working!' as message"
```

## Common Issues

### MCP Not Working?
1. Make sure you're in the BDBT directory
2. Check .env.local has correct credentials
3. Restart VS Code completely
4. Try: `echo $SUPABASE_URL` to verify env vars

### "Project not found" Error?
The project_id should be "bdbt-tips" for local or your actual project ID for cloud.

### No Data Returned?
1. Import tips first: `node importTipsToSupabase.js`
2. Check tips have status='published'

## Quick MCP Commands

```bash
# Count tips
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT COUNT(*) as total FROM tips"

# List categories
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT DISTINCT category FROM tips"

# Get a tip
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT * FROM tips LIMIT 1"
```

That's it! You now have MCP working with your BDBT tips database. 🎉