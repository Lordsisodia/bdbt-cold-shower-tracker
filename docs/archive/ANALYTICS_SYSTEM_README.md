# BDBT Analytics System

A comprehensive analytics system that tracks user interactions, content performance, and provides real-time insights for the BDBT application.

## 🚀 Features

### Real-Time Tracking
- **Page Views**: Track navigation and user journeys
- **Tip Interactions**: View, download, and share events
- **Search Analytics**: Query tracking with results count
- **Filter Usage**: Category and sort preference tracking
- **User Engagement**: Session duration and interaction patterns

### Dashboard Metrics
- **Total Views**: Aggregate view counts with percentage changes
- **Active Users**: Unique user tracking across time periods
- **Downloads**: Tip download metrics and revenue calculation
- **Content Performance**: Top-performing tips with engagement rates
- **Category Distribution**: Visual breakdown of content categories
- **Geographic Data**: User location analytics (simulated)
- **Demographics**: Age group distribution (simulated)

### Performance Optimization
- **Fallback Data**: Graceful degradation with mock data
- **Debounced Tracking**: Efficient search query tracking
- **Batch Processing**: Optimized database operations
- **Caching**: Built-in 15-minute cache for repeated requests

## 📊 Architecture

### Core Components

#### 1. Analytics Service (`analyticsService.ts`)
```typescript
// Main service class handling all analytics operations
class AnalyticsService {
  // Track events in database
  async trackEvent(event: AnalyticsEvent): Promise<void>
  
  // Get dashboard metrics with comparison
  async getDashboardMetrics(filters: AnalyticsFilters): Promise<DashboardMetrics>
  
  // Get content performance data
  async getContentPerformance(filters: AnalyticsFilters): Promise<ContentPerformance[]>
  
  // Get category distribution
  async getCategoryDistribution(filters: AnalyticsFilters): Promise<CategoryDistribution[]>
}
```

#### 2. Database Schema (`analytics-schema.sql`)
```sql
-- Primary events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY,
  tip_id UUID,
  user_id UUID,
  event_type VARCHAR(50),
  session_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMPTZ
);

-- Daily aggregations for performance
CREATE TABLE daily_analytics_summary (
  date DATE,
  tip_id UUID,
  event_type VARCHAR(50),
  event_count INTEGER,
  unique_users INTEGER
);

-- User session tracking
CREATE TABLE user_sessions (
  session_id VARCHAR(100),
  user_id UUID,
  page_views INTEGER,
  tip_views INTEGER,
  downloads INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
);
```

#### 3. Tracking Functions
```typescript
// Convenience functions for common events
trackPageView(page: string, metadata?: any)
trackTipView(tipId: string, metadata?: any)
trackTipDownload(tipId: string, metadata?: any)
trackTipShare(tipId: string, metadata?: any)
trackSearch(searchTerm: string, results: number, metadata?: any)
trackFilter(filterType: string, filterValue: string, metadata?: any)
```

### Integration Points

#### App Router (`App.tsx`)
```typescript
// Automatic page view tracking
function Analytics() {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView(location.pathname, {
      search: location.search,
      referrer: document.referrer
    });
  }, [location]);
}
```

#### Tips Page (`TipsPage.tsx`)
```typescript
// Search tracking with debouncing
useEffect(() => {
  if (searchQuery.trim()) {
    const timeoutId = setTimeout(() => {
      trackSearch(searchQuery, filteredTips.length);
    }, 500);
    return () => clearTimeout(timeoutId);
  }
}, [searchQuery]);

// Filter change tracking
const handleCategoryChange = (category) => {
  setSelectedCategory(category);
  trackFilter('category', category);
};
```

#### Tip Detail Page (`TipWebPage.tsx`)
```typescript
// Download tracking
const handleDownloadPDF = async () => {
  trackTipDownload(tip.id, {
    title: tip.title,
    category: tip.category,
    from: 'tip-detail-page'
  });
  setShowEmailModal(true);
};

// Share tracking
const handleShare = async () => {
  trackTipShare(tip.id, {
    method: 'native-share',
    from: 'tip-detail-page'
  });
  // ... share logic
};
```

## 🛠️ Setup Instructions

### 1. Database Setup
```bash
# Run the analytics setup script
npm run setup-analytics

# Or manually execute the SQL schema
psql -d your_database -f src/database/analytics-schema.sql
```

### 2. Environment Configuration
```env
# Ensure Supabase is configured
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Test Integration
```typescript
// Import and run test suite
import { testAnalyticsIntegration } from './utils/testAnalytics';
await testAnalyticsIntegration();
```

## 📈 Usage Examples

### Basic Event Tracking
```typescript
import { trackTipView, trackSearch } from './services/analyticsService';

// Track a tip view
trackTipView('tip-123', {
  title: 'Morning Routine Guide',
  category: 'health',
  difficulty: 'Easy',
  from: 'search-results'
});

// Track a search with results
trackSearch('morning routine', 15, {
  category: 'health',
  sortBy: 'popular'
});
```

### Dashboard Data Retrieval
```typescript
import { analyticsService } from './services/analyticsService';

// Get last 30 days metrics
const metrics = await analyticsService.getDashboardMetrics({
  dateRange: '30d',
  category: 'health'
});

console.log(`Views: ${metrics.totalViews} (${metrics.viewsChange}%)`);
console.log(`Revenue: $${metrics.revenue}`);
```

### Content Performance Analysis
```typescript
// Get top performing content
const performance = await analyticsService.getContentPerformance({
  dateRange: '7d'
});

performance.forEach(tip => {
  console.log(`${tip.title}: ${tip.views} views, ${tip.engagement}% engagement`);
});
```

## 🔧 Advanced Features

### Custom Event Tracking
```typescript
// Track custom events with rich metadata
analyticsService.trackEvent({
  event_type: 'custom_action',
  tip_id: 'tip-123',
  metadata: {
    action: 'email_signup',
    source: 'tip_download',
    value: 10,
    campaign: 'summer_promotion'
  }
});
```

### Date Range Filtering
```typescript
// Flexible date range options
const filters = {
  dateRange: '7d' | '30d' | '90d' | '1y',
  category: 'health' | 'wealth' | 'happiness',
  difficulty: 'Easy' | 'Moderate' | 'Advanced'
};
```

### Batch Analytics Operations
```typescript
// Efficient batch processing for large datasets
const events = [
  { event_type: 'view', tip_id: 'tip-1' },
  { event_type: 'view', tip_id: 'tip-2' },
  { event_type: 'download', tip_id: 'tip-1' }
];

// All events tracked in a single operation
await Promise.all(events.map(event => 
  analyticsService.trackEvent(event)
));
```

## 📊 Metrics & KPIs

### Primary Metrics
- **Page Views**: Total and unique page views
- **Tip Views**: Individual tip engagement
- **Downloads**: PDF generation and email captures
- **Search Queries**: User intent and discovery patterns
- **Filter Usage**: Content preference insights

### Calculated KPIs
- **Engagement Rate**: Downloads / Views ratio
- **Revenue**: Downloads × $10 (tip pricing)
- **Retention**: Repeat user sessions
- **Conversion**: View-to-download funnel
- **Popular Content**: View-based ranking

### Performance Indicators
- **Response Time**: Analytics query performance
- **Data Freshness**: Real-time vs cached data
- **Error Rate**: Failed tracking events
- **Coverage**: Events tracked vs total interactions

## 🔒 Privacy & Security

### Data Protection
- **User Consent**: Respects user privacy preferences
- **Anonymous Tracking**: No PII in analytics events
- **Session-based**: Temporary session IDs for journey tracking
- **Opt-out Support**: Easy privacy control

### Security Measures
- **RLS Policies**: Row-level security in Supabase
- **Input Validation**: Sanitized event data
- **Rate Limiting**: Prevents analytics spam
- **Audit Trail**: Complete event logging

## 🚨 Troubleshooting

### Common Issues

#### Analytics Not Working
```typescript
// Check Supabase connection
import { supabase } from './lib/supabase';
const { data, error } = await supabase.from('tips').select('id').limit(1);
console.log('Supabase connected:', !error);
```

#### Missing Data
```typescript
// Verify table existence
const { data: tables } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public');
console.log('Available tables:', tables);
```

#### Performance Issues
```typescript
// Enable query logging
console.log('Analytics query time:', performance.now());
const result = await analyticsService.getDashboardMetrics({ dateRange: '7d' });
console.log('Query completed in:', performance.now() - start, 'ms');
```

### Debug Mode
```typescript
// Enable detailed logging
localStorage setItem('analytics_debug', 'true');

// View tracked events
console.log('Recent events:', 
  JSON.parse(localStorage.getItem('analytics_events') || '[]')
);
```

## 🚀 Future Enhancements

### Planned Features
- **Real-time Dashboard**: WebSocket-based live updates
- **A/B Testing**: Content performance comparison
- **Cohort Analysis**: User behavior over time
- **Funnel Analytics**: Multi-step conversion tracking
- **Heatmaps**: Visual interaction patterns
- **Alert System**: Automated performance notifications

### Integration Opportunities
- **Google Analytics**: Dual tracking setup
- **Mixpanel**: Advanced event analytics
- **Segment**: Multi-platform data pipeline
- **DataDog**: Performance monitoring
- **Amplitude**: Product analytics

## 📚 API Reference

### AnalyticsService Methods

```typescript
class AnalyticsService {
  // Core tracking
  trackEvent(event: AnalyticsEvent): Promise<void>
  
  // Dashboard data
  getDashboardMetrics(filters: AnalyticsFilters): Promise<DashboardMetrics>
  getContentPerformance(filters: AnalyticsFilters): Promise<ContentPerformance[]>
  getCategoryDistribution(filters: AnalyticsFilters): Promise<CategoryDistribution[]>
  getEngagementTrends(filters: AnalyticsFilters): Promise<EngagementData[]>
  
  // User insights
  getUserDemographics(filters: AnalyticsFilters): Promise<UserDemographic[]>
  getGeographicDistribution(filters: AnalyticsFilters): Promise<GeographicData[]>
}
```

### Event Types
```typescript
type EventType = 
  | 'view'        // Tip or page viewed
  | 'download'    // PDF downloaded
  | 'share'       // Content shared
  | 'complete'    // Tip completed
  | 'page_view'   // Page navigation
  | 'search'      // Search performed
  | 'filter'      // Filter applied
```

### Filter Options
```typescript
interface AnalyticsFilters {
  dateRange: '24h' | '7d' | '30d' | '90d' | '1y'
  category?: 'health' | 'wealth' | 'happiness'
  difficulty?: 'Easy' | 'Moderate' | 'Advanced'
}
```

---

*This analytics system provides comprehensive insights into user behavior and content performance, enabling data-driven decisions for the BDBT platform.*