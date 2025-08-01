import { createClient } from '@supabase/supabase-js';

// Environment variable validation and fallbacks
export const validateSupabaseConfig = (): {
  isConfigured: boolean;
  url: string;
  key: string;
  errors: string[];
} => {
  const errors: string[] = [];
  let url = '';
  let key = '';

  // Check for Vite environment variables
  if (import.meta.env?.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'your-supabase-url') {
    url = import.meta.env.VITE_SUPABASE_URL;
  } else {
    errors.push('VITE_SUPABASE_URL not properly configured');
  }

  if (import.meta.env?.VITE_SUPABASE_ANON_KEY && import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-supabase-anon-key') {
    key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  } else {
    errors.push('VITE_SUPABASE_ANON_KEY not properly configured');
  }

  // Validate URL format
  if (!url || !url.startsWith('https://')) {
    errors.push('Invalid Supabase URL - must start with https://');
  }

  // Validate key format (basic JWT check)
  if (!key || key.split('.').length !== 3) {
    errors.push('Invalid Supabase anon key - must be a valid JWT token');
  }

  const isConfigured = errors.length === 0;

  return {
    isConfigured,
    url,
    key,
    errors
  };
};

// Create configured Supabase client with validation
export const createConfiguredSupabaseClient = () => {
  const config = validateSupabaseConfig();
  
  if (!config.isConfigured) {
    console.error('Supabase configuration errors:', config.errors);
    throw new Error(`Supabase configuration invalid: ${config.errors.join(', ')}`);
  }

  try {
    return createClient(config.url, config.key);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new Error('Unable to connect to Supabase. Please check your configuration.');
  }
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  details?: any;
}> => {
  try {
    const config = validateSupabaseConfig();
    
    if (!config.isConfigured) {
      return {
        connected: false,
        message: 'Configuration invalid',
        details: config.errors
      };
    }

    const supabase = createClient(config.url, config.key);
    
    // Test with a simple query with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    const queryPromise = supabase
      .from('tips')
      .select('count(*)', { count: 'exact', head: true });

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      return {
        connected: false,
        message: 'Database connection failed',
        details: error.message
      };
    }

    return {
      connected: true,
      message: 'Connected successfully',
      details: { tipCount: data }
    };

  } catch (error) {
    return {
      connected: false,
      message: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Mock data for fallback when Supabase is not available
export const getMockData = () => ({
  tips: [
    {
      id: 1,
      title: 'Morning Gratitude Practice',
      subtitle: 'Start your day with positivity',
      category: 'happiness',
      subcategory: 'mental-wellness',
      difficulty: 'Easy',
      description: 'Begin each day by writing down three things you\'re grateful for. This simple practice can shift your mindset and improve your overall well-being.',
      primary_benefit: 'Improved mental clarity and positive outlook',
      secondary_benefit: 'Better stress management throughout the day',
      tertiary_benefit: 'Enhanced appreciation for life\'s small moments',
      implementation_time: '5 minutes',
      frequency: 'Daily',
      cost: 'Free',
      scientific_backing: true,
      tags: ['gratitude', 'mindfulness', 'morning-routine'],
      status: 'published',
      view_count: 1250,
      download_count: 340,
      rating: 4.8,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Cold Shower Challenge',
      subtitle: 'Build resilience and boost energy',
      category: 'health',
      subcategory: 'physical-wellness',
      difficulty: 'Moderate',
      description: 'End your shower with 30-60 seconds of cold water. This practice can boost your immune system, increase alertness, and build mental resilience.',
      primary_benefit: 'Increased energy and alertness',
      secondary_benefit: 'Improved immune system function',
      tertiary_benefit: 'Greater mental resilience and willpower',
      implementation_time: '1-2 minutes',
      frequency: 'Daily',
      cost: 'Free',
      scientific_backing: true,
      tags: ['cold-therapy', 'energy', 'resilience'],
      status: 'published',
      view_count: 890,
      download_count: 230,
      rating: 4.6,
      created_at: new Date().toISOString(),
    }
  ],
  events: [
    {
      id: 1,
      title: 'Weekly Content Review',
      category: 'health' as const,
      status: 'scheduled' as const,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      type: 'review' as const,
      priority: 'high' as const,
      assignee: 'Content Team',
      description: 'Review and approve pending content'
    },
    {
      id: 2,
      title: 'New Tip: Meditation Basics',
      category: 'happiness' as const,
      status: 'draft' as const,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '14:30',
      type: 'tip' as const,
      priority: 'medium' as const,
      assignee: 'Writing Team',
      description: 'Create beginner-friendly meditation guide'
    }
  ]
});

export default {
  validateSupabaseConfig,
  createConfiguredSupabaseClient,
  testSupabaseConnection,
  getMockData
};