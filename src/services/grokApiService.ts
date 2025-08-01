import { DatabaseTip } from './tipsDatabaseService';

// Grok API configuration
const GROK_API_BASE_URL = 'https://api.x.ai/v1';
const GROK_MODEL = 'grok-beta';

export interface GrokEnhancedTip {
  originalTip: DatabaseTip;
  enhancedContent: {
    expandedDescription: string;
    detailedBenefits: string[];
    implementationSteps: string[];
    proTips: string[];
    commonMistakes: string[];
    successMetrics: string[];
    relatedTips: string[];
    visualDescription: string; // For Canva/image generation
    socialMediaPosts: {
      twitter: string;
      instagram: string;
      linkedin: string;
    };
    emailContent: string;
    landingPageCopy: string;
  };
  metadata: {
    processingTime: number;
    enhancementDate: string;
    model: string;
    tokens: number;
  };
}

export class GrokApiService {
  private apiKey: string;
  private rateLimitDelay: number = 1000; // 1 second between requests for free tier
  private maxRetries: number = 3;
  private batchSize: number = 10; // Process 10 tips at a time

  constructor() {
    // Remove API key from client-side - this should be handled server-side
    this.apiKey = '';
    
    // Log warning about missing server-side configuration
    if (typeof window !== 'undefined') {
      console.warn('Grok API calls should be handled server-side for security. Client-side API keys are a security risk.');
    }
  }

  // Enhance a single tip with Grok
  async enhanceTip(tip: DatabaseTip): Promise<GrokEnhancedTip> {
    const startTime = Date.now();
    
    try {
      const response = await this.callGrokApi(tip);
      const enhancedContent = this.parseGrokResponse(response);
      
      return {
        originalTip: tip,
        enhancedContent,
        metadata: {
          processingTime: Date.now() - startTime,
          enhancementDate: new Date().toISOString(),
          model: GROK_MODEL,
          tokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error(`Error enhancing tip ${tip.id}:`, error);
      throw error;
    }
  }

  // Batch process multiple tips
  async batchEnhanceTips(
    tips: DatabaseTip[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<GrokEnhancedTip[]> {
    const results: GrokEnhancedTip[] = [];
    const total = tips.length;
    
    for (let i = 0; i < tips.length; i += this.batchSize) {
      const batch = tips.slice(i, i + this.batchSize);
      
      // Process batch in parallel with rate limiting
      const batchResults = await this.processBatchWithRateLimit(batch);
      results.push(...batchResults);
      
      if (onProgress) {
        onProgress(Math.min(i + this.batchSize, total), total);
      }
      
      // Delay between batches
      if (i + this.batchSize < tips.length) {
        await this.delay(this.rateLimitDelay * 2);
      }
    }
    
    return results;
  }

  // Process a batch with rate limiting
  private async processBatchWithRateLimit(batch: DatabaseTip[]): Promise<GrokEnhancedTip[]> {
    const results: GrokEnhancedTip[] = [];
    
    for (const tip of batch) {
      try {
        const enhanced = await this.enhanceTip(tip);
        results.push(enhanced);
        await this.delay(this.rateLimitDelay);
      } catch (error) {
        console.error(`Failed to enhance tip ${tip.id}:`, error);
        // Continue with next tip
      }
    }
    
    return results;
  }

  // Generate enhancement prompt for Grok - optimized for 2-line tip generation
  private generateEnhancementPrompt(tip: DatabaseTip): string {
    return `
You are an expert wellness coach and content creator. Transform this simple tip idea into a complete, actionable wellness tip.

Input: "${tip.title}" (Category: ${tip.category})

Create a comprehensive tip with the following JSON structure:
{
  "expandedDescription": "Write 2-3 engaging paragraphs that explain what this tip is, why it works, and how it fits into daily life. Make it practical and motivating.",
  "detailedBenefits": [
    "Primary benefit: What's the main positive outcome?",
    "Secondary benefit: What's another key advantage?", 
    "Tertiary benefit: What long-term impact does this have?"
  ],
  "implementationSteps": [
    "Step 1: How to get started",
    "Step 2: What to do daily",
    "Step 3: How to track progress"
  ],
  "proTips": [
    "Pro tip for making it easier",
    "Pro tip for better results"
  ],
  "commonMistakes": [
    "Common mistake people make",
    "Another pitfall to avoid"
  ],
  "successMetrics": [
    "How to measure progress",
    "What success looks like"
  ],
  "relatedTips": [
    "Related tip idea 1",
    "Related tip idea 2"
  ],
  "visualDescription": "Describe the mood, colors, and imagery that would represent this tip visually",
  "socialMediaPosts": {
    "twitter": "Create an engaging 280-character tweet with relevant hashtags",
    "instagram": "Write an Instagram caption with emojis and hashtags", 
    "linkedin": "Professional post for LinkedIn audience"
  },
  "emailContent": "Write 2 compelling paragraphs that could be used in an email newsletter",
  "landingPageCopy": "Create compelling copy with a headline and 2-3 key sections"
}

Focus on the ${tip.category} category. Make everything actionable, specific, and inspiring. Keep the tone positive and encouraging.`;
  }

  // Secure API call via Supabase Edge Function
  private async callGrokApi(tip: DatabaseTip, retryCount = 0): Promise<any> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase configuration missing, using mock response');
        return this.getMockResponse();
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/enhance-tip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tip: {
            id: tip.id,
            title: tip.title,
            category: tip.category,
            description: tip.description
          },
          enhancementType: 'comprehensive'
        })
      });

