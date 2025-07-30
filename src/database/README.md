# Tips Database Setup Instructions

## Overview
This directory contains the database schema and seed data for the BDBT tips system.

## Files
- `tips-schema.sql` - Complete database schema with tables, indexes, functions, and RLS policies
- `seed-tips-data.sql` - Sample tips data to get started

## Setup Instructions

### 1. Apply the Schema to Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/fnkdtnmlyxcwrptdbmqy
2. Navigate to the **SQL Editor** (in the left sidebar)
3. Create a new query
4. Copy and paste the entire contents of `tips-schema.sql`
5. Click **Run** to execute the migration

### 2. Load Sample Data (Optional)

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `seed-tips-data.sql`
3. Click **Run** to insert the sample tips

### 3. Verify the Setup

Run this query to verify everything is working:

```sql
-- Check categories
SELECT * FROM categories;

-- Check tips count
SELECT COUNT(*) as total_tips FROM tips;

-- Check tips with categories
SELECT 
  t.title,
  t.difficulty,
  c.name as category
FROM tips t
JOIN categories c ON t.category_id = c.id
LIMIT 5;
```

## Database Structure

### Main Tables
- **categories** - Health, Wealth, Happiness
- **tips** - Main tips content
- **user_tip_favorites** - User's favorite tips
- **user_tip_progress** - Track user progress on tips
- **tip_analytics** - Analytics events
- **tip_collections** - Curated tip collections
- **related_tips** - Relationships between tips

### Key Features
- UUID primary keys for all tables
- Row Level Security (RLS) enabled
- Automatic timestamp updates
- Full-text search support on tags
- Analytics tracking functions
- Related tips functionality

### Security
- Public read access for published tips
- Users can only manage their own favorites and progress
- Analytics events are insert-only
- Service role required for admin operations

## API Usage

The schema is designed to work with the Supabase client in your app:

```typescript
// Get all tips
const { data: tips } = await supabase
  .from('tips_with_category')
  .select('*')
  .eq('is_published', true);

// Track a view
await supabase.rpc('increment_tip_view_count', { 
  tip_uuid: tipId 
});

// Get user favorites
const { data: favorites } = await supabase
  .from('user_tip_favorites')
  .select('*, tips(*)')
  .eq('user_id', userId);
```

## Troubleshooting

If you encounter errors:

1. **UUID extension error**: The uuid-ossp extension might already exist, this is fine
2. **Permission errors**: Make sure you're using the SQL Editor in Supabase Dashboard
3. **Foreign key errors**: Run the schema first before the seed data

## Next Steps

1. Update the TypeScript types in `/src/types/tip.ts` to match the database schema
2. Create API service functions in `/src/services/tipsService.ts`
3. Test the integration with your React components