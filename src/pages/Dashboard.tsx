import React, { useState, useEffect } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
// PdfTemplatePreview component removed - using CustomPDFGenerator instead
import { tipsDatabaseService, DatabaseTip } from '../services/tipsDatabaseService';
import { trackPageView } from '../services/analyticsService';
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  Lightbulb,
  TrendingUp,
  Users,
  Download,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  Mic,
  Upload,
  Star,
  Loader,
  AlertCircle,
  FileImage,
  Palette,
  CheckCircle2,
  XCircle,
  Globe,
  FileText as FileTextIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  SortAsc,
  SortDesc,
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface DashboardStats {
  totalTips: number;
  approvedTips: number;
  pendingTips: number;
  ideasQueue: number;
  monthlyViews: number;
  downloads: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
}

interface SortConfig {
  key: keyof DatabaseTip | null;
  direction: 'asc' | 'desc';
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

const Dashboard: React.FC = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState<'overview' | 'tips' | 'ideas' | 'calendar' | 'templates'>('overview');
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'pending' | 'approved' | 'published'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'health' | 'wealth' | 'happiness'>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  
  // Bulk selection
  const [selectedTips, setSelectedTips] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalTips: 0,
    approvedTips: 0,
    pendingTips: 0,
    ideasQueue: 0,
    monthlyViews: 0,
    downloads: 0
  });
  
  const [tips, setTips] = useState<DatabaseTip[]>([]);
  const [totalTips, setTotalTips] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  } | null>(null);
  
  // Load data with proper pagination, filtering, and sorting
  useEffect(() => {
    loadDashboardData();
  }, [currentPage, itemsPerPage, filterCategory, filterStatus, searchTerm, sortConfig]);

  // Load stats separately (once on mount)
  useEffect(() => {
    loadStats();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filters for API call
      const filters: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortConfig.key || 'created_at',
        sortDirection: sortConfig.direction
      };
      
      if (filterCategory !== 'all') filters.category = filterCategory;
      if (filterStatus !== 'all') filters.status = filterStatus;
      if (searchTerm.trim()) filters.searchTerm = searchTerm.trim();
      
      const { tips: loadedTips, total } = await tipsDatabaseService.getTips(filters);
      
      setTips(loadedTips);
      setTotalTips(total);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection.');
      showToast('error', 'Failed to load tips data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await tipsDatabaseService.getTipStats();
      
      if (statsData) {
        setStats({
          totalTips: statsData.total,
          approvedTips: statsData.published || 0,
          pendingTips: statsData.draft || 0,
          ideasQueue: 0,
          monthlyViews: statsData.totalViews || 0,
          downloads: statsData.totalDownloads || 0
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Toast notification system
  const showToast = (type: ToastMessage['type'], message: string, duration = 4000) => {
    const id = Date.now().toString();
    const toast: ToastMessage = { id, type, message, duration };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Confirmation dialog system
  const showConfirmDialog = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: 'danger' | 'warning' | 'info' = 'warning'
  ) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, type });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
  };

  // Sorting functionality
  const handleSort = (key: keyof DatabaseTip) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Pagination functionality
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedTips(new Set()); // Clear selections when changing pages
    setSelectAll(false);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setSelectedTips(new Set());
    setSelectAll(false);
  };

  // Calculate pagination info
  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages: Math.ceil(totalTips / itemsPerPage),
    totalItems: totalTips,
    itemsPerPage,
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalTips)
  };

  // Bulk selection functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTips(new Set());
      setSelectAll(false);
    } else {
      const allTipIds = tips.map(tip => tip.id).filter(Boolean) as number[];
      setSelectedTips(new Set(allTipIds));
      setSelectAll(true);
    }
  };

  const handleSelectTip = (tipId: number) => {
    const newSelected = new Set(selectedTips);
    if (newSelected.has(tipId)) {
      newSelected.delete(tipId);
    } else {
      newSelected.add(tipId);
    }
    setSelectedTips(newSelected);
    setSelectAll(newSelected.size === tips.length && tips.length > 0);
  };

  // Individual tip actions
  const handlePublishTip = async (tipId: number) => {
    setActionLoading(`publish-${tipId}`);
    try {
      await tipsDatabaseService.publishTip(tipId);
      showToast('success', 'Tip published successfully');
      await loadDashboardData();
      await loadStats();
    } catch (error) {
      console.error('Error publishing tip:', error);
      showToast('error', 'Failed to publish tip');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublishTip = async (tipId: number) => {
    showConfirmDialog(
      'Unpublish Tip',
      'Are you sure you want to unpublish this tip? It will no longer be visible to users.',
      async () => {
        setActionLoading(`unpublish-${tipId}`);
        try {
          await tipsDatabaseService.unpublishTip(tipId);
          showToast('success', 'Tip unpublished successfully');
          await loadDashboardData();
          await loadStats();
        } catch (error) {
          console.error('Error unpublishing tip:', error);
          showToast('error', 'Failed to unpublish tip');
        } finally {
          setActionLoading(null);
        }
      },
      'warning'
    );
  };

  const handleDeleteTip = async (tipId: number) => {
    const tip = tips.find(t => t.id === tipId);
    showConfirmDialog(
      'Delete Tip',
      `Are you sure you want to permanently delete "${tip?.title}"? This action cannot be undone.`,
      async () => {
        setActionLoading(`delete-${tipId}`);
        try {
          await tipsDatabaseService.deleteTip(tipId);
          showToast('success', 'Tip deleted successfully');
          await loadDashboardData();
          await loadStats();
        } catch (error) {
          console.error('Error deleting tip:', error);
          showToast('error', 'Failed to delete tip');
        } finally {
          setActionLoading(null);
        }
      },
      'danger'
    );
  };

  const handleViewTip = (tipId: number) => {
    window.open(`/tip/${tipId}`, '_blank');
  };

  const handleEditTip = (tipId: number) => {
    window.open(`/admin/create?edit=${tipId}`, '_blank');
  };

  // Bulk actions
  const handleBulkPublish = async () => {
    if (selectedTips.size === 0) return;
    
    showConfirmDialog(
      'Publish Selected Tips',
      `Are you sure you want to publish ${selectedTips.size} selected tip(s)?`,
      async () => {
        setActionLoading('bulk-publish');
        try {
          await Promise.all(
            Array.from(selectedTips).map(tipId => tipsDatabaseService.publishTip(tipId))
          );
          showToast('success', `${selectedTips.size} tips published successfully`);
          setSelectedTips(new Set());
          setSelectAll(false);
          await loadDashboardData();
          await loadStats();
        } catch (error) {
          console.error('Error bulk publishing:', error);
          showToast('error', 'Failed to publish some tips');
        } finally {
          setActionLoading(null);
        }
      }
    );
  };

  const handleBulkDelete = async () => {
    if (selectedTips.size === 0) return;
    
    showConfirmDialog(
      'Delete Selected Tips',
      `Are you sure you want to permanently delete ${selectedTips.size} selected tip(s)? This action cannot be undone.`,
      async () => {
        setActionLoading('bulk-delete');
        try {
          await Promise.all(
            Array.from(selectedTips).map(tipId => tipsDatabaseService.deleteTip(tipId))
          );
          showToast('success', `${selectedTips.size} tips deleted successfully`);
          setSelectedTips(new Set());
          setSelectAll(false);
          await loadDashboardData();
          await loadStats();
        } catch (error) {
          console.error('Error bulk deleting:', error);
          showToast('error', 'Failed to delete some tips');
        } finally {
          setActionLoading(null);
        }
      },
      'danger'
    );
  };

  // Filter management
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCategory('all');
    setCurrentPage(1);
    setSortConfig({ key: 'created_at', direction: 'desc' });
  };

  const hasActiveFilters = searchTerm || filterStatus !== 'all' || filterCategory !== 'all';

  const categoryColors = {
    health: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    wealth: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    happiness: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' }
  };

  const statusColors = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
    pending: { bg: 'bg-orange-100', text: 'text-orange-800' },
    approved: { bg: 'bg-blue-100', text: 'text-blue-800' },
    published: { bg: 'bg-green-100', text: 'text-green-800' }
  };


  const StatCard = ({ icon: Icon, title, value, change, color }: {
    icon: any;
    title: string;
    value: string | number;
    change?: string;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${color}`}>
              <TrendingUp className="w-4 h-4" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.includes('green') ? 'bg-green-100' : color.includes('blue') ? 'bg-blue-100' : color.includes('purple') ? 'bg-purple-100' : 'bg-orange-100'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          icon={FileText}
          title="Total Tips"
          value={stats.totalTips}
          change="+12 this month"
          color="text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          title="Approved"
          value={stats.approvedTips}
          change="+8 this week"
          color="text-green-600"
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={stats.pendingTips}
          color="text-orange-600"
        />
        <StatCard
          icon={Lightbulb}
          title="Ideas Queue"
          value={stats.ideasQueue}
          change="+5 new ideas"
          color="text-purple-600"
        />
        <StatCard
          icon={Eye}
          title="Monthly Views"
          value={stats.monthlyViews.toLocaleString()}
          change="+23% vs last month"
          color="text-indigo-600"
        />
        <StatCard
          icon={Download}
          title="Downloads"
          value={stats.downloads.toLocaleString()}
          change="+15% vs last month"
          color="text-teal-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tips</h3>
          <div className="space-y-4">
            {tips.slice(0, 5).map((tip) => (
              <div key={tip.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${categoryColors[tip.category].bg} flex items-center justify-center`}>
                    <FileText className={`w-5 h-5 ${categoryColors[tip.category].text}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tip.title}</p>
                    <p className="text-sm text-gray-500">{tip.created}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[tip.status].bg} ${statusColors[tip.status].text}`}>
                  {tip.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors group">
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              <span className="font-medium text-gray-700 group-hover:text-blue-700">Create New Tip</span>
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
            >
              <FileImage className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
              <span className="font-medium text-gray-700 group-hover:text-indigo-700">Preview PDF Templates</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-colors group">
              <Mic className="w-5 h-5 text-gray-400 group-hover:text-purple-500" />
              <span className="font-medium text-gray-700 group-hover:text-purple-700">Record Voice Note</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors group">
              <Upload className="w-5 h-5 text-gray-400 group-hover:text-green-500" />
              <span className="font-medium text-gray-700 group-hover:text-green-700">Bulk Import</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-colors group">
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
              <span className="font-medium text-gray-700 group-hover:text-orange-700">Schedule Content</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Component for sortable table headers
  const SortableHeader = ({ 
    label, 
    sortKey, 
    className = "text-left py-4 px-6 font-medium text-gray-700" 
  }: { 
    label: string; 
    sortKey: keyof DatabaseTip; 
    className?: string;
  }) => (
    <th className={className}>
      <button
        onClick={() => handleSort(sortKey)}
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? 
            <SortAsc className="w-4 h-4" /> : 
            <SortDesc className="w-4 h-4" />
        )}
      </button>
    </th>
  );

  const TipsTab = () => (
    <div className="space-y-6">
      {/* Filter Chips and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          {/* Search and Quick Actions */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="health">Health</option>
                <option value="wealth">Wealth</option>
                <option value="happiness">Happiness</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
              
              <button 
                onClick={() => window.open('/admin/create', '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Tip
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTips.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                {selectedTips.size} tip{selectedTips.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkPublish}
                  disabled={actionLoading === 'bulk-publish'}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'bulk-publish' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    'Publish'
                  )}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={actionLoading === 'bulk-delete'}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === 'bulk-delete' ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedTips(new Set());
                    setSelectAll(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
            
          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} tips
              {hasActiveFilters && ' (filtered)'}
            </span>
            <div className="flex items-center gap-2">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 w-12">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <SortableHeader label="Title" sortKey="title" />
                <SortableHeader label="Category" sortKey="category" />
                <SortableHeader label="Status" sortKey="status" />
                <SortableHeader label="Views" sortKey="view_count" />
                <SortableHeader label="Rating" sortKey="rating" />
                <SortableHeader label="Created" sortKey="created_at" />
                <th className="text-left py-4 px-6 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: itemsPerPage }, (_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="w-48 h-4 bg-gray-200 rounded"></div>
                        <div className="w-32 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-12 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 4 }, (_, j) => (
                          <div key={j} className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-red-500">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  </td>
                </tr>
              ) : tips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No tips found. Try adjusting your filters or create your first tip!
                  </td>
                </tr>
              ) : (
                tips.map((tip) => (
                  <tr key={tip.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedTips.has(tip.id!)}
                        onChange={() => handleSelectTip(tip.id!)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 max-w-xs truncate">{tip.title}</div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">{tip.subtitle}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[tip.category as keyof typeof categoryColors]?.bg || 'bg-gray-100'} ${categoryColors[tip.category as keyof typeof categoryColors]?.text || 'text-gray-800'}`}>
                        {tip.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[tip.status as keyof typeof statusColors]?.bg || 'bg-gray-100'} ${statusColors[tip.status as keyof typeof statusColors]?.text || 'text-gray-800'}`}>
                        {tip.status || 'published'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{(tip.view_count || 0).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      {tip.rating && tip.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-gray-900">{tip.rating}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {tip.created_at ? new Date(tip.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => tip.id && handleViewTip(tip.id)}
                          title="View as web page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        
                        <button 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => tip.id && handleEditTip(tip.id)}
                          title="Edit tip"
                          disabled={actionLoading === `edit-${tip.id}`}
                        >
                          {actionLoading === `edit-${tip.id}` ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </button>

                        {tip.status === 'published' ? (
                          <button 
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            onClick={() => tip.id && handleUnpublishTip(tip.id)}
                            title="Unpublish from website"
                            disabled={actionLoading === `unpublish-${tip.id}`}
                          >
                            {actionLoading === `unpublish-${tip.id}` ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <button 
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => tip.id && handlePublishTip(tip.id)}
                            title="Publish to website"
                            disabled={actionLoading === `publish-${tip.id}`}
                          >
                            {actionLoading === `publish-${tip.id}` ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button 
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => tip.id && handleDeleteTip(tip.id)}
                          title="Delete tip"
                          disabled={actionLoading === `delete-${tip.id}`}
                        >
                          {actionLoading === `delete-${tip.id}` ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginationInfo.totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                    let pageNum;
                    if (paginationInfo.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= paginationInfo.totalPages - 2) {
                      pageNum = paginationInfo.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationInfo.totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {paginationInfo.totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your tips, track performance, and plan content</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Create Tip
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="mt-8 border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'tips', label: 'All Tips', icon: FileText },
                  { id: 'templates', label: 'PDF Templates', icon: Palette },
                  { id: 'ideas', label: 'Ideas Queue', icon: Lightbulb },
                  { id: 'calendar', label: 'Content Calendar', icon: Calendar }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'tips' && <TipsTab />}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Template Preview</h2>
              <p className="text-gray-600">Preview and test the modern PDF templates with different content lengths</p>
            </div>
            {/* PDF template preview functionality available in TipsTemplatePreview page */}
          </div>
        )}
        {activeTab === 'ideas' && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ideas Queue Coming Soon</h3>
            <p className="text-gray-600">Manage your tip ideas and inspiration here</p>
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Content Calendar Coming Soon</h3>
            <p className="text-gray-600">Plan and schedule your content here</p>
          </div>
        )}
      </div>

      <Footer />

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg border flex items-center gap-3 min-w-80 transform transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeConfirmDialog} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              {confirmDialog.type === 'danger' && (
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
              {confirmDialog.type === 'warning' && (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              )}
              {confirmDialog.type === 'info' && (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={closeConfirmDialog}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirmDialog();
                }}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  confirmDialog.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmDialog.type === 'warning'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;