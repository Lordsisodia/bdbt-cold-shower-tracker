// Test script for analytics integration
import { analyticsService, trackPageView, trackSearch, trackTipDownload, trackTipView } from '../services/analyticsService';

export async function testAnalyticsIntegration() {
  console.log('🧪 Testing Analytics Integration...');
  
  try {
    // Test 1: Track page view
    console.log('📊 Testing page view tracking...');
    await trackPageView('/test-page', {
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Page view tracking successful');

    // Test 2: Track tip view
    console.log('📖 Testing tip view tracking...');
    await trackTipView('test-tip-id', {
      title: 'Test Tip',
      category: 'health',
      difficulty: 'Easy',
      from: 'test'
    });
    console.log('✅ Tip view tracking successful');

    // Test 3: Track tip download
    console.log('⬇️ Testing tip download tracking...');
    await trackTipDownload('test-tip-id', {
      title: 'Test Tip',
      category: 'health',
      difficulty: 'Easy',
      from: 'test'
    });
    console.log('✅ Tip download tracking successful');

    // Test 4: Track search
    console.log('🔍 Testing search tracking...');
    await trackSearch('test query', 5, {
      category: 'all',
      sortBy: 'newest'
    });
    console.log('✅ Search tracking successful');

    // Test 5: Get dashboard metrics
    console.log('📈 Testing dashboard metrics...');
    const metrics = await analyticsService.getDashboardMetrics({ dateRange: '7d' });
    console.log('✅ Dashboard metrics retrieved:', {
      totalViews: metrics.totalViews,
      activeUsers: metrics.activeUsers,
      downloads: metrics.downloads,
      revenue: metrics.revenue
    });

    // Test 6: Get content performance
    console.log('🎯 Testing content performance...');
    const performance = await analyticsService.getContentPerformance({ dateRange: '7d' });
    console.log(`✅ Content performance retrieved: ${performance.length} items`);

    // Test 7: Get category distribution
    console.log('📊 Testing category distribution...');
    const categories = await analyticsService.getCategoryDistribution({ dateRange: '7d' });
    console.log('✅ Category distribution retrieved:', categories.map(c => `${c.label}: ${c.percentage}%`));

    console.log('🎉 All analytics tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
    return false;
  }
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Wait a bit for the app to initialize
  setTimeout(() => {
    testAnalyticsIntegration();
  }, 2000);
}