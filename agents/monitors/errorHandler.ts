import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'critical';
  source: string;
  message: string;
  stack?: string;
  context?: any;
  resolved?: boolean;
}

export class ErrorHandler extends EventEmitter {
  private errors: ErrorLog[] = [];
  private logFile: string;
  private maxErrors = 1000;

  constructor() {
    super();
    this.logFile = path.join(process.cwd(), '.logs', 'errors.json');
    this.ensureLogDirectory();
    this.loadExistingErrors();
  }

  private async ensureLogDirectory() {
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private async loadExistingErrors() {
    try {
      const data = await fs.readFile(this.logFile, 'utf-8');
      this.errors = JSON.parse(data).map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
      
      console.log(`📝 Loaded ${this.errors.length} existing error logs`);
    } catch {
      // File doesn't exist or is invalid, start fresh
      this.errors = [];
    }
  }

  async run() {
    try {
      // Analyze recent errors
      const analysis = this.analyzeErrors();
      
      // Clean old errors
      await this.cleanOldErrors();
      
      // Save current state
      await this.saveErrors();
      
      this.emit('status', {
        health: analysis.health,
        errorCount: this.errors.length,
        analysis
      });

      return { success: true, analysis };
    } catch (error) {
      console.error('Error handler failed:', error);
      return { success: false, error };
    }
  }

  logError(error: Omit<ErrorLog, 'id' | 'timestamp'>) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      ...error
    };

    this.errors.push(errorLog);
    
    // Keep only recent errors in memory
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console based on level
    this.logToConsole(errorLog);
    
    // Emit for other components
    this.emit('error', errorLog);
    
    // Auto-attempt recovery for known errors
    this.attemptAutoRecovery(errorLog);
    
    // Save immediately for critical errors
    if (error.level === 'critical') {
      this.saveErrors();
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private logToConsole(error: ErrorLog) {
    const emoji = error.level === 'critical' ? '🚨' : 
                  error.level === 'error' ? '❌' : 
                  '⚠️';
    
    console.log(`${emoji} [${error.level.toUpperCase()}] ${error.source}: ${error.message}`);
    
    if (error.stack && error.level === 'critical') {
      console.log(error.stack);
    }
  }

  private analyzeErrors() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => e.timestamp > oneHourAgo);
    const dailyErrors = this.errors.filter(e => e.timestamp > oneDayAgo);
    
    const criticalCount = recentErrors.filter(e => e.level === 'critical').length;
    const errorCount = recentErrors.filter(e => e.level === 'error').length;
    const warningCount = recentErrors.filter(e => e.level === 'warning').length;
    
    // Group by source
    const errorsBySource = this.groupErrorsBySource(recentErrors);
    
    // Identify patterns
    const patterns = this.identifyPatterns(dailyErrors);
    
    // Calculate health
    const health = criticalCount > 0 ? 'critical' : 
                  errorCount > 5 ? 'degraded' : 
                  'healthy';
    
    return {
      health,
      counts: {
        total: this.errors.length,
        recent: recentErrors.length,
        daily: dailyErrors.length,
        critical: criticalCount,
        errors: errorCount,
        warnings: warningCount
      },
      sources: errorsBySource,
      patterns,
      trends: this.calculateErrorTrends()
    };
  }

  private groupErrorsBySource(errors: ErrorLog[]) {
    const grouped: Record<string, number> = {};
    
    errors.forEach(error => {
      grouped[error.source] = (grouped[error.source] || 0) + 1;
    });
    
    return Object.entries(grouped)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 sources
  }

  private identifyPatterns(errors: ErrorLog[]) {
    const patterns: any[] = [];
    
    // Check for repeated messages
    const messageGroups: Record<string, ErrorLog[]> = {};
    errors.forEach(error => {
      const key = error.message.substring(0, 100); // First 100 chars
      if (!messageGroups[key]) messageGroups[key] = [];
      messageGroups[key].push(error);
    });
    
    Object.entries(messageGroups).forEach(([message, errorList]) => {
      if (errorList.length >= 3) {
        patterns.push({
          type: 'repeated_error',
          message: message,
          count: errorList.length,
          sources: [...new Set(errorList.map(e => e.source))],
          firstSeen: errorList[0].timestamp,
          lastSeen: errorList[errorList.length - 1].timestamp
        });
      }
    });
    
    // Check for error cascades (many errors in short time)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentBurst = errors.filter(e => e.timestamp > fiveMinutesAgo);
    
    if (recentBurst.length > 10) {
      patterns.push({
        type: 'error_cascade',
        count: recentBurst.length,
        timespan: '5 minutes',
        sources: [...new Set(recentBurst.map(e => e.source))]
      });
    }
    
    return patterns;
  }

  private calculateErrorTrends() {
    if (this.errors.length < 20) {
      return { insufficient_data: true };
    }
    
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(e => e.timestamp > twoHoursAgo).length;
    const olderErrors = this.errors.filter(e => e.timestamp > fourHoursAgo && e.timestamp <= twoHoursAgo).length;
    
    const trend = recentErrors > olderErrors ? 'increasing' : 
                  recentErrors < olderErrors ? 'decreasing' : 'stable';
    
    return {
      trend,
      recent_count: recentErrors,
      previous_count: olderErrors,
      change_percentage: olderErrors > 0 ? 
        ((recentErrors - olderErrors) / olderErrors * 100).toFixed(1) + '%' : 
        'N/A'
    };
  }

  private async attemptAutoRecovery(error: ErrorLog) {
    // Define auto-recovery strategies
    const recoveryStrategies: Record<string, () => Promise<void>> = {
      'connection': async () => {
        console.log('🔧 Attempting connection recovery...');
        // Could trigger connection reset
        this.emit('recovery_attempt', { type: 'connection', error });
      },
      
      'memory': async () => {
        console.log('🔧 Attempting memory cleanup...');
        if (global.gc) {
          global.gc();
        }
        this.emit('recovery_attempt', { type: 'memory', error });
      },
      
      'mcp': async () => {
        console.log('🔧 Attempting MCP restart...');
        this.emit('recovery_attempt', { type: 'mcp', error });
      }
    };
    
    // Try to match error to recovery strategy
    for (const [keyword, strategy] of Object.entries(recoveryStrategies)) {
      if (error.message.toLowerCase().includes(keyword) || 
          error.source.toLowerCase().includes(keyword)) {
        try {
          await strategy();
          
          // Mark as resolved if recovery succeeds
          error.resolved = true;
          console.log(`✅ Auto-recovery attempted for ${error.source}`);
        } catch (recoveryError) {
          console.error(`❌ Auto-recovery failed for ${error.source}:`, recoveryError);
        }
        break;
      }
    }
  }

  private async cleanOldErrors() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const initialCount = this.errors.length;
    
    this.errors = this.errors.filter(error => error.timestamp > oneWeekAgo);
    
    const removedCount = initialCount - this.errors.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned ${removedCount} old error logs`);
    }
  }

  private async saveErrors() {
    try {
      const data = JSON.stringify(this.errors, null, 2);
      await fs.writeFile(this.logFile, data);
    } catch (error) {
      console.error('Failed to save error logs:', error);
    }
  }

  getRecentErrors(hours: number = 1): ErrorLog[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.errors.filter(error => error.timestamp > cutoff);
  }

  getCriticalErrors(): ErrorLog[] {
    return this.errors.filter(error => error.level === 'critical' && !error.resolved);
  }

  markResolved(errorId: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      this.saveErrors();
    }
  }

  async recover(issue: any) {
    console.log('🔧 Running error handler recovery...');
    
    // Could implement:
    // - Reset error counters
    // - Clear problematic logs
    // - Restart monitoring
  }
}