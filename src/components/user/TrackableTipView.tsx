import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface TrackableTipViewProps {
  tipId: string;
  children: React.ReactNode;
  onEngagementUpdate?: (engagementTime: number) => void;
  minimumViewTime?: number; // milliseconds before counting as a view
}

export function TrackableTipView({ 
  tipId, 
  children, 
  onEngagementUpdate,
  minimumViewTime = 3000 // 3 seconds default
}: TrackableTipViewProps) {
  const { user } = useAuth();
  const [viewTracked, setViewTracked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const engagementStartRef = useRef<number | null>(null);
  const totalEngagementRef = useRef<number>(0);
  const viewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track view after minimum time
  const trackView = async () => {
    if (!user || viewTracked) return;

    try {
      // Record view interaction
      await supabase
        .from('tip_interactions')
        .upsert({
          user_id: user.id,
          tip_id: tipId,
          interaction_type: 'view'
        }, {
          onConflict: 'user_id,tip_id,interaction_type'
        });

      // Increment view count
      await supabase.rpc('increment_view_count', { tip_id: tipId });

      // Log activity
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action_type: 'tip_viewed',
          action_details: {
            tip_id: tipId,
            timestamp: new Date().toISOString()
          }
        });

      setViewTracked(true);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  // Handle visibility changes
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        const nowVisible = entry.isIntersecting;
        setIsVisible(nowVisible);

        if (nowVisible && !wasVisible) {
          // Started viewing
          engagementStartRef.current = Date.now();
          
          // Set timeout for minimum view time
          if (!viewTracked) {
            viewTimeoutRef.current = setTimeout(trackView, minimumViewTime);
          }
        } else if (!nowVisible && wasVisible && engagementStartRef.current) {
          // Stopped viewing
          const engagementTime = Date.now() - engagementStartRef.current;
          totalEngagementRef.current += engagementTime;
          engagementStartRef.current = null;

          // Clear view timeout if not reached
          if (viewTimeoutRef.current) {
            clearTimeout(viewTimeoutRef.current);
            viewTimeoutRef.current = null;
          }

          // Update engagement time
          if (onEngagementUpdate) {
            onEngagementUpdate(totalEngagementRef.current);
          }
        }
      },
      { threshold: 0.5 } // 50% visible
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (viewTimeoutRef.current) {
        clearTimeout(viewTimeoutRef.current);
      }
    };
  }, [isVisible, viewTracked, minimumViewTime, onEngagementUpdate]);

  // Track engagement time on unmount
  useEffect(() => {
    return () => {
      if (engagementStartRef.current) {
        const finalEngagement = Date.now() - engagementStartRef.current;
        totalEngagementRef.current += finalEngagement;
        
        if (onEngagementUpdate) {
          onEngagementUpdate(totalEngagementRef.current);
        }
      }

      // Log final engagement time if significant
      if (user && totalEngagementRef.current > 5000) { // More than 5 seconds
        supabase
          .from('activity_logs')
          .insert({
            user_id: user.id,
            action_type: 'tip_engagement',
            action_details: {
              tip_id: tipId,
              engagement_time_ms: totalEngagementRef.current,
              timestamp: new Date().toISOString()
            }
          })
          .then(() => {})
          .catch(console.error);
      }
    };
  }, [user, tipId, onEngagementUpdate]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && engagementStartRef.current) {
        // Page hidden, pause engagement tracking
        const engagementTime = Date.now() - engagementStartRef.current;
        totalEngagementRef.current += engagementTime;
        engagementStartRef.current = null;
      } else if (!document.hidden && isVisible) {
        // Page visible again, resume tracking
        engagementStartRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isVisible]);

  return (
    <div ref={containerRef} data-tip-id={tipId} className="trackable-tip-view">
      {children}
    </div>
  );
}