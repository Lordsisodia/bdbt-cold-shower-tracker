import { Grid3X3, List, Search, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Tip } from '../../types/tip';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { TipCard } from './TipCard';

interface TipGridProps {
  tips: Tip[];
  loading?: boolean;
  onViewTip: (tip: Tip) => void;
  onLikeTip?: (tipId: string) => void;
  onBookmarkTip?: (tipId: string) => void;
  onShareTip?: (tip: Tip) => void;
  likedTips?: string[];
  bookmarkedTips?: string[];
}

type SortOption = 'newest' | 'popular' | 'trending' | 'readTime';
type ViewMode = 'grid' | 'list';

export const TipGrid: React.FC<TipGridProps> = ({
  tips,
  loading = false,
  onViewTip,
  onLikeTip,
  onBookmarkTip,
  onShareTip,
  likedTips = [],
  bookmarkedTips = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTips, setFilteredTips] = useState<Tip[]>(tips);

  useEffect(() => {
    let filtered = [...tips];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tip =>
        tip.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.content.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.content.whatsIncluded.some(item => 
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tip => tip.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(tip => tip.difficulty === selectedDifficulty);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.viewCount - a.viewCount;
        case 'trending':
          return (b.likeCount || 0) - (a.likeCount || 0);
        case 'readTime':
          return a.content.readTime - b.content.readTime;
        default:
          return 0;
      }
    });

    setFilteredTips(filtered);
  }, [tips, searchQuery, selectedCategory, selectedDifficulty, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSortBy('newest');
  };

  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (selectedDifficulty !== 'all' ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search tips by title, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="wealth">Wealth</SelectItem>
                    <SelectItem value="happiness">Happiness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Newest First" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="readTime">Reading Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredTips.length} tips found
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' 
            ? `${filteredTips.length} tips found` 
            : `All Tips (${filteredTips.length})`}
        </h2>
      </div>

      {/* Tips Grid or List */}
      {filteredTips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No tips found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your filters or search query
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {filteredTips.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              onView={onViewTip}
              onLike={onLikeTip}
              onBookmark={onBookmarkTip}
              onShare={onShareTip}
              isLiked={likedTips.includes(tip.id)}
              isBookmarked={bookmarkedTips.includes(tip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};