// Canva API Integration for BDBT Tips
// Note: Canva Connect API requires approval and partnership

export interface CanvaDesignData {
  tipId: number;
  title: string;
  subtitle: string;
  category: string;
  benefits: string[];
  whatsIncluded: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  branding: {
    logo: string;
    website: string;
    tagline: string;
  };
}

export class CanvaIntegrationService {
  private apiKey: string;
  private brandId: string;
  private templateIds: Map<string, string>;

  constructor() {
    this.apiKey = process.env.REACT_APP_CANVA_API_KEY || '';
    this.brandId = process.env.REACT_APP_CANVA_BRAND_ID || '';
    
    // Map of template IDs for different tip types
    this.templateIds = new Map([
      ['health-easy', 'DAFyGhIjKlM'],
      ['health-moderate', 'DAFyGhIjKlN'],
      ['health-advanced', 'DAFyGhIjKlO'],
      ['wealth-easy', 'DAFyGhIjKlP'],
      ['wealth-moderate', 'DAFyGhIjKlQ'],
      ['wealth-advanced', 'DAFyGhIjKlR'],
      ['happiness-easy', 'DAFyGhIjKlS'],
      ['happiness-moderate', 'DAFyGhIjKlT'],
      ['happiness-advanced', 'DAFyGhIjKlU'],
      ['default', 'DAFyGhIjKlV']
    ]);
  }

  // Create a design from tip data
  async createDesignFromTip(tipData: CanvaDesignData): Promise<{ designId: string; editUrl: string; exportUrl: string }> {
    const templateKey = `${tipData.category.toLowerCase()}-${tipData.category.toLowerCase()}`;
    const templateId = this.templateIds.get(templateKey) || this.templateIds.get('default')!;

    // Prepare design data for Canva
    const designData = {
      template_id: templateId,
      brand_id: this.brandId,
      data: {
        // Text elements
        title: this.truncateText(tipData.title, 60),
        subtitle: this.truncateText(tipData.subtitle, 120),
        category: tipData.category.toUpperCase(),
        
        // Benefits section
        benefit1: tipData.benefits[0] || '',
        benefit2: tipData.benefits[1] || '',
        benefit3: tipData.benefits[2] || '',
        
        // What's included section (up to 5 items)
        include1: tipData.whatsIncluded[0] || '',
        include2: tipData.whatsIncluded[1] || '',
        include3: tipData.whatsIncluded[2] || '',
        include4: tipData.whatsIncluded[3] || '',
        include5: tipData.whatsIncluded[4] || '',
        
        // Colors
        primaryColor: tipData.colors.primary,
        secondaryColor: tipData.colors.secondary,
        accentColor: tipData.colors.accent,
        
        // Branding
        logoUrl: tipData.branding.logo,
        website: tipData.branding.website,
        tagline: tipData.branding.tagline
      }
    };

    // Mock response for development
    // In production, this would make an actual API call to Canva
    if (!this.apiKey) {
      console.log('Canva API Key not configured. Using mock data.');
      
      // Simulate API call delay
      await this.delay(1000 + Math.random() * 1000);
      
      return {
        designId: `mock_design_${tipData.tipId}`,
        editUrl: `https://www.canva.com/design/mock_${tipData.tipId}/edit`,
        exportUrl: `https://www.canva.com/api/export/mock_${tipData.tipId}`,
        previewUrl: `https://export-download.canva.com/mock_${tipData.tipId}/1/0/0001-1234567890.png`,
        status: 'ready'
      };
    }

    try {
      // Actual Canva API call would go here
      // const response = await fetch('https://api.canva.com/v1/designs', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(designData)
      // });
      
      // const result = await response.json();
      
      // For now, return mock data
      return {
        designId: `design_${tipData.tipId}`,
        editUrl: `https://www.canva.com/design/${tipData.tipId}/edit`,
        exportUrl: `https://www.canva.com/api/export/${tipData.tipId}`
      };
    } catch (error) {
      console.error('Error creating Canva design:', error);
      throw error;
    }
  }

  // Batch create designs for multiple tips
  async batchCreateDesigns(tipsData: CanvaDesignData[]): Promise<any[]> {
    const results = [];
    
    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < tipsData.length; i += batchSize) {
      const batch = tipsData.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(tip => this.createDesignFromTip(tip))
      );
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < tipsData.length) {
        await this.delay(1000);
      }
    }
    
    return results;
  }

  // Export design as PDF
  async exportDesignAsPDF(designId: string): Promise<string> {
    // Mock implementation
    if (!this.apiKey) {
      return `https://mockcdn.canva.com/exports/${designId}.pdf`;
    }

    try {
      // Actual Canva export API call would go here
      // const response = await fetch(`https://api.canva.com/v1/designs/${designId}/export`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     format: 'pdf',
      //     quality: 'print'
      //   })
      // });
      
      return `https://cdn.canva.com/exports/${designId}.pdf`;
    } catch (error) {
      console.error('Error exporting design:', error);
      throw error;
    }
  }

  // Get Canva template preview
  async getTemplatePreview(category: string, difficulty: string): Promise<string> {
    const templateKey = `${category.toLowerCase()}-${difficulty.toLowerCase()}`;
    const templateId = this.templateIds.get(templateKey) || this.templateIds.get('default')!;
    
    // Return preview URL (mock for now)
    return `https://canva.com/templates/preview/${templateId}`;
  }

  // Helper function to truncate text
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Helper function for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get design status
  async getDesignStatus(designId: string): Promise<{
    status: 'processing' | 'ready' | 'failed';
    editUrl?: string;
    exportUrl?: string;
    error?: string;
  }> {
    // Mock implementation
    return {
      status: 'ready',
      editUrl: `https://www.canva.com/design/${designId}/edit`,
      exportUrl: `https://www.canva.com/api/export/${designId}`
    };
  }

  // Create branded templates for BDBT
  getBrandingData(): any {
    return {
      logo: '/images/bdbt-logo.png',
      website: 'www.bdbt.com',
      tagline: 'Better Days, Better Tomorrow',
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        accent: '#fbbf24',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Inter',
        accent: 'Playfair Display'
      }
    };
  }
}

// Canva design templates structure
export const canvaTemplates = {
  fourPage: {
    pages: [
      {
        name: 'Cover',
        elements: ['title', 'subtitle', 'category', 'logo', 'decorative']
      },
      {
        name: 'Benefits',
        elements: ['benefitsTitle', 'benefit1', 'benefit2', 'benefit3', 'icon']
      },
      {
        name: 'What\'s Included',
        elements: ['includesTitle', 'item1', 'item2', 'item3', 'item4', 'item5']
      },
      {
        name: 'Call to Action',
        elements: ['ctaTitle', 'website', 'tagline', 'qrCode', 'socialMedia']
      }
    ]
  },
  singlePage: {
    pages: [
      {
        name: 'Complete Tip',
        elements: [
          'title',
          'subtitle',
          'benefits',
          'includes',
          'logo',
          'website',
          'category'
        ]
      }
    ]
  },
  social: {
    instagram: {
      story: { width: 1080, height: 1920 },
      post: { width: 1080, height: 1080 },
      carousel: { width: 1080, height: 1080 }
    },
    facebook: {
      post: { width: 1200, height: 630 },
      cover: { width: 1640, height: 859 }
    },
    twitter: {
      post: { width: 1024, height: 512 }
    }
  }
};

// Export singleton instance
export const canvaService = new CanvaIntegrationService();