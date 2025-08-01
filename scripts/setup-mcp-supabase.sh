#!/bin/bash

echo "🚀 Setting up Supabase MCP for BDBT Project"
echo "==========================================="

# Check if we're in the right directory
if [[ ! "$PWD" == *"SIDE-QUEST-CLIENTS/bdbt"* ]]; then
    echo "❌ Error: Please run this from the BDBT project directory"
    exit 1
fi

# Step 1: Check for MCP installation
echo -e "\n📦 Step 1: Checking MCP installation..."
MCP_PATH="/Users/shaansisodia/mcp/packages/servers/dist/supabase/index.js"

if [ ! -f "$MCP_PATH" ]; then
    echo "❌ MCP Supabase server not found at: $MCP_PATH"
    echo ""
    echo "To install MCP Supabase server:"
    echo "1. cd ~/mcp"
    echo "2. npm install"
    echo "3. npm run build"
    echo ""
    exit 1
else
    echo "✅ MCP Supabase server found"
fi

# Step 2: Create project-specific MCP config
echo -e "\n📝 Step 2: Creating MCP configuration..."

mkdir -p .config

cat > .config/mcp-bdbt.json << 'EOF'
{
  "mcpServers": {
    "supabase-bdbt": {
      "command": "node",
      "args": [
        "/Users/shaansisodia/mcp/packages/servers/dist/supabase/index.js"
      ],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_KEY": "${SUPABASE_SERVICE_KEY}"
      }
    }
  }
}
EOF

echo "✅ Created .config/mcp-bdbt.json"

# Step 3: Create environment template
echo -e "\n🔐 Step 3: Setting up environment variables..."

if [ ! -f ".env.local" ]; then
    cat > .env.local << 'EOF'
# BDBT Supabase Configuration
# Get these from your Supabase project settings

# For local Supabase (default)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_KEY=your-local-service-key

# For cloud Supabase (production)
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_KEY=your-service-key

# Project ID for MCP
SUPABASE_PROJECT_ID=bdbt-tips
EOF
    echo "✅ Created .env.local template"
    echo "⚠️  Please update .env.local with your actual Supabase credentials"
else
    echo "✅ .env.local already exists"
fi

# Step 4: Create VS Code workspace settings
echo -e "\n⚙️  Step 4: Configuring VS Code workspace..."

mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "mcp.mcpServers": {
    "supabase-bdbt": {
      "command": "node",
      "args": [
        "/Users/shaansisodia/mcp/packages/servers/dist/supabase/index.js"
      ],
      "env": {
        "SUPABASE_URL": "${env:SUPABASE_URL}",
        "SUPABASE_SERVICE_KEY": "${env:SUPABASE_SERVICE_KEY}"
      }
    }
  }
}
EOF

echo "✅ Created VS Code workspace settings"

# Step 5: Create MCP test script
echo -e "\n🧪 Step 5: Creating MCP test script..."

cat > test-mcp-connection.js << 'EOF'
// Test MCP Supabase connection
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing MCP Supabase Configuration\n');

console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Not set');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n❌ Please set your Supabase credentials in .env.local');
    process.exit(1);
}

console.log('\n✅ Configuration looks good!');
console.log('\nTo use MCP in Claude:');
console.log('1. Open this project in VS Code');
console.log('2. Make sure Claude extension is installed');
console.log('3. Restart VS Code after configuration changes');
console.log('\nExample MCP commands:');
console.log('mcp__supabase__list_projects');
console.log('mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT COUNT(*) FROM tips"');
EOF

echo "✅ Created test-mcp-connection.js"

# Step 6: Create quick reference
echo -e "\n📚 Step 6: Creating quick reference..."

cat > MCP_COMMANDS.md << 'EOF'
# BDBT Supabase MCP Commands

## Setup Status
Run `node test-mcp-connection.js` to verify setup

## Common MCP Commands

### List All Tips
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT id, title, category, difficulty FROM tips WHERE status = 'published' LIMIT 10"
```

### Get Specific Tip with Resources
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT t.*, array_agg(DISTINCT ti.item) as includes, array_agg(DISTINCT tr.title) as resources FROM tips t LEFT JOIN tip_includes ti ON t.id = ti.tip_id LEFT JOIN tip_resources tr ON t.id = tr.tip_id WHERE t.id = 1 GROUP BY t.id"
```

### Search Tips
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT id, title, subtitle FROM tips WHERE (title ILIKE '%morning%' OR description ILIKE '%morning%') AND status = 'published'"
```

### Get Category Stats
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT category, difficulty, COUNT(*) as count FROM tips WHERE status = 'published' GROUP BY category, difficulty ORDER BY category, difficulty"
```

### Get Most Viewed Tips
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="SELECT id, title, view_count, download_count FROM tips WHERE status = 'published' ORDER BY view_count DESC LIMIT 10"
```

### Update View Count
```
mcp__supabase__execute_sql project_id="bdbt-tips" query="UPDATE tips SET view_count = view_count + 1 WHERE id = 1"
```

## Database Schema Reference

### Tips Table
- id, title, subtitle, category, subcategory
- difficulty, description, benefits (primary/secondary/tertiary)
- implementation_time, frequency, cost
- scientific_backing, tags, status
- view_count, download_count

### Tip Includes Table
- tip_id, item, order_index

### Tip Resources Table
- tip_id, resource_type, title, url
- description, is_free, author, platform
EOF

echo "✅ Created MCP_COMMANDS.md"

# Step 7: Final instructions
echo -e "\n✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update .env.local with your Supabase credentials:"
echo "   - For local: Run './start-supabase-local.sh' first"
echo "   - For cloud: Get from https://supabase.com project settings"
echo ""
echo "2. Test your configuration:"
echo "   node test-mcp-connection.js"
echo ""
echo "3. Restart VS Code in this directory"
echo ""
echo "4. Use MCP commands in Claude (see MCP_COMMANDS.md)"
echo ""
echo "🔒 Security: .env.local is gitignored - never commit credentials!"