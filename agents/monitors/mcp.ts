import { EventEmitter } from 'events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as child_process from 'child_process';

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface MCPHealth {
  server: string;
  status: 'running' | 'stopped' | 'error';
  capabilities: string[];
  lastPing: Date;
  responseTime: number;
}

export class MCPHealthChecker extends EventEmitter {
  private servers: MCPServerConfig[] = [];
  private clients: Map<string, Client> = new Map();
  private processes: Map<string, child_process.ChildProcess> = new Map();

  constructor() {
    super();
    this.loadServerConfigs();
  }

  private loadServerConfigs() {
    // Load MCP server configurations
    this.servers = [
      {
        name: 'supabase',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-supabase'],
        env: {
          SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        }
      },
      {
        name: 'notion',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-notion'],
        env: {
          NOTION_API_KEY: process.env.NOTION_API_KEY || ''
        }
      },
      {
        name: 'github',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-github'],
        env: {
          GITHUB_TOKEN: process.env.GITHUB_TOKEN || ''
        }
      },
      {
        name: 'sequential-thinking',
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-sequential-thinking']
      }
    ];
  }

  async run() {
    const healthReport: MCPHealth[] = [];
    
    for (const server of this.servers) {
      const health = await this.checkServerHealth(server);
      healthReport.push(health);
      
      if (health.status === 'error' || health.status === 'stopped') {
        await this.attemptServerRestart(server);
      }
    }

    const overallHealth = this.calculateOverallMCPHealth(healthReport);
    
    this.emit('status', {
      health: overallHealth,
      servers: healthReport
    });

    return {
      success: overallHealth !== 'critical',
      healthReport
    };
  }

  private async checkServerHealth(config: MCPServerConfig): Promise<MCPHealth> {
    const startTime = Date.now();
    
    try {
      let client = this.clients.get(config.name);
      
      if (!client) {
        // Initialize client if not exists
        client = await this.initializeMCPClient(config);
        if (!client) {
          return {
            server: config.name,
            status: 'stopped',
            capabilities: [],
            lastPing: new Date(),
            responseTime: -1
          };
        }
      }

      // Test server capabilities
      const capabilities = await this.testServerCapabilities(client);
      const responseTime = Date.now() - startTime;

      return {
        server: config.name,
        status: 'running',
        capabilities,
        lastPing: new Date(),
        responseTime
      };
    } catch (error) {
      console.error(`❌ MCP health check failed for ${config.name}:`, error);
      
      return {
        server: config.name,
        status: 'error',
        capabilities: [],
        lastPing: new Date(),
        responseTime: -1
      };
    }
  }

  private async initializeMCPClient(config: MCPServerConfig): Promise<Client | null> {
    try {
      // Check if process exists
      let process = this.processes.get(config.name);
      
      if (!process || process.killed) {
        // Start MCP server process
        process = child_process.spawn(config.command, config.args, {
          env: { ...process.env, ...config.env },
          stdio: ['pipe', 'pipe', 'pipe']
        });

        this.processes.set(config.name, process);

        // Handle process errors
        process.on('error', (error) => {
          console.error(`MCP server ${config.name} error:`, error);
          this.emit('critical', {
            type: 'mcp_server_crash',
            server: config.name,
            error
          });
        });

        process.on('exit', (code) => {
          if (code !== 0) {
            console.error(`MCP server ${config.name} exited with code ${code}`);
          }
          this.processes.delete(config.name);
          this.clients.delete(config.name);
        });
      }

      // Create client
      const transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: { ...process.env, ...config.env }
      });

      const client = new Client({
        name: `bdbt-${config.name}-client`,
        version: '1.0.0'
      }, {
        capabilities: {}
      });

      await client.connect(transport);
      this.clients.set(config.name, client);

      return client;
    } catch (error) {
      console.error(`Failed to initialize MCP client for ${config.name}:`, error);
      return null;
    }
  }

  private async testServerCapabilities(client: Client): Promise<string[]> {
    const capabilities: string[] = [];

    try {
      // List available tools
      const tools = await client.listTools();
      if (tools.tools.length > 0) {
        capabilities.push(`tools:${tools.tools.length}`);
      }

      // List available resources
      const resources = await client.listResources();
      if (resources.resources.length > 0) {
        capabilities.push(`resources:${resources.resources.length}`);
      }

      // Test a simple operation if possible
      if (tools.tools.length > 0) {
        // Could test calling a tool here
        capabilities.push('operational');
      }

      return capabilities;
    } catch (error) {
      console.error('Failed to test server capabilities:', error);
      return [];
    }
  }

  private calculateOverallMCPHealth(healthReport: MCPHealth[]): 'healthy' | 'degraded' | 'critical' {
    const errorCount = healthReport.filter(h => h.status === 'error').length;
    const stoppedCount = healthReport.filter(h => h.status === 'stopped').length;
    
    if (errorCount > healthReport.length / 2) return 'critical';
    if (errorCount > 0 || stoppedCount > 0) return 'degraded';
    
    return 'healthy';
  }

  private async attemptServerRestart(config: MCPServerConfig) {
    console.log(`🔄 Attempting to restart ${config.name} MCP server...`);
    
    // Kill existing process
    const process = this.processes.get(config.name);
    if (process && !process.killed) {
      process.kill();
    }
    
    // Remove from maps
    this.processes.delete(config.name);
    this.clients.delete(config.name);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try to reinitialize
    const client = await this.initializeMCPClient(config);
    
    if (client) {
      console.log(`✅ Successfully restarted ${config.name} MCP server`);
    } else {
      console.error(`❌ Failed to restart ${config.name} MCP server`);
    }
  }

  async recover(issue: any) {
    switch (issue.type) {
      case 'mcp_server_crash':
        // Attempt to restart the crashed server
        const config = this.servers.find(s => s.name === issue.server);
        if (config) {
          await this.attemptServerRestart(config);
        }
        break;
      
      default:
        console.log('Unknown MCP issue type:', issue.type);
    }
  }

  cleanup() {
    // Close all clients
    this.clients.forEach(client => {
      client.close();
    });
    
    // Kill all processes
    this.processes.forEach(process => {
      if (!process.killed) {
        process.kill();
      }
    });
    
    this.clients.clear();
    this.processes.clear();
  }
}