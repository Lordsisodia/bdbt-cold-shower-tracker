import { canvaService } from './canvaIntegration';
import { grokApiService, GrokEnhancedTip } from './grokApiService';
import { pdfGenerator } from './pdfGenerator';
import { DatabaseTip, tipsDatabaseService } from './tipsDatabaseService';
import { webPageGenerator } from './webPageGenerator';

export interface BatchProcessingConfig {
  tipIds?: number[]; // Specific tips to process, or all if not provided
  outputFormats: ('pdf' | 'canva' | 'webpage')[];
  enhanceWithGrok: boolean;
  batchSize: number;
  outputDirectory: string;
  webhookUrl?: string; // For progress notifications
}

export interface BatchProcessingResult {
  processedCount: number;
  successCount: number;
  failedCount: number;
  outputs: {
    pdf?: string[];
    canva?: string[];
    webpage?: string[];
  };
  errors: any[];
  processingTime: number;
  apiCosts?: {
    grokTokens: number;
    estimatedCost: number;
  };
}

export interface ProcessingProgress {
  stage: 'fetching' | 'enhancing' | 'generating' | 'complete';
  current: number;
  total: number;
  percentage: number;
  estimatedTimeRemaining: number;
  currentTip?: string;
}

export class BatchProcessingService {
  private isProcessing: boolean = false;
  private currentProgress: ProcessingProgress | null = null;
  private progressCallbacks: ((progress: ProcessingProgress) => void)[] = [];

  // Main batch processing function
  async processBatch(config: BatchProcessingConfig): Promise<BatchProcessingResult> {
    if (this.isProcessing) {
      throw new Error('Batch processing already in progress');
    }

    this.isProcessing = true;
    const startTime = Date.now();
    const result: BatchProcessingResult = {
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      outputs: {},
      errors: [],
      processingTime: 0
    };

    try {
      // Stage 1: Fetch tips from database
      this.updateProgress('fetching', 0, 100, 0);
      const tips = await this.fetchTips(config.tipIds);
      const totalTips = tips.length;
      
      // Stage 2: Enhance with Grok if enabled
      let enhancedTips: GrokEnhancedTip[] = [];
      if (config.enhanceWithGrok) {
        this.updateProgress('enhancing', 0, totalTips, 0);
        enhancedTips = await grokApiService.batchEnhanceTips(
          tips,
          (processed, total) => {
            this.updateProgress('enhancing', processed, total, processed / total * 100);
          }
        );
        
        // Calculate API costs
        const costs = grokApiService.calculateApiCosts(enhancedTips);
        result.apiCosts = {
          grokTokens: costs.totalTokens,
          estimatedCost: costs.estimatedCost
        };
      }

      // Stage 3: Generate outputs
      this.updateProgress('generating', 0, totalTips, 0);
      
      // Process in batches
      for (let i = 0; i < tips.length; i += config.batchSize) {
        const batch = tips.slice(i, i + config.batchSize);
        const enhancedBatch = enhancedTips.slice(i, i + config.batchSize);
        
        await this.processTipBatch(
          batch,
          enhancedBatch,
          config,
          result,
          i,
          totalTips
        );
      }

      result.processedCount = totalTips;
      result.processingTime = Date.now() - startTime;
      
      // Send completion webhook if configured
      if (config.webhookUrl) {
        await this.sendWebhook(config.webhookUrl, {
          status: 'complete',
          result
        });
      }

      this.updateProgress('complete', totalTips, totalTips, 100);
      
    } catch (error) {
      result.errors.push({
        stage: 'general',
        error: error.message
      });
      throw error;
    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  // Fetch tips from database
  private async fetchTips(tipIds?: number[]): Promise<DatabaseTip[]> {
    if (tipIds && tipIds.length > 0) {
      // Fetch specific tips
      const tips = await Promise.all(
        tipIds.map(id => tipsDatabaseService.getTipById(id))
      );
      return tips.filter(tip => tip !== null);
    } else {
      // Fetch all tips
      const { tips } = await tipsDatabaseService.getTips({ limit: 1000 });
      return tips;
    }
  }

  // Process a batch of tips
  private async processTipBatch(
    tips: DatabaseTip[],
    enhancedTips: GrokEnhancedTip[],
    config: BatchProcessingConfig,
    result: BatchProcessingResult,
    batchStart: number,
    total: number
  ): Promise<void> {
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      const enhanced = enhancedTips[i];
      const currentIndex = batchStart + i;
      
      this.updateProgress(
        'generating',
        currentIndex + 1,
        total,
        ((currentIndex + 1) / total) * 100,
        tip.title
      );

      try {
        // Generate PDF if requested
        if (config.outputFormats.includes('pdf')) {
          const pdfPath = await this.generatePDF(tip, enhanced, config.outputDirectory);
          if (!result.outputs.pdf) result.outputs.pdf = [];
          result.outputs.pdf.push(pdfPath);
        }

        // Generate Canva design if requested
        if (config.outputFormats.includes('canva')) {
          const canvaUrl = await this.generateCanvaDesign(tip, enhanced);
          if (!result.outputs.canva) result.outputs.canva = [];
          result.outputs.canva.push(canvaUrl);
        }

        // Generate webpage if requested
        if (config.outputFormats.includes('webpage')) {
          const webpagePath = await this.generateWebpage(tip, enhanced, config.outputDirectory);
          if (!result.outputs.webpage) result.outputs.webpage = [];
          result.outputs.webpage.push(webpagePath);
        }

        result.successCount++;
      } catch (error) {
        result.failedCount++;
        result.errors.push({
          tipId: tip.id,
          tipTitle: tip.title,
          error: error.message
        });
      }
    }
  }

  // Generate PDF for a tip
  private async generatePDF(
    tip: DatabaseTip,
    enhanced: GrokEnhancedTip | null,
    outputDir: string
  ): Promise<string> {
    // Convert to the format expected by PDF generator
    const tipData = {
      id: tip.id || 0,
      category: tip.category as 'health' | 'wealth' | 'happiness',
      difficulty: tip.difficulty as 'Easy' | 'Moderate' | 'Advanced',
      content: {
        title: tip.title,
        subtitle: tip.subtitle,
        description: enhanced?.enhancedContent.expandedDescription || tip.description,
        benefits: {
          primary: tip.primary_benefit,
          secondary: tip.secondary_benefit,
          tertiary: tip.tertiary_benefit
        },
        implementation: {
          time: tip.implementation_time,
          frequency: tip.frequency,
          cost: tip.cost
        },
        whatsIncluded: enhanced?.enhancedContent.implementationSteps || [],
        readTime: 5,
        tags: tip.tags
      }
    };

    const pdfBlob = pdfGenerator.generateTipPDF(tipData);
    
    // Save to file system (in a real implementation)
    const fileName = `${outputDir}/tip_${tip.id}_${tip.title.replace(/\s+/g, '_')}.pdf`;
    // await fs.writeFile(fileName, pdfBlob);
    
    return fileName;
  }

  // Generate Canva design
  private async generateCanvaDesign(
    tip: DatabaseTip,
    enhanced: GrokEnhancedTip | null
  ): Promise<string> {
    const designData = {
      tipId: tip.id || 0,
      title: tip.title,
      subtitle: tip.subtitle,
      category: tip.category,
      benefits: [
        tip.primary_benefit,
        tip.secondary_benefit,
        tip.tertiary_benefit
      ],
      whatsIncluded: enhanced?.enhancedContent.implementationSteps.slice(0, 5) || [],
      colors: tipsDatabaseService['getCategoryColors'](tip.category),
      branding: canvaService.getBrandingData()
    };

    const design = await canvaService.createDesignFromTip(designData);
    return design.editUrl;
  }

  // Generate webpage
  private async generateWebpage(
    tip: DatabaseTip,
    enhanced: GrokEnhancedTip | null,
    outputDir: string
  ): Promise<string> {
    const webpageContent = await webPageGenerator.generateTipPage(tip, enhanced);
    const fileName = `${outputDir}/tip_${tip.id}_${tip.title.replace(/\s+/g, '_')}.html`;
    
    // Save to file system (in a real implementation)
    // await fs.writeFile(fileName, webpageContent);
    
    return fileName;
  }

  // Update progress
  private updateProgress(
    stage: ProcessingProgress['stage'],
    current: number,
    total: number,
    percentage: number,
    currentTip?: string
  ): void {
    const avgProcessingTime = 2000; // 2 seconds per tip average
    const remaining = total - current;
    const estimatedTimeRemaining = remaining * avgProcessingTime;

    this.currentProgress = {
      stage,
      current,
      total,
      percentage,
      estimatedTimeRemaining,
      currentTip
    };

    // Notify all progress callbacks
    this.progressCallbacks.forEach(callback => callback(this.currentProgress!));
  }

  // Subscribe to progress updates
  subscribeToProgress(callback: (progress: ProcessingProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.progressCallbacks.indexOf(callback);
      if (index > -1) {
        this.progressCallbacks.splice(index, 1);
      }
    };
  }

  // Get current progress
  getCurrentProgress(): ProcessingProgress | null {
    return this.currentProgress;
  }

  // Send webhook notification
  private async sendWebhook(url: string, data: any): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Webhook send failed:', error);
    }
  }

  // Generate batch report
  async generateBatchReport(result: BatchProcessingResult): Promise<string> {
    const report = `
# BDBT Batch Processing Report

## Summary
- **Total Tips Processed**: ${result.processedCount}
- **Successful**: ${result.successCount}
- **Failed**: ${result.failedCount}
- **Processing Time**: ${(result.processingTime / 1000).toFixed(2)} seconds

## API Usage
${result.apiCosts ? `
- **Grok Tokens Used**: ${result.apiCosts.grokTokens}
- **Estimated Cost**: $${result.apiCosts.estimatedCost.toFixed(4)}
` : 'No API usage (Grok enhancement disabled)'}

## Outputs Generated
${result.outputs.pdf ? `- **PDFs**: ${result.outputs.pdf.length} files` : ''}
${result.outputs.canva ? `- **Canva Designs**: ${result.outputs.canva.length} designs` : ''}
${result.outputs.webpage ? `- **Web Pages**: ${result.outputs.webpage.length} pages` : ''}

## Errors
${result.errors.length > 0 ? result.errors.map(e => 
  `- Tip ${e.tipId} (${e.tipTitle}): ${e.error}`
).join('\n') : 'No errors occurred'}

---
Generated: ${new Date().toISOString()}
`;

    return report;
  }

  // Estimate processing time and costs
  async estimateProcessing(tipCount: number, config: BatchProcessingConfig): Promise<{
    estimatedTime: number;
    estimatedCost: number;
    estimatedTokens: number;
  }> {
    const timePerTip = config.enhanceWithGrok ? 3000 : 1000; // 3s with Grok, 1s without
    const tokensPerTip = 1500; // Average tokens per tip
    const costPer1kTokens = 0.001;

    return {
      estimatedTime: tipCount * timePerTip,
      estimatedCost: config.enhanceWithGrok ? (tipCount * tokensPerTip / 1000) * costPer1kTokens : 0,
      estimatedTokens: config.enhanceWithGrok ? tipCount * tokensPerTip : 0
    };
  }
}

// Export singleton instance
export const batchProcessingService = new BatchProcessingService();