#!/bin/bash

# Create BDBT schema using direct REST API calls
PROJECT_URL="https://fnkdtnmlyxcwrptdbmqy.supabase.co"
SERVICE_ROLE_KEY="sb_secret_O-_c-mbsICfrzIcXSBW45Q_lisfrQP2"

echo "🔧 Creating BDBT tips schema via REST API..."

# Create the main table
SQL_QUERY="CREATE TABLE IF NOT EXISTS bdbt_tips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(100),
  difficulty VARCHAR(20),
  description TEXT,
  primary_benefit TEXT,
  secondary_benefit TEXT,
  tertiary_benefit TEXT,
  implementation_time VARCHAR(100),
  frequency VARCHAR(100),
  cost VARCHAR(100),
  scientific_backing BOOLEAN DEFAULT false,
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'published'
);"

# Execute via REST API
curl -X POST "${PROJECT_URL}/rest/v1/rpc/exec" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"${SQL_QUERY}\"}"

echo ""
echo "✅ Schema creation attempted!"