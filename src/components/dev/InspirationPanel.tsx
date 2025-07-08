import React, { useState, useEffect } from 'react';
import { Search, Lightbulb, Palette, ExternalLink, Copy } from 'lucide-react';
import { Button, Card, Input, Modal, Badge } from '../ui';
import { designInspiration } from '../../services/designInspiration';

interface InspirationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InspirationItem {
  title: string;
  description: string;
  url?: string;
  code?: string;
  tags: string[];
  type: 'design' | 'code' | 'pattern';
}

export const InspirationPanel: React.FC<InspirationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'trends' | 'components'>('search');
  const [trends, setTrends] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && activeTab === 'trends') {
      loadTrends();
    }
  }, [isOpen, activeTab]);

  const loadTrends = async () => {
    setLoading(true);
    try {
      const trendingDesigns = designInspiration.getTrendingPatterns();
      setTrends(trendingDesigns);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const inspirationResults = designInspiration.searchInspiration(searchQuery);
      const formattedResults = inspirationResults.map(result => ({
        title: result.title,
        description: result.description,
        url: result.url,
        code: undefined, // We'll add code examples in future iterations
        tags: [result.category],
        type: 'design' as const
      }));
      setResults(formattedResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchComponents = async (componentType: string) => {
    setLoading(true);
    try {
      const patterns = designInspiration.getComponentInspiration(componentType);
      const formattedResults = patterns.map(pattern => ({
        title: pattern.title,
        description: pattern.description,
        url: pattern.url,
        code: undefined, // We'll add code examples in future iterations
        tags: [componentType, 'component'],
        type: 'pattern' as const
      }));
      setResults(formattedResults);
      setActiveTab('search');
    } catch (error) {
      console.error('Component search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const popularComponents = [
    'Button', 'Card', 'Modal', 'Form', 'Dashboard', 'Navigation', 
    'Calendar', 'Chart', 'Badge', 'Avatar', 'Dropdown', 'Sidebar'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="🎨 Design Inspiration Hub">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          <Button
            variant={activeTab === 'search' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            leftIcon={<Search size={16} />}
          >
            Search
          </Button>
          <Button
            variant={activeTab === 'trends' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('trends')}
            leftIcon={<Lightbulb size={16} />}
          >
            Trends
          </Button>
          <Button
            variant={activeTab === 'components' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('components')}
            leftIcon={<Palette size={16} />}
          >
            Components
          </Button>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for UI patterns, designs, or inspiration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                leftIcon={<Search size={16} />}
              />
              <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Quick search suggestions */}
            <div className="flex flex-wrap gap-2">
              {['glassmorphism design', 'modern dashboard', 'cold therapy app UI', 'habit tracker design', 'saas inspiration', 'react components'].map(suggestion => (
                <Badge
                  key={suggestion}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch();
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
            
            {/* Quick inspiration categories */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const results = designInspiration.getColdTherapyInspiration();
                  setResults(results.map(r => ({ ...r, code: undefined, tags: [r.category], type: 'design' as const })));
                }}
              >
                🧊 Cold Therapy Apps
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const results = designInspiration.getSaaSInspiration();
                  setResults(results.map(r => ({ ...r, code: undefined, tags: [r.category], type: 'design' as const })));
                }}
              >
                💼 SaaS Inspiration
              </Button>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">🔥 Trending Design Patterns</h3>
              <Button variant="ghost" size="sm" onClick={loadTrends}>
                Refresh
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading trends...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trends.map((trend, index) => (
                  <Card key={index} padding="sm" className="cursor-pointer hover:bg-blue-50">
                    <div className="text-sm font-medium">{trend}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🧩 Component Inspiration</h3>
            <p className="text-gray-600 text-sm">Click any component to get design patterns and implementation ideas</p>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {popularComponents.map(component => (
                <Button
                  key={component}
                  variant="outline"
                  size="sm"
                  onClick={() => searchComponents(component)}
                  disabled={loading}
                >
                  {component}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">💡 Inspiration Results</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <Card key={index} padding="md">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{result.title}</h4>
                    <div className="flex gap-2">
                      {result.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.url, '_blank')}
                          leftIcon={<ExternalLink size={14} />}
                        >
                          View
                        </Button>
                      )}
                      {result.code && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.code!)}
                          leftIcon={<Copy size={14} />}
                        >
                          Copy
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{result.description}</p>
                  
                  {result.code && (
                    <div className="bg-gray-50 rounded p-3 mb-3">
                      <pre className="text-xs overflow-x-auto">
                        <code>{result.code.slice(0, 200)}...</code>
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {result.tags.map(tag => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};