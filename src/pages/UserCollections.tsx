import React, { useState, useEffect } from 'react';
import { Plus, Search, Grid, List, Star, Lock, Globe, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import LoadingOverlay from '../components/ui/LoadingOverlay';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  is_public: boolean;
  item_count?: number;
  created_at: string;
  updated_at: string;
}

const UserCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#6366F1',
    is_public: false
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_collections')
        .select(`
          *,
          collection_items(count)
        `)
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const collectionsWithCount = data?.map(col => ({
        ...col,
        item_count: col.collection_items?.[0]?.count || 0
      })) || [];

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          icon: formData.icon,
          color: formData.color,
          is_public: formData.is_public,
          sort_order: collections.length
        });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        icon: '📁',
        color: '#6366F1',
        is_public: false
      });
      fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleUpdateCollection = async () => {
    if (!selectedCollection) return;

    try {
      const { error } = await supabase
        .from('user_collections')
        .update({
          name: formData.name,
          description: formData.description || null,
          icon: formData.icon,
          color: formData.color,
          is_public: formData.is_public
        })
        .eq('id', selectedCollection.id);

      if (error) throw error;

      setSelectedCollection(null);
      setFormData({
        name: '',
        description: '',
        icon: '📁',
        color: '#6366F1',
        is_public: false
      });
      fetchCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const filteredCollections = collections.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    col.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openEditModal = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      icon: collection.icon || '📁',
      color: collection.color || '#6366F1',
      is_public: collection.is_public
    });
    setShowCreateModal(true);
  };

  if (loading) return <LoadingOverlay />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">My Collections</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Collection
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: collection.color + '20' }}
                >
                  {collection.icon}
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden">
                    <button
                      onClick={() => openEditModal(collection)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    {!collection.is_default && (
                      <button
                        onClick={() => handleDeleteCollection(collection.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{collection.name}</h3>
              {collection.description && (
                <p className="text-gray-600 text-sm mb-4">{collection.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{collection.item_count || 0} items</span>
                <div className="flex items-center gap-2">
                  {collection.is_default && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                  {collection.is_public ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: collection.color + '20' }}
                >
                  {collection.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-sm text-gray-600">{collection.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{collection.item_count || 0} items</span>
                <div className="flex items-center gap-2">
                  {collection.is_default && <Star className="w-4 h-4 text-yellow-500" />}
                  {collection.is_public ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => openEditModal(collection)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                {!collection.is_default && (
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {selectedCollection ? 'Edit Collection' : 'Create New Collection'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              selectedCollection ? handleUpdateCollection() : handleCreateCollection();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_public" className="text-sm text-gray-700">
                    Make this collection public
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedCollection(null);
                    setFormData({
                      name: '',
                      description: '',
                      icon: '📁',
                      color: '#6366F1',
                      is_public: false
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {selectedCollection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCollections;