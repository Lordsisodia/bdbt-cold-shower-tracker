# 🚀 Simple Supabase MCP Setup for BDBT

Since you already have Supabase MCP available in your system, here's how to use it specifically for this project:

## Step 1: Start Local Supabase

```bash
./start-supabase-local.sh
```

You'll see output like:
```
Started supabase local development setup.

API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

## Step 2: Use MCP Commands Directly

You can now use the Supabase MCP that's already available. Since we can see from your system that `mcp__supabase__` commands are available, you can use them directly:

### List Organizations (to verify connection)
```
mcp__supabase__list_organizations
```

### For Local Supabase, use SQL directly:
Since local Supabase doesn't have a project ID in the cloud sense, you'll need to use the SQL execution with your local credentials:

```
mcp__supabase__execute_sql query="SELECT version()"
```

## Step 3: Import Your Tips

First, let's create the tables using MCP:

```
mcp__supabase__execute_sql query="CREATE TABLE IF NOT EXISTS tips (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, subtitle VARCHAR(500), category VARCHAR(50), difficulty VARCHAR(20), description TEXT, primary_benefit TEXT, secondary_benefit TEXT, tertiary_benefit TEXT, status VARCHAR(20) DEFAULT 'published')"
```

Then import your tips:
```bash
node importTipsToSupabase.js
```

## Step 4: Query Your Tips

Now you can query your tips database:

```
mcp__supabase__execute_sql query="SELECT COUNT(*) as total_tips FROM tips"
```

```
mcp__supabase__execute_sql query="SELECT id, title, category FROM tips LIMIT 5"
```

```
mcp__supabase__execute_sql query="SELECT category, COUNT(*) as count FROM tips GROUP BY category"
```

## Alternative: Use Project-Specific Environment

If you want to ensure MCP uses your local Supabase credentials:

1. Set environment variables in your terminal:
```bash
export SUPABASE_URL=http://localhost:54321
export SUPABASE_SERVICE_KEY=your-service-role-key-from-above
```

2. Then use MCP commands as shown above

## Tips for BDBT Project

- Keep local Supabase running while developing
- Your data persists between sessions
- Access Supabase Studio at http://localhost:54323
- All tips are stored locally, not in the cloud

That's it! You're now using Supabase MCP with your BDBT tips database.