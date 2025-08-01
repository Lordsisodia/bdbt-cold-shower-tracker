import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';

interface ExportAnalyticsProps {
  userId: string;
  onExport: (format: 'csv' | 'json' | 'pdf', dateRange?: { start: Date; end: Date }) => Promise<void>;
}

export const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({ userId, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat, dateRange);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Export Analytics</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedFormat('csv')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedFormat === 'csv' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">CSV</span>
            </button>
            <button
              onClick={() => setSelectedFormat('json')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedFormat === 'json' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">JSON</span>
            </button>
            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedFormat === 'pdf' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">PDF</span>
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            <Calendar className="inline w-4 h-4 mr-1" />
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({ ...dateRange, start: new Date(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({ ...dateRange, end: new Date(e.target.value) })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>Processing...</>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export Analytics
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
