import React, { useState, useEffect } from 'react';
import { DatabaseTip, tipsDatabaseService } from '../../services/tipsDatabaseService';
import { 
  ArrowRight, 
  Clock, 
  Star,
  TrendingUp,
  Eye
} from 'lucide-react';

interface RelatedTipsSectionProps {
  currentTip: DatabaseTip;
  onTipClick?: (tip: DatabaseTip) => void;
}

const RelatedTipsSection: React.FC<RelatedTipsSectionProps> = ({ 
  currentTip, 
  onTipClick 
}) => {
  const [relatedTips, setRelatedTips] = useState<DatabaseTip[]>([]);
  const [loading, setLoading] = useState(true);

  // Modern color schemes matching PDF templates
  const categoryColors = {
    health: {
      primary: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      button: 'bg-emerald-600 hover:bg-emerald-700'
    },
    wealth: {
      primary: 'from-amber-500 to-orange-600', 
      light: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      button: 'bg-amber-600 hover:bg-amber-700'
    },
    happiness: {
      primary: 'from-violet-500 to-purple-600',
      light: 'bg-violet-50',
      text: 'text-violet-600', 
      border: 'border-violet-200',
      button: 'bg-violet-600 hover:bg-violet-700'
    }
  };

  useEffect(() => {
    const fetchRelatedTips = async () => {
      try {
        setLoading(true);
        
        // Get published tips from same category, excluding current tip
        const { tips } = await tipsDatabaseService.getPublishedTips({
          category: currentTip.category,
          limit: 6
        });
        
        // Filter out current tip and get related ones
        let related = tips.filter(tip => tip.id !== currentTip.id);
        
        // If we don't have enough from same category, get from other categories
        if (related.length < 3) {
          const { tips: moreTips } = await tipsDatabaseService.getPublishedTips({
            limit: 6 - related.length
          });
          
          const additionalTips = moreTips.filter(tip => 
            tip.id !== currentTip.id && 
            !related.some(r => r.id === tip.id)
          );
          
          related = [...related, ...additionalTips];
        }
        
        // Sort by view count and limit to 3
        related.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        setRelatedTips(related.slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching related tips:', error);
        setRelatedTips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedTips();
  }, [currentTip]);

  const difficultyBadge = {
    Easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    Moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    Advanced: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            You might also like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedTips.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          You might also like
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedTips.map((tip) => {
            const colors = categoryColors[tip.category as keyof typeof categoryColors] || categoryColors.health;
            const difficulty = difficultyBadge[tip.difficulty as keyof typeof difficultyBadge] || difficultyBadge.Moderate;
            
            return (
              <div 
                key={tip.id}
                className="group cursor-pointer bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-gray-300"
                onClick={() => onTipClick?.(tip)}
              >
                {/* Card Header with Gradient */}
                <div className={`h-24 bg-gradient-to-br ${colors.primary} rounded-t-lg relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.05'%3E%3Cpath d='m0 20l20-20h-20v20zm20-20v20h-20l20-20z'/%3E%3C/g%3E%3C/svg%3E")`,
                  }}></div>
                  
                  <div className="relative p-4 flex items-center justify-between">
                    <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-white">
                      {tip.category.toUpperCase()}
                    </span>
                    <span className={`${difficulty.bg} ${difficulty.text} px-2 py-1 rounded-full text-xs font-semibold border ${difficulty.border}`}>
                      {tip.difficulty}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {tip.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {tip.subtitle || tip.description.substring(0, 100)}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.ceil(tip.description.length / 200)} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{(tip.view_count || 0).toLocaleString()}</span>
                    </div>
                    {tip.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{tip.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {tip.tags && tip.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tip.tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {tip.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{tip.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Read more
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Tips CTA */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            View all tips
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelatedTipsSection;