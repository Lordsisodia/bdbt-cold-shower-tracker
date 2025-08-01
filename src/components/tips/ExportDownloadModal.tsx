import { AlertCircle, CheckCircle, Database, Download, FileSpreadsheet, FileText, Globe, Image, Loader, Palette, X } from 'lucide-react';
import React, { useState } from 'react';
import { ExportOptions, ExportResult, exportService } from '../../services/exportService';
import { DatabaseTip } from '../../services/tipsDatabaseService';
import CanvaAuthButton from '../canva/CanvaAuthButton';

interface ExportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  tip: DatabaseTip;
}

interface ExportFormat {
  key: ExportOptions['format'];
  name: string;
  description: string;
  icon: React.ReactNode;
  sizes: { quality: ExportOptions['quality']; name: string; description: string }[];
  recommended?: boolean;
}

const ExportDownloadModal: React.FC<ExportDownloadModalProps> = ({ isOpen, onClose, tip }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('pdf');
  const [selectedQuality, setSelectedQuality] = useState<ExportOptions['quality']>('premium');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const exportFormats: ExportFormat[] = [
    {
      key: 'pdf',
      name: 'PDF Document',
      description: 'Professional PDF with layouts and graphics',
      icon: <FileText className="w-5 h-5" />,
      recommended: true,
      sizes: [
        { quality: 'standard', name: 'Standard', description: 'Basic PDF from template (1-2 pages)' },
        { quality: 'high', name: 'Enhanced', description: 'Premium 5-page PDF with visual design' },
        { quality: 'premium', name: 'Professional', description: 'Client-style professional layout (9+ pages)' }
      ]
    },
    {
      key: 'png',
      name: 'PNG Image',
      description: 'High-quality image for sharing',
      icon: <Image className="w-5 h-5" />,
      sizes: [
        { quality: 'standard', name: 'Web (1200px)', description: 'Optimized for web sharing' },
        { quality: 'high', name: 'HD (2400px)', description: 'High definition for printing' },
        { quality: 'premium', name: '4K (3600px)', description: 'Ultra high resolution' }
      ]
    },
    {
      key: 'jpg',
      name: 'JPG Image',
      description: 'Compressed image, smaller file size',
      icon: <Image className="w-5 h-5" />,
      sizes: [
        { quality: 'standard', name: 'Web Quality', description: 'Good for social media' },
        { quality: 'high', name: 'High Quality', description: 'Balanced size and quality' },
        { quality: 'premium', name: 'Maximum Quality', description: 'Minimal compression' }
      ]
    },
    {
      key: 'json',
      name: 'JSON Data',
      description: 'Structured data for developers',
      icon: <Database className="w-5 h-5" />,
      sizes: [
        { quality: 'standard', name: 'Basic', description: 'Core tip data only' },
        { quality: 'high', name: 'Extended', description: 'Includes metadata' },
        { quality: 'premium', name: 'Complete', description: 'Full AI-enhanced content' }
      ]
    },
    {
      key: 'markdown',
      name: 'Markdown',
      description: 'Text format for documentation',
      icon: <FileText className="w-5 h-5" />,
      sizes: [
        { quality: 'standard', name: 'Basic', description: 'Simple markdown format' },
        { quality: 'high', name: 'Formatted', description: 'Rich formatting and structure' },
        { quality: 'premium', name: 'Comprehensive', description: 'Full content with AI enhancements' }
      ]
    },
    {
      key: 'html',
      name: 'HTML Page',
      description: 'Web page format',
      icon: <Globe className="w-5 h-5" />,
      sizes: [
        { quality: 'standard', name: 'Simple', description: 'Basic HTML layout' },
        { quality: 'high', name: 'Styled', description: 'CSS styling included' },
        { quality: 'premium', name: 'Interactive', description: 'Enhanced with JavaScript' }
      ]
    },
    {
      key: 'csv',
      name: 'CSV Data',
      description: 'Spreadsheet format for analysis',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      sizes: [
        { quality: 'standard', name: 'Basic', description: 'Core fields only' },
        { quality: 'high', name: 'Extended', description: 'All available fields' },
        { quality: 'premium', name: 'Analytics', description: 'Includes calculated metrics' }
      ]
    },
    {
      key: 'canva',
      name: 'Canva Design',
      description: 'Create editable design in Canva',
      icon: <Palette className="w-5 h-5" />,
      recommended: true,
      sizes: [
        { quality: 'standard', name: 'Instagram Post', description: '1080x1080px square format' },
        { quality: 'high', name: 'Facebook Post', description: '1200x630px landscape format' },
        { quality: 'premium', name: 'Presentation Slide', description: '1920x1080px presentation format' }
      ]
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        quality: selectedQuality,
        includeImages,
        includeMetadata,
        customizations: {
          colorScheme: 'light',
          pageSize: 'A4',
          compression: selectedFormat === 'jpg'
        }
      };

      const result = await exportService.exportTip(tip, options);
      setExportResult(result);

      // Auto-download if successful
      if (result.success && result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      setExportResult({
        success: false,
        fileName: '',
        error: error instanceof Error ? error.message : 'Export failed'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatFileSize = (bytes: number = 0): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedFormatData = exportFormats.find(f => f.key === selectedFormat);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export & Download</h2>
            <p className="text-gray-600 mt-1">Choose your preferred format and quality</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Tip Preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900">{tip.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{tip.subtitle}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {tip.category}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {tip.difficulty}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Choose Format</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {exportFormats.map((format) => (
                  <div
                    key={format.key}
                    className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedFormat === format.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedFormat(format.key);
                      setSelectedQuality(format.sizes[0].quality);
                    }}
                  >
                    {format.recommended && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Recommended
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedFormat === format.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {format.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{format.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality & Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Select Quality</h3>
              
              {selectedFormatData && (
                <div className="space-y-3 mb-6">
                  {selectedFormatData.sizes.map((size) => (
                    <div
                      key={size.quality}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedQuality === size.quality
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedQuality(size.quality)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{size.name}</h4>
                          <p className="text-sm text-gray-600">{size.description}</p>
                        </div>
                        {size.quality === 'premium' && (
                          <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            AI Enhanced
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Additional Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Additional Options</h4>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include images and graphics</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeMetadata}
                    onChange={(e) => setIncludeMetadata(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include metadata and timestamps</span>
                </label>
              </div>

              {/* Export Button */}
              <div className="mt-8">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating Export...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Export & Download
                    </>
                  )}
                </button>
              </div>

              {/* Export Result */}
              {exportResult && (
                <div className={`mt-4 p-4 rounded-xl ${
                  exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {exportResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      exportResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {exportResult.success ? 'Export Successful!' : 'Export Failed'}
                    </span>
                  </div>
                  
                  {exportResult.success ? (
                    <div className="mt-2 text-sm text-green-800">
                      <p><strong>File:</strong> {exportResult.fileName}</p>
                      {exportResult.fileSize && (
                        <p><strong>Size:</strong> {formatFileSize(exportResult.fileSize)}</p>
                      )}
                      <p className="mt-2 text-xs">File has been downloaded to your default download folder.</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-red-800">{exportResult.error}</p>
                  )}
                </div>
              )}

              {/* Canva Authentication */}
              {selectedFormat === 'canva' && (
                <div className="mt-4">
                  <CanvaAuthButton 
                    onAuthSuccess={() => console.log('Canva authenticated successfully')}
                    onAuthError={(error) => console.error('Canva auth error:', error)}
                  />
                </div>
              )}

              {/* Format Info */}
              {selectedFormat === 'pdf' && selectedQuality === 'premium' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Premium PDF:</strong> Includes AI-enhanced content with detailed benefits, 
                    implementation guides, progress tracking, and scientific evidence. Generation may take 30-60 seconds.
                  </p>
                </div>
              )}

              {selectedFormat === 'canva' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Canva Design:</strong> Creates an editable design in your Canva account that you can 
                    customize further. The design will open in a new tab for immediate editing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDownloadModal;