#!/bin/bash

# BDBT MCP Server Setup Script
# This script sets up the project-specific Supabase MCP server

echo "🚀 Setting up BDBT Supabase MCP Server..."
echo "========================================"

# Get the absolute path to this project
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📍 Project directory: $PROJECT_DIR"

# Check if package.json exists
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo "❌ package.json not found. Are you in the correct directory?"
    exit 1
fi

# Install MCP SDK if not already installed
echo "📦 Checking MCP SDK installation..."
if ! npm list @modelcontextprotocol/sdk > /dev/null 2>&1; then
    echo "Installing @modelcontextprotocol/sdk..."
    npm install @modelcontextprotocol/sdk
else
    echo "✅ MCP SDK already installed"
fi

# Check if MCP server file exists
if [ ! -f "$PROJECT_DIR/.mcp/supabase-server.js" ]; then
    echo "❌ MCP server file not found at .mcp/supabase-server.js"
    exit 1
fi

# Test the MCP server
echo "🧪 Testing MCP server..."
if node "$PROJECT_DIR/.mcp/test-server.js"; then
    echo "✅ MCP server test passed"
else
    echo "❌ MCP server test failed"
    exit 1
fi

# Create MCP configuration for different locations
echo "⚙️  Creating MCP configuration files..."

# Create .claude directory if it doesn't exist
mkdir -p "$PROJECT_DIR/.claude"

# Create the MCP configuration
cat > "$PROJECT_DIR/.claude/mcp-config.json" << EOF
{
  "mcpServers": {
    "bdbt-supabase": {
      "command": "node",
      "args": ["./.mcp/supabase-server.js"],
      "cwd": "$PROJECT_DIR",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

# Also create it in the root for other MCP clients
cat > "$PROJECT_DIR/mcp-servers.json" << EOF
{
  "mcpServers": {
    "bdbt-supabase": {
      "command": "node",
      "args": ["./.mcp/supabase-server.js"],
      "cwd": "$PROJECT_DIR",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "✅ MCP configuration files created"

# Check environment setup
echo "🔍 Checking environment setup..."
if [ -f "$PROJECT_DIR/.env" ]; then
    if grep -q "VITE_SUPABASE_URL" "$PROJECT_DIR/.env" && grep -q "VITE_SUPABASE_ANON_KEY" "$PROJECT_DIR/.env"; then
        echo "✅ Environment variables found"
        echo "🔗 MCP server will use live Supabase data"
    else
        echo "⚠️  Environment variables incomplete"
        echo "📝 MCP server will use mock data (see SETUP_SUPABASE.md for live data setup)"
    fi
else
    echo "⚠️  No .env file found"
    echo "📝 MCP server will use mock data (see SETUP_SUPABASE.md for live data setup)"
fi

echo ""
echo "🎉 BDBT MCP Server Setup Complete!"
echo "=================================="
echo ""
echo "📋 What was set up:"
echo "   ✅ MCP SDK installed"
echo "   ✅ MCP server tested and working"
echo "   ✅ Configuration files created:"
echo "      - $PROJECT_DIR/.claude/mcp-config.json"
echo "      - $PROJECT_DIR/mcp-servers.json"
echo ""
echo "🔧 Available MCP Tools:"
echo "   • list_tips - Get tips with filtering"
echo "   • get_tip - Get specific tip by ID"
echo "   • create_tip - Create new tips"
echo "   • update_tip - Update existing tips"
echo "   • delete_tip - Delete tips"
echo "   • get_statistics - Get database statistics"
echo "   • list_calendar_events - Get calendar events"
echo "   • create_calendar_event - Create calendar events"
echo "   • test_connection - Test Supabase connection"
echo ""
echo "📚 Available MCP Resources:"
echo "   • supabase://tips - All tips data"
echo "   • supabase://calendar-events - Calendar events"
echo "   • supabase://statistics - Database stats"
echo "   • supabase://connection-status - Connection info"
echo ""
echo "🚀 The MCP server is now ready for use in this Claude Code project!"
echo "💡 It will automatically use live data if Supabase is configured, or mock data otherwise."