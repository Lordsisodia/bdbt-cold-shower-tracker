import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tipsDatabaseService, DatabaseTip } from '../../services/tipsDatabaseService';
import { 
  ArrowRight, 
  Clock, 
  Eye, 
  Download, 
  Star, 
  Sparkles,
  TrendingUp,
  Filter,
  Search,
  Loader
} from 'lucide-react';

interface PublishedTipsSectionProps {
  className?: string;
  showTitle?: boolean;
  limit?: number;
}

const PublishedTipsSection: React.FC<PublishedTipsSectionProps> = ({ 
  className = '', 
  showTitle = true,
  limit = 6 
}) => {
  const [tips, setTips] = useState<DatabaseTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'health' | 'wealth' | 'happiness'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPublishedTips();
  }, [selectedCategory, searchTerm, limit]);

  const loadPublishedTips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = { limit };
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (searchTerm) filters.searchTerm = searchTerm;
      
      const { tips: publishedTips } = await tipsDatabaseService.getPublishedTips(filters);
      setTips(publishedTips);
    } catch (err) {
      console.error('Error loading published tips:', err);
      setError('Failed to load tips');
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    health: {
      bg: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    wealth: {
      bg: 'from-amber-500 to-orange-600',
      light: 'bg-amber-50', 
      text: 'text-amber-600',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700'
    },
    happiness: {
      bg: 'from-violet-500 to-purple-600',
      light: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-200', 
      badge: 'bg-violet-100 text-violet-700'
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const TipCard = ({ tip }: { tip: DatabaseTip }) => {
    const colors = categoryColors[tip.category as keyof typeof categoryColors] || categoryColors.health;
    
    return (
      <Link
        to={`/tip/${tip.id}`}
        className="group block bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 overflow-hidden"
      >
        {/* Header Gradient */}
        <div className={`h-2 bg-gradient-to-r ${colors.bg}`}></div>
        
        <div className="p-6">
          {/* Category & Difficulty Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
              {tip.category.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(tip.difficulty)}`}>
              {tip.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {tip.title}
          </h3>

          {/* Subtitle */}
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {tip.subtitle}
          </p>

          {/* Description Preview */}
          <p className="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
            {tip.description}
          </p>

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{Math.ceil(tip.description.length / 200)} min read</span>
              </div>
              {tip.view_count && tip.view_count > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{tip.view_count.toLocaleString()}</span>
                </div>
              )}
            </div>
            {tip.rating && tip.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-gray-700 font-medium">{tip.rating}</span>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                Read More
              </span>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">PDF Available</span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading latest tips...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || tips.length === 0) {
    return (
      <section className={`py-16 bg-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tips Published Yet</h3>
            <p className="text-gray-600">Check back soon for our latest tips and guides!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showTitle && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Latest Tips & Guides</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover actionable insights for better health, wealth, and happiness. 
              Each tip includes both a beautiful web experience and downloadable PDF guide.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex gap-2">
              {(['all', 'health', 'wealth', 'happiness'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip) => (
            <TipCard key={tip.id} tip={tip} />
          ))}
        </div>

        {/* View All Link */}
        {tips.length >= limit && (
          <div className="text-center mt-12">
            <Link
              to="/tips"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <span>View All Tips</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
          <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Both Web & PDF Versions</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Every tip is available as both a beautiful web page and a professionally designed PDF. 
            Read online for the full interactive experience, or download for offline reference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tips"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-5 h-5" />
              Browse All Tips
            </Link>
            <Link
              to="/template-preview"
              className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <Download className="w-5 h-5" />
              Preview PDF Templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublishedTipsSection;