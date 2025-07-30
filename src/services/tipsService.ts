import { Tip, TipFilter, TipStats, TipCategory, TipDifficulty } from '../types/tip';
import { generateTips } from '../data/tipGenerator';

class TipsService {
  private tips: Tip[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (!this.initialized) {
      this.tips = generateTips();
      this.initialized = true;
      console.log(`Generated ${this.tips.length} tips`);
    }
  }

  getAllTips(): Tip[] {
    return [...this.tips];
  }

  getTipById(id: string): Tip | null {
    return this.tips.find(tip => tip.id === id) || null;
  }

  getTipsByCategory(category: TipCategory): Tip[] {
    return this.tips.filter(tip => tip.category === category);
  }

  getTipsByDifficulty(difficulty: TipDifficulty): Tip[] {
    return this.tips.filter(tip => tip.difficulty === difficulty);
  }

  searchTips(searchTerm: string): Tip[] {
    const lowercaseSearch = searchTerm.toLowerCase();
    return this.tips.filter(tip => 
      tip.content.title.toLowerCase().includes(lowercaseSearch) ||
      tip.content.subtitle.toLowerCase().includes(lowercaseSearch) ||
      tip.content.description.toLowerCase().includes(lowercaseSearch) ||
      tip.tags.some(tag => tag.toLowerCase().includes(lowercaseSearch))
    );
  }

  filterTips(filter: TipFilter): Tip[] {
    let filtered = [...this.tips];

    if (filter.category) {
      filtered = filtered.filter(tip => tip.category === filter.category);
    }

    if (filter.difficulty) {
      filtered = filtered.filter(tip => tip.difficulty === filter.difficulty);
    }

    if (filter.searchTerm) {
      const lowercaseSearch = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(tip => 
        tip.content.title.toLowerCase().includes(lowercaseSearch) ||
        tip.content.subtitle.toLowerCase().includes(lowercaseSearch) ||
        tip.content.description.toLowerCase().includes(lowercaseSearch)
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(tip => 
        filter.tags!.some(tag => tip.tags.includes(tag))
      );
    }

    return filtered;
  }

  getRelatedTips(tipId: string, count: number = 5): Tip[] {
    const tip = this.getTipById(tipId);
    if (!tip) return [];

    // Find tips with similar tags or same category
    const related = this.tips
      .filter(t => t.id !== tipId)
      .map(t => ({
        tip: t,
        score: this.calculateRelevanceScore(tip, t)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.tip);

    return related;
  }

  private calculateRelevanceScore(tip1: Tip, tip2: Tip): number {
    let score = 0;

    // Same category
    if (tip1.category === tip2.category) score += 3;

    // Same difficulty
    if (tip1.difficulty === tip2.difficulty) score += 2;

    // Shared tags
    const sharedTags = tip1.tags.filter(tag => tip2.tags.includes(tag));
    score += sharedTags.length;

    return score;
  }

  getTipStats(): TipStats {
    const stats: TipStats = {
      totalTips: this.tips.length,
      byCategory: {
        health: 0,
        wealth: 0,
        happiness: 0
      },
      byDifficulty: {
        Easy: 0,
        Moderate: 0,
        Advanced: 0
      },
      mostViewed: [],
      mostDownloaded: []
    };

    // Count by category and difficulty
    this.tips.forEach(tip => {
      stats.byCategory[tip.category]++;
      stats.byDifficulty[tip.difficulty]++;
    });

    // Get most viewed (top 10)
    stats.mostViewed = [...this.tips]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10)
      .map(tip => tip.id);

    // Get most downloaded (top 10)
    stats.mostDownloaded = [...this.tips]
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, 10)
      .map(tip => tip.id);

    return stats;
  }

  incrementViewCount(tipId: string): void {
    const tip = this.tips.find(t => t.id === tipId);
    if (tip) {
      tip.viewCount++;
      tip.updatedAt = new Date();
    }
  }

  incrementDownloadCount(tipId: string): void {
    const tip = this.tips.find(t => t.id === tipId);
    if (tip) {
      tip.downloadCount++;
      tip.updatedAt = new Date();
    }
  }

  // Get tips for different sorting options
  getTipsSortedBy(sortBy: 'newest' | 'popular' | 'trending' | 'readTime'): Tip[] {
    const sorted = [...this.tips];

    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      case 'popular':
        return sorted.sort((a, b) => b.viewCount - a.viewCount);
      
      case 'trending':
        // Combine recent activity with view count
        return sorted.sort((a, b) => {
          const aScore = a.viewCount * (1 / (Date.now() - a.updatedAt.getTime() + 1));
          const bScore = b.viewCount * (1 / (Date.now() - b.updatedAt.getTime() + 1));
          return bScore - aScore;
        });
      
      case 'readTime':
        return sorted.sort((a, b) => a.content.readTime - b.content.readTime);
      
      default:
        return sorted;
    }
  }

  // Pagination support
  getTipsPaginated(page: number = 1, pageSize: number = 20, filter?: TipFilter): {
    tips: Tip[];
    totalPages: number;
    currentPage: number;
    totalTips: number;
  } {
    const filtered = filter ? this.filterTips(filter) : this.tips;
    const totalTips = filtered.length;
    const totalPages = Math.ceil(totalTips / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      tips: filtered.slice(startIndex, endIndex),
      totalPages,
      currentPage: page,
      totalTips
    };
  }
}

// Export singleton instance
export const tipsService = new TipsService();