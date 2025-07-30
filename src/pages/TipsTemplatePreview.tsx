import React, { useState } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { ChevronLeft, ChevronRight, Download, Eye, Palette, Layout } from 'lucide-react';

interface MockTip {
  id: number;
  title: string;
  subtitle: string;
  category: 'health' | 'wealth' | 'happiness';
  difficulty: string;
  description: string;
  primary_benefit: string;
  secondary_benefit: string;
  tertiary_benefit: string;
  implementation_time: string;
  frequency: string;
  cost: string;
  images: {
    hero: string;
    benefits: string;
    implementation: string;
    cta: string;
  };
}

const TipsTemplatePreview: React.FC = () => {
  const [selectedTip, setSelectedTip] = useState<MockTip>({
    id: 1,
    title: "Morning Gratitude Practice",
    subtitle: "Start your day with positivity and appreciation",
    category: "happiness",
    difficulty: "Easy",
    description: "Begin each morning by writing down three things you're grateful for.",
    primary_benefit: "Improved mood and outlook",
    secondary_benefit: "Better stress management", 
    tertiary_benefit: "Enhanced relationships",
    implementation_time: "5 minutes",
    frequency: "Daily",
    cost: "Free",
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
      difficulty: "Moderate",
      description: "End your shower with 30 seconds of cold water to build mental toughness.",
      primary_benefit: "Increased energy levels",
      secondary_benefit: "Improved immune system",
      tertiary_benefit: "Enhanced mental resilience",
      implementation_time: "2 minutes",
      frequency: "Daily",
      cost: "Free",
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
      difficulty: "Easy",
      description: "Set up automatic transfers to your investment account every payday.",
      primary_benefit: "Consistent wealth building",
      secondary_benefit: "Reduced decision fatigue",
      tertiary_benefit: "Compound growth advantage",
      implementation_time: "15 minutes",
      frequency: "Monthly",
      cost: "Free",
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

  const pages = [
    // Cover Page
    {
      name: 'Cover Page',
      content: (
        <div className="w-full h-full relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${selectedTip.images.hero})` }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${currentColors.primary}CC 0%, ${currentColors.accent}CC 100%)` 
            }}
          />
          
          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-white">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48" />
            </div>

            <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full mb-8 backdrop-blur-sm">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {selectedTip.category} • {selectedTip.difficulty}
              </span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 leading-tight max-w-3xl">
              {selectedTip.title}
            </h1>
            
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-12">
              {selectedTip.subtitle}
            </p>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{selectedTip.implementation_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{selectedTip.cost}</span>
              </div>
            </div>
          </div>

          {/* BDBT Logo */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="text-2xl font-bold">BDBT</div>
          </div>
        </div>
      )
    },
    // Benefits Page
    {
      name: 'Benefits',
      content: (
        <div className="w-full h-full relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${selectedTip.images.benefits})` }}
          />
          <div className="absolute inset-0 bg-gray-50/90" />
          
          <div className="relative z-10 w-full h-full p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Benefits</h2>
              <p className="text-lg text-gray-600">What you'll gain from this tip</p>
            </div>

            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {[
              { text: selectedTip.primary_benefit, icon: '🎯' },
              { text: selectedTip.secondary_benefit, icon: '💡' },
              { text: selectedTip.tertiary_benefit, icon: '🚀' }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: currentColors.secondary }}
                >
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700 leading-relaxed">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: currentColors.primary }} />
          </div>
        </div>
      )
    },
    // Implementation Page
    {
      name: "Implementation Guide",
      content: (
        <div className="w-full h-full relative overflow-hidden bg-white">
          {/* Background Image */}
          <div 
            className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${selectedTip.images.implementation})` }}
          />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/60" />
          
          <div className="relative z-10 w-full h-full p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Implementation Guide</h2>
              <p className="text-lg text-gray-600">How to get started today</p>
            </div>

            <div className="max-w-4xl mx-auto">
            <div className="p-6 bg-gray-50 rounded-lg mb-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Time Required</p>
                  <p className="font-semibold text-lg">{selectedTip.implementation_time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Frequency</p>
                  <p className="font-semibold text-lg">{selectedTip.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost</p>
                  <p className="font-semibold text-lg">{selectedTip.cost}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-xl mb-2 text-blue-900">Getting Started</h3>
                <p className="text-blue-800">{selectedTip.description}</p>
              </div>
              
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-xl mb-2 text-green-900">Pro Tips</h3>
                <ul className="text-green-800 space-y-2">
                  <li>• Start small and build consistency</li>
                  <li>• Track your progress daily</li>
                  <li>• Find an accountability partner</li>
                  <li>• Celebrate small wins along the way</li>
                </ul>
              </div>
            </div>
          </div>

            {/* Category indicator */}
            <div className="absolute bottom-8 right-8">
              <div 
                className="px-6 py-3 rounded-full text-white font-semibold"
                style={{ backgroundColor: currentColors.primary }}
              >
                {selectedTip.category.toUpperCase()} TIP
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Call to Action Page
    {
      name: 'Call to Action',
      content: (
        <div className="w-full h-full relative overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${selectedTip.images.cta})` }}
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: `${currentColors.accent}DD` }}
          />
          
          <div className="relative z-10 w-full h-full p-12 text-white flex flex-col items-center justify-center">
          <div className="text-center max-w-3xl">
            <h2 className="text-5xl font-bold mb-8">Ready to Get Started?</h2>
            
            <p className="text-2xl mb-12 opacity-90">
              Transform your life with this simple yet powerful tip.
            </p>

            <div className="bg-white text-gray-900 p-8 rounded-2xl mb-12">
              <h3 className="text-2xl font-bold mb-4">Next Steps:</h3>
              <ol className="text-left space-y-3 text-lg">
                <li>1. Download the complete PDF guide</li>
                <li>2. Follow the implementation steps</li>
                <li>3. Track your progress daily</li>
                <li>4. Share your success with the community</li>
              </ol>
            </div>

              <div className="space-y-6">
                <div className="text-3xl font-bold">BDBT</div>
                <p className="text-xl">Better Days, Better Tomorrow</p>
                <p className="text-lg opacity-75">www.bdbt.com</p>
              </div>
            </div>
          </div>
        </div>
      )
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
            {/* Tip selector */}
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
            <div className="mt-6 flex gap-4">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-5 h-5" />
                Download Template
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

      <Footer />
    </div>
  );
};

export default TipsTemplatePreview;