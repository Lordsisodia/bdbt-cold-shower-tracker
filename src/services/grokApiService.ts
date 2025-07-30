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
    this.apiKey = process.env.REACT_APP_GROK_API_KEY || '';
  }

  // Enhance a single tip with Grok
  async enhanceTip(tip: DatabaseTip): Promise<GrokEnhancedTip> {
    const startTime = Date.now();
    
    const prompt = this.generateEnhancementPrompt(tip);
    
    try {
      const response = await this.callGrokApi(prompt);
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

  // Generate enhancement prompt for Grok
  private generateEnhancementPrompt(tip: DatabaseTip): string {
    return `
You are an expert content creator and marketing strategist. Enhance the following tip to create comprehensive content for multiple output formats.

Original Tip:
Title: ${tip.title}
Subtitle: ${tip.subtitle}
Category: ${tip.category}
Difficulty: ${tip.difficulty}
Description: ${tip.description}
Primary Benefit: ${tip.primary_benefit}
Secondary Benefit: ${tip.secondary_benefit}
Tertiary Benefit: ${tip.tertiary_benefit}
Implementation: ${tip.implementation_time} | ${tip.frequency} | ${tip.cost}

Please provide enhanced content in the following JSON format:
{
  "expandedDescription": "A detailed 3-4 paragraph description expanding on the original",
  "detailedBenefits": ["5-7 specific, measurable benefits with explanations"],
  "implementationSteps": ["5-10 clear, actionable steps to implement this tip"],
  "proTips": ["3-5 advanced tips for maximum effectiveness"],
  "commonMistakes": ["3-5 common mistakes to avoid"],
  "successMetrics": ["3-5 ways to measure success"],
  "relatedTips": ["3-5 related tip ideas in the same category"],
  "visualDescription": "Detailed description for visual design (colors, imagery, mood)",
  "socialMediaPosts": {
    "twitter": "Engaging tweet (max 280 chars) with hashtags",
    "instagram": "Instagram caption with emojis and hashtags",
    "linkedin": "Professional LinkedIn post"
  },
  "emailContent": "2-3 paragraph email content promoting this tip",
  "landingPageCopy": "Compelling landing page copy with headline and 3 sections"
}

Make the content actionable, engaging, and valuable. Focus on the ${tip.category} category.`;
  }

  // Call Grok API
  private async callGrokApi(prompt: string, retryCount = 0): Promise<any> {
    if (!this.apiKey) {
      // Mock response for development
      return this.getMockResponse();
    }

    try {
      const response = await fetch(`${GROK_API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert content creator specializing in health, wealth, and happiness tips.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        await this.delay(this.rateLimitDelay * (retryCount + 1));
        return this.callGrokApi(prompt, retryCount + 1);
      }
      throw error;
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
    const platformPrompts = {
      pdf: 'Optimize this content for a professional PDF document with clear sections and visual hierarchy',
      canva: 'Optimize this content for visual design with short, impactful text and clear visual elements',
      web: 'Optimize this content for web with SEO-friendly structure, headings, and engaging copy'
    };

    const prompt = `
${platformPrompts[platform]}

Content to optimize:
${JSON.stringify(tip.enhancedContent, null, 2)}

Provide optimized content in JSON format with platform-specific formatting.`;

    const response = await this.callGrokApi(prompt);
    return this.parseGrokResponse(response);
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