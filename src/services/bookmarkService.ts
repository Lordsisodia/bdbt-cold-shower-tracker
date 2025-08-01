import { DatabaseTip } from './tipsDatabaseService';

export interface Bookmark {
  id: string;
  userId: string;
  tipId: number;
  tipTitle: string;
  tipCategory: string;
  tipSlug?: string;
  bookmarkedAt: string;
  notes?: string;
  tags?: string[];
  isArchived: boolean;
}

export interface ReadingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tipIds: number[];
  color: string;
}

export interface BookmarkStats {
  totalBookmarks: number;
  bookmarksByCategory: { [category: string]: number };
  recentBookmarks: Bookmark[];
  readingLists: ReadingList[];
  mostBookmarkedTips: { tipId: number; count: number; title: string }[];
}

class BookmarkService {
  private getUserId(): string | null {
    // In production, get from auth context
    const user = localStorage.getItem('bdbt_current_user');
    if (user) {
      return JSON.parse(user).id;
    }
    return null;
  }

  private getStorageKey(userId: string, type: 'bookmarks' | 'reading_lists'): string {
    return `bdbt_${type}_${userId}`;
  }

  // Bookmark a tip
  async bookmarkTip(tip: DatabaseTip, notes?: string, tags?: string[]): Promise<Bookmark> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in to bookmark tips');
    }

    const bookmark: Bookmark = {
      id: this.generateId(),
      userId,
      tipId: tip.id!,
      tipTitle: tip.title,
      tipCategory: tip.category,
      tipSlug: tip.slug,
      bookmarkedAt: new Date().toISOString(),
      notes,
      tags: tags || [],
      isArchived: false
    };

    // Get existing bookmarks
    const bookmarks = await this.getUserBookmarks(userId);
    
    // Check if already bookmarked
    const existingIndex = bookmarks.findIndex(b => b.tipId === tip.id);
    if (existingIndex >= 0) {
      // Update existing bookmark
      bookmarks[existingIndex] = { ...bookmarks[existingIndex], ...bookmark };
    } else {
      // Add new bookmark
      bookmarks.push(bookmark);
    }

    // Save to storage
    localStorage.setItem(this.getStorageKey(userId, 'bookmarks'), JSON.stringify(bookmarks));

    // Add to default reading list
    await this.addToDefaultReadingList(userId, tip.id!);

    return bookmark;
  }

  // Remove bookmark
  async removeBookmark(tipId: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const bookmarks = await this.getUserBookmarks(userId);
    const filtered = bookmarks.filter(b => b.tipId !== tipId);
    
    localStorage.setItem(this.getStorageKey(userId, 'bookmarks'), JSON.stringify(filtered));

    // Remove from all reading lists
    await this.removeFromAllReadingLists(userId, tipId);
  }

  // Check if tip is bookmarked
  async isBookmarked(tipId: number): Promise<boolean> {
    const userId = this.getUserId();
    if (!userId) return false;

    const bookmarks = await this.getUserBookmarks(userId);
    return bookmarks.some(b => b.tipId === tipId && !b.isArchived);
  }

  // Get user's bookmarks
  async getUserBookmarks(userId?: string): Promise<Bookmark[]> {
    const currentUserId = userId || this.getUserId();
    if (!currentUserId) return [];

    try {
      const stored = localStorage.getItem(this.getStorageKey(currentUserId, 'bookmarks'));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Archive/unarchive bookmark
  async toggleArchiveBookmark(tipId: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const bookmarks = await this.getUserBookmarks(userId);
    const bookmarkIndex = bookmarks.findIndex(b => b.tipId === tipId);
    
    if (bookmarkIndex >= 0) {
      bookmarks[bookmarkIndex].isArchived = !bookmarks[bookmarkIndex].isArchived;
      localStorage.setItem(this.getStorageKey(userId, 'bookmarks'), JSON.stringify(bookmarks));
    }
  }

  // Update bookmark notes
  async updateBookmarkNotes(tipId: number, notes: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const bookmarks = await this.getUserBookmarks(userId);
    const bookmarkIndex = bookmarks.findIndex(b => b.tipId === tipId);
    
    if (bookmarkIndex >= 0) {
      bookmarks[bookmarkIndex].notes = notes;
      localStorage.setItem(this.getStorageKey(userId, 'bookmarks'), JSON.stringify(bookmarks));
    }
  }

  // Create reading list
  async createReadingList(
    name: string, 
    description?: string, 
    color: string = '#3B82F6',
    isPublic: boolean = false
  ): Promise<ReadingList> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const readingList: ReadingList = {
      id: this.generateId(),
      userId,
      name,
      description,
      isDefault: false,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tipIds: [],
      color
    };

    const readingLists = await this.getUserReadingLists(userId);
    readingLists.push(readingList);
    
    localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(readingLists));

    return readingList;
  }

  // Get user's reading lists
  async getUserReadingLists(userId?: string): Promise<ReadingList[]> {
    const currentUserId = userId || this.getUserId();
    if (!currentUserId) return [];

    try {
      const stored = localStorage.getItem(this.getStorageKey(currentUserId, 'reading_lists'));
      let lists = stored ? JSON.parse(stored) : [];
      
      // Ensure default reading list exists
      if (!lists.some((list: ReadingList) => list.isDefault)) {
        const defaultList: ReadingList = {
          id: 'default',
          userId: currentUserId,
          name: 'My Bookmarks',
          description: 'All your bookmarked tips',
          isDefault: true,
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tipIds: [],
          color: '#3B82F6'
        };
        lists.unshift(defaultList);
        localStorage.setItem(this.getStorageKey(currentUserId, 'reading_lists'), JSON.stringify(lists));
      }
      
      return lists;
    } catch {
      return [];
    }
  }

  // Add tip to reading list
  async addToReadingList(listId: string, tipId: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const readingLists = await this.getUserReadingLists(userId);
    const listIndex = readingLists.findIndex(list => list.id === listId);
    
    if (listIndex >= 0) {
      if (!readingLists[listIndex].tipIds.includes(tipId)) {
        readingLists[listIndex].tipIds.push(tipId);
        readingLists[listIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(readingLists));
      }
    }
  }

  // Remove tip from reading list
  async removeFromReadingList(listId: string, tipId: number): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const readingLists = await this.getUserReadingLists(userId);
    const listIndex = readingLists.findIndex(list => list.id === listId);
    
    if (listIndex >= 0) {
      readingLists[listIndex].tipIds = readingLists[listIndex].tipIds.filter(id => id !== tipId);
      readingLists[listIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(readingLists));
    }
  }

  // Add to default reading list
  private async addToDefaultReadingList(userId: string, tipId: number): Promise<void> {
    const readingLists = await this.getUserReadingLists(userId);
    const defaultList = readingLists.find(list => list.isDefault);
    
    if (defaultList && !defaultList.tipIds.includes(tipId)) {
      defaultList.tipIds.push(tipId);
      defaultList.updatedAt = new Date().toISOString();
      localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(readingLists));
    }
  }

  // Remove from all reading lists
  private async removeFromAllReadingLists(userId: string, tipId: number): Promise<void> {
    const readingLists = await this.getUserReadingLists(userId);
    
    readingLists.forEach(list => {
      list.tipIds = list.tipIds.filter(id => id !== tipId);
      list.updatedAt = new Date().toISOString();
    });
    
    localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(readingLists));
  }

  // Delete reading list
  async deleteReadingList(listId: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const readingLists = await this.getUserReadingLists(userId);
    const filtered = readingLists.filter(list => list.id !== listId && !list.isDefault);
    
    localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(filtered));
  }

  // Update reading list
  async updateReadingList(
    listId: string, 
    updates: Partial<Pick<ReadingList, 'name' | 'description' | 'color' | 'isPublic'>>
  ): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const readingLists = await this.getUserReadingLists(userId);
    const listIndex = readingLists.findIndex(list => list.id === listId);
    
    if (listIndex >= 0) {
      readingLists[listIndex] = {
        ...readingLists[listIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.getStorageKey(userId, 'reading_lists'), JSON.stringify(readingLists));
    }
  }

  // Get bookmark statistics
  async getBookmarkStats(): Promise<BookmarkStats> {
    const userId = this.getUserId();
    if (!userId) {
      return {
        totalBookmarks: 0,
        bookmarksByCategory: {},
        recentBookmarks: [],
        readingLists: [],
        mostBookmarkedTips: []
      };
    }

    const bookmarks = await this.getUserBookmarks(userId);
    const readingLists = await this.getUserReadingLists(userId);
    
    // Calculate stats
    const bookmarksByCategory: { [category: string]: number } = {};
    bookmarks.forEach(bookmark => {
      if (!bookmark.isArchived) {
        bookmarksByCategory[bookmark.tipCategory] = 
          (bookmarksByCategory[bookmark.tipCategory] || 0) + 1;
      }
    });

    const recentBookmarks = bookmarks
      .filter(b => !b.isArchived)
      .sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime())
      .slice(0, 10);

    // Mock most bookmarked tips (in production, this would be from analytics)
    const tipCounts: { [tipId: number]: { count: number; title: string } } = {};
    bookmarks.forEach(bookmark => {
      if (!bookmark.isArchived) {
        if (!tipCounts[bookmark.tipId]) {
          tipCounts[bookmark.tipId] = { count: 0, title: bookmark.tipTitle };
        }
        tipCounts[bookmark.tipId].count += 1;
      }
    });

    const mostBookmarkedTips = Object.entries(tipCounts)
      .map(([tipId, data]) => ({
        tipId: parseInt(tipId),
        count: data.count,
        title: data.title
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBookmarks: bookmarks.filter(b => !b.isArchived).length,
      bookmarksByCategory,
      recentBookmarks,
      readingLists,
      mostBookmarkedTips
    };
  }

  // Search bookmarks
  async searchBookmarks(query: string, filters?: {
    category?: string;
    tags?: string[];
    archived?: boolean;
  }): Promise<Bookmark[]> {
    const userId = this.getUserId();
    if (!userId) return [];

    const bookmarks = await this.getUserBookmarks(userId);
    
    return bookmarks.filter(bookmark => {
      // Text search
      const matchesQuery = !query || 
        bookmark.tipTitle.toLowerCase().includes(query.toLowerCase()) ||
        (bookmark.notes && bookmark.notes.toLowerCase().includes(query.toLowerCase()));
      
      // Category filter
      const matchesCategory = !filters?.category || bookmark.tipCategory === filters.category;
      
      // Tags filter
      const matchesTags = !filters?.tags?.length || 
        filters.tags.some(tag => bookmark.tags?.includes(tag));
      
      // Archived filter
      const matchesArchived = filters?.archived === undefined || 
        bookmark.isArchived === filters.archived;
      
      return matchesQuery && matchesCategory && matchesTags && matchesArchived;
    });
  }

  // Export bookmarks
  async exportBookmarks(format: 'json' | 'csv' = 'json'): Promise<string> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User must be logged in');
    }

    const bookmarks = await this.getUserBookmarks(userId);
    const readingLists = await this.getUserReadingLists(userId);

    if (format === 'json') {
      return JSON.stringify({
        bookmarks,
        readingLists,
        exportedAt: new Date().toISOString()
      }, null, 2);
    } else {
      // CSV format
      const headers = 'Title,Category,Bookmarked At,Notes,Tags\n';
      const rows = bookmarks.map(bookmark => 
        `"${bookmark.tipTitle}","${bookmark.tipCategory}","${bookmark.bookmarkedAt}","${bookmark.notes || ''}","${(bookmark.tags || []).join(', ')}"`
      ).join('\n');
      
      return headers + rows;
    }
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Demo: Create sample bookmarks
  async createSampleBookmarks(userId: string): Promise<void> {
    const sampleBookmarks: Bookmark[] = [
      {
        id: 'bookmark-1',
        userId,
        tipId: 1,
        tipTitle: 'Start Your Day with Cold Showers',
        tipCategory: 'health',
        tipSlug: 'start-your-day-with-cold-showers',
        bookmarkedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Great for morning energy boost',
        tags: ['energy', 'morning-routine'],
        isArchived: false
      },
      {
        id: 'bookmark-2',
        userId,
        tipId: 2,
        tipTitle: 'Build Your Emergency Fund in 30 Days',
        tipCategory: 'wealth',
        tipSlug: 'build-emergency-fund-30-days',
        bookmarkedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Essential financial planning',
        tags: ['finance', 'emergency'],
        isArchived: false
      }
    ];

    localStorage.setItem(this.getStorageKey(userId, 'bookmarks'), JSON.stringify(sampleBookmarks));
  }
}

// Export singleton instance
export const bookmarkService = new BookmarkService();