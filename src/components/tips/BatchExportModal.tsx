import { AlertCircle, CheckCircle, Loader, Package, X } from 'lucide-react';
import React, { useState } from 'react';
import { ExportOptions, ExportResult, exportService } from '../../services/exportService';
import { DatabaseTip } from '../../services/tipsDatabaseService';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tips: DatabaseTip[];
}

interface BatchProgress {
  current: number;
  total: number;
  currentTip: string;
  percentage: number;
}

const BatchExportModal: React.FC<BatchExportModalProps> = ({ isOpen, onClose, tips }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportOptions['format']>('pdf');
  const [selectedQuality, setSelectedQuality] = useState<ExportOptions['quality']>('high');
  const [selectedTips, setSelectedTips] = useState<Set<number>>(new Set(tips.map(tip => tip.id || 0)));
  const [isExporting, setIsExporting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);
  const [createZip, setCreateZip] = useState(true);
  const [zipResult, setZipResult] = useState<ExportResult | null>(null);

  const formats = [
    { key: 'pdf' as const, name: 'PDF Documents', icon: '📄' },
    { key: 'png' as const, name: 'PNG Images', icon: '🖼️' },
    { key: 'jpg' as const, name: 'JPG Images', icon: '📸' },
    { key: 'json' as const, name: 'JSON Data', icon: '📊' },
    { key: 'markdown' as const, name: 'Markdown Files', icon: '📝' },
    { key: 'html' as const, name: 'HTML Pages', icon: '🌐' },
    { key: 'csv' as const, name: 'CSV Data', icon: '📈' }
  ];

  const qualities = [
    { key: 'standard' as const, name: 'Standard', description: 'Basic quality, faster generation' },
    { key: 'high' as const, name: 'High Quality', description: 'Enhanced layouts and styling' },
    { key: 'premium' as const, name: 'Premium AI', description: 'AI-enhanced comprehensive content' }
  ];

  const selectedTipsArray = tips.filter(tip => selectedTips.has(tip.id || 0));

  const toggleTipSelection = (tipId: number) => {
    const newSelected = new Set(selectedTips);
    if (newSelected.has(tipId)) {
      newSelected.delete(tipId);
    } else {
      newSelected.add(tipId);
    }
    setSelectedTips(newSelected);
  };

  const selectAll = () => {
    setSelectedTips(new Set(tips.map(tip => tip.id || 0)));
  };

  const selectNone = () => {
    setSelectedTips(new Set());
  };

  const handleBatchExport = async () => {
    if (selectedTips.size === 0) return;

    setIsExporting(true);
    setExportResults([]);
    setZipResult(null);
    setBatchProgress({ current: 0, total: selectedTips.size, currentTip: '', percentage: 0 });

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        quality: selectedQuality,
        includeImages: true,
        includeMetadata: true
      };

      const results = await exportService.batchExport(
        selectedTipsArray,
        options,
        (current, total) => {
          const currentTip = selectedTipsArray[current - 1]?.title || '';
          setBatchProgress({
            current,
            total,
            currentTip,
            percentage: (current / total) * 100
          });
        }
      );

      setExportResults(results);

      // Create ZIP file if requested
      if (createZip && results.some(r => r.success)) {
        setBatchProgress(prev => prev ? { ...prev, currentTip: 'Creating ZIP archive...' } : null);
        const zipResult = await exportService.createZipArchive(results);
        setZipResult(zipResult);

        // Auto-download ZIP
        if (zipResult.success && zipResult.downloadUrl) {
          const link = document.createElement('a');
          link.href = zipResult.downloadUrl;
          link.download = zipResult.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Download individual files
        const successfulResults = results.filter(r => r.success && r.downloadUrl);
        for (const result of successfulResults) {
          if (result.downloadUrl) {
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

    } catch (error) {
      console.error('Batch export failed:', error);
    } finally {
      setIsExporting(false);
      setBatchProgress(null);
    }
  };

  const formatFileSize = (bytes: number = 0): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const successCount = exportResults.filter(r => r.success).length;
  const failureCount = exportResults.filter(r => !r.success).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch Export & Download</h2>
            <p className="text-gray-600 mt-1">Export multiple tips in one go</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tip Selection */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Tips ({selectedTips.size} of {tips.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                  >
                    Select All
                  </button>
                  <button
                    onClick={selectNone}
                    className="text-sm text-gray-600 hover:text-gray-700 px-2 py-1 rounded"
                  >
                    Select None
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                {tips.map((tip) => (
                  <div
                    key={tip.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTips.has(tip.id || 0)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleTipSelection(tip.id || 0)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTips.has(tip.id || 0)}
                      onChange={() => toggleTipSelection(tip.id || 0)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{tip.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{tip.subtitle}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {tip.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {tip.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h3>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <div className="space-y-2">
                  {formats.map((format) => (
                    <label key={format.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={format.key}
                        checked={selectedFormat === format.key}
                        onChange={(e) => setSelectedFormat(e.target.value as ExportOptions['format'])}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">
                        {format.icon} {format.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quality Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <div className="space-y-2">
                  {qualities.map((quality) => (
                    <label key={quality.key} className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="quality"
                        value={quality.key}
                        checked={selectedQuality === quality.key}
                        onChange={(e) => setSelectedQuality(e.target.value as ExportOptions['quality'])}
                        className="w-4 h-4 text-blue-600 border-gray-300 mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quality.name}</div>
                        <div className="text-xs text-gray-600">{quality.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* ZIP Option */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createZip}
                    onChange={(e) => setCreateZip(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Create ZIP archive</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Combine all files into a single download
                </p>
              </div>

              {/* Export Button */}
              <button
                onClick={handleBatchExport}
                disabled={isExporting || selectedTips.size === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    Export {selectedTips.size} Tips
                  </>
                )}
              </button>

              {/* Estimated Time */}
              {selectedTips.size > 0 && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Estimated time: {selectedQuality === 'premium' ? 
                    `${Math.ceil(selectedTips.size * 1.5)} minutes` : 
                    `${Math.ceil(selectedTips.size * 0.3)} minutes`
                  }
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {batchProgress && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Processing: {batchProgress.current} of {batchProgress.total}
                </span>
                <span className="text-sm text-blue-700">
                  {batchProgress.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress.percentage}%` }}
                />
              </div>
              <p className="text-sm text-blue-800">{batchProgress.currentTip}</p>
            </div>
          )}

          {/* Results */}
          {exportResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Results</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-sm text-green-700">Successful</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{failureCount}</div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatFileSize(exportResults.reduce((sum, r) => sum + (r.fileSize || 0), 0))}
                  </div>
                  <div className="text-sm text-blue-700">Total Size</div>
                </div>
              </div>

              {/* ZIP Result */}
              {zipResult && (
                <div className={`p-4 rounded-xl mb-4 ${
                  zipResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {zipResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      zipResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {zipResult.success ? 'ZIP Archive Created!' : 'ZIP Creation Failed'}
                    </span>
                  </div>
                  {zipResult.success && (
                    <div className="mt-2 text-sm text-green-800">
                      <p><strong>File:</strong> {zipResult.fileName}</p>
                      <p><strong>Size:</strong> {formatFileSize(zipResult.fileSize)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Individual Results (collapsed view) */}
              <details className="bg-gray-50 rounded-lg">
                <summary className="p-3 cursor-pointer font-medium text-gray-900">
                  View Individual File Results
                </summary>
                <div className="px-3 pb-3 max-h-48 overflow-y-auto">
                  {exportResults.map((result, index) => (
                    <div key={index} className={`flex items-center gap-2 py-2 text-sm ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.success ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span className="flex-1 truncate">{result.fileName}</span>
                      {result.fileSize && (
                        <span className="text-xs">{formatFileSize(result.fileSize)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchExportModal;