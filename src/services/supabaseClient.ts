import { createClient } from '@supabase/supabase-js';

// Supabase configuration with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fnkdtnmlyxcwrptdbmqy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZua2R0bm1seXhjd3JwdGRibXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NzY2MTEsImV4cCI6MjA2OTQ1MjYxMX0.ptZKi5h00D3faXVpuUJlLEeue-j418NMIwaOWcVlPZA';

// Create Supabase client with retry and error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'BDBT'
    }
  }
});

// Connection health check
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  details?: any;
}> {
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return {
        connected: false,
        error: error.message,
        details: error
      };
    }

    return {
      connected: true,
      details: {
        url: supabaseUrl,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err) {
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: err
    };
  }
}

// Database error handler
export function handleDatabaseError(error: any): {
  message: string;
  code?: string;
  hint?: string;
  shouldRetry: boolean;
} {
  const errorResponse = {
    message: error.message || 'Database operation failed',
    code: error.code,
    hint: error.hint,
    shouldRetry: false
  };

  // Handle common Supabase errors
  switch (error.code) {
    case 'PGRST116': // No rows returned
      errorResponse.message = 'No data found';
      errorResponse.shouldRetry = false;
      break;
    case '42P01': // Table does not exist
      errorResponse.message = 'Database table not found. Please check migrations.';
      errorResponse.shouldRetry = false;
      break;
    case '23505': // Unique violation
      errorResponse.message = 'This record already exists';
      errorResponse.shouldRetry = false;
      break;
    case '23503': // Foreign key violation
      errorResponse.message = 'Related record not found';
      errorResponse.shouldRetry = false;
      break;
    case 'PGRST301': // JWT expired
      errorResponse.message = 'Authentication expired. Please sign in again.';
      errorResponse.shouldRetry = true;
      break;
    case '57P03': // Cannot connect to server
      errorResponse.message = 'Cannot connect to database. Please check your connection.';
      errorResponse.shouldRetry = true;
      break;
    default:
      if (error.message?.includes('Failed to fetch')) {
        errorResponse.message = 'Network error. Please check your internet connection.';
        errorResponse.shouldRetry = true;
      }
  }

  return errorResponse;
}

// Retry utility for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = handleDatabaseError(error);
      
      if (!errorInfo.shouldRetry || i === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
    }
  }

  throw lastError;
}

// Export types for consistency
export type { Database } from '../types/supabase';
export { supabase as default };