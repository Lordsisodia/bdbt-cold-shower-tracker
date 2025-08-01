import {
    Archive, Bookmark, Clock, ExternalLink, Folder, Grid,
    List, MoreVertical, Plus, Search, Tag, Trash
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Bookmark as BookmarkType, bookmarkService, BookmarkStats, ReadingList } from '../services/bookmarkService';
import { DatabaseTip, tipsDatabaseService } from '../services/tipsDatabaseService';

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [stats, setStats] = useState<BookmarkStats | null>(null);
  const [tips, setTips] = useState<DatabaseTip[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedList, setSelectedList] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [bookmarksData, readingListsData, statsData, tipsData] = await Promise.all([
        bookmarkService.getUserBookmarks(),
        bookmarkService.getUserReadingLists(),
        bookmarkService.getBookmarkStats(),
        tipsDatabaseService.getPublishedTips()
      ]);
      
      setBookmarks(bookmarksData);
      setReadingLists(readingListsData);
      setStats(statsData);
      setTips(tipsData.tips);
      
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = !searchQuery || 
      bookmark.tipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bookmark.notes && bookmark.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || bookmark.tipCategory === selectedCategory;
    const matchesArchived = bookmark.isArchived === showArchived;
    
    const matchesList = selectedList === 'all' || 
      readingLists.find(list => list.id === selectedList)?.tipIds.includes(bookmark.tipId);
    
    return matchesSearch && matchesCategory && matchesArchived && matchesList;
  });

  const handleRemoveBookmark = async (tipId: number) => {
    try {
      await bookmarkService.removeBookmark(tipId);
      await loadData();
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleToggleArchive = async (tipId: number) => {
    try {
      await bookmarkService.toggleArchiveBookmark(tipId);
      await loadData();
    } catch (error) {
      console.error('Error archiving bookmark:', error);
    }
  };

  const getTipData = (tipId: number): DatabaseTip | undefined => {
    return tips.find(tip => tip.id === tipId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your bookmarks...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-blue-600" />
                My Bookmarks
              </h1>
              <p className="text-gray-600 mt-1">
                {stats?.totalBookmarks || 0} saved tips across {readingLists.length} lists
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
              
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                New List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedCategory === 'all'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Categories ({bookmarks.length})
                  </button>
                  {Object.entries(stats?.bookmarksByCategory || {}).map(([category, count]) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${
                        selectedCategory === category
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Lists */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Reading Lists
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedList('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      selectedList === 'all'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Lists
                  </button>
                  {readingLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedList(list.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        selectedList === list.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: list.color }}
                        ></div>
                        <span>{list.name}</span>
                        <span className="text-xs text-gray-500">({list.tipIds.length})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Options</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      showArchived
                        ? 'bg-gray-50 text-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search or filters'
                    : 'Start bookmarking tips you want to save for later'
                  }
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredBookmarks.map(bookmark => {
                  const tipData = getTipData(bookmark.tipId);
                  
                  return (
                    <div
                      key={bookmark.id}
                      className={`group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all ${
                        viewMode === 'list' ? 'p-4 flex items-center gap-4' : 'p-6'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bookmark.tipCategory === 'health' ? 'bg-emerald-100 text-emerald-700' :
                                bookmark.tipCategory === 'wealth' ? 'bg-amber-100 text-amber-700' :
                                'bg-violet-100 text-violet-700'
                              }`}>
                                {bookmark.tipCategory}
                              </span>
                              {bookmark.isArchived && (
                                <Archive className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {bookmark.tipTitle}
                            </h3>
                            {bookmark.notes && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {bookmark.notes}
                              </p>
                            )}
                          </div>

                          {/* Tags */}
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {bookmark.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  #{tag}
                                </span>
                              ))}
                              {bookmark.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{bookmark.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  const slug = bookmark.tipSlug || bookmark.tipTitle
                                    .toLowerCase()
                                    .replace(/[^a-z0-9\s-]/g, '')
                                    .replace(/\s+/g, '-');
                                  window.open(`/tips/${slug}`, '_blank');
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="View tip"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              
                              <button 
                                onClick={() => handleToggleArchive(bookmark.tipId)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title={bookmark.isArchived ? 'Unarchive' : 'Archive'}
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                              
                              <button 
                                onClick={() => handleRemoveBookmark(bookmark.tipId)}
                                className="p-1 hover:bg-red-100 hover:text-red-600 rounded"
                                title="Remove bookmark"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* List view */
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{bookmark.tipTitle}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bookmark.tipCategory === 'health' ? 'bg-emerald-100 text-emerald-700' :
                                bookmark.tipCategory === 'wealth' ? 'bg-amber-100 text-amber-700' :
                                'bg-violet-100 text-violet-700'
                              }`}>
                                {bookmark.tipCategory}
                              </span>
                            </div>
                            {bookmark.notes && (
                              <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                                {bookmark.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                              {bookmark.tags && bookmark.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  <span>{bookmark.tags.length} tags</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                const slug = bookmark.tipSlug || bookmark.tipTitle
                                  .toLowerCase()
                                  .replace(/[^a-z0-9\s-]/g, '')
                                  .replace(/\s+/g, '-');
                                window.open(`/tips/${slug}`, '_blank');
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title="View tip"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            <button 
                              onClick={() => handleToggleArchive(bookmark.tipId)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              title={bookmark.isArchived ? 'Unarchive' : 'Archive'}
                            >
                              <Archive className="w-4 h-4 text-gray-600" />
                            </button>
                            
                            <button 
                              onClick={() => handleRemoveBookmark(bookmark.tipId)}
                              className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg"
                              title="Remove bookmark"
                            >
                              <Trash className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;