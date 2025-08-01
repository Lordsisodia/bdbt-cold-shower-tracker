import { Bookmark, BookmarkCheck, Heart, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { bookmarkService } from '../../services/bookmarkService';
import { DatabaseTip } from '../../services/tipsDatabaseService';

interface BookmarkButtonProps {
  tip: DatabaseTip;
  variant?: 'default' | 'heart' | 'compact';
  showText?: boolean;
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  tip,
  variant = 'default',
  showText = true,
  className = '',
  onBookmarkChange
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (tip.id) {
        const bookmarked = await bookmarkService.isBookmarked(tip.id);
        setIsBookmarked(bookmarked);
      }
    };

    checkBookmarkStatus();
  }, [tip.id]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!tip.id) return;

    setIsLoading(true);
    
    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(tip.id);
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      } else {
        await bookmarkService.bookmarkTip(tip);
        setIsBookmarked(true);
        onBookmarkChange?.(true);
        
        // Show feedback animation
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'transition-all duration-200 flex items-center gap-2';
    
    if (variant === 'compact') {
      return `${baseClasses} p-2 rounded-full hover:bg-gray-100 ${className}`;
    }
    
    if (variant === 'heart') {
      return `${baseClasses} p-2 rounded-full ${
        isBookmarked 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
      } ${className}`;
    }
    
    // Default variant
    return `${baseClasses} px-4 py-2 rounded-lg border-2 font-medium ${
      isBookmarked
        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
    } ${className}`;
  };

  const getIcon = () => {
    const iconClass = variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5';
    
    if (isLoading) {
      return <Loader2 className={`${iconClass} animate-spin`} />;
    }
    
    if (variant === 'heart') {
      return (
        <Heart 
          className={`${iconClass} ${isBookmarked ? 'fill-current' : ''} ${
            showFeedback ? 'animate-bounce' : ''
          }`} 
        />
      );
    }
    
    return isBookmarked ? (
      <BookmarkCheck 
        className={`${iconClass} ${showFeedback ? 'animate-bounce' : ''}`} 
      />
    ) : (
      <Bookmark className={iconClass} />
    );
  };

  const getText = () => {
    if (!showText) return null;
    
    if (variant === 'compact') return null;
    
    if (isLoading) {
      return isBookmarked ? 'Removing...' : 'Saving...';
    }
    
    if (variant === 'heart') {
      return isBookmarked ? 'Loved' : 'Love this';
    }
    
    return isBookmarked ? 'Saved' : 'Save';
  };

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={`${getButtonClasses()} ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
    >
      {getIcon()}
      {getText() && <span>{getText()}</span>}
      
      {/* Success feedback */}
      {showFeedback && !isLoading && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-lg">
          Saved!
        </div>
      )}
    </button>
  );
};

export default BookmarkButton;