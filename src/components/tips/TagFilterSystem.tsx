import { Clock, Filter, Hash, Search, Settings, Star, X, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { SearchFilters, SearchResult, searchService } from '../../services/searchService';
import { DatabaseTip } from '../../services/tipsDatabaseService';
import AdvancedSearchModal from '../search/AdvancedSearchModal';

interface TagFilterSystemProps {
  tips: DatabaseTip[];
  onFilteredTipsChange: (filteredTips: DatabaseTip[]) => void;
  className?: string;
}

const TagFilterSystem: React.FC<TagFilterSystemProps> = ({
  tips,
  onFilteredTipsChange,
  className = ""
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize search index and extract tags
  useEffect(() => {
    const initializeSearch = async () => {
      await searchService.initializeIndex(tips);
    };
    
    const allTags = new Set<string>();
    tips.forEach(tip => {
      if (tip.tags && Array.isArray(tip.tags)) {
        tip.tags.forEach(tag => allTags.add(tag));
      }
    });
    setAvailableTags(Array.from(allTags).sort());
    
    if (tips.length > 0) {
      initializeSearch();
    }
  }, [tips]);

  // Filter tips based on selected criteria or search results
  useEffect(() => {
    if (isSearchMode && searchResults.length > 0) {
      // Use search results
      const resultTips = searchResults.map(result => result.tip);
      onFilteredTipsChange(resultTips);
    } else {
      // Use traditional filtering
      let filtered = [...tips];

      // Filter by search term (simple text search when not in advanced search mode)
      if (searchTerm.trim() && !isSearchMode) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(tip =>
          tip.title.toLowerCase().includes(term) ||
          tip.subtitle.toLowerCase().includes(term) ||
          tip.description.toLowerCase().includes(term) ||
          (tip.tags && tip.tags.some(tag => tag.toLowerCase().includes(term)))
        );
      }

      // Filter by selected tags (AND logic - tip must have ALL selected tags)
      if (selectedTags.length > 0) {
        filtered = filtered.filter(tip => {
          if (!tip.tags || !Array.isArray(tip.tags)) return false;
          return selectedTags.every(selectedTag => 
            tip.tags.includes(selectedTag)
          );
        });
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(tip => tip.category === selectedCategory);
      }

      // Filter by difficulty
      if (selectedDifficulty !== 'all') {
        filtered = filtered.filter(tip => tip.difficulty === selectedDifficulty);
      }

      onFilteredTipsChange(filtered);
    }
  }, [tips, selectedTags, searchTerm, selectedCategory, selectedDifficulty, isSearchMode, searchResults, onFilteredTipsChange]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setIsSearchMode(false);
    setSearchResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle search input changes
  const handleSearchChange = async (value: string) => {
    setSearchTerm(value);
    
    // Get suggestions
    if (value.length >= 2) {
      const newSuggestions = await searchService.getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Perform search if there's a query
    if (value.trim().length >= 3) {
      try {
        const results = await searchService.search(value, {
          filters: {
            categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
            difficulties: selectedDifficulty !== 'all' ? [selectedDifficulty] : undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined
          }
        });
        
        setSearchResults(results.results);
        setIsSearchMode(true);
        
        // Log search
        await searchService.logSearch(value, results.total);
      } catch (error) {
        console.error('Search error:', error);
        setIsSearchMode(false);
      }
    } else {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = async (query: string, filters: SearchFilters) => {
    try {
      const results = await searchService.search(query, { filters });
      setSearchResults(results.results);
      setSearchTerm(query);
      setIsSearchMode(true);
      setShowSuggestions(false);
      
      // Update UI filters based on search filters
      if (filters.categories && filters.categories.length === 1) {
        setSelectedCategory(filters.categories[0]);
      }
      if (filters.difficulties && filters.difficulties.length === 1) {
        setSelectedDifficulty(filters.difficulties[0]);
      }
      if (filters.tags) {
        setSelectedTags(filters.tags);
      }
      
      await searchService.logSearch(query, results.total);
    } catch (error) {
      console.error('Advanced search error:', error);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearchChange(suggestion);
  };

  const hasActiveFilters = selectedTags.length > 0 || searchTerm.trim() || 
                          selectedCategory !== 'all' || selectedDifficulty !== 'all';

  // Get tag counts for display
  const getTagCount = (tag: string) => {
    return tips.filter(tip => tip.tags && tip.tags.includes(tag)).length;
  };

  const displayedTags = showAllTags ? availableTags : availableTags.slice(0, 10);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Tips
        </h3>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search tips..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Advanced Search Button */}
        <button
          onClick={() => setShowAdvancedSearch(true)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
          title="Advanced Search"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
              >
                <Search className="w-3 h-3 inline mr-2 text-gray-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Search Mode Indicator */}
        {isSearchMode && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600">Smart search active</span>
            <span className="text-gray-500">({searchResults.length} results)</span>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {['all', 'health', 'wealth', 'happiness'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {['all', 'Easy', 'Moderate', 'Advanced'].map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDifficulty === difficulty
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {difficulty === 'all' ? 'All Levels' : difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      {availableTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Tags
            {selectedTags.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {selectedTags.length} selected
              </span>
            )}
          </label>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {displayedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              const count = getTagCount(tag);
              
              return (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Hash className="w-3 h-3" />
                  {tag}
                  <span className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Show more/less tags */}
          {availableTags.length > 10 && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAllTags ? 'Show less' : `Show all ${availableTags.length} tags`}
            </button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Active filters:</div>
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                <Search className="w-3 h-3" />
                "{searchTerm}"
              </div>
            )}
            {selectedCategory !== 'all' && (
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                <Clock className="w-3 h-3" />
                {selectedCategory}
              </div>
            )}
            {selectedDifficulty !== 'all' && (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs">
                <Star className="w-3 h-3" />
                {selectedDifficulty}
              </div>
            )}
            {selectedTags.map(tag => (
              <div key={tag} className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                <Hash className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
        initialQuery={searchTerm}
        initialFilters={{
          categories: selectedCategory !== 'all' ? [selectedCategory] : undefined,
          difficulties: selectedDifficulty !== 'all' ? [selectedDifficulty] : undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined
        }}
      />
    </div>
  );
};

export default TagFilterSystem;