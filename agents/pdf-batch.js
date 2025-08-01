#!/usr/bin/env node

/**
 * BDBT PDF Creator Agent
 * Generates PDF exports for approved tips in batches
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tipsDatabaseService } from '../src/services/tipsDatabaseService.js';

class PDFBatchCreator {
  constructor() {
    this.projectPath = process.cwd();
    this.metricsPath = '/tmp/bdbt_metrics';
    this.errorLogPath = '/tmp/bdbt_errors';
    this.outputDir = join(this.projectPath, 'output', 'pdfs');
    this.batchResults = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [PDF] [${level}] ${message}`);
  }

  async processPDFBatch() {
    this.log('📄 Starting PDF batch generation...');
    
    try {
      // Get approved tips that need PDFs
      const approvedTips = await tipsDatabaseService.getTipsByStatus('approved');
      
      this.log(`📋 Found ${approvedTips.length} approved tips for PDF generation`);
      
      // Process in smaller batches to avoid memory issues
      const batchSize = 10;
      for (let i = 0; i < approvedTips.length; i += batchSize) {
        const batch = approvedTips.slice(i, i + batchSize);
        await this.processBatch(batch, Math.floor(i / batchSize) + 1);
      }
      
      // Generate summary report
      await this.generateBatchReport();
      
      this.log(`✅ PDF batch completed: ${this.batchResults.successful}/${this.batchResults.processed} successful`);
      
    } catch (error) {
      this.log(`❌ PDF batch failed: ${error.message}`, 'ERROR');
      this.writeError('pdf_batch_failed', error);
    }
  }

  async processBatch(tips, batchNumber) {
    this.log(`📦 Processing batch ${batchNumber} (${tips.length} tips)`);
    
    for (const tip of tips) {
      try {
        await this.generateTipPDF(tip);
        this.batchResults.successful++;
        
        // Mark as published after successful PDF generation
        await tipsDatabaseService.publishTip(tip.id);
        
      } catch (error) {
        this.log(`❌ Failed to generate PDF for tip ${tip.id}: ${error.message}`, 'ERROR');
        this.batchResults.failed++;
        this.batchResults.errors.push({
          tipId: tip.id,
          title: tip.title,
          error: error.message
        });
      }
      
      this.batchResults.processed++;
    }
  }

  async generateTipPDF(tip) {
    this.log(`📄 Generating PDF for: ${tip.title}`);
    
    // Use the existing PDF generator service
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('node', [
        join(this.projectPath, 'src/scripts/generatePDF.js'),
        '--tip-id', tip.id.toString(),
        '--output-dir', this.outputDir
      ]);
      
      let output = '';
      let errorOutput = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          this.log(`✅ PDF generated successfully for tip ${tip.id}`);
          
          // Increment download count (preparing for PDF availability)
          tipsDatabaseService.incrementDownloadCount(tip.id);
          
          resolve(output);
        } else {
          reject(new Error(`PDF generation failed with code ${code}: ${errorOutput}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async generateBatchReport() {
    const report = {
      timestamp: new Date().toISOString(),
      batch_summary: {
        total_processed: this.batchResults.processed,
        successful: this.batchResults.successful,
        failed: this.batchResults.failed,
        success_rate: (this.batchResults.successful / this.batchResults.processed) * 100
      },
      errors: this.batchResults.errors,
      output_directory: this.outputDir
    };
    
    // Save batch report
    const reportFile = join(this.metricsPath, `pdf_batch_report_${Date.now()}.json`);
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`📊 Batch report saved: ${reportFile}`);
    
    // Update daily metrics
    this.updateDailyMetrics(report.batch_summary);
  }

  updateDailyMetrics(summary) {
    const metricsFile = join(this.metricsPath, 'daily_metrics.json');
    let metrics = {};
    
    if (existsSync(metricsFile)) {
      metrics = JSON.parse(readFileSync(metricsFile, 'utf8'));
    }
    
    if (!metrics.pdf_batches) {
      metrics.pdf_batches = [];
    }
    
    metrics.pdf_batches.push({
      timestamp: new Date().toISOString(),
      ...summary
    });
    
    writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  }

  async generateWeeklyCompilation() {
    this.log('📚 Generating weekly PDF compilation...');
    
    try {
      // Get all tips published in the last week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { tips: weeklyTips } = await tipsDatabaseService.getTips({
        status: 'published',
        limit: 100
      });
      
      // Filter by creation date (approximate)
      const recentTips = weeklyTips.slice(0, 35); // Last 35 tips as weekly batch
      
      if (recentTips.length > 0) {
        await this.generateCompilationPDF(recentTips);
        this.log(`✅ Weekly compilation generated with ${recentTips.length} tips`);
      } else {
        this.log('ℹ️ No tips found for weekly compilation');
      }
      
    } catch (error) {
      this.log(`❌ Weekly compilation failed: ${error.message}`, 'ERROR');
      this.writeError('weekly_compilation_failed', error);
    }
  }

  async generateCompilationPDF(tips) {
    const compilationData = {
      title: `BDBT Weekly Compilation - ${new Date().toLocaleDateString()}`,
      tips: tips.map(tip => ({
        title: tip.title,
        subtitle: tip.subtitle,
        category: tip.category,
        difficulty: tip.difficulty,
        description: tip.description,
        benefits: [tip.primary_benefit, tip.secondary_benefit, tip.tertiary_benefit],
        implementation: {
          time: tip.implementation_time,
          frequency: tip.frequency,
          cost: tip.cost
        }
      }))
    };
    
    const compilationFile = join(this.outputDir, `weekly_compilation_${Date.now()}.json`);
    writeFileSync(compilationFile, JSON.stringify(compilationData, null, 2));
    
    // Use PDF generator for compilation
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('node', [
        join(this.projectPath, 'src/scripts/generateCompilationPDF.js'),
        '--input', compilationFile,
        '--output-dir', this.outputDir
      ]);
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Compilation PDF generation failed with code ${code}`));
        }
      });
    });
  }

  writeError(type, error) {
    const errorFile = join(this.errorLogPath, `${type}_${Date.now()}.json`);
    const errorData = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      batch_results: this.batchResults
    };
    writeFileSync(errorFile, JSON.stringify(errorData, null, 2));
  }

  async start() {
    this.log('📄 PDF Batch Creator Agent Starting...');
    
    // Generate individual PDFs
    await this.processPDFBatch();
    
    // Generate weekly compilation on Sundays
    const today = new Date();
    if (today.getDay() === 0) { // Sunday
      await this.generateWeeklyCompilation();
    }
    
    this.log('✅ PDF Batch Creation Complete');
  }
}

// Start the PDF creator
const pdfCreator = new PDFBatchCreator();
pdfCreator.start().catch(error => {
  console.error('❌ PDF Batch Creator failed:', error);
  process.exit(1);
});