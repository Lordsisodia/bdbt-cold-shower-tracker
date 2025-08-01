import { supabase } from '../lib/supabase';
import { enhancedGrokService } from './enhancedGrokService';

interface GenerationConfig {
  targetCount: number;
  categories: string[];
  qualityThreshold: number;
  retryAttempts: number;
}

interface GeneratedTip {
  title: string;
  content: string;
  category: string;
  tags: string[];
  quality_score: number;
  generated_at: string;
}

export class AutomatedTipGenerationService {
  private static isRunning = false;
  private static generationHistory: GeneratedTip[] = [];

  // Schedule daily tip generation
  static async scheduleDailyGeneration() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // Run at 6 AM daily

    const delay = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.runDailyGeneration();
      // Schedule next run
      setInterval(() => this.runDailyGeneration(), 24 * 60 * 60 * 1000);
    }, delay);

    console.log(`Daily tip generation scheduled for ${tomorrow.toISOString()}`);
  }

  // Run the daily generation process
  static async runDailyGeneration() {
    if (this.isRunning) {
      console.log('Generation already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    const config: GenerationConfig = {
      targetCount: 100,
      categories: ['Productivity', 'Marketing', 'Finance', 'Leadership', 'Strategy'],
      qualityThreshold: 0.8,
      retryAttempts: 3
    };

    try {
      console.log(`Starting daily tip generation at ${new Date().toISOString()}`);
      
      const results = await this.generateTipBatch(config);
      
      // Log generation results
      await this.logGenerationResults(results, startTime);
      
      // Send notification
      await this.sendGenerationReport(results);
      
      console.log(`Daily generation completed: ${results.successful} tips generated`);
    } catch (error) {
      console.error('Daily generation failed:', error);
      await this.handleGenerationError(error);
    } finally {
      this.isRunning = false;
    }
  }

  // Generate a batch of tips
  private static async generateTipBatch(config: GenerationConfig) {
    const results = {
      successful: 0,
      failed: 0,
      tips: [] as GeneratedTip[]
    };

    const tipsPerCategory = Math.ceil(config.targetCount / config.categories.length);

    for (const category of config.categories) {
      for (let i = 0; i < tipsPerCategory; i++) {
        let attempts = 0;
        let generated = false;

        while (attempts < config.retryAttempts && !generated) {
          try {
            const tip = await this.generateSingleTip(category);
            
            // Quality check
            if (tip.quality_score >= config.qualityThreshold) {
              await this.saveTipToDatabase(tip);
              results.tips.push(tip);
              results.successful++;
              generated = true;
            } else {
              console.log(`Tip quality too low (${tip.quality_score}), retrying...`);
            }
          } catch (error) {
            console.error(`Failed to generate tip for ${category}:`, error);
            attempts++;
          }
        }

        if (!generated) {
          results.failed++;
        }
      }
    }

    return results;
  }

  // Generate a single tip
  private static async generateSingleTip(category: string): Promise<GeneratedTip> {
    const prompt = `Generate a high-quality business tip for the category: ${category}. 
    The tip should be actionable, specific, and valuable for business professionals.
    Include a catchy title and detailed content with practical steps.`;

    const response = await enhancedGrokService.processTip({
      title: `Generate ${category} Tip`,
      content: prompt,
      category
    });

    // Extract and structure the generated tip
    const generatedTip: GeneratedTip = {
      title: response.enhancedTitle || `${category} Business Tip`,
      content: response.enhancedContent || '',
      category,
      tags: response.tags || [category.toLowerCase(), 'business', 'tips'],
      quality_score: this.calculateQualityScore(response),
      generated_at: new Date().toISOString()
    };

    return generatedTip;
  }

  // Calculate quality score
  private static calculateQualityScore(tip: any): number {
    let score = 0;
    
    // Check content length
    if (tip.enhancedContent && tip.enhancedContent.length > 200) score += 0.3;
    
    // Check for actionable content
    const actionWords = ['implement', 'create', 'develop', 'establish', 'measure'];
    const hasActionWords = actionWords.some(word => 
      tip.enhancedContent?.toLowerCase().includes(word)
    );
    if (hasActionWords) score += 0.3;
    
    // Check for structure
    if (tip.keyTakeaways && tip.keyTakeaways.length >= 3) score += 0.2;
    
    // Check for specificity
    if (tip.practicalApplication) score += 0.2;
    
    return Math.min(score, 1);
  }

  // Save tip to database
  private static async saveTipToDatabase(tip: GeneratedTip) {
    const { error } = await supabase
      .from('tips')
      .insert({
        title: tip.title,
        content: tip.content,
        category: tip.category,
        tags: tip.tags,
        status: 'published',
        quality_score: tip.quality_score,
        source: 'automated_generation',
        created_at: tip.generated_at
      });

    if (error) {
      throw new Error(`Failed to save tip: ${error.message}`);
    }
  }

  // Auto-categorization for imported tips
  static async autoCategorize(content: string): Promise<string> {
    const categories = {
      Productivity: ['efficiency', 'time management', 'workflow', 'automation', 'tools'],
      Marketing: ['branding', 'advertising', 'social media', 'content', 'seo'],
      Finance: ['budget', 'investment', 'revenue', 'costs', 'profit'],
      Leadership: ['team', 'management', 'culture', 'motivation', 'communication'],
      Strategy: ['planning', 'goals', 'competitive', 'growth', 'innovation']
    };

    const contentLower = content.toLowerCase();
    let bestMatch = 'General';
    let maxScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    return bestMatch;
  }

  // Error handling with retries
  private static async handleGenerationError(error: any) {
    console.error('Generation error:', error);
    
    // Log error to database
    await supabase
      .from('automation_logs')
      .insert({
        process: 'tip_generation',
        status: 'error',
        error_message: error.message,
        timestamp: new Date().toISOString()
      });

    // Send alert to admin
    // This would integrate with your notification system
  }

  // Log generation results
  private static async logGenerationResults(results: any, startTime: number) {
    const duration = Date.now() - startTime;
    
    await supabase
      .from('automation_logs')
      .insert({
        process: 'tip_generation',
        status: 'completed',
        details: {
          successful: results.successful,
          failed: results.failed,
          duration_ms: duration,
          tips_generated: results.tips.length
        },
        timestamp: new Date().toISOString()
      });
  }

  // Send generation report
  private static async sendGenerationReport(results: any) {
    const report = `
Daily Tip Generation Report
==========================
Generated: ${results.successful} tips
Failed: ${results.failed} attempts
Categories: ${results.tips.map(t => t.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
Average Quality: ${(results.tips.reduce((sum, t) => sum + t.quality_score, 0) / results.tips.length).toFixed(2)}
    `;

    console.log(report);
    // Send via email/notification system
  }

  // Manual trigger for testing
  static async triggerManualGeneration(count: number = 10) {
    const config: GenerationConfig = {
      targetCount: count,
      categories: ['Productivity', 'Marketing', 'Finance', 'Leadership', 'Strategy'],
      qualityThreshold: 0.7,
      retryAttempts: 2
    };

    return await this.generateTipBatch(config);
  }
}