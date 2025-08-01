import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { DatabaseTip, tipsDatabaseService } from '../services/tipsDatabaseService';
import TipWebPage from '../components/tips/TipWebPage';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { trackTipView } from '../services/analyticsService';

const TipSlugPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tip, setTip] = useState<DatabaseTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTip = async () => {
      if (!slug) {
        setError('No tip slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const fetchedTip = await tipsDatabaseService.getTipBySlug(slug);
        
        if (!fetchedTip) {
          setError('Tip not found');
        } else {
          setTip(fetchedTip);
          
          // Track tip view
          trackTipView(fetchedTip.id?.toString() || '', {
            title: fetchedTip.title,
            category: fetchedTip.category,
            difficulty: fetchedTip.difficulty,
            slug: slug,
            from: 'slug-page'
          });
        }
      } catch (err) {
        console.error('Error fetching tip by slug:', err);
        setError('Failed to load tip');
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading tip...</h2>
          <p className="text-gray-600">Please wait while we fetch the content.</p>
        </div>
      </div>
    );
  }

  // Error state - redirect to tips page
  if (error || !tip) {
    return <Navigate to="/tips" replace />;
  }

  return (
    <TipWebPage 
      tip={tip}
      showBackButton={true}
      onBack={() => window.history.back()}
    />
  );
};

export default TipSlugPage;