#!/bin/bash

echo "🚀 Setting up Supabase MCP for BDBT Project"
echo "==========================================="

# Step 1: Install Supabase MCP server locally
echo -e "\n📦 Step 1: Installing Supabase MCP server..."
npm install --save-dev @modelcontextprotocol/server-supabase

# Step 2: Create project-specific MCP config
echo -e "\n📝 Step 2: Creating MCP configuration..."

cat > bdbt-mcp-config.json << 'EOF'
{
  "mcpServers": {
    "supabase-bdbt": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_KEY": "${SUPABASE_SERVICE_KEY}"
      },
      "description": "BDBT Tips Database"
    }
  }
}
EOF

echo "✅ Created bdbt-mcp-config.json"

# Step 3: Update the main MCP config to include Supabase
echo -e "\n📝 Step 3: Updating main MCP configuration..."

# Read current config and add Supabase
node << 'EOF'
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('mcp-config.json', 'utf8'));

// Add Supabase server if not exists
if (!config.mcpServers['supabase-bdbt']) {
  config.mcpServers['supabase-bdbt'] = {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-supabase"],
    "env": {
      "SUPABASE_URL": process.env.SUPABASE_URL || "http://localhost:54321",
      "SUPABASE_SERVICE_KEY": process.env.SUPABASE_SERVICE_KEY || "your-service-key"
    },
    "description": "BDBT Tips Database via Supabase"
  };
  
  fs.writeFileSync('mcp-config.json', JSON.stringify(config, null, 2));
  console.log('✅ Added Supabase to mcp-config.json');
} else {
  console.log('✅ Supabase already in mcp-config.json');
}
EOF

# Step 4: Create environment template
echo -e "\n🔐 Step 4: Setting up environment variables..."

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
EOF
    echo "✅ Created .env.local template"
else
    echo "✅ .env.local already exists"
fi

# Step 5: Create test script
echo -e "\n🧪 Step 5: Creating test script..."

cat > test-supabase-mcp.js << 'EOF'
// Test Supabase MCP connection
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing Supabase MCP Configuration\n');

console.log('Environment Variables:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set (hidden)' : '❌ Not set');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n❌ Please set your Supabase credentials in .env.local');
    console.log('\nFor local Supabase:');
    console.log('1. Run: ./start-supabase-local.sh');
    console.log('2. Copy the anon and service_role keys shown');
    console.log('3. Update .env.local with these keys');
} else {
    console.log('\n✅ Configuration looks good!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart this terminal or run: source ~/.zshrc');
    console.log('2. The MCP server will now have access to your Supabase');
}

// Set environment variables for current session
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    console.log('\n🔧 Setting environment variables for current session...');
    console.log('export SUPABASE_URL=' + process.env.SUPABASE_URL);
    console.log('export SUPABASE_SERVICE_KEY=' + process.env.SUPABASE_SERVICE_KEY);
}
EOF

echo "✅ Created test-supabase-mcp.js"

# Step 6: Create shell script to export env vars
echo -e "\n🔧 Step 6: Creating environment setup script..."

cat > setup-env.sh << 'EOF'
#!/bin/bash
# Source this file to set environment variables: source setup-env.sh

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.local"
    echo "SUPABASE_URL=$SUPABASE_URL"
    echo "SUPABASE_SERVICE_KEY=(hidden)"
else
    echo "❌ .env.local not found"
fi
EOF

chmod +x setup-env.sh

# Step 7: Show instructions
echo -e "\n✅ Setup Complete!"
echo "=================="
echo ""
echo "📋 Quick Start:"
echo ""
echo "1. Start local Supabase (if not using cloud):"
echo "   ./start-supabase-local.sh"
echo ""
echo "2. Update .env.local with your credentials"
echo ""
echo "3. Load environment variables:"
echo "   source setup-env.sh"
echo ""
echo "4. Test the connection:"
echo "   node test-supabase-mcp.js"
echo ""
echo "5. Now you can use Supabase MCP commands!"
echo ""
echo "📝 Example MCP usage:"
echo 'mcp__supabase__execute_sql query="SELECT COUNT(*) FROM tips"'