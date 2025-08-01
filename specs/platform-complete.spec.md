# BDBT Complete Platform Specification

## Platform Overview
BDBT is a full-stack SaaS platform with two main interfaces:
1. **User Platform** - Where businesses access and use tips
2. **Admin Dashboard** - Where administrators manage users, content, and analytics

## User Platform Features

### 1. Authentication & Onboarding
- [ ] Email/password authentication via Supabase Auth
- [ ] Social login (Google, LinkedIn)
- [ ] User profile management
- [ ] Company information collection
- [ ] Subscription tier selection

### 2. Tip Discovery & Access
- [ ] Browse tips by category
- [ ] Search functionality with filters
- [ ] Tip of the day feature
- [ ] Favorites/bookmarks system
- [ ] Tip sharing capabilities
- [ ] Download tips as PDF/images

### 3. User Dashboard
- [ ] Tips accessed counter
- [ ] Download history
- [ ] Saved tips collection
- [ ] Usage analytics
- [ ] Subscription status
- [ ] Billing management

### 4. Tip Collections
- [ ] Create custom collections
- [ ] Share collections with team
- [ ] Export collections
- [ ] Collection templates

### 5. API Access (Premium)
- [ ] API key generation
- [ ] Usage tracking
- [ ] Rate limiting
- [ ] Documentation

## Admin Dashboard Features

### 1. User Management
- [ ] View all registered users
- [ ] User details (company, subscription, usage)
- [ ] User activity tracking
- [ ] Tips accessed per user
- [ ] Downloads per user
- [ ] Email communications sent
- [ ] Subscription management
- [ ] User suspension/activation

### 2. Content Management
- [ ] View all tips with metadata
- [ ] Edit/update tips
- [ ] Bulk operations
- [ ] Quality scoring interface
- [ ] Category management
- [ ] Tip approval workflow
- [ ] Schedule tip releases

### 3. Analytics Dashboard
- [ ] Total users chart
- [ ] Active users (DAU/MAU)
- [ ] Tips generated vs accessed
- [ ] Popular tips ranking
- [ ] Category performance
- [ ] Revenue metrics
- [ ] Conversion funnels
- [ ] User retention cohorts

### 4. Email Campaign Management
- [ ] Create email campaigns
- [ ] Segment users
- [ ] Track email opens/clicks
- [ ] A/B testing
- [ ] Automated sequences

### 5. System Administration
- [ ] Grok API usage monitoring
- [ ] Supabase storage metrics
- [ ] Error logs viewer
- [ ] System health dashboard
- [ ] Backup management
- [ ] Feature flags

## Database Schema Additions

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  company_size TEXT,
  industry TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  api_key TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

### User Activity Table
```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action_type TEXT, -- 'view', 'download', 'share', 'favorite'
  tip_id UUID REFERENCES tips(id),
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

### User Collections Table
```sql
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  tip_ids UUID[],
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Email Campaigns Table
```sql
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  user_segment JSONB,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Technical Requirements

### Authentication
- Supabase Auth with RLS policies
- JWT token management
- Session persistence
- Password reset flow
- Email verification

### Performance
- Page load < 2s
- API response < 200ms
- Real-time updates via Supabase subscriptions
- CDN for static assets
- Database query optimization

### Security
- Row Level Security on all tables
- API rate limiting
- Input sanitization
- HTTPS only
- Regular security audits

### Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User behavior analytics
- Uptime monitoring
- Alert system for critical issues