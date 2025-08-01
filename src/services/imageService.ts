import { DatabaseTip } from './tipsDatabaseService';

// Image category mappings
export interface ImageQuery {
  category: 'health' | 'wealth' | 'happiness';
  subcategory?: string;
  style?: 'lifestyle' | 'abstract' | 'nature' | 'business' | 'wellness';
  context?: 'hero' | 'benefits' | 'implementation' | 'cta';
}

export interface ImageResult {
  url: string;
  thumbnailUrl: string;
  alt: string;
  source: 'local' | 'unsplash' | 'pixabay' | 'pexels';
  credit?: string;
  id: string;
}

class ImageService {
  private unsplashAccessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY || '';
  private pixabayKey = process.env.REACT_APP_PIXABAY_KEY || '';
  private pexelsKey = process.env.REACT_APP_PEXELS_KEY || '';
  
  // Local image cache
  private localImages: Record<string, ImageResult[]> = {};
  private imageCache = new Map<string, ImageResult>();

  constructor() {
    this.initializeLocalImages();
  }

  // Initialize local image database
  private initializeLocalImages() {
    // Pre-curated high-quality images for each category
    this.localImages = {
      'health-hero': [
        {
          url: '/images/health/hero/morning-yoga-1.jpg',
          thumbnailUrl: '/images/health/hero/thumbs/morning-yoga-1.jpg',
          alt: 'Person doing morning yoga stretches',
          source: 'local',
          id: 'health-hero-1'
        },
        {
          url: '/images/health/hero/healthy-breakfast-1.jpg', 
          thumbnailUrl: '/images/health/hero/thumbs/healthy-breakfast-1.jpg',
          alt: 'Nutritious breakfast bowl with fruits',
          source: 'local',
          id: 'health-hero-2'
        },
        {
          url: '/images/health/hero/meditation-1.jpg',
          thumbnailUrl: '/images/health/hero/thumbs/meditation-1.jpg', 
          alt: 'Peaceful meditation scene',
          source: 'local',
          id: 'health-hero-3'
        }
      ],
      'wealth-hero': [
        {
          url: '/images/wealth/hero/business-growth-1.jpg',
          thumbnailUrl: '/images/wealth/hero/thumbs/business-growth-1.jpg',
          alt: 'Growing business chart and plants',
          source: 'local',
          id: 'wealth-hero-1'
        },
        {
          url: '/images/wealth/hero/investment-1.jpg',
          thumbnailUrl: '/images/wealth/hero/thumbs/investment-1.jpg',
          alt: 'Investment planning workspace',
          source: 'local', 
          id: 'wealth-hero-2'
        },
        {
          url: '/images/wealth/hero/success-1.jpg',
          thumbnailUrl: '/images/wealth/hero/thumbs/success-1.jpg',
          alt: 'Professional success celebration',
          source: 'local',
          id: 'wealth-hero-3'
        }
      ],
      'happiness-hero': [
        {
          url: '/images/happiness/hero/joy-1.jpg',
          thumbnailUrl: '/images/happiness/hero/thumbs/joy-1.jpg',
          alt: 'Person expressing genuine joy',
          source: 'local',
          id: 'happiness-hero-1'
        },
        {
          url: '/images/happiness/hero/friendship-1.jpg',
          thumbnailUrl: '/images/happiness/hero/thumbs/friendship-1.jpg',
          alt: 'Friends enjoying time together',
          source: 'local',
          id: 'happiness-hero-2'
        },
        {
          url: '/images/happiness/hero/gratitude-1.jpg',
          thumbnailUrl: '/images/happiness/hero/thumbs/gratitude-1.jpg',
          alt: 'Gratitude journaling moment',
          source: 'local',
          id: 'happiness-hero-3'
        }
      ]
    };
  }

  // Main method to get image for tip context
  async getImageForTip(tip: DatabaseTip, context: 'hero' | 'benefits' | 'implementation' | 'cta'): Promise<ImageResult> {
    const query: ImageQuery = {
      category: tip.category,
      subcategory: tip.subcategory,
      context
    };

    // Try local images first (fast)
    const localImage = this.getLocalImage(query);
    if (localImage) {
      return localImage;
    }

    // Fallback to API (more variety)
    return await this.getApiImage(query);
  }

  // Get multiple images for variety
  async getImagesForTip(tip: DatabaseTip, count: number = 4): Promise<Record<string, ImageResult>> {
    const contexts: Array<'hero' | 'benefits' | 'implementation' | 'cta'> = 
      ['hero', 'benefits', 'implementation', 'cta'];
    
    const images: Record<string, ImageResult> = {};
    
    for (const context of contexts) {
      images[context] = await this.getImageForTip(tip, context);
    }
    
    return images;
  }

  // Get local image (instant)
  private getLocalImage(query: ImageQuery): ImageResult | null {
    const key = `${query.category}-${query.context}`;
    const categoryImages = this.localImages[key];
    
    if (categoryImages && categoryImages.length > 0) {
      // Return random image from local collection
      const randomIndex = Math.floor(Math.random() * categoryImages.length);
      return categoryImages[randomIndex];
    }
    
    return null;
  }

