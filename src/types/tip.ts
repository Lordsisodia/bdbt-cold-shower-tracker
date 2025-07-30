export type TipCategory = 'health' | 'wealth' | 'happiness';
export type TipDifficulty = 'Easy' | 'Moderate' | 'Advanced';

export interface TipBenefit {
  description: string;
}

export interface TipContent {
  title: string;
  subtitle: string;
  description: string;
  whatsIncluded: string[];
  readTime: number; // in minutes
  benefits: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export interface Tip {
  id: string;
  category: TipCategory;
  difficulty: TipDifficulty;
  content: TipContent;
  tags: string[];
  relatedTips?: string[]; // IDs of related tips
  imageUrl?: string;
  downloadUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  downloadCount: number;
}

export interface TipFilter {
  category?: TipCategory;
  difficulty?: TipDifficulty;
  searchTerm?: string;
  tags?: string[];
}

export interface TipStats {
  totalTips: number;
  byCategory: Record<TipCategory, number>;
  byDifficulty: Record<TipDifficulty, number>;
  mostViewed: string[];
  mostDownloaded: string[];
}