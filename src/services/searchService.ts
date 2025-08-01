import { DatabaseTip } from './tipsDatabaseService';

export interface SearchResult {
  tip: DatabaseTip;
  score: number;
  matchedFields: string[];
  highlights: { [field: string]: string };
}

export interface SearchFilters {
  categories?: string[];
  difficulties?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minRating?: number;
  hasVideo?: boolean;
  readTimeRange?: {
    min: number;
    max: number;
  };
}

export interface SearchOptions {
  filters?: SearchFilters;
  sortBy?: 'relevance' | 'date' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class SearchService {
  private searchIndex: Map<string, Set<number>> = new Map();
  private tips: DatabaseTip[] = [];

  // Initialize search index
  async initializeIndex(tips: DatabaseTip[]): Promise<void> {
    this.tips = tips;
    this.searchIndex.clear();

    tips.forEach((tip, index) => {
      if (!tip.id) return;

      // Index different fields
      const searchableText = [
        tip.title,
        tip.subtitle || '',
        tip.description,
        tip.primary_benefit,
        tip.secondary_benefit,
        tip.tertiary_benefit,
        ...(tip.tags || [])
      ].join(' ').toLowerCase();

      // Create n-grams and individual words
      const words = this.tokenize(searchableText);
      
      words.forEach(word => {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set());
        }
        this.searchIndex.get(word)!.add(tip.id!);
      });

      // Add partial matches (prefixes)
      words.forEach(word => {
        for (let i = 2; i <= word.length; i++) {
          const prefix = word.substring(0, i);
          if (!this.searchIndex.has(prefix)) {
            this.searchIndex.set(prefix, new Set());
          }
          this.searchIndex.get(prefix)!.add(tip.id!);
        }
      });
    });

    console.log(`🔍 Search index initialized with ${tips.length} tips and ${this.searchIndex.size} terms`);
  }

  // Tokenize text into searchable terms
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
      .filter(word => !this.isStopWord(word));
  }

  // Check if word is a stop word
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);
    return stopWords.has(word);
  }

  // Perform full-text search
  async search(query: string, options: SearchOptions = {}): Promise<{
    results: SearchResult[];
    total: number;
    facets: {
      categories: { [key: string]: number };
      difficulties: { [key: string]: number };
      tags: { [key: string]: number };
    };
  }> {
    if (!query.trim()) {
      return {
        results: [],
        total: 0,
        facets: { categories: {}, difficulties: {}, tags: {} }
      };
    }

    const queryTerms = this.tokenize(query);
    const candidateIds = new Set<number>();
    const termMatches = new Map<number, Set<string>>();

    // Find candidate tips
    queryTerms.forEach(term => {
      const matchingIds = this.searchIndex.get(term) || new Set();
      matchingIds.forEach(id => {
        candidateIds.add(id);
        if (!termMatches.has(id)) {
          termMatches.set(id, new Set());
        }
        termMatches.get(id)!.add(term);
      });
    });

    // Score and rank results
    const scoredResults: SearchResult[] = [];
    
    candidateIds.forEach(tipId => {
      const tip = this.tips.find(t => t.id === tipId);
      if (!tip) return;

      // Apply filters
      if (!this.passesFilters(tip, options.filters)) return;

      const matchedTerms = termMatches.get(tipId) || new Set();
      const score = this.calculateRelevanceScore(tip, query, queryTerms, matchedTerms);
      const matchedFields = this.getMatchedFields(tip, queryTerms);
      const highlights = this.generateHighlights(tip, queryTerms);

      scoredResults.push({
        tip,
        score,
        matchedFields,
        highlights
      });
    });

    // Sort results
    this.sortResults(scoredResults, options.sortBy || 'relevance', options.sortOrder || 'desc');

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginatedResults = scoredResults.slice(offset, offset + limit);

    // Generate facets
    const facets = this.generateFacets(scoredResults.map(r => r.tip));

    return {
      results: paginatedResults,
      total: scoredResults.length,
      facets
    };
  }

  // Calculate relevance score
  private calculateRelevanceScore(
    tip: DatabaseTip, 
    query: string, 
    queryTerms: string[], 
    matchedTerms: Set<string>
  ): number {
    let score = 0;

    // Term frequency score
    const termCoverage = matchedTerms.size / queryTerms.length;
    score += termCoverage * 100;

    // Field-specific bonuses
    const titleWords = this.tokenize(tip.title);
    const descriptionWords = this.tokenize(tip.description);
    const tagWords = (tip.tags || []).map(tag => tag.toLowerCase());

    queryTerms.forEach(term => {
      // Title matches are most important
      if (titleWords.includes(term)) {
        score += 50;
      }
      
      // Subtitle matches
      if (tip.subtitle && this.tokenize(tip.subtitle).includes(term)) {
        score += 30;
      }
      
      // Tag matches
      if (tagWords.includes(term)) {
        score += 40;
      }
      
      // Description matches
      if (descriptionWords.includes(term)) {
        score += 10;
      }
      
      // Benefit matches
      const benefits = [tip.primary_benefit, tip.secondary_benefit, tip.tertiary_benefit]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (benefits.includes(term)) {
        score += 20;
      }
    });

    // Exact phrase bonus
    const fullText = [tip.title, tip.subtitle, tip.description].join(' ').toLowerCase();
    if (fullText.includes(query.toLowerCase())) {
      score += 75;
    }

    // Quality signals
    if (tip.view_count && tip.view_count > 1000) {
      score += 10;
    }
    
    if (tip.rating && tip.rating > 4) {
      score += 15;
    }
    
    if (tip.is_featured) {
      score += 25;
    }

    // Recency bonus (newer content gets slight boost)
    if (tip.created_at) {
      const daysSinceCreated = (Date.now() - new Date(tip.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 30) {
        score += 5;
      }
    }

    return score;
  }

  // Check if tip passes filters
  private passesFilters(tip: DatabaseTip, filters?: SearchFilters): boolean {
    if (!filters) return true;

    // Category filter
    if (filters.categories && !filters.categories.includes(tip.category)) {
      return false;
    }

    // Difficulty filter
    if (filters.difficulties && !filters.difficulties.includes(tip.difficulty)) {
      return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const tipTags = tip.tags || [];
      const hasMatchingTag = filters.tags.some(tag => tipTags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Date range filter
    if (filters.dateRange && tip.created_at) {
      const createdDate = new Date(tip.created_at);
      if (createdDate < filters.dateRange.start || createdDate > filters.dateRange.end) {
        return false;
      }
    }

    // Rating filter
    if (filters.minRating && (!tip.rating || tip.rating < filters.minRating)) {
      return false;
    }

    // Read time filter
    if (filters.readTimeRange) {
      const estimatedReadTime = Math.ceil(tip.description.length / 200);
      if (estimatedReadTime < filters.readTimeRange.min || 
          estimatedReadTime > filters.readTimeRange.max) {
        return false;
      }
    }

    return true;
  }

  // Get fields that matched the search
  private getMatchedFields(tip: DatabaseTip, queryTerms: string[]): string[] {
    const matchedFields: string[] = [];
    
    const fields = {
      title: tip.title,
      subtitle: tip.subtitle || '',
      description: tip.description,
      tags: (tip.tags || []).join(' ')
    };

    Object.entries(fields).forEach(([fieldName, fieldValue]) => {
      const fieldWords = this.tokenize(fieldValue);
      const hasMatch = queryTerms.some(term => fieldWords.includes(term));
      if (hasMatch) {
        matchedFields.push(fieldName);
      }
    });

    return matchedFields;
  }

  // Generate highlighted text snippets
  private generateHighlights(tip: DatabaseTip, queryTerms: string[]): { [field: string]: string } {
    const highlights: { [field: string]: string } = {};
    
    const fields = {
      title: tip.title,
      subtitle: tip.subtitle || '',
      description: tip.description.substring(0, 200) + '...'
    };

    Object.entries(fields).forEach(([fieldName, fieldValue]) => {
      let highlighted = fieldValue;
      
      queryTerms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        highlighted = highlighted.replace(regex, `<mark>$&</mark>`);
      });
      
      if (highlighted !== fieldValue) {
        highlights[fieldName] = highlighted;
      }
    });

    return highlights;
  }

  // Sort search results
  private sortResults(
    results: SearchResult[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc'
  ): void {
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.tip.created_at || 0).getTime();
          const dateB = new Date(b.tip.created_at || 0).getTime();
          comparison = dateA - dateB;
          break;
          
        case 'popularity':
          comparison = (a.tip.view_count || 0) - (b.tip.view_count || 0);
          break;
          
        case 'rating':
          comparison = (a.tip.rating || 0) - (b.tip.rating || 0);
          break;
          
        case 'relevance':
        default:
          comparison = a.score - b.score;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Generate search facets for filtering
  private generateFacets(tips: DatabaseTip[]): {
    categories: { [key: string]: number };
    difficulties: { [key: string]: number };
    tags: { [key: string]: number };
  } {
    const facets = {
      categories: {} as { [key: string]: number },
      difficulties: {} as { [key: string]: number },
      tags: {} as { [key: string]: number }
    };

    tips.forEach(tip => {
      // Categories
      facets.categories[tip.category] = (facets.categories[tip.category] || 0) + 1;
      
      // Difficulties
      facets.difficulties[tip.difficulty] = (facets.difficulties[tip.difficulty] || 0) + 1;
      
      // Tags
      (tip.tags || []).forEach(tag => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      });
    });

    return facets;
  }

  // Get search suggestions
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Find matching terms in the index
    for (const [term] of this.searchIndex) {
      if (term.startsWith(queryLower) && term !== queryLower) {
        suggestions.add(term);
        if (suggestions.size >= limit * 2) break;
      }
    }

    // Also add popular searches (mock data)
    const popularSearches = [
      'cold shower benefits',
      'emergency fund',
      'morning routine',
      'meditation techniques',
      'budgeting tips',
      'productivity hacks',
      'stress management',
      'healthy habits'
    ];

    popularSearches.forEach(search => {
      if (search.toLowerCase().includes(queryLower)) {
        suggestions.add(search);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Get trending searches
  async getTrendingSearches(): Promise<string[]> {
    // Mock trending searches - in production, this would be from analytics
    return [
      'morning routine',
      'emergency fund',
      'meditation',
      'cold shower',
      'productivity',
      'budgeting',
      'exercise',
      'mindfulness'
    ];
  }

  // Search analytics
  async logSearch(query: string, resultCount: number, clickedResultId?: number): Promise<void> {
    // In production, this would log to analytics service
    console.log('Search logged:', {
      query,
      resultCount,
      clickedResultId,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
export const searchService = new SearchService();