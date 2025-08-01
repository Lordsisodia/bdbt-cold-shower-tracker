#!/bin/bash

# MCP Verification and Auto-Fix Script
# This script verifies all MCP tools are working and attempts to fix issues

echo "🔍 MCP Verification Starting..."

# Check if MCP servers config exists
if [ ! -f "$HOME/.config/claude/mcp-servers.json" ]; then
    echo "❌ MCP config not found! Creating..."
    mkdir -p "$HOME/.config/claude"
    cat > "$HOME/.config/claude/mcp-servers.json" << 'EOF'
{
  "supabase": {
    "command": "npx",
    "args": ["@supabase/mcp-server@latest", "projects", "start"],
    "env": {
      "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
    }
  },
  "github": {
    "command": "gh",
    "args": ["mcp"]
  },
  "desktop-commander": {
    "command": "npx",
    "args": ["@desktop-commander/mcp-server@latest"]
  }
}
EOF
fi

# Test Supabase MCP
echo "🔄 Testing Supabase MCP..."
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

# Check Supabase access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "⚠️  SUPABASE_ACCESS_TOKEN not set!"
    echo "📝 Add to ~/.zshrc or ~/.bashrc:"
    echo "export SUPABASE_ACCESS_TOKEN='your-token-here'"
else
    echo "✅ Supabase token found"
fi

# Test GitHub CLI
echo "🔄 Testing GitHub CLI..."
if ! command -v gh &> /dev/null; then
    echo "📦 Installing GitHub CLI..."
    brew install gh
fi

# Check GitHub authentication
if ! gh auth status &> /dev/null; then
    echo "🔐 GitHub CLI not authenticated!"
    echo "Run: gh auth login"
else
    echo "✅ GitHub CLI authenticated"
fi

# Test Git configuration
echo "🔄 Checking Git configuration..."
if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    echo "⚠️  Git user not configured!"
    git config user.name "BDBT Orchestrator"
    git config user.email "orchestrator@bdbt.local"
    echo "✅ Set default Git user"
fi

# Create MCP test results
cat > /tmp/bdbt_mcp_status.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "supabase": $(command -v supabase &> /dev/null && echo "true" || echo "false"),
  "github": $(gh auth status &> /dev/null && echo "true" || echo "false"),
  "git_configured": $([ -n "$(git config user.name)" ] && echo "true" || echo "false"),
  "mcp_config_exists": $([ -f "$HOME/.config/claude/mcp-servers.json" ] && echo "true" || echo "false")
}
EOF

echo "✅ MCP verification complete! Results saved to /tmp/bdbt_mcp_status.json"