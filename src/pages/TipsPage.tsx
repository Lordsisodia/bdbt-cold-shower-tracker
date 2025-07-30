import React, { useState } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Download, Clock, ChevronDown, Search, Filter, BookOpen, Star } from 'lucide-react';
import { downloadTip } from '../utils/downloadUtils';

interface Tip {
  id: string;
  category: 'health' | 'wealth' | 'happiness';
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  title: string;
  description: string;
  includes: string[];
  readTime: number;
  downloads?: number;
  isFeatured?: boolean;
}

const TipsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'health' | 'wealth' | 'happiness'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'difficulty'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const tips: Tip[] = [
    {
      id: '1',
      category: 'wealth',
      difficulty: 'Moderate',
      title: 'Build a 6-Month Emergency Buffer Fund',
      description: 'Step-by-step guide to six months of bare-bones financial security.',
      includes: [
        'Automate transfers to remove temptation',
        'Use windfalls to accelerate progress',
        'Celebrate milestones to stay motivated'
      ],
      readTime: 6,
      downloads: 1234,
      isFeatured: true
    },
    {
      id: '2',
      category: 'happiness',
      difficulty: 'Easy',
      title: 'Appreciate the Things Around You',
      description: 'A micro-gratitude practice for instant calm and contentment.',
      includes: [
        'Lowers stress hormones effectively',
        'Curbs impulse spending habits',
        'Rewires mindset for positivity'
      ],
      readTime: 4,
      downloads: 987
    },
    {
      id: '3',
      category: 'health',
      difficulty: 'Easy',
      title: '30 Reasons to Drink Green Tea Instead of Water',
      description: 'Positions green tea as a hydration-plus habit for daily wellness.',
      includes: [
        'Antioxidants boost metabolism naturally',
        'Cheaper than sugary drinks long-term',
        'Creates a calming daily ritual'
      ],
      readTime: 6,
      downloads: 765
    },
    {
      id: '4',
      category: 'happiness',
      difficulty: 'Easy',
      title: '30 Ways to Track Your Habit Progress',
      description: 'Thirty low-tech and high-tech tracking options to keep momentum.',
      includes: [
        'Visibility equals consistency in habit building',
        'Pick friction-free tools that fit your lifestyle',
        'Celebrate streaks to maintain motivation'
      ],
      readTime: 5,
      downloads: 654
    },
    {
      id: '5',
      category: 'health',
      difficulty: 'Moderate',
      title: '30 Benefits of Getting Up and Down',
      description: 'Shows why floor mobility predicts longevity and vitality.',
      includes: [
        'Improves balance and coordination',
        'Protects joints through natural movement',
        'Great self-test for functional fitness'
      ],
      readTime: 6,
      downloads: 543
    },
    {
      id: '6',
      category: 'health',
      difficulty: 'Easy',
      title: '30 Benefits of Activating Your Brown Fat',
      description: 'Explains how cold exposure and certain foods stoke your metabolic furnace.',
      includes: [
        'BAT burns calories at rest for effortless fat loss',
        'Boosts insulin sensitivity for better health',
        'Pairs well with exercise for enhanced results'
      ],
      readTime: 6,
      downloads: 876
    },
    {
      id: '7',
      category: 'health',
      difficulty: 'Easy',
      title: '25 Ways to Prevent or Delay Sarcopenia',
      description: 'A checklist of strength-training, nutrition and lifestyle tweaks to keep muscle as you age.',
      includes: [
        'Lift weights 2-3 times per week minimum',
        'Prioritise protein intake throughout the day',
        'Move daily to maintain muscle function'
      ],
      readTime: 5,
      downloads: 432
    },
    {
      id: '8',
      category: 'wealth',
      difficulty: 'Easy',
      title: 'Connect with More Animals',
      description: 'Uses animal interaction for free mood-boosts and stress relief.',
      includes: [
        'Lowers cortisol levels naturally',
        'Encourages daily movement and activity',
        'Sparks empathy and emotional intelligence'
      ],
      readTime: 5,
      downloads: 321
    },
    {
      id: '9',
      category: 'happiness',
      difficulty: 'Easy',
      title: 'Create a WhatsApp Group with Friends for a Specific Purpose',
      description: 'Shows how a focused chat turns goals into shared wins and accountability.',
      includes: [
        'Built-in accountability from friends',
        'Low-cost coaching and support system',
        '30 group-idea prompts included'
      ],
      readTime: 5,
      downloads: 765
    },
    // Add more tips to reach 54+
  ];

  const categoryColors = {
    health: 'bg-green-100 text-green-700 border-green-200',
    wealth: 'bg-blue-100 text-blue-700 border-blue-200',
    happiness: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const difficultyColors = {
    Easy: 'bg-gray-100 text-gray-700',
    Moderate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700',
  };

  const filteredTips = tips.filter(tip => {
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTips = [...filteredTips].sort((a, b) => {
    if (sortBy === 'popular') return (b.downloads || 0) - (a.downloads || 0);
    if (sortBy === 'difficulty') {
      const diffOrder = { Easy: 0, Moderate: 1, Advanced: 2 };
      return diffOrder[a.difficulty] - diffOrder[b.difficulty];
    }
    return 0; // newest
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold">
              Free Tips & Guide Catalogue
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Transform your life with our comprehensive collection of proven strategies, actionable 
              frameworks, and practical guides. All completely free for our community.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tips and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setSelectedCategory('health')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'health'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Health
              </button>
              <button
                onClick={() => setSelectedCategory('wealth')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'wealth'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Wealth
              </button>
              <button
                onClick={() => setSelectedCategory('happiness')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === 'happiness'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Happiness
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Sort by: {sortBy}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setSortBy('newest');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        sortBy === 'newest' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('popular');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        sortBy === 'popular' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Most Popular
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('difficulty');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                        sortBy === 'difficulty' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      By Difficulty
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {sortedTips.length} resources
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTips.map((tip) => (
              <div
                key={tip.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {tip.isFeatured && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-medium px-4 py-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Featured Resource
                  </div>
                )}
                
                <div className="p-8">
                  {/* Category & Difficulty Badges */}
                  <div className="flex gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[tip.category]}`}>
                      {tip.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[tip.difficulty]}`}>
                      {tip.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{tip.title}</h3>
                  <p className="text-gray-600 mb-6">{tip.description}</p>

                  {/* What's Included */}
                  <div className="space-y-2 mb-6">
                    <p className="font-semibold text-gray-900">What's Included:</p>
                    <ul className="space-y-1">
                      {tip.includes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{tip.readTime} min read</span>
                    </div>
                    
                    <button 
                      onClick={() => downloadTip(tip.title, tip.description, tip.includes)}
                      className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More Button */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
              <BookOpen className="w-5 h-5" />
              Load More Resources
            </button>
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Want More Exclusive Content?</h2>
          <p className="text-xl text-blue-100 mb-12">
            Join our premium community for advanced strategies, personal coaching, and exclusive 
            resources not available anywhere else.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Join Premium Community
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300">
              Browse All Resources
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TipsPage;