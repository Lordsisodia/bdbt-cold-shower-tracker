import { Calendar, Clock, Search, Star, Tag, X } from 'lucide-react';
import React, { useState } from 'react';
import { SearchFilters } from '../../services/searchService';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: SearchFilters) => void;
  initialQuery?: string;
  initialFilters?: SearchFilters;
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialQuery = '',
  initialFilters = {}
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
    onClose();
  };

  const handleReset = () => {
    setQuery('');
    setFilters({});
  };

  const updateFilters = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: 'categories' | 'difficulties' | 'tags', value: string) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilters(key, newArray.length > 0 ? newArray : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-blue-600" />
              Advanced Search
            </h2>
            <p className="text-gray-600 mt-1">Find exactly what you're looking for</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Search Query */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Terms
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter keywords, phrases, or specific topics..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {['health', 'wealth', 'happiness'].map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleArrayFilter('categories', category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filters.categories?.includes(category)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Difficulty Level
            </label>
            <div className="flex flex-wrap gap-2">
              {['Easy', 'Moderate', 'Advanced'].map(difficulty => (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => toggleArrayFilter('difficulties', difficulty)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filters.difficulties?.includes(difficulty)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const start = e.target.value ? new Date(e.target.value) : undefined;
                    updateFilters('dateRange', start ? { 
                      start, 
                      end: filters.dateRange?.end || new Date() 
                    } : undefined);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const end = e.target.value ? new Date(e.target.value) : undefined;
                    updateFilters('dateRange', end ? { 
                      start: filters.dateRange?.start || new Date('2020-01-01'), 
                      end 
                    } : undefined);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Read Time Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Reading Time (minutes)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={filters.readTimeRange?.min || ''}
                  onChange={(e) => {
                    const min = parseInt(e.target.value) || undefined;
                    updateFilters('readTimeRange', min ? {
                      min,
                      max: filters.readTimeRange?.max || 60
                    } : undefined);
                  }}
                  placeholder="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={filters.readTimeRange?.max || ''}
                  onChange={(e) => {
                    const max = parseInt(e.target.value) || undefined;
                    updateFilters('readTimeRange', max ? {
                      min: filters.readTimeRange?.min || 1,
                      max
                    } : undefined);
                  }}
                  placeholder="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => updateFilters('minRating', filters.minRating === rating ? undefined : rating)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    filters.minRating === rating
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${filters.minRating === rating ? 'fill-current' : ''}`} />
                  {rating}+
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              placeholder="Enter tags separated by commas (e.g., morning, routine, productivity)"
              value={(filters.tags || []).join(', ')}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag.length > 0);
                updateFilters('tags', tags.length > 0 ? tags : undefined);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter tags separated by commas to filter results
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear All Filters
            </button>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;