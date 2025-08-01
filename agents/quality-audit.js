#!/usr/bin/env node

/**
 * BDBT Quality Auditor Agent
 * Reviews generated content for quality, duplicates, and formatting
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tipsDatabaseService } from '../src/services/tipsDatabaseService.js';

class QualityAuditor {
  constructor() {
    this.projectPath = process.cwd();
    this.metricsPath = '/tmp/bdbt_metrics';
    this.errorLogPath = '/tmp/bdbt_errors';
    this.auditResults = {
      duplicates: [],
      formatIssues: [],
      qualityFlags: [],
      approved: [],
      rejected: []
    };
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [AUDIT] [${level}] ${message}`);
  }

  async auditTips() {
    this.log('🔍 Starting quality audit process...');
    
    try {
      // Get all pending tips
      const pendingTips = await tipsDatabaseService.getTipsByStatus('pending');
      
      this.log(`📋 Found ${pendingTips.length} tips pending review`);
      
      for (const tip of pendingTips) {
        await this.auditSingleTip(tip);
      }
      
      // Generate audit report
      await this.generateAuditReport();
      
      this.log(`✅ Audit completed: ${this.auditResults.approved.length} approved, ${this.auditResults.rejected.length} rejected`);
      
    } catch (error) {
      this.log(`❌ Audit failed: ${error.message}`, 'ERROR');
      this.writeError('audit_failed', error);
    }
  }

  async auditSingleTip(tip) {
    this.log(`🔍 Auditing tip: ${tip.title}`);
    
    let qualityScore = 100;
    const issues = [];
    
    // Check for duplicates
    const isDuplicate = await this.checkForDuplicates(tip);
    if (isDuplicate) {
      issues.push('Duplicate content detected');
      qualityScore -= 50;
    }
    
    // Check formatting
    const formatIssues = this.checkFormatting(tip);
    issues.push(...formatIssues);
    qualityScore -= formatIssues.length * 10;
    
    // Check content quality
    const qualityIssues = this.checkContentQuality(tip);
    issues.push(...qualityIssues);
    qualityScore -= qualityIssues.length * 15;
    
    // Check completeness
    const completenessIssues = this.checkCompleteness(tip);
    issues.push(...completenessIssues);
    qualityScore -= completenessIssues.length * 20;
    
    // Determine approval status
    if (qualityScore >= 80 && issues.length === 0) {
      await tipsDatabaseService.approveTip(tip.id);
      this.auditResults.approved.push({
        id: tip.id,
        title: tip.title,
        score: qualityScore
      });
      this.log(`✅ Approved: ${tip.title} (Score: ${qualityScore})`);
    } else {
      this.auditResults.rejected.push({
        id: tip.id,
        title: tip.title,
        score: qualityScore,
        issues
      });
      this.log(`❌ Rejected: ${tip.title} (Score: ${qualityScore}, Issues: ${issues.length})`);
    }
  }

  async checkForDuplicates(tip) {
    // Get all published tips
    const { tips: existingTips } = await tipsDatabaseService.getPublishedTips({ limit: 1000 });
    
    // Check title similarity
    const titleSimilarity = existingTips.some(existing => 
      this.calculateSimilarity(tip.title.toLowerCase(), existing.title.toLowerCase()) > 0.8
    );
    
    // Check description similarity
    const descSimilarity = existingTips.some(existing => 
      this.calculateSimilarity(tip.description.toLowerCase(), existing.description.toLowerCase()) > 0.9
    );
    
    return titleSimilarity || descSimilarity;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  checkFormatting(tip) {
    const issues = [];
    
    // Check title formatting
    if (!tip.title || tip.title.length < 10 || tip.title.length > 100) {
      issues.push('Title length should be 10-100 characters');
    }
    
    // Check subtitle
    if (!tip.subtitle || tip.subtitle.length < 15 || tip.subtitle.length > 150) {
      issues.push('Subtitle length should be 15-150 characters');
    }
    
    // Check description
    if (!tip.description || tip.description.length < 50 || tip.description.length > 500) {
      issues.push('Description length should be 50-500 characters');
    }
    
    // Check benefits
    if (!tip.primary_benefit || tip.primary_benefit.length < 10) {
      issues.push('Primary benefit is too short');
    }
    
    // Check tags
    if (!tip.tags || tip.tags.length < 3) {
      issues.push('Should have at least 3 tags');
    }
    
    return issues;
  }

  checkContentQuality(tip) {
    const issues = [];
    
    // Check for placeholder text
    const placeholders = ['lorem ipsum', 'placeholder', 'todo', 'fix me', 'example'];
    const content = `${tip.title} ${tip.subtitle} ${tip.description}`.toLowerCase();
    
    placeholders.forEach(placeholder => {
      if (content.includes(placeholder)) {
        issues.push(`Contains placeholder text: ${placeholder}`);
      }
    });
    
    // Check for profanity or inappropriate content
    const inappropriate = ['damn', 'hell', 'stupid', 'idiot'];
    inappropriate.forEach(word => {
      if (content.includes(word)) {
        issues.push(`Contains inappropriate language: ${word}`);
      }
    });
    
    // Check for scientific backing claim
    if (tip.scientific_backing && !tip.source_url) {
      issues.push('Claims scientific backing but no source provided');
    }
    
    return issues;
  }

  checkCompleteness(tip) {
    const issues = [];
    
    const requiredFields = [
      'title', 'subtitle', 'category', 'subcategory', 'difficulty',
      'description', 'primary_benefit', 'implementation_time', 'frequency'
    ];
    
    requiredFields.forEach(field => {
      if (!tip[field] || tip[field].toString().trim() === '') {
        issues.push(`Missing required field: ${field}`);
      }
    });
    
    // Check category validity
    const validCategories = ['health', 'wealth', 'happiness'];
    if (!validCategories.includes(tip.category)) {
      issues.push('Invalid category');
    }
    
    // Check difficulty validity
    const validDifficulties = ['Easy', 'Moderate', 'Advanced'];
    if (!validDifficulties.includes(tip.difficulty)) {
      issues.push('Invalid difficulty level');
    }
    
    return issues;
  }

  async generateAuditReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_audited: this.auditResults.approved.length + this.auditResults.rejected.length,
        approved: this.auditResults.approved.length,
        rejected: this.auditResults.rejected.length,
        approval_rate: this.auditResults.approved.length / (this.auditResults.approved.length + this.auditResults.rejected.length) * 100
      },
      details: this.auditResults
    };
    
    // Save to metrics
    const reportFile = join(this.metricsPath, `audit_report_${Date.now()}.json`);
    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    this.log(`📊 Audit report saved: ${reportFile}`);
    
    // Update daily metrics
    this.updateDailyMetrics(report.summary);
  }

  updateDailyMetrics(summary) {
    const metricsFile = join(this.metricsPath, 'daily_metrics.json');
    let metrics = {};
    
    if (existsSync(metricsFile)) {
      metrics = JSON.parse(readFileSync(metricsFile, 'utf8'));
    }
    
    if (!metrics.quality_audits) {
      metrics.quality_audits = [];
    }
    
    metrics.quality_audits.push({
      timestamp: new Date().toISOString(),
      ...summary
    });
    
    writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  }

  writeError(type, error) {
    const errorFile = join(this.errorLogPath, `${type}_${Date.now()}.json`);
    const errorData = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    writeFileSync(errorFile, JSON.stringify(errorData, null, 2));
  }

  async start() {
    this.log('🔍 Quality Auditor Agent Starting...');
    await this.auditTips();
    this.log('✅ Quality Audit Complete');
  }
}

// Start the auditor
const auditor = new QualityAuditor();
auditor.start().catch(error => {
  console.error('❌ Quality Auditor failed:', error);
  process.exit(1);
});