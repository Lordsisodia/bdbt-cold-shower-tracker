import React, { useState } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

export interface FilterState {
  categories: string[];
  tags: string[];
  difficulty: string | null;
  sortBy: 'newest' | 'popular' | 'alphabetical';
}

interface TipFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: string[];
  availableTags: string[];
}

export const TipFilters: React.FC<TipFiltersProps> = ({
  onFiltersChange,
  availableCategories,
  availableTags
}) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    tags: [],
    difficulty: null,
    sortBy: 'newest'
  });
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <button
        onClick={() => setIsOpen(\!isOpen)}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <Filter className="w-4 h-4" />
        Filters
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Categories</label>
            <div className="mt-2 space-y-2">
              {availableCategories.map(category => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ categories: [...filters.categories, category] });
                      } else {
                        updateFilters({ categories: filters.categories.filter(c => c \!== category) });
                      }
                    }}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
