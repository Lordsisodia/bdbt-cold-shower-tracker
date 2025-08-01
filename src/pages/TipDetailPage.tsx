import { AlertCircle, ArrowLeft, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/landing/Footer';
import Navigation from '../components/landing/Navigation';
import TipWebPage from '../components/tips/TipWebPage';
import { DatabaseTip, tipsDatabaseService } from '../services/tipsDatabaseService';

const TipDetailPage: React.FC = () => {
  const { tipId } = useParams<{ tipId: string }>();
  const navigate = useNavigate();
  const [tip, setTip] = useState<DatabaseTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTip = async () => {
      if (!tipId) {
        setError('Invalid tip ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const loadedTip = await tipsDatabaseService.getTipById(parseInt(tipId));
        
        if (!loadedTip) {
          setError('Tip not found');
          return;
        }

        // Only show published tips on public pages
        if (loadedTip.status !== 'published') {
          setError('This tip is not yet available');
          return;
        }

        setTip(loadedTip);
        
        // Increment view count
        await tipsDatabaseService.incrementViewCount(parseInt(tipId));
        
      } catch (err) {
        console.error('Error loading tip:', err);
        setError('Failed to load tip. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTip();
  }, [tipId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading tip...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tip) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <TipWebPage 
        tip={tip} 
        onBack={() => navigate(-1)}
        showBackButton={true}
      />
      <Footer />
    </div>
  );
};

export default TipDetailPage;