import { Bookmark, Download, Share2, X } from 'lucide-react';
import React from 'react';
import { Tip } from '../../types/tip';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface TipDetailModalProps {
  tip: Tip | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (tip: Tip) => void;
  onBookmark?: (tip: Tip) => void;
  onShare?: (tip: Tip) => void;
}

export const TipDetailModal: React.FC<TipDetailModalProps> = ({
  tip,
  isOpen,
  onClose,
  onDownload,
  onBookmark,
  onShare
}) => {
  if (\!tip) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{tip.title}</h2>
            <p className="text-gray-600">{tip.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="prose max-w-none mb-6">
          <div dangerouslySetInnerHTML={{ __html: tip.content || '' }} />
        </div>

        <div className="flex gap-3">
          {onDownload && (
            <Button onClick={() => onDownload(tip)} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
          {onBookmark && (
            <Button onClick={() => onBookmark(tip)} variant="outline">
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
          {onShare && (
            <Button onClick={() => onShare(tip)} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
