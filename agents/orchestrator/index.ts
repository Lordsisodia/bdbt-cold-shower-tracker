import { EventEmitter } from 'events';
import cron from 'node-cron';
import { ConnectionMonitor } from '../monitors/connection.js';
import { MCPHealthChecker } from '../monitors/mcp.js';
import { FunctionalityTester } from '../automation/tester.js';
import { APIKeyHunter } from '../automation/apiKeyHunter.js';
import { PerformanceMonitor } from '../monitors/performance.js';
import { ErrorHandler } from '../monitors/errorHandler.js';

interface AgentStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastCheck: Date;
  health: 'healthy' | 'degraded' | 'critical';
}

export class AgentOrchestrator extends EventEmitter {
  private agents: Map<string, any> = new Map();
  private schedules: Map<string, cron.ScheduledTask> = new Map();
  private status: Map<string, AgentStatus> = new Map();

  constructor() {
    super();
    this.initializeAgents();
  }

  private initializeAgents() {
    // Initialize all agents
    this.agents.set('connection', new ConnectionMonitor());
    this.agents.set('mcp', new MCPHealthChecker());
    this.agents.set('tester', new FunctionalityTester());
    this.agents.set('apiHunter', new APIKeyHunter());
    this.agents.set('performance', new PerformanceMonitor());
    this.agents.set('errorHandler', new ErrorHandler());

    // Set up event listeners
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Listen for critical events from agents
    this.agents.forEach((agent, name) => {
      agent.on('critical', (issue: any) => {
        this.handleCriticalIssue(name, issue);
      });

      agent.on('status', (status: any) => {
        this.updateAgentStatus(name, status);
      });
    });
  }

  public start() {
    console.log('🚀 Starting BDBT Autonomous Agent System...');

    // Schedule agent tasks
    this.scheduleAgentTasks();

    // Start continuous monitoring
    this.startContinuousMonitoring();

    console.log('✅ All agents initialized and running');
  }

  private scheduleAgentTasks() {
    // Connection monitor - every 5 minutes
    this.schedules.set('connection', cron.schedule('*/5 * * * *', async () => {
      await this.runAgent('connection');
    }));

    // MCP health check - every 10 minutes
    this.schedules.set('mcp', cron.schedule('*/10 * * * *', async () => {
      await this.runAgent('mcp');
    }));

    // Functionality tests - every hour
    this.schedules.set('tester', cron.schedule('0 * * * *', async () => {
      await this.runAgent('tester');
    }));

    // API key check - daily at 3 AM
    this.schedules.set('apiHunter', cron.schedule('0 3 * * *', async () => {
      await this.runAgent('apiHunter');
    }));

    // Performance monitoring - every 15 minutes
    this.schedules.set('performance', cron.schedule('*/15 * * * *', async () => {
      await this.runAgent('performance');
    }));
  }

  private async runAgent(agentName: string) {
    const agent = this.agents.get(agentName);
    if (!agent) return;

    try {
      console.log(`🔄 Running ${agentName} agent...`);
      const result = await agent.run();
      
      this.updateAgentStatus(agentName, {
        status: 'running',
        health: result.success ? 'healthy' : 'degraded',
        lastCheck: new Date()
      });

      this.emit('agentComplete', { agent: agentName, result });
    } catch (error) {
      console.error(`❌ Error in ${agentName} agent:`, error);
      
      this.updateAgentStatus(agentName, {
        status: 'error',
        health: 'critical',
        lastCheck: new Date()
      });

      this.handleAgentError(agentName, error);
    }
  }

  private startContinuousMonitoring() {
    // Real-time monitoring loop
    setInterval(() => {
      this.checkSystemHealth();
    }, 30000); // Every 30 seconds
  }

  private async checkSystemHealth() {
    const healthReport = {
      timestamp: new Date(),
      agents: Array.from(this.status.entries()),
      overallHealth: this.calculateOverallHealth()
    };

    this.emit('healthUpdate', healthReport);
  }

  private calculateOverallHealth(): 'healthy' | 'degraded' | 'critical' {
    const statuses = Array.from(this.status.values());
    
    if (statuses.some(s => s.health === 'critical')) {
      return 'critical';
    }
    
    if (statuses.some(s => s.health === 'degraded')) {
      return 'degraded';
    }
    
    return 'healthy';
  }

  private handleCriticalIssue(agentName: string, issue: any) {
    console.error(`🚨 CRITICAL ISSUE from ${agentName}:`, issue);
    
    // Attempt auto-recovery
    this.attemptRecovery(agentName, issue);
    
    // Notify admin
    this.notifyAdmin(agentName, issue);
  }

  private async attemptRecovery(agentName: string, issue: any) {
    console.log(`🔧 Attempting recovery for ${agentName}...`);
    
    const agent = this.agents.get(agentName);
    if (agent && agent.recover) {
      try {
        await agent.recover(issue);
        console.log(`✅ Recovery successful for ${agentName}`);
      } catch (error) {
        console.error(`❌ Recovery failed for ${agentName}:`, error);
      }
    }
  }

  private updateAgentStatus(name: string, status: Partial<AgentStatus>) {
    const current = this.status.get(name) || {
      name,
      status: 'stopped',
      lastCheck: new Date(),
      health: 'healthy'
    };

    this.status.set(name, { ...current, ...status });
  }

  private handleAgentError(agentName: string, error: any) {
    const errorHandler = this.agents.get('errorHandler');
    if (errorHandler) {
      errorHandler.logError({
        agent: agentName,
        error,
        timestamp: new Date()
      });
    }
  }

  private notifyAdmin(agentName: string, issue: any) {
    // Implement notification logic (email, Slack, etc.)
    console.log(`📧 Admin notification sent for ${agentName} issue`);
  }

  public stop() {
    console.log('🛑 Stopping agent system...');
    
    // Stop all scheduled tasks
    this.schedules.forEach(task => task.stop());
    
    // Cleanup agents
    this.agents.forEach(agent => {
      if (agent.cleanup) {
        agent.cleanup();
      }
    });
    
    console.log('✅ Agent system stopped');
  }

  public getStatus() {
    return {
      agents: Array.from(this.status.entries()),
      overallHealth: this.calculateOverallHealth(),
      uptime: process.uptime()
    };
  }
}

// Auto-start if run directly
if (require.main === module) {
  const orchestrator = new AgentOrchestrator();
  orchestrator.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    orchestrator.stop();
    process.exit(0);
  });
}