import { batchProcessingService, BatchProcessingConfig } from './batchProcessingService';
import { tipsDatabaseService } from './tipsDatabaseService';
import { grokApiService } from './grokApiService';

export interface PipelineConfig {
  // Input configuration
  source: 'database' | 'csv' | 'json';
  tipIds?: number[]; // Specific tips or all if not provided
  limit?: number; // Max tips to process (default 1000)
  
  // Enhancement configuration
  useGrok: boolean;
  grokModel?: 'grok-beta' | 'grok-pro';
  enhancementOptions?: {
    expandDescriptions: boolean;
    generateSocialMedia: boolean;
    createEmailContent: boolean;
    designVisualDescriptions: boolean;
  };
  
  // Output configuration
  outputs: {
    pdf?: {
      enabled: boolean;
      individual: boolean; // Individual PDFs per tip
      catalogue: boolean; // Single PDF with all tips
      megaPDF: boolean; // Comprehensive PDF with all content
    };
    canva?: {
      enabled: boolean;
      templates: string[]; // Template IDs to use
      autoExport: boolean; // Auto-export designs as PDFs
    };
    webpage?: {
      enabled: boolean;
      individual: boolean; // Individual pages per tip
      collection: boolean; // Collection page with all tips
      hosting?: 'local' | 'vercel' | 's3'; // Hosting option
    };
  };
  
  // Processing configuration
  batchSize: number; // Tips to process in parallel
  outputDirectory: string;
  webhookUrl?: string; // Progress notifications
  
  // Advanced options
  caching?: boolean; // Cache Grok responses
  retryFailures?: boolean; // Retry failed tips
  generateReport?: boolean; // Generate processing report
}

export interface PipelineResult {
  status: 'success' | 'partial' | 'failed';
  summary: {
    totalTips: number;
    processedTips: number;
    enhancedTips: number;
    outputsGenerated: {
      pdfs: number;
      canvaDesigns: number;
      webpages: number;
    };
  };
  outputs: {
    pdfs?: string[];
    canvaUrls?: string[];
    webpageUrls?: string[];
    reportPath?: string;
  };
  errors: any[];
  timing: {
    startTime: Date;
    endTime: Date;
    totalDuration: number;
    phases: {
      fetching: number;
      enhancement: number;
      generation: number;
    };
  };
  costs?: {
    grokTokens: number;
    estimatedCost: number;
  };
}

export class UnifiedPipelineManager {
  private activeJobs: Map<string, any> = new Map();

  // Main pipeline execution
  async executePipeline(config: PipelineConfig): Promise<PipelineResult> {
    const jobId = this.generateJobId();
    const startTime = new Date();
    const phaseTimings = {
      fetching: 0,
      enhancement: 0,
      generation: 0
    };

    // Initialize result
    const result: PipelineResult = {
      status: 'success',
      summary: {
        totalTips: 0,
        processedTips: 0,
        enhancedTips: 0,
        outputsGenerated: {
          pdfs: 0,
          canvaDesigns: 0,
          webpages: 0
        }
      },
      outputs: {},
      errors: [],
      timing: {
        startTime,
        endTime: new Date(),
        totalDuration: 0,
        phases: phaseTimings
      }
    };

    try {
      // Phase 1: Fetch tips
      const fetchStart = Date.now();
      const tips = await this.fetchTips(config);
      result.summary.totalTips = tips.length;
      phaseTimings.fetching = Date.now() - fetchStart;

      // Validate tip count
      if (tips.length === 0) {
        throw new Error('No tips found to process');
      }

      // Phase 2: Process with batch service
      const batchConfig: BatchProcessingConfig = {
        tipIds: config.tipIds,
        outputFormats: this.getOutputFormats(config),
        enhanceWithGrok: config.useGrok,
        batchSize: config.batchSize || 10,
        outputDirectory: config.outputDirectory,
        webhookUrl: config.webhookUrl
      };

      const batchResult = await batchProcessingService.processBatch(batchConfig);
      
      // Update result
      result.summary.processedTips = batchResult.processedCount;
      result.summary.enhancedTips = config.useGrok ? batchResult.successCount : 0;
      
      if (batchResult.outputs.pdf) {
        result.summary.outputsGenerated.pdfs = batchResult.outputs.pdf.length;
        result.outputs.pdfs = batchResult.outputs.pdf;
      }
      if (batchResult.outputs.canva) {
        result.summary.outputsGenerated.canvaDesigns = batchResult.outputs.canva.length;
        result.outputs.canvaUrls = batchResult.outputs.canva;
      }
      if (batchResult.outputs.webpage) {
        result.summary.outputsGenerated.webpages = batchResult.outputs.webpage.length;
        result.outputs.webpageUrls = batchResult.outputs.webpage;
      }

      result.errors = batchResult.errors;
      if (batchResult.apiCosts) {
        result.costs = batchResult.apiCosts;
      }

      // Phase 3: Generate report if requested
      if (config.generateReport) {
        const reportPath = await this.generatePipelineReport(result, config);
        result.outputs.reportPath = reportPath;
      }

      // Determine final status
      if (batchResult.failedCount === 0) {
        result.status = 'success';
      } else if (batchResult.successCount > 0) {
        result.status = 'partial';
      } else {
        result.status = 'failed';
      }

    } catch (error) {
      result.status = 'failed';
      result.errors.push({
        stage: 'pipeline',
        error: error.message
      });
    } finally {
      result.timing.endTime = new Date();
      result.timing.totalDuration = result.timing.endTime.getTime() - result.timing.startTime.getTime();
      this.activeJobs.delete(jobId);
    }

    return result;
  }

