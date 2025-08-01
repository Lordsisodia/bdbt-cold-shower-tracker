#!/bin/bash

# BDBT Supabase MCP Setup Script
# This script helps set up the dedicated MCP for BDBT project

echo "🚀 BDBT Supabase MCP Setup"
echo "=========================="
echo ""

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
else
    echo "❌ Unsupported operating system. Please set up manually."
    exit 1
fi

# Check if Claude config exists
if [ ! -f "$CONFIG_PATH" ]; then
    echo "❌ Claude Desktop config not found at: $CONFIG_PATH"
    echo "Please ensure Claude Desktop is installed and has been run at least once."
    exit 1
fi

echo "📝 Please enter your Supabase Management API Key:"
echo "   (Get it from: https://supabase.com/dashboard/account/tokens)"
read -s SUPABASE_API_KEY
echo ""

# Validate API key format (basic check)
if [ -z "$SUPABASE_API_KEY" ]; then
    echo "❌ API key cannot be empty"
    exit 1
fi

# Create backup of current config
cp "$CONFIG_PATH" "$CONFIG_PATH.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Created backup of Claude config"

# Update the local MCP config with the API key
MCP_CONFIG_PATH=".mcp/bdbt-supabase-mcp.json"
if [ -f "$MCP_CONFIG_PATH" ]; then
    # Use perl for cross-platform compatibility
    perl -i -pe "s/YOUR_SUPABASE_MANAGEMENT_API_KEY_HERE/$SUPABASE_API_KEY/g" "$MCP_CONFIG_PATH"
    echo "✅ Updated local MCP configuration"
else
    echo "❌ Local MCP config not found at: $MCP_CONFIG_PATH"
    exit 1
fi

# Add to Claude Desktop config
echo ""
echo "📋 Next steps:"
echo "1. Open Claude Desktop settings:"
echo "   $CONFIG_PATH"
echo ""
echo "2. Add this to the 'mcpServers' section:"
echo ""
echo '    "bdbt-supabase": {'
echo '      "command": "npx",'
echo '      "args": ['
echo '        "-y",'
echo '        "@modelcontextprotocol/server-supabase@latest"'
echo '      ],'
echo '      "env": {'
echo "        \"SUPABASE_MANAGEMENT_API_KEY\": \"$SUPABASE_API_KEY\""
echo '      }'
echo '    }'
echo ""
echo "3. Save the file and restart Claude Desktop"
echo ""
echo "🎉 Setup complete! Remember to restart Claude Desktop."