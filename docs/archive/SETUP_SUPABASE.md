# 🚀 BDBT Supabase Setup Guide

This guide will help you connect your BDBT app to Supabase for live data.

## 📋 Quick Setup (5 minutes)

### 1. Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Find Your Supabase Credentials
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** > **API**
4. Copy your:
   - **Project URL** (for `VITE_SUPABASE_URL`)
   - **anon/public key** (for `VITE_SUPABASE_ANON_KEY`)

## 🗄️ Database Setup

### Create the Required Tables

Run these SQL commands in your Supabase SQL Editor:

#### 1. Tips Table
```sql
CREATE TABLE tips (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
  subcategory VARCHAR(100) NOT NULL DEFAULT 'general',
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('Easy', 'Moderate', 'Advanced')),
  description TEXT NOT NULL,
  primary_benefit TEXT NOT NULL,
  secondary_benefit TEXT NOT NULL,
  tertiary_benefit TEXT NOT NULL,
  implementation_time VARCHAR(100) NOT NULL DEFAULT '5-10 minutes',
  frequency VARCHAR(100) NOT NULL DEFAULT 'Daily',
  cost VARCHAR(100) NOT NULL DEFAULT 'Free',
  scientific_backing BOOLEAN DEFAULT false,
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tips_category ON tips(category);
CREATE INDEX idx_tips_difficulty ON tips(difficulty);
CREATE INDEX idx_tips_status ON tips(status);
CREATE INDEX idx_tips_created_at ON tips(created_at);
```

#### 2. Calendar Events Table
```sql
CREATE TABLE calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('health', 'wealth', 'happiness')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'published', 'draft')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('tip', 'idea', 'campaign', 'review')),
  priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  assignee VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_date ON calendar_events(date);
CREATE INDEX idx_calendar_events_category ON calendar_events(category);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
```

#### 3. Helper Functions
```sql
-- Function to increment tip view count
CREATE OR REPLACE FUNCTION increment_tip_view_count(tip_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE tips 
  SET view_count = view_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment tip download count
CREATE OR REPLACE FUNCTION increment_tip_download_count(tip_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE tips 
  SET download_count = download_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;
```

### 4. Row Level Security (Optional but Recommended)
```sql
-- Enable RLS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published tips
CREATE POLICY "Allow public read access to published tips" ON tips
  FOR SELECT USING (status = 'published');

-- Allow public read access to calendar events
CREATE POLICY "Allow public read access to calendar events" ON calendar_events
  FOR SELECT USING (true);

-- For now, allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on tips" ON tips
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on calendar events" ON calendar_events
  FOR ALL USING (true);
```

## 🎯 Test Your Setup

1. Start your app: `npm run dev`
2. Navigate to `/admin/dashboard`
3. You should see:
   - ✅ **"Supabase connected successfully"** in browser console
   - Live data loading (or empty tables if no data)
   - No "using mock data" warnings

## 🔧 Troubleshooting

### Common Issues:

#### "401 Unauthorized" Error
- ❌ **Problem**: Invalid API key
- ✅ **Solution**: Double-check your `VITE_SUPABASE_ANON_KEY` in `.env`

#### "Mock data" Messages
- ❌ **Problem**: Environment variables not found
- ✅ **Solution**: Ensure `.env` file exists with correct variable names (`VITE_*`)

#### Tables Don't Exist
- ❌ **Problem**: Database tables not created
- ✅ **Solution**: Run the SQL commands above in Supabase SQL Editor

#### No Data Showing
- ❌ **Problem**: Empty database
- ✅ **Solution**: Use the "Generate Sample Data" button in the admin panel

## 🚀 Next Steps

Once connected, you can:
- Create tips in `/admin/create`
- Schedule content in `/admin/calendar`
- View analytics in `/admin/dashboard`
- Export PDFs with live data

## 💡 Mock Data Mode

Don't have Supabase set up yet? No problem! The app automatically uses realistic mock data when Supabase isn't configured, so you can:
- Test all features
- See the full UI
- Generate sample PDFs
- Evaluate the system before setting up the database

---

**Need Help?** Check the browser console for detailed connection status and error messages.