  // Quick preset pipelines
  async quickGenerate(preset: 'pdf-only' | 'canva-only' | 'web-only' | 'all', tipCount: number = 100): Promise<PipelineResult> {
    const presets: Record<string, Partial<PipelineConfig>> = {
      'pdf-only': {
        outputs: {
          pdf: { enabled: true, individual: true, catalogue: true, megaPDF: false }
        }
      },
      'canva-only': {
        outputs: {
          canva: { enabled: true, templates: ['default'], autoExport: true }
        }
      },
      'web-only': {
        outputs: {
          webpage: { enabled: true, individual: true, collection: true }
        }
      },
      'all': {
        outputs: {
          pdf: { enabled: true, individual: true, catalogue: true, megaPDF: true },
          canva: { enabled: true, templates: ['default'], autoExport: true },
          webpage: { enabled: true, individual: true, collection: true }
        }
      }
    };

    const config: PipelineConfig = {
      source: 'database',
      limit: tipCount,
      useGrok: true,
      outputs: presets[preset].outputs || {},
      batchSize: 10,
      outputDirectory: `./output/${preset}_${Date.now()}`,
      generateReport: true,
      ...presets[preset]
    };

    return this.executePipeline(config);
  }

  // Fetch tips based on configuration
  private async fetchTips(config: PipelineConfig): Promise<any[]> {
    switch (config.source) {
      case 'database':
        if (config.tipIds && config.tipIds.length > 0) {
          const tips = await Promise.all(
            config.tipIds.map(id => tipsDatabaseService.getTipById(id))
          );
          return tips.filter(tip => tip !== null);
        } else {
          const { tips } = await tipsDatabaseService.getTips({ 
            limit: config.limit || 1000 
          });
          return tips;
        }
      
      case 'csv':
        // Implement CSV import
        throw new Error('CSV import not yet implemented');
      
      case 'json':
        // Implement JSON import
        throw new Error('JSON import not yet implemented');
      
      default:
        throw new Error(`Unknown source: ${config.source}`);
    }
  }

  // Get output formats from config
  private getOutputFormats(config: PipelineConfig): ('pdf' | 'canva' | 'webpage')[] {
    const formats: ('pdf' | 'canva' | 'webpage')[] = [];
    
    if (config.outputs.pdf?.enabled) formats.push('pdf');
    if (config.outputs.canva?.enabled) formats.push('canva');
    if (config.outputs.webpage?.enabled) formats.push('webpage');
    
    return formats;
  }

