import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { canvaService } from '../services/canvaIntegration';
import { batchProcessingService } from '../services/batchProcessingService';

interface CanvaDesignResult {
  designId: string;
  editUrl: string;
  exportUrl: string;
  previewUrl?: string;
  status: string;
  tipTitle: string;
}

const CanvaIntegrationDemo: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CanvaDesignResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'mock'>('checking');

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = () => {
    // Check if Canva API key is configured
    const hasApiKey = process.env.REACT_APP_CANVA_API_KEY;
    setApiStatus(hasApiKey ? 'connected' : 'mock');
  };

  // Mock tip data for demo
  const sampleTips = [
    {
      id: 1,
      title: "Morning Gratitude Practice",
      subtitle: "Start your day with positivity",
      category: "happiness",
      benefits: ["Improved mood", "Better relationships", "Reduced stress"],
      whatsIncluded: ["Daily journal template", "Gratitude prompts", "Progress tracker"]
    },
    {
      id: 2,
      title: "5-Minute Meditation",
      subtitle: "Quick mindfulness for busy people",
      category: "health",
      benefits: ["Mental clarity", "Stress reduction", "Better focus"],
      whatsIncluded: ["Guided audio", "Timer app", "Breathing exercises"]
    },
    {
      id: 3,
      title: "Budget Tracking System",
      subtitle: "Simple expense management",
      category: "wealth",
      benefits: ["Financial awareness", "Better savings", "Debt reduction"],
      whatsIncluded: ["Expense tracker", "Budget calculator", "Monthly reports"]
    }
  ];

  const startCanvaGeneration = async () => {
    setIsProcessing(true);
    setResults([]);
    setProgress({ current: 0, total: sampleTips.length, percentage: 0 });

    try {
      for (let i = 0; i < sampleTips.length; i++) {
        const tip = sampleTips[i];
        
        // Update progress
        setProgress({
          current: i + 1,
          total: sampleTips.length,
          percentage: ((i + 1) / sampleTips.length) * 100
        });

        // Prepare design data
        const designData = {
          tipId: tip.id,
          title: tip.title,
          subtitle: tip.subtitle,
          category: tip.category,
          benefits: tip.benefits,
          whatsIncluded: tip.whatsIncluded,
          colors: {
            primary: getCategoryColor(tip.category).primary,
            secondary: getCategoryColor(tip.category).secondary,
            accent: getCategoryColor(tip.category).accent,
            gradient: `linear-gradient(135deg, ${getCategoryColor(tip.category).primary} 0%, ${getCategoryColor(tip.category).accent} 100%)`
          },
          branding: canvaService.getBrandingData()
        };

        // Create design
        const result = await canvaService.createDesignFromTip(designData);
        
        setResults(prev => [...prev, {
          ...result,
          tipTitle: tip.title
        }]);

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error generating Canva designs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: { primary: '#22c55e', secondary: '#86efac', accent: '#15803d' },
      wealth: { primary: '#eab308', secondary: '#fde047', accent: '#a16207' },
      happiness: { primary: '#a855f7', secondary: '#d8b4fe', accent: '#7c3aed' }
    };
    return colors[category as keyof typeof colors] || colors.health;
  };

  const exportDesign = async (designId: string) => {
    try {
      const exportUrl = await canvaService.exportDesignAsPDF(designId);
      window.open(exportUrl, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Canva Integration Demo</h2>
          <p className="text-gray-600">Test the Canva API integration with sample tips</p>
        </div>
        
        {/* API Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            apiStatus === 'connected' ? 'bg-green-500' :
            apiStatus === 'mock' ? 'bg-yellow-500' : 'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600">
            {apiStatus === 'connected' ? 'API Connected' :
             apiStatus === 'mock' ? 'Mock Mode' : 'Checking...'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={startCanvaGeneration}
          disabled={isProcessing}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Generate Canva Designs
            </>
          )}
        </button>
        
        <div className="text-sm text-gray-600">
          {sampleTips.length} sample tips ready for processing
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Processing tip {progress.current} of {progress.total}
            </span>
            <span className="text-sm text-gray-500">
              {progress.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Generated Designs ({results.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div key={result.designId} className="border rounded-lg p-4 bg-gray-50">
                {/* Preview placeholder */}
                <div className="aspect-[3/4] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                  {result.previewUrl ? (
                    <img 
                      src={result.previewUrl} 
                      alt={result.tipTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient if image fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🎨</div>
                      <div className="text-sm font-medium text-gray-700">
                        {result.tipTitle}
                      </div>
                    </div>
                  )}
                  
                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    {result.status === 'ready' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                    ) : (
                      <RefreshCw className="w-5 h-5 text-yellow-500 bg-white rounded-full animate-spin" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 truncate">
                    {result.tipTitle}
                  </h4>
                  
                  <div className="text-xs text-gray-500">
                    Design ID: {result.designId}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(result.editUrl, '_blank')}
                      className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Edit in Canva
                    </button>
                    
                    <button
                      onClick={() => exportDesign(result.designId)}
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Generation Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">{results.length}</div>
                <div className="text-blue-800">Designs Created</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.status === 'ready').length}
                </div>
                <div className="text-green-800">Ready to Edit</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-purple-800">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Configuration Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">API Configuration</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Status:</strong> {
            apiStatus === 'connected' ? 'Connected to Canva API' :
            'Using mock responses (add REACT_APP_CANVA_API_KEY to .env)'
          }</p>
          <p><strong>Brand ID:</strong> {canvaService['brandId'] || 'Not configured'}</p>
          <p><strong>Templates:</strong> {canvaService['templateIds'].size} available</p>
        </div>
        
        {apiStatus === 'mock' && (
          <div className="mt-3 p-3 bg-yellow-100 rounded border-l-4 border-yellow-400">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-700">
                Currently in mock mode. Add your Canva API key to enable real design generation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvaIntegrationDemo;