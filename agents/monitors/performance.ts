import { EventEmitter } from 'events';

interface PerformanceMetrics {
  timestamp: Date;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  database: {
    connectionPool: number;
    slowQueries: number;
    avgResponseTime: number;
  };
  frontend: {
    loadTime: number;
    renderTime: number;
    bundleSize: number;
  };
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private thresholds = {
    memory: 80, // percentage
    cpu: 70, // percentage
    dbResponseTime: 1000, // ms
    loadTime: 3000 // ms
  };

  async run() {
    try {
      const metrics = await this.collectMetrics();
      this.metrics.push(metrics);
      
      // Keep only last 100 measurements
      if (this.metrics.length > 100) {
        this.metrics = this.metrics.slice(-100);
      }

      // Analyze performance
      const analysis = this.analyzePerformance(metrics);
      
      this.emit('status', {
        health: analysis.health,
        metrics,
        analysis
      });

      return { success: true, metrics, analysis };
    } catch (error) {
      this.emit('critical', {
        type: 'performance_monitoring_failure',
        error
      });

      return { success: false, error };
    }
  }

  private async collectMetrics(): Promise<PerformanceMetrics> {
    // Collect system metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = await this.getCPUUsage();
    
    // Collect database metrics
    const dbMetrics = await this.collectDatabaseMetrics();
    
    // Collect frontend metrics
    const frontendMetrics = await this.collectFrontendMetrics();

    return {
      timestamp: new Date(),
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      cpu: {
        usage: cpuUsage
      },
      database: dbMetrics,
      frontend: frontendMetrics
    };
  }

  private async getCPUUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        
        const totalTime = (endTime - startTime) * 1000; // microseconds
        const cpuPercent = ((endUsage.user + endUsage.system) / totalTime) * 100;
        
        resolve(Math.min(cpuPercent, 100));
      }, 100);
    });
  }

  private async collectDatabaseMetrics() {
    try {
      const startTime = Date.now();
      
      // Test query performance
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/tips?select=id&limit=1`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || ''
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        connectionPool: 1, // Simplified
        slowQueries: responseTime > this.thresholds.dbResponseTime ? 1 : 0,
        avgResponseTime: responseTime
      };
    } catch (error) {
      return {
        connectionPool: 0,
        slowQueries: 1,
        avgResponseTime: -1
      };
    }
  }

  private async collectFrontendMetrics() {
    try {
      // Check if dev server is running
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:5173', {
        method: 'HEAD',
        timeout: 5000
      }).catch(() => null);
      
      const loadTime = response ? Date.now() - startTime : -1;
      
      // Get bundle size (approximation)
      const bundleSize = await this.estimateBundleSize();
      
      return {
        loadTime,
        renderTime: loadTime > 0 ? loadTime * 0.3 : -1, // Estimate
        bundleSize
      };
    } catch (error) {
      return {
        loadTime: -1,
        renderTime: -1,
        bundleSize: -1
      };
    }
  }

  private async estimateBundleSize(): Promise<number> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const distPath = path.join(process.cwd(), 'dist');
      
      try {
        const files = await fs.readdir(distPath, { recursive: true });
        let totalSize = 0;
        
        for (const file of files) {
          try {
            const filePath = path.join(distPath, file.toString());
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
            }
          } catch {
            // Skip files we can't read
          }
        }
        
        return totalSize;
      } catch {
        return -1;
      }
    } catch {
      return -1;
    }
  }

  private analyzePerformance(metrics: PerformanceMetrics) {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Memory analysis
    if (metrics.memory.percentage > this.thresholds.memory) {
      issues.push(`High memory usage: ${metrics.memory.percentage.toFixed(1)}%`);
      recommendations.push('Consider restarting the application or investigating memory leaks');
    }
    
    // CPU analysis
    if (metrics.cpu.usage > this.thresholds.cpu) {
      issues.push(`High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
      recommendations.push('Check for intensive operations or consider scaling');
    }
    
    // Database analysis
    if (metrics.database.avgResponseTime > this.thresholds.dbResponseTime) {
      issues.push(`Slow database response: ${metrics.database.avgResponseTime}ms`);
      recommendations.push('Optimize queries or check database connection');
    }
    
    // Frontend analysis
    if (metrics.frontend.loadTime > this.thresholds.loadTime) {
      issues.push(`Slow page load: ${metrics.frontend.loadTime}ms`);
      recommendations.push('Optimize bundle size or improve caching');
    }
    
    // Bundle size analysis
    if (metrics.frontend.bundleSize > 1024 * 1024 * 5) { // 5MB
      issues.push(`Large bundle size: ${(metrics.frontend.bundleSize / 1024 / 1024).toFixed(1)}MB`);
      recommendations.push('Consider code splitting or removing unused dependencies');
    }
    
    // Calculate health
    const health = issues.length === 0 ? 'healthy' : 
                  issues.length <= 2 ? 'degraded' : 'critical';
    
    return {
      health,
      issues,
      recommendations,
      trends: this.calculateTrends()
    };
  }

  private calculateTrends() {
    if (this.metrics.length < 10) {
      return { insufficient_data: true };
    }
    
    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);
    
    const recentAvgMemory = recent.reduce((sum, m) => sum + m.memory.percentage, 0) / recent.length;
    const olderAvgMemory = older.reduce((sum, m) => sum + m.memory.percentage, 0) / older.length;
    
    const recentAvgResponse = recent.reduce((sum, m) => sum + m.database.avgResponseTime, 0) / recent.length;
    const olderAvgResponse = older.reduce((sum, m) => sum + m.database.avgResponseTime, 0) / older.length;
    
    return {
      memory_trend: recentAvgMemory > olderAvgMemory ? 'increasing' : 'decreasing',
      response_time_trend: recentAvgResponse > olderAvgResponse ? 'increasing' : 'decreasing',
      memory_change: ((recentAvgMemory - olderAvgMemory) / olderAvgMemory * 100).toFixed(1) + '%',
      response_time_change: ((recentAvgResponse - olderAvgResponse) / olderAvgResponse * 100).toFixed(1) + '%'
    };
  }

  async recover(issue: any) {
    switch (issue.type) {
      case 'performance_monitoring_failure':
        console.log('🔧 Restarting performance monitoring...');
        // Could restart monitoring processes
        break;
      
      default:
        console.log('Unknown performance issue type:', issue.type);
    }
  }

  getMetricsHistory() {
    return this.metrics;
  }

  getLatestMetrics() {
    return this.metrics[this.metrics.length - 1];
  }
}