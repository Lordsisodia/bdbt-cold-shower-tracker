import React from 'react';
import { Tip } from '../../types/tip';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Download, Eye, ChevronRight } from 'lucide-react';

interface TipCardProps {
  tip: Tip;
  onView?: (tipId: string) => void;
  onDownload?: (tipId: string) => void;
  compact?: boolean;
}

export const TipCard: React.FC<TipCardProps> = ({ 
  tip, 
  onView, 
  onDownload,
  compact = false 
}) => {
  const categoryColors = {
    health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    wealth: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    happiness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };

  const difficultyColors = {
    Easy: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    Moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    Advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const handleView = () => {
    if (onView) onView(tip.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) onDownload(tip.id);
  };

  if (compact) {
    return (
      <Card 
        className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={handleView}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">
              {tip.content.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {tip.content.subtitle}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={categoryColors[tip.category]}>
                {tip.category}
              </Badge>
              <Badge className={difficultyColors[tip.difficulty]}>
                {tip.difficulty}
              </Badge>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tip.content.readTime} min read
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <div 
        className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative cursor-pointer"
        onClick={handleView}
      >
        {tip.imageUrl ? (
          <img 
            src={tip.imageUrl} 
            alt={tip.content.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to placeholder
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`inline-flex p-4 rounded-full mb-2 ${categoryColors[tip.category]}`}>
                {tip.category === 'health' && '🏃'}
                {tip.category === 'wealth' && '💰'}
                {tip.category === 'happiness' && '😊'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={categoryColors[tip.category]}>
                {tip.category}
              </Badge>
              <Badge className={difficultyColors[tip.difficulty]}>
                {tip.difficulty}
              </Badge>
            </div>
            <h3 className="text-xl font-bold mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400" onClick={handleView}>
              {tip.content.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {tip.content.subtitle}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h4 className="font-semibold text-sm">What's Included:</h4>
          <ul className="space-y-2">
            {tip.content.whatsIncluded.slice(0, 3).map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {tip.content.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tip.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {tip.downloadCount}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};