      if (!response.ok) {
        throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed');
      }

      // Transform the response to match expected format
      return {
        choices: [{
          message: {
            content: JSON.stringify(data.enhancedContent)
          }
        }],
        usage: {
          total_tokens: data.metadata?.tokens || 500
        }
      };
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await this.delay(this.rateLimitDelay * (retryCount + 1));
        return this.callGrokApi(tip, retryCount + 1);
      }
      
      console.warn('Secure API call failed, using mock response:', error);
      return this.getMockResponse();
    }
  }

  // Parse Grok response
  private parseGrokResponse(response: any): GrokEnhancedTip['enhancedContent'] {
    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      console.error('Error parsing Grok response:', error);
      return this.getDefaultEnhancedContent();
    }
  }

  // Generate content variations for A/B testing
  async generateContentVariations(tip: DatabaseTip, count: number = 3): Promise<any[]> {
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      const enhanced = await this.enhanceTip(tip);
      variations.push({
        version: i + 1,
        content: enhanced.enhancedContent,
        metadata: enhanced.metadata
      });
      await this.delay(this.rateLimitDelay);
    }
    
    return variations;
  }

  // Optimize content for specific platform
  async optimizeForPlatform(tip: GrokEnhancedTip, platform: 'pdf' | 'canva' | 'web'): Promise<any> {
    // For now, return the existing enhanced content
    // In a full implementation, this would call a specialized edge function
    console.log(`Platform optimization for ${platform} requested, returning enhanced content`);
    return tip.enhancedContent;
  }

  // Helper function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get mock response for development
  private getMockResponse(): any {
    return {
      choices: [{
        message: {
          content: JSON.stringify(this.getDefaultEnhancedContent())
        }
      }],
      usage: {
        total_tokens: 500
      }
    };
  }

  // Get default enhanced content structure
  private getDefaultEnhancedContent(): GrokEnhancedTip['enhancedContent'] {
    return {
      expandedDescription: 'Enhanced description with more detail and context...',
      detailedBenefits: [
        'Benefit 1: Improved productivity by 25%',
        'Benefit 2: Better work-life balance',
        'Benefit 3: Reduced stress levels'
      ],
      implementationSteps: [
        'Step 1: Start with small changes',
        'Step 2: Track your progress',
        'Step 3: Adjust as needed'
      ],
      proTips: [
        'Pro tip 1: Consistency is key',
        'Pro tip 2: Measure your results'
      ],
      commonMistakes: [
        'Mistake 1: Trying to change too much at once',
        'Mistake 2: Not tracking progress'
      ],
      successMetrics: [
        'Metric 1: Daily completion rate',
        'Metric 2: Weekly progress score'
      ],
      relatedTips: [
        'Related tip 1: Morning routine optimization',
        'Related tip 2: Energy management'
      ],
      visualDescription: 'Clean, modern design with category-specific colors and icons',
      socialMediaPosts: {
        twitter: 'Transform your life with this simple tip! 🚀 #BetterDaysBetterTomorrow',
        instagram: '✨ Ready for a positive change? Try this tip today! 💪 #BDBT #SelfImprovement',
        linkedin: 'Discover how this simple strategy can improve your professional performance.'
      },
      emailContent: 'Subject: Your daily tip for success\n\nDear reader, here\'s a powerful tip...',
      landingPageCopy: 'Headline: Transform Your Life Today\n\nSection 1: The problem...\nSection 2: The solution...\nSection 3: Take action...'
    };
  }

  // Calculate API costs
  calculateApiCosts(tips: GrokEnhancedTip[]): {
    totalTokens: number;
    estimatedCost: number;
    processingTime: number;
  } {
    const totalTokens = tips.reduce((sum, tip) => sum + (tip.metadata.tokens || 0), 0);
    const processingTime = tips.reduce((sum, tip) => sum + tip.metadata.processingTime, 0);
    
    // Grok API pricing (example rates)
    const costPer1kTokens = 0.001; // $0.001 per 1k tokens
    const estimatedCost = (totalTokens / 1000) * costPer1kTokens;
    
    return {
      totalTokens,
      estimatedCost,
      processingTime
    };
  }
}

// Export singleton instance
export const grokApiService = new GrokApiService();