  // Get API image with fallback chain
  private async getApiImage(query: ImageQuery): Promise<ImageResult> {
    const cacheKey = `${query.category}-${query.context}-${query.subcategory}`;
    
    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Try Unsplash first (highest quality)
    try {
      const unsplashImage = await this.getUnsplashImage(query);
      if (unsplashImage) {
        this.imageCache.set(cacheKey, unsplashImage);
        return unsplashImage;
      }
    } catch (error) {
      console.warn('Unsplash API failed:', error);
    }

    // Fallback to Pixabay
    try {
      const pixabayImage = await this.getPixabayImage(query);
      if (pixabayImage) {
        this.imageCache.set(cacheKey, pixabayImage);
        return pixabayImage;
      }
    } catch (error) {
      console.warn('Pixabay API failed:', error);
    }

    // Final fallback to default placeholder
    return this.getDefaultImage(query);
  }

  // Unsplash API integration
  private async getUnsplashImage(query: ImageQuery): Promise<ImageResult | null> {
    if (!this.unsplashAccessKey) return null;

    const searchTerms = this.getSearchTerms(query);
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerms.join(' '))}&orientation=landscape&w=800&h=600`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${this.unsplashAccessKey}`
      }
    });

    if (!response.ok) throw new Error('Unsplash API error');

    const data = await response.json();
    return {
      url: data.urls.regular,
      thumbnailUrl: data.urls.thumb,
      alt: data.alt_description || `${query.category} related image`,
      source: 'unsplash',
      credit: `Photo by ${data.user.name} on Unsplash`,
      id: data.id
    };
  }

  // Pixabay API integration  
  private async getPixabayImage(query: ImageQuery): Promise<ImageResult | null> {
    if (!this.pixabayKey) return null;

    const searchTerms = this.getSearchTerms(query);
    const url = `https://pixabay.com/api/?key=${this.pixabayKey}&q=${encodeURIComponent(searchTerms.join(' '))}&image_type=photo&orientation=horizontal&category=lifestyle&min_width=800&min_height=600`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Pixabay API error');

    const data = await response.json();
    if (data.hits && data.hits.length > 0) {
      const hit = data.hits[0];
      return {
        url: hit.webformatURL,
        thumbnailUrl: hit.previewURL,
        alt: hit.tags || `${query.category} related image`,
        source: 'pixabay',
        credit: `Image by ${hit.user} from Pixabay`,
        id: hit.id.toString()
      };
    }

    return null;
  }

  // Generate search terms based on query
  private getSearchTerms(query: ImageQuery): string[] {
    const baseTerms: Record<string, string[]> = {
      health: ['wellness', 'fitness', 'healthy living', 'nutrition', 'mental health'],
      wealth: ['success', 'business', 'finance', 'investment', 'growth'],
      happiness: ['joy', 'mindfulness', 'gratitude', 'relationships', 'life satisfaction']
    };

    const contextTerms: Record<string, string[]> = {
      hero: ['lifestyle', 'inspiring', 'motivation'],
      benefits: ['positive', 'improvement', 'results'],
      implementation: ['action', 'steps', 'practice'],
      cta: ['success', 'achievement', 'transformation']
    };

    const terms = [
      ...baseTerms[query.category],
      ...(query.context ? contextTerms[query.context] : [])
    ];

    if (query.subcategory) {
      terms.push(query.subcategory);
    }

    return terms.slice(0, 3); // Limit to 3 most relevant terms
  }

  // Default fallback image
  private getDefaultImage(query: ImageQuery): ImageResult {
    const defaultUrls = {
      health: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      wealth: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop&q=80', 
      happiness: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80'
    };

    return {
      url: defaultUrls[query.category],
      thumbnailUrl: defaultUrls[query.category],
      alt: `${query.category} placeholder image`,
      source: 'local',
      id: `default-${query.category}`
    };
  }

  // Bulk download and setup local images (dev utility)
  async downloadAndSetupLocalImages(): Promise<void> {
    // This would be used during development to populate local image folder
    console.log('Use this method to download curated images to local storage');
    
    const categories = ['health', 'wealth', 'happiness'];
    const contexts = ['hero', 'benefits', 'implementation', 'cta'];
    
    for (const category of categories) {
      for (const context of contexts) {
        const query = { category: category as any, context: context as any };
        // Download 10 images per category-context combination
        // Store in /public/images/{category}/{context}/
      }
    }
  }

  // Get random image from any category (for variety)
  async getRandomImage(): Promise<ImageResult> {
    const categories: Array<'health' | 'wealth' | 'happiness'> = ['health', 'wealth', 'happiness'];
    const contexts: Array<'hero' | 'benefits' | 'implementation' | 'cta'> = ['hero', 'benefits', 'implementation', 'cta'];
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
    
    const query = { category: randomCategory, context: randomContext };
    return await this.getApiImage(query);
  }

  // Health check for APIs
  async checkApiHealth(): Promise<Record<string, boolean>> {
    const health = {
      unsplash: false,
      pixabay: false,
      pexels: false
    };

    // Test Unsplash
    if (this.unsplashAccessKey) {
      try {
        const response = await fetch('https://api.unsplash.com/photos/random?w=100&h=100', {
          headers: { 'Authorization': `Client-ID ${this.unsplashAccessKey}` }
        });
        health.unsplash = response.ok;
      } catch (e) {}
    }

    // Test Pixabay
    if (this.pixabayKey) {
      try {
        const response = await fetch(`https://pixabay.com/api/?key=${this.pixabayKey}&q=test&per_page=3`);
        health.pixabay = response.ok;
      } catch (e) {}
    }

    return health;
  }
}

export const imageService = new ImageService();