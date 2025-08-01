import { RealTip } from '../data/realTipsCollection';

// Interface for TipsPage component
export interface Tip {
  id: string;
  category: 'health' | 'wealth' | 'happiness';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  title: string;
  description: string;
  includes: string[];
  readTime: number;
  downloads?: number;
  isFeatured?: boolean;
  subtitle?: string;
  tags?: string[];
  scientificBacking?: boolean;
  implementationTime?: string;
  frequency?: string;
  cost?: string;
}

/**
 * Converts RealTip format to TipsPage Tip format
 */
export function convertRealTipToTip(realTip: RealTip, index: number): Tip {
  // Calculate read time based on content length (rough estimate)
  const contentLength = realTip.description.length + realTip.whatsIncluded.join(' ').length;
  const wordsPerMinute = 200;
  const readTime = Math.max(3, Math.ceil(contentLength / (wordsPerMinute * 5))); // Min 3 minutes

  // Generate pseudo-random download count based on title hash
  const titleHash = realTip.title.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const downloads = Math.abs(titleHash % 2000) + 100; // Between 100-2100

  return {
    id: `tip-${index + 1}`,
    category: realTip.category,
    difficulty: realTip.difficulty,
    title: realTip.title,
    description: realTip.description,
    includes: realTip.whatsIncluded,
    readTime,
    downloads,
    isFeatured: realTip.scientificBacking && Math.random() > 0.8, // 20% of science-backed tips are featured
    subtitle: realTip.subtitle,
    tags: realTip.tags,
    scientificBacking: realTip.scientificBacking,
    implementationTime: realTip.implementation.time,
    frequency: realTip.implementation.frequency,
    cost: realTip.implementation.cost
  };
}

/**
 * Converts array of RealTips to Tips for TipsPage
 */
export function convertRealTipsToTips(realTips: RealTip[]): Tip[] {
  return realTips.map((realTip, index) => convertRealTipToTip(realTip, index));
}

/**
 * Gets a curated selection of tips (not all variations)
 * Returns base tips without auto-generated variations for better quality
 */
export function getCuratedTips(realTips: RealTip[]): Tip[] {
  // Filter out auto-generated variations to avoid duplicates
  const variationPrefixes = ['Beginner ', 'Advanced ', 'Quick ', 'Comprehensive ', 'Budget ', 'Premium '];
  
  const baseTips = realTips.filter(tip => 
    !variationPrefixes.some(prefix => tip.title.startsWith(prefix))
  );
  
  return convertRealTipsToTips(baseTips);
}

/**
 * Gets tips filtered by category
 */
export function getTipsByCategory(tips: Tip[], category: 'all' | 'health' | 'wealth' | 'happiness'): Tip[] {
  if (category === 'all') return tips;
  return tips.filter(tip => tip.category === category);
}

/**
 * Sorts tips based on criteria
 */
export function sortTips(tips: Tip[], sortBy: 'newest' | 'popular' | 'difficulty'): Tip[] {
  switch (sortBy) {
    case 'popular':
      return [...tips].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    case 'difficulty':
      const difficultyOrder = { 'Easy': 1, 'Moderate': 2, 'Advanced': 3 };
      return [...tips].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case 'newest':
    default:
      // Simulate newest first by reversing order (since we don't have creation dates)
      return [...tips].reverse();
  }
}

/**
 * Searches tips based on query
 */
export function searchTips(tips: Tip[], query: string): Tip[] {
  if (!query.trim()) return tips;
  
  const lowercaseQuery = query.toLowerCase();
  return tips.filter(tip => 
    tip.title.toLowerCase().includes(lowercaseQuery) ||
    tip.description.toLowerCase().includes(lowercaseQuery) ||
    tip.includes.some(item => item.toLowerCase().includes(lowercaseQuery)) ||
    (tip.tags && tip.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
}