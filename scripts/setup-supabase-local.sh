#!/bin/bash

# Setup Supabase for BDBT project only
echo "🚀 Setting up Supabase for BDBT project..."

# Check if we're in the BDBT directory
if [[ ! "$PWD" == *"SIDE-QUEST-CLIENTS/bdbt"* ]]; then
    echo "❌ Error: This script must be run from the BDBT project directory"
    exit 1
fi

# Install Supabase CLI locally to this project
echo "📦 Installing Supabase CLI locally..."
npm install --save-dev supabase

# Create local Supabase config
echo "📝 Creating Supabase configuration..."
cat > supabase/config.toml << 'EOF'
# BDBT Supabase Configuration
[project]
id = "bdbt-tips"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]

[db]
port = 54322
shadow_port = 54320
major_version = 15

[db.pooler]
enabled = false
port = 54329

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[analytics]
enabled = false
port = 54327
EOF

# Create initialization SQL for tips database
echo "🗄️ Creating database initialization script..."
mkdir -p supabase/migrations
cat > supabase/migrations/20240101000000_create_tips_tables.sql << 'EOF'
-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
    subcategory VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
    description TEXT,
    primary_benefit TEXT,
    secondary_benefit TEXT,
    tertiary_benefit TEXT,
    implementation_time VARCHAR(50),
    frequency VARCHAR(50),
    cost VARCHAR(50),
    scientific_backing BOOLEAN DEFAULT false,
    source_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create what's included items table
CREATE TABLE IF NOT EXISTS tip_includes (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    item TEXT NOT NULL,
    order_index INTEGER DEFAULT 0
);

-- Create resources table
CREATE TABLE IF NOT EXISTS tip_resources (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER REFERENCES tips(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) CHECK (resource_type IN ('book', 'article', 'video', 'app', 'tool', 'website', 'course', 'podcast')),
    title VARCHAR(255),
    url TEXT,
    description TEXT,
    is_free BOOLEAN DEFAULT true,
    author VARCHAR(255),
    platform VARCHAR(100)
);

-- Create indexes
CREATE INDEX idx_tips_category ON tips(category);
CREATE INDEX idx_tips_status ON tips(status);
CREATE INDEX idx_tips_tags ON tips USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_includes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Tips are viewable by everyone" ON tips
    FOR SELECT USING (status = 'published');

CREATE POLICY "Tip includes are viewable by everyone" ON tip_includes
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM tips WHERE tips.id = tip_includes.tip_id AND tips.status = 'published'
    ));

CREATE POLICY "Tip resources are viewable by everyone" ON tip_resources
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM tips WHERE tips.id = tip_resources.tip_id AND tips.status = 'published'
    ));
EOF

# Create project-specific MCP config
echo "🔧 Creating MCP configuration..."
cat > bdbt-mcp-config.json << 'EOF'
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

# Create start script
echo "📜 Creating start scripts..."
cat > start-supabase-local.sh << 'EOF'
#!/bin/bash
echo "Starting local Supabase for BDBT..."
npx supabase start
echo "Supabase is running at http://localhost:54321"
echo "Studio is available at http://localhost:54323"
EOF

cat > stop-supabase-local.sh << 'EOF'
#!/bin/bash
echo "Stopping local Supabase..."
npx supabase stop
EOF

# Make scripts executable
chmod +x start-supabase-local.sh
chmod +x stop-supabase-local.sh

# Create VS Code workspace settings
echo "⚙️ Creating VS Code workspace settings..."
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
        "SUPABASE_URL": "${workspaceFolder}/.env.local:SUPABASE_URL",
        "SUPABASE_SERVICE_KEY": "${workspaceFolder}/.env.local:SUPABASE_SERVICE_KEY"
      }
    }
  },
  "files.exclude": {
    "supabase/.branches": true,
    "supabase/.temp": true
  }
}
EOF

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your Supabase project credentials"
echo "2. Run './start-supabase-local.sh' to start local Supabase"
echo "3. Run 'npx supabase db push' to apply migrations"
echo "4. The MCP server will only be available when you open this project in VS Code"
echo ""
echo "🔐 Security note: .env.local is already in .gitignore"