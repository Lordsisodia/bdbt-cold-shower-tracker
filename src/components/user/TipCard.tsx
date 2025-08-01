import React from 'react';
import { Tip } from '../../types/tip';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Clock, Eye, Heart, Share2, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TipCardProps {
  tip: Tip;
  onView: (tip: Tip) => void;
  onLike?: (tipId: string) => void;
  onBookmark?: (tipId: string) => void;
  onShare?: (tip: Tip) => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export const TipCard: React.FC<TipCardProps> = ({
  tip,
  onView,
  onLike,
  onBookmark,
  onShare,
  isLiked = false,
  isBookmarked = false,
}) => {
  const categoryColors = {
    health: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    wealth: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    happiness: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  };

  const difficultyIcons = {
    Easy: '🌱',
    Moderate: '🌿',
    Advanced: '🌳',
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
      <div 
        onClick={() => onView(tip)}
        className="relative"
      >
        {/* Image or Gradient Header */}
        <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {tip.imageUrl ? (
            <img
              src={tip.imageUrl}
              alt={tip.content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-50">
                {tip.category === 'health' && '🏃‍♀️'}
                {tip.category === 'wealth' && '💎'}
                {tip.category === 'happiness' && '🌟'}
              </div>
            </div>
          )}
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={categoryColors[tip.category]}>
              {tip.category}
            </Badge>
            <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90">
              {difficultyIcons[tip.difficulty]} {tip.difficulty}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3">
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tip.content.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {tip.content.subtitle}
          </p>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          {/* Key Benefits Preview */}
          <div className="space-y-1.5 mb-3">
            {tip.content.whatsIncluded.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500">✓</span>
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
            {tip.content.whatsIncluded.length > 2 && (
              <p className="text-xs text-gray-500 dark:text-gray-500 ml-6">
                +{tip.content.whatsIncluded.length - 2} more benefits
              </p>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {tip.content.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {tip.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {tip.likeCount || 0}
            </span>
          </div>
        </CardContent>
      </div>

      <CardFooter className="pt-3 pb-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLike?.(tip.id);
              }}
              className={`p-2 ${isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onBookmark?.(tip.id);
              }}
              className={`p-2 ${isBookmarked ? 'text-blue-500' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(tip);
              }}
              className="p-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(tip.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};