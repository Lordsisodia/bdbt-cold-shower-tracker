# BDBT Database Structure

This folder contains all database-related files for the BDBT (Better Days, Better Tomorrow) tips application.

## Folder Structure

```
database/
├── migrations/           # SQL migration files (run in order)
│   ├── 001_initial_schema.sql      # Creates tables and indexes
│   ├── 002_row_level_security.sql  # Sets up RLS policies
│   └── 003_views.sql               # Creates helpful views
├── seeds/               # Seed data
│   ├── bdbt-tips-seed.sql         # 619 tips imported from JSON
│   └── convert-json-to-sql.js     # Converter script
├── schema/              # Schema documentation (future)
└── functions/           # Database functions (future)
```

## Database Schema

### Tables

1. **bdbt_tips** - Main tips table
   - id, title, subtitle, category, subcategory
   - difficulty, description, benefits (primary/secondary/tertiary)
   - implementation_time, frequency, cost
   - scientific_backing, tags, status
   - Full-text search support

2. **bdbt_tip_includes** - What's included in each tip
   - Links to tips via tip_id
   - Ordered list items

3. **bdbt_tip_resources** - Resources/links for each tip
   - Different resource types (book, article, video, etc.)
   - Optional URLs and descriptions

### Views

- **bdbt_tips_with_counts** - Tips with include/resource counts
- **bdbt_category_stats** - Statistics by category
- **bdbt_popular_tips** - Top 10 most recent published tips

## Setup Instructions

### Using MCP Supabase

1. Ensure MCP Supabase is configured in Claude Code
2. Apply migrations in order:
   ```
   mcp__supabase__apply_migration(project_id, name, query)
   ```
3. Load seed data (may need to chunk due to size)

### Manual Setup

1. Go to Supabase SQL Editor
2. Run each migration file in order
3. Run the seed data SQL file

## Data Source

Tips are imported from `data/bdbt-1000-tips.json` containing:
- 619 total tips
- Categories: Health (231), Wealth (194), Happiness (194)
- Difficulties: Easy (217), Moderate (210), Advanced (192)

## Security

- Row Level Security (RLS) enabled on all tables
- Public can only view published tips
- Admin role required for modifications

## Future Enhancements

- User favorites/bookmarks
- Tip ratings and reviews
- Usage tracking
- AI-enhanced tip generation
- Personalized recommendations