  // Generate pipeline report
  private async generatePipelineReport(result: PipelineResult, config: PipelineConfig): Promise<string> {
    const report = `
# BDBT Pipeline Execution Report

## Configuration
- **Source**: ${config.source}
- **Tips Limit**: ${config.limit || 'All'}
- **Grok Enhancement**: ${config.useGrok ? 'Enabled' : 'Disabled'}
- **Batch Size**: ${config.batchSize}
- **Output Directory**: ${config.outputDirectory}

## Results Summary
- **Status**: ${result.status}
- **Total Tips**: ${result.summary.totalTips}
- **Processed Tips**: ${result.summary.processedTips}
- **Enhanced Tips**: ${result.summary.enhancedTips}

## Outputs Generated
- **PDFs**: ${result.summary.outputsGenerated.pdfs}
- **Canva Designs**: ${result.summary.outputsGenerated.canvaDesigns}
- **Web Pages**: ${result.summary.outputsGenerated.webpages}

## Timing
- **Total Duration**: ${(result.timing.totalDuration / 1000).toFixed(2)} seconds
- **Fetching Phase**: ${(result.timing.phases.fetching / 1000).toFixed(2)} seconds
- **Enhancement Phase**: ${(result.timing.phases.enhancement / 1000).toFixed(2)} seconds
- **Generation Phase**: ${(result.timing.phases.generation / 1000).toFixed(2)} seconds

${result.costs ? `
## API Costs
- **Grok Tokens**: ${result.costs.grokTokens}
- **Estimated Cost**: $${result.costs.estimatedCost.toFixed(4)}
` : ''}

## Errors
${result.errors.length > 0 ? result.errors.map(e => 
  `- ${e.stage}: ${e.error}`
).join('\n') : 'No errors occurred'}

## Output Files
${result.outputs.pdfs ? `
### PDFs
${result.outputs.pdfs.slice(0, 10).join('\n')}
${result.outputs.pdfs.length > 10 ? `... and ${result.outputs.pdfs.length - 10} more` : ''}
` : ''}

${result.outputs.canvaUrls ? `
### Canva Designs
${result.outputs.canvaUrls.slice(0, 10).join('\n')}
${result.outputs.canvaUrls.length > 10 ? `... and ${result.outputs.canvaUrls.length - 10} more` : ''}
` : ''}

${result.outputs.webpageUrls ? `
### Web Pages
${result.outputs.webpageUrls.slice(0, 10).join('\n')}
${result.outputs.webpageUrls.length > 10 ? `... and ${result.outputs.webpageUrls.length - 10} more` : ''}
` : ''}

---
Generated: ${new Date().toISOString()}
Job ID: ${this.generateJobId()}
`;

    const reportPath = `${config.outputDirectory}/pipeline_report_${Date.now()}.md`;
    // In real implementation, save to file system
    // await fs.writeFile(reportPath, report);
    
    return reportPath;
  }

  // Generate unique job ID
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get active jobs
  getActiveJobs(): string[] {
    return Array.from(this.activeJobs.keys());
  }

  // Estimate processing time and costs
  async estimatePipeline(config: PipelineConfig): Promise<{
    estimatedTime: number;
    estimatedCost: number;
    estimatedOutputs: {
      pdfs: number;
      canvaDesigns: number;
      webpages: number;
    };
  }> {
    // Fetch tip count
    const tips = await this.fetchTips({ ...config, limit: 1 });
    const tipCount = config.limit || tips.length;
    
    // Calculate estimates
    const timePerTip = config.useGrok ? 3000 : 1000; // 3s with Grok, 1s without
    const outputCount = this.getOutputFormats(config).length;
    const estimatedTime = tipCount * timePerTip * outputCount;
    
    const tokensPerTip = 1500;
    const costPer1kTokens = 0.001;
    const estimatedCost = config.useGrok ? (tipCount * tokensPerTip / 1000) * costPer1kTokens : 0;
    
    return {
      estimatedTime,
      estimatedCost,
      estimatedOutputs: {
        pdfs: config.outputs.pdf?.enabled ? tipCount : 0,
        canvaDesigns: config.outputs.canva?.enabled ? tipCount : 0,
        webpages: config.outputs.webpage?.enabled ? tipCount : 0
      }
    };
  }

  // Validate pipeline configuration
  validateConfig(config: PipelineConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate source
    if (!['database', 'csv', 'json'].includes(config.source)) {
      errors.push('Invalid source specified');
    }
    
    // Validate outputs
    const hasOutput = config.outputs.pdf?.enabled || 
                     config.outputs.canva?.enabled || 
                     config.outputs.webpage?.enabled;
    if (!hasOutput) {
      errors.push('At least one output format must be enabled');
    }
    
    // Validate batch size
    if (config.batchSize < 1 || config.batchSize > 100) {
      errors.push('Batch size must be between 1 and 100');
    }
    
    // Validate output directory
    if (!config.outputDirectory) {
      errors.push('Output directory must be specified');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const pipelineManager = new UnifiedPipelineManager();