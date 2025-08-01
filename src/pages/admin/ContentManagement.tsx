import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, FileText, Edit, Trash2, 
  Eye, MoreVertical, Upload, Download, TrendingUp,
  Clock, Star, Users, BarChart3
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author: string;
  views: number;
  downloads: number;
  rating: number;
  tags: string[];
}

interface ContentFilters {
  status: string;
  category: string;
  author: string;
  sortBy: string;
}

export const ContentManagement: React.FC = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTips, setSelectedTips] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  const [filters, setFilters] = useState<ContentFilters>({
    status: 'all',
    category: 'all',
    author: 'all',
    sortBy: 'recent'
  });

  // Mock data
  React.useEffect(() => {
    const mockTips: Tip[] = Array.from({ length: 50 }, (_, i) => ({
      id: `tip-${i}`,
      title: `Business Tip ${i + 1}: ${['Productivity', 'Marketing', 'Finance', 'Leadership', 'Strategy'][i % 5]} Insights`,
      content: `This is a comprehensive business tip about ${['productivity', 'marketing', 'finance', 'leadership', 'strategy'][i % 5]}...`,
      category: ['Productivity', 'Marketing', 'Finance', 'Leadership', 'Strategy'][i % 5],
      status: ['draft', 'published', 'archived'][Math.floor(Math.random() * 3)] as any,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      author: ['AI Generator', 'Admin User', 'Content Team'][Math.floor(Math.random() * 3)],
      views: Math.floor(Math.random() * 10000),
      downloads: Math.floor(Math.random() * 1000),
      rating: 4 + Math.random(),
      tags: ['business', 'tips', ['productivity', 'marketing', 'finance', 'leadership', 'strategy'][i % 5]]
    }));
    setTips(mockTips);
  }, []);

  const filteredAndSortedTips = useMemo(() => {
    let filtered = tips;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    if (filters.author !== 'all') {
      filtered = filtered.filter(t => t.author === filters.author);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'mostViewed':
          return b.views - a.views;
        case 'topRated':
          return b.rating - a.rating;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [tips, filters, searchTerm]);

  const stats = useMemo(() => ({
    total: tips.length,
    published: tips.filter(t => t.status === 'published').length,
    drafts: tips.filter(t => t.status === 'draft').length,
    archived: tips.filter(t => t.status === 'archived').length,
    totalViews: tips.reduce((sum, t) => sum + t.views, 0),
    avgRating: tips.reduce((sum, t) => sum + t.rating, 0) / tips.length
  }), [tips]);

  const handleBulkAction = (action: 'publish' | 'archive' | 'delete') => {
    // Implementation would update selected tips
    console.log(`Bulk ${action} for tips:`, selectedTips);
    setSelectedTips([]);
    setShowBulkActions(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Manage tips, categories, and publishing workflow</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tip
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-500">Total Tips</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          <p className="text-xs text-gray-500">Published</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
          <p className="text-xs text-gray-500">Drafts</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
          <p className="text-xs text-gray-500">Archived</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Views</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.avgRating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Avg Rating</p>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tips by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="Productivity">Productivity</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Leadership">Leadership</option>
            <option value="Strategy">Strategy</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="mostViewed">Most Viewed</option>
            <option value="topRated">Top Rated</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        {selectedTips.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedTips.length} tip{selectedTips.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleBulkAction('publish')}>
                Publish
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                Archive
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-red-600 hover:bg-red-50">
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tips List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tips...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTips(filteredAndSortedTips.map(t => t.id));
                        } else {
                          setSelectedTips([]);
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedTips.map((tip) => (
                  <tr key={tip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTips.includes(tip.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTips([...selectedTips, tip.id]);
                          } else {
                            setSelectedTips(selectedTips.filter(id => id !== tip.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">{tip.title}</p>
                        <p className="text-sm text-gray-500">by {tip.author}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                        {tip.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tip.status)}`}>
                        {tip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{tip.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4 text-gray-400" />
                          <span>{tip.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{tip.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tip.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};