# Complete Supabase Setup Guide for BDBT

## 📋 Overview
This guide will help you set up all the necessary tables and configurations to make the BDBT app fully functional with real data.

## 🗂️ Database Setup Steps

### Step 1: Create Core Tables
Run the following SQL files in order in your Supabase SQL Editor:

1. **First, run the existing schema** (if not already done):
   ```sql
   -- Run: src/database/schema.sql
   ```

2. **Then, run the complete schema for new tables**:
   ```sql
   -- Run: src/database/complete-schema.sql
   ```

3. **Set up Row Level Security policies**:
   ```sql
   -- Run: src/database/rls-policies.sql
   ```

4. **Optionally, add sample data**:
   ```sql
   -- Run: src/database/sample-data.sql
   ```

### Step 2: Enable Authentication
1. Go to Authentication → Settings in Supabase Dashboard
2. Enable Email/Password authentication
3. Configure email templates for:
   - Confirmation emails
   - Password reset emails
   - Magic link emails

### Step 3: Configure Storage Buckets (Optional)
If you want to store images for users, tips, or podcasts:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('tip-images', 'tip-images', true),
  ('podcast-thumbnails', 'podcast-thumbnails', true);
```

### Step 4: Update Environment Variables
Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Table Overview

### Public Tables (No authentication required to read):
- ✅ **tips** - Main tips content
- ✅ **tip_includes** - What's included in tips
- ✅ **calendar_events** - Content calendar
- ✅ **podcast_episodes** - Podcast episode data

### Protected Tables (Require authentication):
- 🔐 **daily_wins** - User wins/achievements
- 🔐 **win_likes** - Likes on wins
- 🔐 **win_comments** - Comments on wins
- 🔐 **user_profiles** - User profile data
- 🔐 **user_api_keys** - User's API keys

### Admin-only Tables:
- 🔒 **newsletter_subscribers** - Email subscribers
- 🔒 **contact_submissions** - Contact form submissions
- 🔒 **analytics_events** - Analytics tracking

## 🔌 Connecting Pages to Supabase

Here's what needs to be updated in the codebase:

### 1. TipsPage (`/src/pages/TipsPage.tsx`)
- Replace hardcoded tips array with `tipsDatabaseService.getTips()`
- Add filtering and search functionality

### 2. DailyWinsPage (`/src/pages/DailyWinsPage.tsx`)
- Create service: `dailyWinsService.ts`
- Implement CRUD operations for wins
- Add real-time subscriptions for live updates

### 3. PodcastPage (`/src/pages/PodcastPage.tsx`)
- Create service: `podcastService.ts`
- Fetch episodes from `podcast_episodes` table

### 4. Form Submissions
- Update `formUtils.ts` to save to Supabase instead of mock API
- Newsletter signups → `newsletter_subscribers`
- Contact forms → `contact_submissions`

### 5. Analytics Page
- Create service: `analyticsService.ts`
- Track events to `analytics_events` table
- Aggregate data for dashboard

### 6. Authentication
- Implement auth using Supabase Auth
- Create auth context and hooks
- Add login/signup pages

## 🚀 Quick Test

After setup, test the connection:

```typescript
// Test in browser console
const { data, error } = await supabase
  .from('tips')
  .select('*')
  .limit(5);

console.log('Tips:', data);
console.log('Error:', error);
```

## 📝 Next Steps

1. **Run the SQL scripts** in Supabase SQL Editor
2. **Update the services** to use real Supabase queries
3. **Add authentication** flows
4. **Test each feature** with real data

## 🆘 Troubleshooting

- **RLS Policy Errors**: Use the provided `rls-policies.sql` that drops existing policies first
- **Foreign Key Errors**: Make sure to enable Authentication before creating user-related tables
- **Connection Issues**: Verify your environment variables are correct

## 📚 Useful Supabase Queries

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies;

-- Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```