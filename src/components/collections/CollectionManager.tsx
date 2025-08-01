import { Download, Edit2, Folder, Plus, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/apiClient';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Toast } from '../ui/Toast';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  tip_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tips?: string[];
}

interface CollectionManagerProps {
  onSelectCollection?: (collection: Collection) => void;
  onShareCollection?: (collection: Collection) => void;
  onExportCollection?: (collection: Collection) => void;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  onSelectCollection,
  onShareCollection,
  onExportCollection
}) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      loadCollections();
    }
  }, [user]);

  const loadCollections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.collections.getAll(user.id);
      if (response.success && response.data) {
        setCollections(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load collections');
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      setToast({ message: 'Failed to load collections', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!user || !formData.name.trim()) return;

    try {
      if (editingCollection) {
        const response = await api.collections.update(editingCollection.id, {
          name: formData.name,
          description: formData.description,
          is_public: formData.is_public
        });
        
        if (response.success) {
          setToast({ message: 'Collection updated successfully', type: 'success' });
          await loadCollections();
        } else {
          throw new Error(response.error?.message || 'Failed to update collection');
        }
      } else {
        const response = await api.collections.create({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          is_public: formData.is_public
        });
        
        if (response.success) {
          setToast({ message: 'Collection created successfully', type: 'success' });
          await loadCollections();
        } else {
          throw new Error(response.error?.message || 'Failed to create collection');
        }
      }
      
      handleCloseModal();
    } catch (error) {
      console.error('Error saving collection:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to save collection', 
        type: 'error' 
      });
    }
  };

  const handleDelete = async (collection: Collection) => {
    if (!confirm(`Are you sure you want to delete "${collection.name}"?`)) return;

    try {
      const response = await api.collections.delete(collection.id);
      if (response.success) {
        setToast({ message: 'Collection deleted successfully', type: 'success' });
        await loadCollections();
      } else {
        throw new Error(response.error?.message || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setToast({ message: 'Failed to delete collection', type: 'error' });
    }
  };

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      is_public: collection.is_public
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCollection(null);
    setFormData({ name: '', description: '', is_public: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Collections</h2>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card className="p-8 text-center">
          <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">No collections yet</p>
          <Button onClick={() => setShowCreateModal(true)}>Create your first collection</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectCollection?.(collection)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-sm text-gray-600 mt-1">{collection.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(collection);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(collection);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{collection.tip_count} tips</span>
                <div className="flex gap-2">
                  {collection.is_public && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareCollection?.(collection);
                      }}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <Users className="w-4 h-4" />
                      Share
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportCollection?.(collection);
                    }}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        title={editingCollection ? 'Edit Collection' : 'Create New Collection'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Collection"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of this collection"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_public" className="text-sm">
              Make this collection public (allow sharing)
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingCollection ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};