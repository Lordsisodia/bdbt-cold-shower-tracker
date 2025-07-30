import React, { useState } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Trophy, TrendingUp, Heart, MessageCircle, Share2, CheckCircle, Calendar, Users, Sparkles, Plus, Filter, ChevronDown, Award } from 'lucide-react';

interface Win {
  id: string;
  user: {
    name: string;
    avatar: string;
    streak: number;
  };
  content: string;
  category: 'health' | 'wealth' | 'happiness';
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked?: boolean;
}

const DailyWinsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'recent' | 'popular' | 'following'>('recent');
  const [showCategories, setShowCategories] = useState<'all' | 'health' | 'wealth' | 'happiness'>('all');

  const wins: Win[] = [
    {
      id: '1',
      user: {
        name: 'Alex Johnson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        streak: 47
      },
      content: "Hit my 5AM wake-up goal for 30 days straight! The morning routine from the Blueprint is literally changing my life. Energy levels through the roof! 🚀",
      category: 'health',
      likes: 234,
      comments: 18,
      timeAgo: '2 hours ago',
      isLiked: true
    },
    {
      id: '2',
      user: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        streak: 21
      },
      content: "Closed my first $10K client using the negotiation tips from Episode 87. Still can't believe it worked! Thank you BDBT family! 💰",
      category: 'wealth',
      likes: 567,
      comments: 45,
      timeAgo: '4 hours ago'
    },
    {
      id: '3',
      user: {
        name: 'Marcus Williams',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        streak: 93
      },
      content: "Finally had that difficult conversation with my partner. Used the communication framework from the relationships guide. We're stronger than ever now! ❤️",
      category: 'happiness',
      likes: 189,
      comments: 12,
      timeAgo: '6 hours ago'
    },
    {
      id: '4',
      user: {
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        streak: 15
      },
      content: "Week 2 of cold showers complete! I thought y'all were crazy but the mental clarity is REAL. Plus saved $50 on my energy bill 😄",
      category: 'health',
      likes: 412,
      comments: 34,
      timeAgo: '8 hours ago'
    },
    {
      id: '5',
      user: {
        name: 'James Park',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        streak: 156
      },
      content: "Launched my side hustle today! Been building in silence for 3 months following the Blueprint. First sale already in! 🎉",
      category: 'wealth',
      likes: 892,
      comments: 67,
      timeAgo: '12 hours ago',
      isLiked: true
    }
  ];

  const topPerformers = [
    { name: 'David Kim', streak: 365, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop' },
    { name: 'Lisa Brown', streak: 243, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop' },
    { name: 'Tom Wilson', streak: 198, avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop' },
  ];

  const categoryColors = {
    health: 'bg-green-100 text-green-700 border-green-200',
    wealth: 'bg-blue-100 text-blue-700 border-blue-200',
    happiness: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const filteredWins = wins.filter(win => 
    showCategories === 'all' || win.category === showCategories
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500" />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
              <Trophy className="w-5 h-5 text-yellow-200" />
              <span className="text-white font-medium">COMMUNITY CELEBRATION WALL</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                Daily Wins Wall
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Where momentum meets community. Share your victories, celebrate others, and watch 
                how small wins compound into massive transformations.
              </p>
            </div>

            {/* Community Stats */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">12,847</div>
                <div className="text-white/70">Wins Today</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">3,421</div>
                <div className="text-white/70">Active Members</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">847</div>
                <div className="text-white/70">Streaks Active</div>
              </div>
            </div>

            {/* Share Win Button */}
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Plus className="w-5 h-5" />
              Share Your Win
            </button>
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔥 On Fire This Week</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View Leaderboard →</button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="relative">
                  <img 
                    src={performer.avatar} 
                    alt={performer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{performer.name}</h3>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{performer.streak} day streak</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 py-6 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowCategories('all')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  showCategories === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Wins
              </button>
              <button
                onClick={() => setShowCategories('health')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  showCategories === 'health'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Health
              </button>
              <button
                onClick={() => setShowCategories('wealth')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  showCategories === 'wealth'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Wealth
              </button>
              <button
                onClick={() => setShowCategories('happiness')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  showCategories === 'happiness'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Happiness
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === 'recent'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setSelectedFilter('popular')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === 'popular'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setSelectedFilter('following')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === 'following'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Following
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Wins Feed */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {filteredWins.map((win) => (
              <div key={win.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={win.user.avatar} 
                        alt={win.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{win.user.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{win.timeAgo}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-600">
                            <Trophy className="w-3 h-3" />
                            {win.user.streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryColors[win.category]}`}>
                      {win.category}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-gray-800 text-lg mb-4 leading-relaxed">{win.content}</p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        win.isLiked 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                        <Heart className={`w-5 h-5 ${win.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{win.likes}</span>
                      </button>

                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{win.comments}</span>
                      </button>

                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium">Share</span>
                      </button>
                    </div>

                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View Comments →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
              <Sparkles className="w-5 h-5" />
              Load More Wins
            </button>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Start Your Winning Streak?</h2>
          <p className="text-xl text-yellow-100">
            Join thousands celebrating daily victories and building momentum together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Create Your Account
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300">
              Learn More
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-yellow-200">Active Members</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
              <div className="text-2xl font-bold">1M+</div>
              <div className="text-yellow-200">Wins Shared</div>
            </div>
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
              <div className="text-2xl font-bold">365</div>
              <div className="text-yellow-200">Longest Streak</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DailyWinsPage;