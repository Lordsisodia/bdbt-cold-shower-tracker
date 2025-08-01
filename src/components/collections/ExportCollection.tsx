import { Download, FileImage, FileJson, FileText } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface ExportCollectionProps {
  collectionId: string;
  collectionName: string;
  itemCount: number;
  onExport: (format: 'pdf' | 'json' | 'markdown') => Promise<void>;
}

export const ExportCollection: React.FC<ExportCollectionProps> = ({
  collectionId,
  collectionName,
  itemCount,
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'json' | 'markdown'>('pdf');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    {
      value: 'pdf' as const,
      label: 'PDF Document',
      description: 'Best for printing and sharing',
      icon: FileText
    },
    {
      value: 'json' as const,
      label: 'JSON Data',
      description: 'For developers and backups',
      icon: FileJson
    },
    {
      value: 'markdown' as const,
      label: 'Markdown',
      description: 'For documentation and wikis',
      icon: FileImage
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Export Collection</h3>
        <p className="text-sm text-gray-600 mt-1">
          Export "{collectionName}" ({itemCount} items)
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {formats.map((format) => (
          <label
            key={format.value}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedFormat === format.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              value={format.value}
              checked={selectedFormat === format.value}
              onChange={() => setSelectedFormat(format.value)}
              className="sr-only"
            />
            <format.icon className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{format.label}</p>
              <p className="text-sm text-gray-600">{format.description}</p>
            </div>
          </label>
        ))}
      </div>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full"
      >
        {isExporting ? (
          'Exporting...'
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Export Collection
          </>
        )}
      </Button>
    </div>
  );
};
