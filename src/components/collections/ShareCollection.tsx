import { Check, Copy, Globe, Link, Share2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface ShareCollectionProps {
  collectionId: string;
  collectionName: string;
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => Promise<void>;
  onGenerateLink: () => Promise<string>;
}

export const ShareCollection: React.FC<ShareCollectionProps> = ({
  collectionId,
  collectionName,
  isPublic,
  onTogglePublic,
  onGenerateLink
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    try {
      const url = await onGenerateLink();
      setShareUrl(url);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Share Collection</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium">Public Collection</p>
              <p className="text-sm text-gray-600">Anyone with the link can view</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => onTogglePublic(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {isPublic && (
          <div className="space-y-3">
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              {isGenerating ? (
                'Generating...'
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Generate Share Link
                </>
              )}
            </Button>

            {shareUrl && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="px-3"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <Users className="w-4 h-4" />
            Invite collaborators
          </button>
        </div>
      </div>
    </div>
  );
};
