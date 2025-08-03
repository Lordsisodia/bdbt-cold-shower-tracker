import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsEvent, analyticsService } from '../../services/analyticsService';

interface ActivityTrackingOptions {
  enablePageTracking?: boolean;
  enableClickTracking?: boolean;
  enableScrollTracking?: boolean;
  enableTimeTracking?: boolean;
  enableErrorTracking?: boolean;
  userId?: string;
}

interface ActivityMetadata {
  page?: string;
  component?: string;
  action?: string;
  target?: string;
  value?: any;
  duration?: number;
  error?: string;
  stackTrace?: string;
  [key: string]: any;
}

export const useActivityTracking = (options: ActivityTrackingOptions = {}) => {
  const {
    enablePageTracking = true,
    enableClickTracking = true,
    enableScrollTracking = true,
    enableTimeTracking = true,
    enableErrorTracking = true,
    userId
  } = options;

  const location = useLocation();
  const sessionId = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const pageStartTime = useRef<number>(Date.now());
  const lastScrollPosition = useRef<number>(0);
  const scrollDebounceTimer = useRef<NodeJS.Timeout>();

  // Track custom events
  const trackEvent = useCallback(async (
    eventType: AnalyticsEvent['event_type'] | 'click' | 'scroll' | 'error' | 'time_spent',
    metadata: ActivityMetadata
  ) => {
    try {
      await analyticsService.trackEvent({
        event_type: eventType as AnalyticsEvent['event_type'],
        user_id: userId,
        session_id: sessionId.current,
        metadata: {
          ...metadata,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          page: location.pathname,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn('Failed to track activity:', error);
    }
  }, [userId, location.pathname]);

  // Track page views
  useEffect(() => {
    if (!enablePageTracking) return;

    pageStartTime.current = Date.now();
    
    trackEvent('page_view', {
      page: location.pathname,
      search: location.search,
      hash: location.hash,
      title: document.title
    });

    // Track time spent on previous page
    return () => {
      if (enableTimeTracking) {
        const timeSpent = Date.now() - pageStartTime.current;
        trackEvent('page_view', {
          page: location.pathname,
          action: 'leave',
          duration: Math.round(timeSpent / 1000) // seconds
        });
      }
    };
  }, [location, enablePageTracking, enableTimeTracking, trackEvent]);

  // Track clicks
  useEffect(() => {
    if (!enableClickTracking) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const trackableElement = target.closest('[data-track-click]');
      
      if (trackableElement) {
        const trackData = trackableElement.getAttribute('data-track-click');
        const trackValue = trackableElement.getAttribute('data-track-value');
        
        trackEvent('page_view', {
          action: 'click',
          target: trackData || 'unknown',
          value: trackValue,
          element: trackableElement.tagName.toLowerCase(),
          text: trackableElement.textContent?.substring(0, 50)
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [enableClickTracking, trackEvent]);

  // Track scroll depth
  useEffect(() => {
    if (!enableScrollTracking) return;

    const handleScroll = () => {
      if (scrollDebounceTimer.current) {
        clearTimeout(scrollDebounceTimer.current);
      }

      scrollDebounceTimer.current = setTimeout(() => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

        // Only track significant scroll changes (10% increments)
        const lastPercentage = Math.round((lastScrollPosition.current / scrollHeight) * 100);
        if (Math.abs(scrollPercentage - lastPercentage) >= 10) {
          lastScrollPosition.current = scrollPosition;
          
          trackEvent('page_view', {
            action: 'scroll',
            value: scrollPercentage,
            direction: scrollPosition > lastScrollPosition.current ? 'down' : 'up'
          });
        }
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollDebounceTimer.current) {
        clearTimeout(scrollDebounceTimer.current);
      }
    };
  }, [enableScrollTracking, trackEvent]);

  // Track errors
  useEffect(() => {
    if (!enableErrorTracking) return;

    const handleError = (event: ErrorEvent) => {
      trackEvent('page_view', {
        action: 'error',
        error: event.error?.message || event.message,
        stackTrace: event.error?.stack,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('page_view', {
        action: 'unhandled_rejection',
        error: event.reason?.message || String(event.reason),
        stackTrace: event.reason?.stack
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableErrorTracking, trackEvent]);

  // Track specific user actions
  const trackUserAction = useCallback((action: string, metadata?: ActivityMetadata) => {
    trackEvent('page_view', {
      action,
      ...metadata
    });
  }, [trackEvent]);

  // Track tip-specific events
  const trackTipEvent = useCallback((
    tipId: string,
    eventType: 'view' | 'download' | 'share' | 'complete',
    metadata?: ActivityMetadata
  ) => {
    analyticsService.trackEvent({
      event_type: eventType,
      tip_id: tipId,
      user_id: userId,
      session_id: sessionId.current,
      metadata
    });
  }, [userId]);

  // Track search events
  const trackSearch = useCallback((searchTerm: string, results: number, metadata?: ActivityMetadata) => {
    trackEvent('search', {
      search_term: searchTerm,
      results,
      ...metadata
    });
  }, [trackEvent]);

  // Track filter events
  const trackFilter = useCallback((filterType: string, filterValue: string, metadata?: ActivityMetadata) => {
    trackEvent('filter', {
      filter_type: filterType,
      filter_value: filterValue,
      ...metadata
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackUserAction,
    trackTipEvent,
    trackSearch,
    trackFilter,
    sessionId: sessionId.current
  };
};

// HOC for adding tracking to components
export const withActivityTracking = <P extends object>(
  Component: React.ComponentType<P>,
  trackingOptions?: ActivityTrackingOptions
) => {
  return (props: P) => {
    useActivityTracking(trackingOptions);
    return <Component {...props} />;
  };
};

// Context provider for global activity tracking
import React, { createContext, ReactNode, useContext } from 'react';

interface ActivityTrackingContextValue {
  trackEvent: (eventType: string, metadata: ActivityMetadata) => void;
  trackUserAction: (action: string, metadata?: ActivityMetadata) => void;
  trackTipEvent: (tipId: string, eventType: 'view' | 'download' | 'share' | 'complete', metadata?: ActivityMetadata) => void;
  trackSearch: (searchTerm: string, results: number, metadata?: ActivityMetadata) => void;
  trackFilter: (filterType: string, filterValue: string, metadata?: ActivityMetadata) => void;
  sessionId: string;
}

const ActivityTrackingContext = createContext<ActivityTrackingContextValue | null>(null);

export const ActivityTrackingProvider: React.FC<{ children: ReactNode; options?: ActivityTrackingOptions }> = ({
  children,
  options
}) => {
  const tracking = useActivityTracking(options);

  return (
    <ActivityTrackingContext.Provider value={tracking}>
      {children}
    </ActivityTrackingContext.Provider>
  );
};

export const useActivityTrackingContext = () => {
  const context = useContext(ActivityTrackingContext);
  if (!context) {
    throw new Error('useActivityTrackingContext must be used within ActivityTrackingProvider');
  }
  return context;
};