import React, { useState } from 'react';
import { DatabaseTip } from '../../services/tipsDatabaseService';
import { trackTipDownload, trackTipShare } from '../../services/analyticsService';
import { 
  Clock, 
  Star, 
  Share2, 
  Bookmark, 
  Download, 
  CheckCircle, 
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  Tag,
  User,
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCheck
} from 'lucide-react';
import { PDFGenerator } from '../../services/pdfGenerator';
import SEOHead from '../common/SEOHead';
import RelatedTipsSection from './RelatedTipsSection';
import EmailCaptureModal from '../email/EmailCaptureModal';
import BookmarkButton from '../bookmarks/BookmarkButton';
import { emailService, handlePDFDownloadWithEmail } from '../../services/emailService';

interface TipWebPageProps {
  tip: DatabaseTip;
  onBack?: () => void;
  showBackButton?: boolean;
}

const TipWebPage: React.FC<TipWebPageProps> = ({ tip, onBack, showBackButton = false }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

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

  const colors = categoryColors[tip.category as keyof typeof categoryColors] || categoryColors.health;

  const handleDownloadPDF = async () => {
    // Track download attempt
    trackTipDownload(tip.id?.toString() || '', {
      title: tip.title,
      category: tip.category,
      difficulty: tip.difficulty,
      from: 'tip-detail-page'
    });
    
    // Show email capture modal instead of direct download
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (email: string, preferences: any) => {
    try {
      const generator = new PDFGenerator();
      const tipData = {
        id: tip.id?.toString() || '1',
        category: tip.category as 'health' | 'wealth' | 'happiness',
        difficulty: tip.difficulty as 'Easy' | 'Moderate' | 'Advanced',
        content: {
          title: tip.title,
          subtitle: tip.subtitle,
          description: tip.description,
          benefits: {
            primary: tip.primary_benefit,
            secondary: tip.secondary_benefit,
            tertiary: tip.tertiary_benefit
          },
          whatsIncluded: [
            'Complete implementation guide',
            'Progress tracking templates',
            'Troubleshooting tips',
            'Success metrics framework'
          ],
          readTime: Math.ceil(tip.description.length / 200)
        },
        tags: tip.tags || [],
        createdAt: new Date(tip.created_at || Date.now()),
        updatedAt: new Date(tip.updated_at || Date.now()),
        viewCount: tip.view_count || 0,
        downloadCount: tip.download_count || 0
      };

      const blob = generator.generateTipPDF(tipData);
      
      // Handle email subscription and PDF download
      await handlePDFDownloadWithEmail(
        email,
        preferences,
        {
          id: tipData.id,
          title: tip.title,
          category: tip.category
        },
        blob
      );

      setShowEmailModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleShare = async () => {
    // Track share action
    trackTipShare(tip.id?.toString() || '', {
      title: tip.title,
      category: tip.category,
      difficulty: tip.difficulty,
      method: 'native-share',
      from: 'tip-detail-page'
    });
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tip.title,
          text: tip.subtitle,
          url: window.location.href
        });
      } catch (error) {
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const copyLink = async () => {
    // Track link copy action
    trackTipShare(tip.id?.toString() || '', {
      title: tip.title,
      category: tip.category,
      difficulty: tip.difficulty,
      method: 'copy-link',
      from: 'tip-detail-page'
    });
    
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link');
    }
  };

  const difficultyBadge = {
    Easy: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    Moderate: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    Advanced: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
  };

  const difficulty = difficultyBadge[tip.difficulty as keyof typeof difficultyBadge] || difficultyBadge.Moderate;

  return (
    <article className="min-h-screen bg-white">
      <SEOHead
        title={tip.title}
        description={tip.subtitle || tip.description.substring(0, 160)}
        keywords={tip.tags || [tip.category, 'tips', 'self-improvement']}
        image={(() => {
          const { generateSocialPreviewSVG } = require('../../utils/imageGenerator');
          return generateSocialPreviewSVG({
            title: tip.title,
            category: tip.category,
            difficulty: tip.difficulty
          });
        })()}
        url={window.location.href}
        type="article"
        publishedTime={tip.created_at}
        modifiedTime={tip.updated_at}
        section={tip.category}
        tags={tip.tags || []}
      />
      {/* Hero Section */}
      <div className={`relative bg-gradient-to-br ${colors.primary} text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='0.03'%3E%3Cpath d='m0 40l40-40h-40v40zm40-40v40h-40l40-40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tips
            </button>
          )}

          {/* Category & Metadata */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              {tip.category.toUpperCase()}
            </span>
            <span className={`${difficulty.bg} ${difficulty.text} px-3 py-1 rounded-full text-sm font-semibold border ${difficulty.border}`}>
              {tip.difficulty}
            </span>
            <div className="flex items-center gap-1 text-white/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{Math.ceil(tip.description.length / 200)} min read</span>
            </div>
            <div className="flex items-center gap-1 text-white/80">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{(tip.view_count || 0).toLocaleString()} views</span>
            </div>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {tip.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-3xl">
            {tip.subtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <BookmarkButton 
              tip={tip}
              variant="default"
              className="bg-white/10 text-white hover:bg-white/20 border-2 border-white/30"
            />
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
              
              {showShareMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-48 z-10">
                  <button
                    onClick={copyLink}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    {copiedLink ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Link copied!' : 'Copy link'}
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tip.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Share on Twitter
                  </a>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-500 text-sm"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {tip.description}
              </div>
            </div>

            {/* Benefits Section */}
            <div className={`${colors.light} rounded-xl p-8 border ${colors.border}`}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className={`w-6 h-6 ${colors.text}`} />
                Key Benefits
              </h2>
              <div className="space-y-4">
                {[tip.primary_benefit, tip.secondary_benefit, tip.tertiary_benefit].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${colors.button} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1`}>
                      {index + 1}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Details */}
            {(tip.implementation_time || tip.frequency || tip.cost) && (
              <div className="bg-gray-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Implementation Guide
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tip.implementation_time && (
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Time Required</div>
                      <div className="text-gray-600">{tip.implementation_time}</div>
                    </div>
                  )}
                  {tip.frequency && (
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Frequency</div>
                      <div className="text-gray-600">{tip.frequency}</div>
                    </div>
                  )}
                  {tip.cost && (
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <Star className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <div className="font-semibold text-gray-900">Cost</div>
                      <div className="text-gray-600">{tip.cost}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty</span>
                  <span className={`px-2 py-1 rounded text-sm ${difficulty.bg} ${difficulty.text}`}>
                    {tip.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className={`px-2 py-1 rounded text-sm ${colors.light} ${colors.text}`}>
                    {tip.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{(tip.view_count || 0).toLocaleString()}</span>
                </div>
                {tip.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{tip.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {tip.tags && tip.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tip.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Engagement */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Engage</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
                    isLiked 
                      ? 'border-red-200 bg-red-50 text-red-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  {isLiked ? 'Liked' : 'Like this tip'}
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-gray-700 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  Leave feedback
                </button>
              </div>
            </div>

            {/* Author/Source */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                About BDBT
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Better Days, Better Tomorrow (BDBT) provides evidence-based tips and strategies 
                for improving your health, wealth, and happiness through actionable daily practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={`bg-gradient-to-r ${colors.primary} text-white py-12`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-white/90 mb-6">
            Download the complete guide and start implementing this tip today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download PDF Guide
            </button>
            <button className="flex items-center gap-2 bg-white/10 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors border-2 border-white/30">
              <ExternalLink className="w-5 h-5" />
              View More Tips
            </button>
          </div>
        </div>
      </div>

      {/* Related Tips Section */}
      <RelatedTipsSection 
        currentTip={tip} 
        onTipClick={(relatedTip) => {
          // Generate slug and navigate to SEO-friendly URL
          const slug = relatedTip.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          window.location.href = `/tips/${slug}`;
        }}
      />

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
        tipTitle={tip.title}
        tipCategory={tip.category}
      />
    </article>
  );
};

export default TipWebPage;