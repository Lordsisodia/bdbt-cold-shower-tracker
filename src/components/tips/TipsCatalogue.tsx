import React, { useState, useEffect, useMemo } from 'react';
import { Tip, TipCategory, TipDifficulty, TipFilter } from '../../types/tip';
import { tipsService } from '../../services/tipsService';
import { pdfGenerator } from '../../services/pdfGenerator';
import { TipCard } from './TipCard';
import { TipDetail } from './TipDetail';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type SortBy = 'newest' | 'popular' | 'trending' | 'readTime';

export const TipsCatalogue: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [filter, setFilter] = useState<TipFilter>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    loadTips();
  }, [filter, sortBy]);

  const loadTips = () => {
    const filteredTips = filter ? tipsService.filterTips(filter) : tipsService.getAllTips();
    const sortedTips = tipsService.getTipsSortedBy(sortBy);
    setTips(sortedTips.filter(tip => filteredTips.includes(tip)));
  };

  const paginatedTips = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tips.slice(startIndex, endIndex);
  }, [tips, currentPage]);

  const totalPages = Math.ceil(tips.length / pageSize);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilter({ ...filter, searchTerm: value });
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category?: TipCategory) => {
    setFilter({ ...filter, category });
    setCurrentPage(1);
  };

  const handleDifficultyFilter = (difficulty?: TipDifficulty) => {
    setFilter({ ...filter, difficulty });
    setCurrentPage(1);
  };

  const handleViewTip = (tipId: string) => {
    const tip = tipsService.getTipById(tipId);
    if (tip) {
      tipsService.incrementViewCount(tipId);
      setSelectedTip(tip);
    }
  };

  const handleDownloadTip = async (tipId: string) => {
    const tip = tipsService.getTipById(tipId);
    if (tip) {
      tipsService.incrementDownloadCount(tipId);
      const pdfBlob = pdfGenerator.generateTipPDF(tip);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BDBT-${tip.category}-${tip.content.title.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleBack = () => {
    setSelectedTip(null);
  };

  const stats = tipsService.getTipStats();

  if (selectedTip) {
    const relatedTips = tipsService.getRelatedTips(selectedTip.id, 3);
    return (
      <TipDetail
        tip={selectedTip}
        relatedTips={relatedTips}
        onBack={handleBack}
        onDownload={handleDownloadTip}
        onViewRelated={handleViewTip}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Free Tips & Guide Catalogue</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          Transform your life with our comprehensive collection of proven strategies, 
          actionable frameworks, and practical guides.
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-500">
          All completely free for our community.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalTips}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tips</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.byCategory.health}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Health Tips</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.byCategory.wealth}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Wealth Tips</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.byCategory.happiness}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Happiness Tips</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search tips..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
              <option value="readTime">Quick Reads</option>
            </select>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!filter.category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter(undefined)}
                >
                  All Categories
                </Button>
                <Button
                  variant={filter.category === 'health' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter('health')}
                >
                  Health
                </Button>
                <Button
                  variant={filter.category === 'wealth' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter('wealth')}
                >
                  Wealth
                </Button>
                <Button
                  variant={filter.category === 'happiness' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryFilter('happiness')}
                >
                  Happiness
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Difficulty</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!filter.difficulty ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDifficultyFilter(undefined)}
                >
                  All Levels
                </Button>
                <Button
                  variant={filter.difficulty === 'Easy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDifficultyFilter('Easy')}
                >
                  Easy
                </Button>
                <Button
                  variant={filter.difficulty === 'Moderate' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDifficultyFilter('Moderate')}
                >
                  Moderate
                </Button>
                <Button
                  variant={filter.difficulty === 'Advanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDifficultyFilter('Advanced')}
                >
                  Advanced
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }>
        {paginatedTips.map((tip) => (
          <TipCard
            key={tip.id}
            tip={tip}
            onView={handleViewTip}
            onDownload={handleDownloadTip}
            compact={viewMode === 'list'}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="px-2">...</span>}
            {totalPages > 5 && (
              <Button
                variant={currentPage === totalPages ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Download All Button */}
      <div className="text-center mt-8">
        <Button
          size="lg"
          className="flex items-center gap-2 mx-auto"
          onClick={async () => {
            const allTips = tipsService.getAllTips();
            const pdfBlob = pdfGenerator.generateCataloguePDF(allTips);
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `BDBT-Complete-Tips-Catalogue-${new Date().toISOString().split('T')[0]}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="w-5 h-5" />
          Download Complete Catalogue (PDF)
        </Button>
      </div>
    </div>
  );
};