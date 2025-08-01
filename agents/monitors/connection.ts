import { EventEmitter } from 'events';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface ConnectionHealth {
  database: 'connected' | 'disconnected' | 'error';
  auth: 'authenticated' | 'anonymous' | 'error';
  realtime: 'connected' | 'disconnected' | 'error';
  latency: number;
}

export class ConnectionMonitor extends EventEmitter {
  private supabase: SupabaseClient;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    super();
    this.initializeSupabase();
  }

  private initializeSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      this.emit('critical', {
        type: 'missing_credentials',
        message: 'Supabase credentials not found in environment'
      });
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async run() {
    const startTime = Date.now();
    const health: ConnectionHealth = {
      database: 'disconnected',
      auth: 'anonymous',
      realtime: 'disconnected',
      latency: 0
    };

    try {
      // Test database connection
      const dbTest = await this.testDatabaseConnection();
      health.database = dbTest ? 'connected' : 'error';

      // Test authentication
      const authTest = await this.testAuthentication();
      health.auth = authTest;

      // Test realtime
      const realtimeTest = await this.testRealtimeConnection();
      health.realtime = realtimeTest ? 'connected' : 'error';

      // Calculate latency
      health.latency = Date.now() - startTime;

      // Emit status
      this.emit('status', {
        health: this.calculateHealthStatus(health),
        details: health
      });

      // Handle degraded states
      if (health.database === 'error' || health.realtime === 'error') {
        await this.handleDegradedConnection(health);
      }

      return { success: true, health };
    } catch (error) {
      this.emit('critical', {
        type: 'connection_failure',
        error,
        health
      });

      return { success: false, error, health };
    }
  }

  private async testDatabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('tips')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  private async testAuthentication(): Promise<'authenticated' | 'anonymous' | 'error'> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) return 'error';
      return user ? 'authenticated' : 'anonymous';
    } catch {
      return 'error';
    }
  }

  private async testRealtimeConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const channel = this.supabase.channel('connection-test');
      const timeout = setTimeout(() => {
        channel.unsubscribe();
        resolve(false);
      }, 5000);

      channel
        .on('system', { event: '*' }, () => {
          clearTimeout(timeout);
          channel.unsubscribe();
          resolve(true);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            channel.unsubscribe();
            resolve(true);
          }
        });
    });
  }

  private calculateHealthStatus(health: ConnectionHealth): 'healthy' | 'degraded' | 'critical' {
    if (health.database === 'error') return 'critical';
    if (health.realtime === 'error' || health.latency > 5000) return 'degraded';
    return 'healthy';
  }

  private async handleDegradedConnection(health: ConnectionHealth) {
    console.log('⚠️  Degraded connection detected, attempting recovery...');
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('critical', {
        type: 'max_reconnect_attempts',
        message: 'Maximum reconnection attempts reached'
      });
      return;
    }

    this.reconnectAttempts++;
    await this.attemptReconnection();
  }

  private async attemptReconnection() {
    // Re-initialize Supabase client
    this.initializeSupabase();
    
    // Wait before testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test connection again
    const result = await this.run();
    
    if (result.success) {
      console.log('✅ Connection recovered successfully');
      this.reconnectAttempts = 0;
    }
  }

  async recover(issue: any) {
    console.log('🔧 Running connection recovery procedure...');
    
    switch (issue.type) {
      case 'missing_credentials':
        // Attempt to load from alternative sources
        await this.loadCredentialsFromFile();
        break;
      
      case 'connection_failure':
        // Force reconnection
        await this.attemptReconnection();
        break;
      
      default:
        console.log('Unknown issue type:', issue.type);
    }
  }

  private async loadCredentialsFromFile() {
    // Implement loading credentials from .env.local or other sources
    console.log('📁 Attempting to load credentials from file...');
  }

  cleanup() {
    // Cleanup any open connections
    if (this.supabase) {
      this.supabase.removeAllChannels();
    }
  }
}