import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import NewsletterSubscriptionWidget from './NewsletterSubscriptionWidget';

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  incentive?: string;
  delayMs?: number;
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({
  isOpen,
  onClose,
  title = "Don't Miss Out!",
  description = "Join thousands of readers getting weekly tips for a better life.",
  incentive = "🎁 Free PDF: '21 Daily Habits for Success' when you subscribe",
  delayMs = 0
}) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, delayMs);

      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [isOpen, delayMs]);

  const handleClose = () => {
    setShowPopup(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleSubscribe = (email: string) => {
    console.log('Popup subscription:', email);
    setTimeout(handleClose, 2000); // Close after success message
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="relative animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Widget */}
        <NewsletterSubscriptionWidget
          variant="popup"
          title={title}
          description={description}
          incentive={incentive}
          showPreferences={true}
          onSubscribe={handleSubscribe}
        />
      </div>
    </div>
  );
};

// Hook for managing newsletter popup behavior
export const useNewsletterPopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  useEffect(() => {
    // Check if user has already seen popup or is subscribed
    const hasSeenPopup = localStorage.getItem('bdbt_newsletter_popup_shown');
    const isSubscribed = localStorage.getItem('bdbt_newsletter')?.includes('subscribed');
    
    if (hasSeenPopup || isSubscribed) {
      setHasShownPopup(true);
      return;
    }

    // Trigger conditions
    const triggers = {
      // Time-based trigger (after 30 seconds)
      timeDelay: () => {
        setTimeout(() => {
          if (!hasShownPopup) {
            setIsPopupOpen(true);
            setHasShownPopup(true);
            localStorage.setItem('bdbt_newsletter_popup_shown', 'true');
          }
        }, 30000);
      },

      // Scroll-based trigger (when user scrolls 70% down the page)
      scrollTrigger: () => {
        const handleScroll = () => {
          const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          
          if (scrollPercent > 70 && !hasShownPopup) {
            setIsPopupOpen(true);
            setHasShownPopup(true);
            localStorage.setItem('bdbt_newsletter_popup_shown', 'true');
            window.removeEventListener('scroll', handleScroll);
          }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      },

      // Exit intent trigger (when mouse moves towards top of screen)
      exitIntentTrigger: () => {
        const handleMouseMove = (e: MouseEvent) => {
          if (e.clientY <= 50 && !hasShownPopup) {
            setIsPopupOpen(true);
            setHasShownPopup(true);
            localStorage.setItem('bdbt_newsletter_popup_shown', 'true');
            document.removeEventListener('mousemove', handleMouseMove);
          }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
      },

      // Page count trigger (after visiting 3 pages)
      pageCountTrigger: () => {
        const pageCount = parseInt(localStorage.getItem('bdbt_page_count') || '0') + 1;
        localStorage.setItem('bdbt_page_count', pageCount.toString());
        
        if (pageCount >= 3 && !hasShownPopup) {
          setTimeout(() => {
            setIsPopupOpen(true);
            setHasShownPopup(true);
            localStorage.setItem('bdbt_newsletter_popup_shown', 'true');
          }, 2000);
        }
      }
    };

    // Activate triggers
    const cleanupFunctions: (() => void)[] = [];
    
    // Use time delay as default
    triggers.timeDelay();
    
    // Add scroll trigger
    const scrollCleanup = triggers.scrollTrigger();
    if (scrollCleanup) cleanupFunctions.push(scrollCleanup);
    
    // Add exit intent trigger (desktop only)
    if (window.innerWidth > 768) {
      const exitCleanup = triggers.exitIntentTrigger();
      if (exitCleanup) cleanupFunctions.push(exitCleanup);
    }
    
    // Add page count trigger
    triggers.pageCountTrigger();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [hasShownPopup]);

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
    setHasShownPopup(true);
    localStorage.setItem('bdbt_newsletter_popup_shown', 'true');
  };

  return {
    isPopupOpen,
    closePopup,
    openPopup,
    hasShownPopup
  };
};

export default NewsletterPopup;