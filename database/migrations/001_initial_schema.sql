-- BDBT Tips Database Schema Migration
-- Migration: 001_initial_schema
-- Created: 2025-07-30

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Main tips table
CREATE TABLE IF NOT EXISTS bdbt_tips (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
    subcategory VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
    description TEXT NOT NULL,
    primary_benefit TEXT NOT NULL,
    secondary_benefit TEXT NOT NULL,
    tertiary_benefit TEXT NOT NULL,
    implementation_time VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    cost VARCHAR(50) NOT NULL,
    scientific_backing BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(primary_benefit, '')), 'D')
    ) STORED
);

-- What's included items for each tip
CREATE TABLE IF NOT EXISTS bdbt_tip_includes (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    item_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources/links for each tip
CREATE TABLE IF NOT EXISTS bdbt_tip_resources (
    id SERIAL PRIMARY KEY,
    tip_id INTEGER NOT NULL REFERENCES bdbt_tips(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('book', 'article', 'video', 'tool', 'app', 'website', 'other')),
    title VARCHAR(255) NOT NULL,
    url TEXT,
    description TEXT,
    resource_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bdbt_tips_category ON bdbt_tips(category);
CREATE INDEX idx_bdbt_tips_difficulty ON bdbt_tips(difficulty);
CREATE INDEX idx_bdbt_tips_status ON bdbt_tips(status);
CREATE INDEX idx_bdbt_tips_search ON bdbt_tips USING GIN(search_vector);
CREATE INDEX idx_bdbt_tips_tags ON bdbt_tips USING GIN(tags);
CREATE INDEX idx_bdbt_tip_includes_tip_id ON bdbt_tip_includes(tip_id);
CREATE INDEX idx_bdbt_tip_resources_tip_id ON bdbt_tip_resources(tip_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update timestamps
CREATE TRIGGER update_bdbt_tips_updated_at BEFORE UPDATE ON bdbt_tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();