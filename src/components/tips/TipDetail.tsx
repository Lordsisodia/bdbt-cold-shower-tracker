import React from 'react';
import { Tip } from '../../types/tip';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Clock, 
  Download, 
  Eye, 
  Share2, 
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  Heart,
  DollarSign
} from 'lucide-react';

interface TipDetailProps {
  tip: Tip;
  relatedTips?: Tip[];
  onBack?: () => void;
  onDownload?: (tipId: string) => void;
  onViewRelated?: (tipId: string) => void;
}

export const TipDetail: React.FC<TipDetailProps> = ({ 
  tip, 
  relatedTips = [],
  onBack,
  onDownload,
  onViewRelated
}) => {
  const categoryColors = {
    health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    wealth: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    happiness: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };

  const categoryIcons = {
    health: <Heart className="w-5 h-5" />,
    wealth: <DollarSign className="w-5 h-5" />,
    happiness: <TrendingUp className="w-5 h-5" />
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tip.content.title,
          text: tip.content.subtitle,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tips
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge className={`${categoryColors[tip.category]} flex items-center gap-1`}>
              {categoryIcons[tip.category]}
              {tip.category}
            </Badge>
            <Badge variant="outline">
              {tip.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={() => onDownload?.(tip.id)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="mb-8">
        {/* Hero Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative mb-8">
          {tip.imageUrl ? (
            <img 
              src={tip.imageUrl} 
              alt={tip.content.title}
              className="w-full h-full object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`inline-flex p-6 rounded-full mb-4 ${categoryColors[tip.category]}`}>
                  <span className="text-6xl">
                    {tip.category === 'health' && '🏃'}
                    {tip.category === 'wealth' && '💰'}
                    {tip.category === 'happiness' && '😊'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 pb-8">
          {/* Title and Description */}
          <h1 className="text-3xl font-bold mb-4">{tip.content.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {tip.content.subtitle}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            {tip.content.description}
          </p>

          {/* Benefits */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Key Benefits
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300">{tip.content.benefits.primary}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300">{tip.content.benefits.secondary}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <p className="text-gray-700 dark:text-gray-300">{tip.content.benefits.tertiary}</p>
              </div>
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What's Included</h2>
            <div className="grid gap-4">
              {tip.content.whatsIncluded.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {tip.content.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tip.viewCount} views
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {tip.downloadCount} downloads
            </span>
          </div>
        </div>
      </Card>

      {/* Related Tips */}
      {relatedTips.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Tips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedTips.map((relatedTip) => (
              <Card 
                key={relatedTip.id}
                className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onViewRelated?.(relatedTip.id)}
              >
                <Badge className={`${categoryColors[relatedTip.category]} mb-2`}>
                  {relatedTip.category}
                </Badge>
                <h3 className="font-semibold mb-2">{relatedTip.content.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {relatedTip.content.subtitle}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {relatedTip.content.readTime} min read
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};