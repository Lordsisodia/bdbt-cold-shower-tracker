import React, { useState, useEffect } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Trophy, TrendingUp, Heart, MessageCircle, Share2, CheckCircle, Calendar, Users, Sparkles, Plus, Filter, ChevronDown, Award } from 'lucide-react';
import { dailyWinsService, type DailyWin, type UserProfile, type WinFilters } from '../services/dailyWinsService';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const DailyWinsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'recent' | 'popular' | 'following'>('recent');
  const [showCategories, setShowCategories] = useState<'all' | 'health' | 'wealth' | 'happiness'>('all');
  const [wins, setWins] = useState<DailyWin[]>([]);
  const [topPerformers, setTopPerformers] = useState<UserProfile[]>([]);
  const [communityStats, setCommunityStats] = useState({
    todayWins: 0,
    activeMembers: 0,
    activeStreaks: 0
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateWin, setShowCreateWin] = useState(false);
  const [newWinContent, setNewWinContent] = useState('');
  const [newWinCategory, setNewWinCategory] = useState<'health' | 'wealth' | 'happiness'>('health');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load wins
  useEffect(() => {
    loadWins();
  }, [selectedFilter, showCategories, page, currentUser]);

  // Load top performers and stats
  useEffect(() => {
    loadTopPerformers();
    loadCommunityStats();
  }, []);

  const loadWins = async () => {
    try {
      setLoading(true);
      const filters: WinFilters = {
        category: showCategories,
        sortBy: selectedFilter,
        page,
        limit: 10,
        userId: currentUser?.id
      };

      const result = await dailyWinsService.getWins(filters);
      setWins(result.wins);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading wins:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopPerformers = async () => {
    try {
      const performers = await dailyWinsService.getTopPerformers(3);
      setTopPerformers(performers);
    } catch (error) {
      console.error('Error loading top performers:', error);
    }
  };

  const loadCommunityStats = async () => {
    try {
      const stats = await dailyWinsService.getCommunityStats();
      setCommunityStats(stats);
    } catch (error) {
      console.error('Error loading community stats:', error);
    }
  };

  const handleCreateWin = async () => {
    if (!currentUser || !newWinContent.trim()) return;

    try {
      const newWin = await dailyWinsService.createWin({
        user_id: currentUser.id,
        content: newWinContent,
        category: newWinCategory
      });

      // Add to wins list
      setWins([newWin, ...wins]);
      setNewWinContent('');
      setShowCreateWin(false);
      
      // Reload stats
      loadCommunityStats();
    } catch (error) {
      console.error('Error creating win:', error);
    }
  };

  const handleLikeWin = async (winId: number) => {
    if (!currentUser) {
      // Redirect to login or show auth modal
      return;
    }

    try {
      const result = await dailyWinsService.toggleLike(winId, currentUser.id);
      
      // Update local state
      setWins(wins.map(win => 
        win.id === winId 
          ? { ...win, is_liked: result.liked, likes_count: win.likes_count + (result.liked ? 1 : -1) }
          : win
      ));
    } catch (error) {
      console.error('Error liking win:', error);
    }
  };

  const categoryColors = {
    health: 'bg-green-100 text-green-700 border-green-200',
    wealth: 'bg-blue-100 text-blue-700 border-blue-200',
    happiness: 'bg-purple-100 text-purple-700 border-purple-200',
  };

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
                <div className="text-3xl font-bold text-white">{communityStats.todayWins.toLocaleString()}</div>
                <div className="text-white/70">Wins Today</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{communityStats.activeMembers.toLocaleString()}</div>
                <div className="text-white/70">Active Members</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{communityStats.activeStreaks.toLocaleString()}</div>
                <div className="text-white/70">Streaks Active</div>
              </div>
            </div>

            {/* Share Win Button */}
            <button 
              onClick={() => currentUser ? setShowCreateWin(true) : alert('Please sign in to share a win')}
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
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
              <div key={performer.id} className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="relative">
                  <img 
                    src={performer.avatar_url || `https://ui-avatars.com/api/?name=${performer.full_name || performer.username || 'User'}&background=random`} 
                    alt={performer.full_name || performer.username || 'User'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{performer.full_name || performer.username || 'Anonymous'}</h3>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{performer.streak_count} day streak</span>
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
          {/* Create Win Modal */}
          {showCreateWin && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Share Your Win</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="flex gap-2">
                    {(['health', 'wealth', 'happiness'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewWinCategory(cat)}
                        className={`px-4 py-2 rounded-lg capitalize font-medium transition-all ${
                          newWinCategory === cat
                            ? categoryColors[cat]
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Win</label>
                  <textarea
                    value={newWinContent}
                    onChange={(e) => setNewWinContent(e.target.value)}
                    placeholder="Share your victory with the community..."
                    className="w-full p-4 border rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">{newWinContent.length}/500 characters</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCreateWin}
                    disabled={!newWinContent.trim()}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                  >
                    Share Win
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateWin(false);
                      setNewWinContent('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading wins...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {wins.map((win) => (
                <div key={win.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    {/* User Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={win.user?.avatar_url || `https://ui-avatars.com/api/?name=${win.user?.full_name || win.user?.username || 'User'}&background=random`} 
                          alt={win.user?.full_name || win.user?.username || 'User'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{win.user?.full_name || win.user?.username || 'Anonymous'}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{formatDistanceToNow(new Date(win.created_at), { addSuffix: true })}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-orange-600">
                              <Trophy className="w-3 h-3" />
                              {win.user?.streak_count || 0} day streak
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
                        <button 
                          onClick={() => handleLikeWin(win.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            win.is_liked 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${win.is_liked ? 'fill-current' : ''}`} />
                          <span className="font-medium">{win.likes_count}</span>
                        </button>

                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">{win.comments_count}</span>
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
          )}

          {/* Load More */}
          {page < totalPages && (
            <div className="text-center mt-12">
              <button 
                onClick={() => setPage(page + 1)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                Load More Wins
              </button>
            </div>
          )}
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