import React, { useState } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
// PdfTemplatePreview component removed - using CustomPDFGenerator instead
import { ChevronLeft, ChevronRight, Download, Eye, Palette, Layout, Package, FileText } from 'lucide-react';
import ExportDownloadModal from '../components/tips/ExportDownloadModal';
import BatchExportModal from '../components/tips/BatchExportModal';
import CustomPDFGenerator from '../components/tips/CustomPDFGenerator';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { 
  ImprovedCoverPage, 
  ImprovedBenefitsPage, 
  ImprovedImplementationPage,
  ImprovedProgressPage,
  ImprovedCTAPage
} from '../components/tips/ImprovedTemplatePages';
import { ImprovedSinglePageTemplate } from '../components/tips/ImprovedSinglePageTemplate';

interface MockTip {
  id: number;
  title: string;
  subtitle: string;
  category: 'health' | 'wealth' | 'happiness';
  subcategory: string;
  difficulty: string;
  description: string;
  primary_benefit: string;
  secondary_benefit: string;
  tertiary_benefit: string;
  implementation_time: string;
  frequency: string;
  cost: string;
  scientific_backing: boolean;
  tags: string[];
  images: {
    hero: string;
    benefits: string;
    implementation: string;
    cta: string;
  };
}

const TipsTemplatePreview: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBatchExportModal, setShowBatchExportModal] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedTip, setSelectedTip] = useState<MockTip>({
    id: 1,
    title: "Morning Gratitude Practice",
    subtitle: "Start your day with positivity and appreciation",
    category: "happiness",
    subcategory: "mindfulness",
    difficulty: "Easy",
    description: "Begin each morning by writing down three things you're grateful for.",
    primary_benefit: "Improved mood and outlook",
    secondary_benefit: "Better stress management", 
    tertiary_benefit: "Enhanced relationships",
    implementation_time: "5 minutes",
    frequency: "Daily",
    cost: "Free",
    scientific_backing: true,
    tags: ["gratitude", "mindfulness", "happiness", "morning routine"],
    images: {
      hero: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80",
      benefits: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=400&fit=crop&q=80",
      implementation: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop&q=80",
      cta: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80"
    }
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('fourPage');

  const mockTips: MockTip[] = [
    selectedTip,
    {
      id: 2,
      title: "Cold Shower Challenge",
      subtitle: "Boost resilience with temperature therapy",
      category: "health",
      subcategory: "wellness",
      difficulty: "Moderate",
      description: "End your shower with 30 seconds of cold water to build mental toughness.",
      primary_benefit: "Increased energy levels",
      secondary_benefit: "Improved immune system",
      tertiary_benefit: "Enhanced mental resilience",
      implementation_time: "2 minutes",
      frequency: "Daily",
      cost: "Free",
      scientific_backing: true,
      tags: ["cold therapy", "resilience", "health", "energy"],
      images: {
        hero: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80",
        benefits: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop&q=80",
        implementation: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&q=80",
        cta: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80"
      }
    },
    {
      id: 3,
      title: "Investment Automation",
      subtitle: "Build wealth while you sleep",
      category: "wealth",
      subcategory: "investing",
      difficulty: "Easy",
      description: "Set up automatic transfers to your investment account every payday.",
      primary_benefit: "Consistent wealth building",
      secondary_benefit: "Reduced decision fatigue",
      tertiary_benefit: "Compound growth advantage",
      implementation_time: "15 minutes",
      frequency: "Monthly",
      cost: "Free",
      scientific_backing: false,
      tags: ["investing", "automation", "wealth", "compound growth"],
      images: {
        hero: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop&q=80",
        benefits: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop&q=80",
        implementation: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop&q=80",
        cta: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80"
      }
    }
  ];

  const categoryColors = {
    health: { primary: '#22c55e', secondary: '#86efac', accent: '#15803d' },
    wealth: { primary: '#eab308', secondary: '#fde047', accent: '#a16207' },
    happiness: { primary: '#a855f7', secondary: '#d8b4fe', accent: '#7c3aed' }
  };

  const currentColors = categoryColors[selectedTip.category];

  const pages = selectedTemplate === "fourPage" ? [
    // 5-Page Professional Template with Icons
    {
      name: 'Cover Page',
      content: <ImprovedCoverPage tip={selectedTip} colors={currentColors} />
    },
    {
      name: 'Benefits',
      content: <ImprovedBenefitsPage tip={selectedTip} colors={currentColors} />
    },
    {
      name: 'Implementation',
      content: <ImprovedImplementationPage tip={selectedTip} colors={currentColors} />
    },
    {
      name: 'Progress Tracking',
      content: <ImprovedProgressPage tip={selectedTip} colors={currentColors} />
    },
    {
      name: 'Call to Action',
      content: <ImprovedCTAPage tip={selectedTip} colors={currentColors} />
    }
  ] : [
    // Single Page Summary
    {
      name: 'Summary Page',
      content: <ImprovedSinglePageTemplate tip={selectedTip} colors={currentColors} />
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              Template Preview
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              See how your tips will look when transformed into beautiful, professional templates.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            {/* Mode Toggle */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-4">Mode</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isCustomMode}
                    onChange={() => setIsCustomMode(false)}
                    className="mr-2"
                  />
                  <span>Preview Existing Tips</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isCustomMode}
                    onChange={() => setIsCustomMode(true)}
                    className="mr-2"
                  />
                  <span>Create Custom PDF</span>
                </label>
              </div>
            </div>

            {!isCustomMode ? (
              /* Existing tip selector */
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="font-semibold mb-4">Select a Tip</h3>
                <select
                  value={selectedTip.id}
                  onChange={(e) => {
                    const tip = mockTips.find(t => t.id === parseInt(e.target.value));
                    if (tip) setSelectedTip(tip);
                  }}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mockTips.map(tip => (
                    <option key={tip.id} value={tip.id}>
                      {tip.title}
                    </option>
                  ))}
                </select>
              
              {selectedTip && (
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-medium">Category:</span> {selectedTip.category}</p>
                  <p><span className="font-medium">Difficulty:</span> {selectedTip.difficulty}</p>
                  <p><span className="font-medium">Time:</span> {selectedTip.implementation_time}</p>
                </div>
              )}
            </div>
            ) : (
              /* Custom PDF Creation Form - Single Input with AI */
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <CustomPDFGenerator onGenerate={(tip) => setSelectedTip(tip)} />
              </div>
            )}

            {/* Template selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Template Style</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="fourPage"
                    checked={selectedTemplate === "fourPage"}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">4-Page Professional (4 pages)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="singlePage"
                    checked={selectedTemplate === "singlePage"}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Single Page Summary (1 page)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-9">
            {/* Template Preview */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Header */}
              <div className="bg-gray-100 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Template Preview</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Page {currentPage + 1} of {pages.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
                      disabled={currentPage === pages.length - 1}
                      className="p-2 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="relative bg-gray-200 p-8">
                <div className="mx-auto" style={{ width: '600px', height: '800px' }}>
                  <div className="w-full h-full bg-white shadow-xl relative">
                    {pages[currentPage].content}
                  </div>
                </div>
                
                {/* Page indicator dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentPage ? 'bg-blue-600 w-8' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Page info */}
              <div className="bg-gray-50 px-6 py-3">
                <p className="text-sm text-gray-600 text-center">
                  {pages[currentPage].name}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex gap-4 flex-wrap">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                {isCustomMode ? 'Export Custom PDF' : 'Export This Tip'}
              </button>
              <button 
                onClick={() => setShowBatchExportModal(true)}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Package className="w-5 h-5" />
                Batch Export All
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                <Eye className="w-5 h-5" />
                Preview Full Size
              </button>
              <button className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Palette className="w-5 h-5" />
                Customize Colors
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern PDF Template Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Modern PDF Templates 2025</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience our completely redesigned PDF templates featuring modern typography, 
              professional color schemes, and intelligent layout systems optimized for AI-generated content.
            </p>
          </div>
          
          {/* PDF template preview integrated into the main preview area */}
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Palette className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Color System</h3>
                <p className="text-gray-600">Sophisticated color palettes with high contrast ratios following 2025 design standards.</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Layout className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Grid System</h3>
                <p className="text-gray-600">Professional spacing using golden ratio principles and modular scale for perfect alignment.</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Adaptive Typography</h3>
                <p className="text-gray-600">Intelligent font sizing and line spacing that adapts to content length for optimal readability.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Export Modals */}
      <ExportDownloadModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        tip={selectedTip}
      />

      <BatchExportModal
        isOpen={showBatchExportModal}
        onClose={() => setShowBatchExportModal(false)}
        tips={mockTips}
      />
    </div>
  );
};

export default TipsTemplatePreview;