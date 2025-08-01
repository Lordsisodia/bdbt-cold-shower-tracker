# BDBT Supabase MCP Setup Guide

This guide will help you set up a dedicated Supabase MCP connection for the BDBT project.

## Prerequisites

- Supabase account with access to the BDBT project
- Claude Desktop installed
- Access to your Supabase Management API Key

## Step 1: Get Your Supabase Management API Key

1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new access token with the following permissions:
   - `projects:read`
   - `projects:write`
   - `organizations:read`
3. Copy the generated token (you won't be able to see it again!)

## Step 2: Configure the MCP

1. Open the `bdbt-supabase-mcp.json` file in this directory
2. Replace `YOUR_SUPABASE_MANAGEMENT_API_KEY_HERE` with your actual API key
3. Save the file

## Step 3: Add to Claude Desktop Configuration

Add this configuration to your Claude Desktop settings:

### On macOS:
Open `~/Library/Application Support/Claude/claude_desktop_config.json`

### On Windows:
Open `%APPDATA%\Claude\claude_desktop_config.json`

Add the BDBT Supabase MCP to the `mcpServers` section:

```json
{
  "mcpServers": {
    // ... your existing MCPs ...
    "bdbt-supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase@latest"
      ],
      "env": {
        "SUPABASE_MANAGEMENT_API_KEY": "your-actual-api-key-here"
      }
    }
  }
}
```

## Step 4: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Restart Claude Desktop
3. The BDBT Supabase MCP should now be available

## Step 5: Test the Connection

In Claude, try running:
```
mcp__bdbt-supabase__list_projects
```

This should list your Supabase projects including the BDBT project.

## Project-Specific Usage

When working on the BDBT project, all Supabase commands will use the prefix:
```
mcp__bdbt-supabase__
```

For example:
- `mcp__bdbt-supabase__execute_sql`
- `mcp__bdbt-supabase__list_tables`
- `mcp__bdbt-supabase__apply_migration`

## Security Notes

- Keep your API key secure and never commit it to version control
- The `.mcp` directory is already in .gitignore
- Consider using environment variables for production deployments

## Troubleshooting

If the MCP doesn't work:
1. Verify your API key has the correct permissions
2. Check that Claude Desktop is fully restarted
3. Look for errors in Claude Desktop logs
4. Ensure you're using the correct project ID from your Supabase dashboard