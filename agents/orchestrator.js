#!/usr/bin/env node

/**
 * BDBT Autonomous Orchestrator Agent
 * Coordinates 24/7 tip generation, processing, and content management
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

class BDBTOrchestrator {
  constructor() {
    this.projectPath = process.cwd();
    this.statusPath = '/tmp/bdbt_status';
    this.taskQueuePath = '/tmp/bdbt_tasks';
    this.errorLogPath = '/tmp/bdbt_errors';
    this.metricsPath = '/tmp/bdbt_metrics';
    
    this.agents = {
      tip_generator: { status: 'idle', lastRun: null, nextRun: null },
      database_manager: { status: 'idle', lastRun: null, nextRun: null },
      pdf_creator: { status: 'idle', lastRun: null, nextRun: null },
      quality_auditor: { status: 'idle', lastRun: null, nextRun: null }
    };

    this.config = this.loadConfig();
    this.isRunning = false;
  }

  loadConfig() {
    try {
      const configPath = join(this.projectPath, 'orchestrator-config.json');
      return JSON.parse(readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load orchestrator config:', error);
      process.exit(1);
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    console.log(logMessage);
    
    // Write to status file
    this.writeStatus(`${level}: ${message}`);
  }

  writeStatus(message) {
    const statusFile = join(this.statusPath, 'orchestrator.json');
    const status = {
      timestamp: new Date().toISOString(),
      message,
      agents: this.agents,
      uptime: process.uptime()
    };
    writeFileSync(statusFile, JSON.stringify(status, null, 2));
  }

  async scheduleAgent(agentName, command) {
    this.log(`📋 Scheduling ${agentName}: ${command}`);
    
    this.agents[agentName].status = 'scheduled';
    this.agents[agentName].nextRun = new Date().toISOString();
    
    // Add to task queue
    const taskFile = join(this.taskQueuePath, `${agentName}_${Date.now()}.json`);
    const task = {
      agent: agentName,
      command,
      scheduled: new Date().toISOString(),
      status: 'pending'
    };
    writeFileSync(taskFile, JSON.stringify(task, null, 2));
  }

  async executeAgent(agentName, command) {
    this.log(`🚀 Executing ${agentName}: ${command}`);
    
    this.agents[agentName].status = 'running';
    this.agents[agentName].lastRun = new Date().toISOString();
    
    return new Promise((resolve) => {
      const process = spawn('tmux', [
        'send-keys', '-t', `bdbt-orchestrator:${agentName.replace('_', '-')}`,
        command, 'C-m'
      ]);
      
      process.on('close', (code) => {
        this.agents[agentName].status = code === 0 ? 'completed' : 'failed';
        this.log(`✅ Agent ${agentName} finished with code ${code}`);
        resolve(code === 0);
      });
    });
  }

  async runTipGenerationWorkflow() {
    this.log('🎯 Starting tip generation workflow...');
    
    try {
      // 1. Generate new tips using Grok API
      await this.executeAgent('tip_generator', 'npm run process-tips');
      
      // 2. Import to database
      await this.executeAgent('database_manager', 'npm run import-tips');
      
      // 3. Quality audit
      await this.executeAgent('quality_auditor', 'node agents/quality-audit.js');
      
      // 4. Generate PDFs for approved tips
      await this.executeAgent('pdf_creator', 'node agents/pdf-batch.js');
      
      this.log('✅ Tip generation workflow completed');
      
      // Update metrics
      this.updateMetrics('workflow_completed', {
        timestamp: new Date().toISOString(),
        duration: 'calculated',
        success: true
      });
      
    } catch (error) {
      this.log(`❌ Workflow failed: ${error.message}`, 'ERROR');
      this.writeError('workflow_failed', error);
    }
  }

  async performSystemMaintenance() {
    this.log('🔧 Performing system maintenance...');
    
    // Git backup
    await this.executeAgent('orchestrator', 'git add . && git commit -m "Auto-backup: $(date)" || echo "No changes to commit"');
    
    // Database cleanup
    await this.executeAgent('database_manager', 'node scripts/cleanup-database.js');
    
    // Clear old temp files
    await this.executeAgent('orchestrator', 'find /tmp/bdbt_* -type f -mtime +7 -delete');
    
    this.log('✅ System maintenance completed');
  }

  updateMetrics(event, data) {
    const metricsFile = join(this.metricsPath, 'daily_metrics.json');
    let metrics = {};
    
    if (existsSync(metricsFile)) {
      metrics = JSON.parse(readFileSync(metricsFile, 'utf8'));
    }
    
    if (!metrics[event]) {
      metrics[event] = [];
    }
    
    metrics[event].push(data);
    writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  }

  writeError(type, error) {
    const errorFile = join(this.errorLogPath, `${type}_${Date.now()}.json`);
    const errorData = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      agents: this.agents
    };
    writeFileSync(errorFile, JSON.stringify(errorData, null, 2));
  }

  scheduleNextRuns() {
    const now = new Date();
    
    // Tip generation: Daily at 9 AM
    const nextTipRun = new Date(now);
    nextTipRun.setHours(9, 0, 0, 0);
    if (nextTipRun <= now) {
      nextTipRun.setDate(nextTipRun.getDate() + 1);
    }
    
    // Quality audit: Twice daily
    const nextAuditRun = new Date(now);
    nextAuditRun.setHours(now.getHours() < 10 ? 10 : 16, 0, 0, 0);
    if (nextAuditRun <= now) {
      nextAuditRun.setDate(nextAuditRun.getDate() + 1);
      nextAuditRun.setHours(10, 0, 0, 0);
    }
    
    // PDF generation: Daily at 6 PM
    const nextPdfRun = new Date(now);
    nextPdfRun.setHours(18, 0, 0, 0);
    if (nextPdfRun <= now) {
      nextPdfRun.setDate(nextPdfRun.getDate() + 1);
    }
    
    this.agents.tip_generator.nextRun = nextTipRun.toISOString();
    this.agents.quality_auditor.nextRun = nextAuditRun.toISOString();
    this.agents.pdf_creator.nextRun = nextPdfRun.toISOString();
  }

  async mainLoop() {
    this.log('🎯 BDBT Orchestrator starting main loop...');
    this.isRunning = true;
    
    this.scheduleNextRuns();
    
    while (this.isRunning) {
      const now = new Date();
      
      // Check if it's time to run tip generation
      if (this.agents.tip_generator.nextRun && new Date(this.agents.tip_generator.nextRun) <= now) {
        await this.runTipGenerationWorkflow();
        this.scheduleNextRuns();
      }
      
      // Perform maintenance every 2 hours
      if (now.getMinutes() === 0 && now.getHours() % 2 === 0) {
        await this.performSystemMaintenance();
      }
      
      // Update status
      this.writeStatus('System running normally');
      
      // Wait 5 minutes before next check
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }

  async start() {
    this.log('🚀 BDBT Autonomous Orchestrator Online!');
    this.log(`📍 Project Path: ${this.projectPath}`);
    this.log(`🎯 Target: ${this.config.automation_targets.daily_tips} tips/day`);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.log('📴 Shutting down orchestrator...');
      this.isRunning = false;
      process.exit(0);
    });
    
    // Start main loop
    await this.mainLoop();
  }
}

// Start the orchestrator
const orchestrator = new BDBTOrchestrator();
orchestrator.start().catch(error => {
  console.error('❌ Orchestrator failed:', error);
  process.exit(1);
});