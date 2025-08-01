#!/bin/bash

echo "🎨 Setting up 21st.dev Magic MCP for Claude Code..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Installing 21st.dev Magic MCP Server...${NC}"

# Try to install the Magic MCP server
if npx @21st-dev/magic --version &> /dev/null; then
    echo -e "${GREEN}✅ 21st.dev Magic MCP server is available${NC}"
else
    echo -e "${YELLOW}⚠️  Installing 21st.dev Magic MCP server...${NC}"
    npm install -g @21st-dev/magic 2>/dev/null || echo -e "${RED}❌ Could not install globally. Will use npx instead.${NC}"
fi

echo -e "${BLUE}Step 2: Getting API Key...${NC}"
echo -e "${YELLOW}🔑 You need to get an API key from 21st.dev${NC}"
echo -e "   1. Visit: ${BLUE}https://21st.dev/magic${NC}"
echo -e "   2. Sign up for an account"
echo -e "   3. Get your API key"
echo -e "   4. Set it in your environment:"
echo -e "      ${GREEN}export MAGIC_API_KEY='your-api-key-here'${NC}"

echo -e "${BLUE}Step 3: Configure Claude Code...${NC}"

# Check if Claude Code config directory exists
CLAUDE_CONFIG_DIR="$HOME/.config/claude-code"
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo -e "${YELLOW}Creating Claude Code config directory...${NC}"
    mkdir -p "$CLAUDE_CONFIG_DIR"
fi

# Create MCP configuration
cat > "$CLAUDE_CONFIG_DIR/mcp_servers.json" << EOF
{
  "mcpServers": {
    "21st-dev-magic": {
      "command": "npx",
      "args": ["@21st-dev/magic"],
      "env": {
        "MAGIC_API_KEY": "\${MAGIC_API_KEY}"
      }
    },
    "web-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-web-search"]
    },
    "github": {
      "command": "npx", 
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
EOF

echo -e "${GREEN}✅ MCP configuration created at: $CLAUDE_CONFIG_DIR/mcp_servers.json${NC}"

echo -e "${BLUE}Step 4: Usage Instructions...${NC}"
echo -e "${GREEN}Once you have your API key set up, you can use these commands in Claude Code:${NC}"
echo -e "   📱 ${YELLOW}/ui create a modern button component${NC}"
echo -e "   🎨 ${YELLOW}/ui design a pricing table with 3 tiers${NC}" 
echo -e "   🔍 ${YELLOW}/ui search for navigation components${NC}"
echo -e "   💡 ${YELLOW}/ui get inspiration for dashboard layouts${NC}"

echo -e "${BLUE}Step 5: Test Connection...${NC}"
echo -e "Run this in your project:"
echo -e "   ${GREEN}claude-code --mcp-config $CLAUDE_CONFIG_DIR/mcp_servers.json${NC}"

echo -e "${GREEN}🎉 Setup complete! Don't forget to get your API key from https://21st.dev/magic${NC}"