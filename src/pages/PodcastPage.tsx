import React, { useState } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Play, Pause, Volume2, Clock, Calendar, Headphones, Youtube, Podcast as PodcastIcon, Share2, Heart, Download, TrendingUp, Mic, Filter } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  category: string;
  views: string;
  thumbnail: string;
  featured?: boolean;
  platforms: {
    youtube?: string;
    spotify?: string;
    apple?: string;
  };
}

const PodcastPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mindset' | 'business' | 'health' | 'relationships'>('all');
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null);

  const featuredEpisode: Episode = {
    id: 'featured',
    title: "How I Built a $1M Business in 12 Months",
    description: "In this powerful episode, we break down the exact blueprint I used to scale from zero to seven figures. Learn the mindset shifts, daily habits, and strategic moves that made it possible.",
    duration: "45:32",
    date: "2024-01-15",
    category: "business",
    views: "125K",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop",
    featured: true,
    platforms: {
      youtube: "#",
      spotify: "#",
      apple: "#"
    }
  };

  const episodes: Episode[] = [
    {
      id: '1',
      title: "The Morning Routine That Changed Everything",
      description: "Discover the 5AM protocol that top performers use to maximize productivity and mental clarity.",
      duration: "32:18",
      date: "2024-01-12",
      category: "mindset",
      views: "89K",
      thumbnail: "https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=400&h=225&fit=crop",
      platforms: { youtube: "#", spotify: "#", apple: "#" }
    },
    {
      id: '2',
      title: "From Broke to Boss: Real Talk on Financial Freedom",
      description: "Raw, unfiltered conversation about overcoming financial struggles and building wealth from scratch.",
      duration: "41:27",
      date: "2024-01-10",
      category: "business",
      views: "102K",
      thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=225&fit=crop",
      platforms: { youtube: "#", spotify: "#", apple: "#" }
    },
    {
      id: '3',
      title: "Optimize Your Body, Optimize Your Life",
      description: "Science-backed strategies for peak physical performance and how it translates to success in all areas.",
      duration: "38:45",
      date: "2024-01-08",
      category: "health",
      views: "76K",
      thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop",
      platforms: { youtube: "#", spotify: "#", apple: "#" }
    },
    {
      id: '4',
      title: "Building Unshakeable Confidence",
      description: "Master the psychology of self-belief and learn practical techniques to boost your confidence daily.",
      duration: "29:56",
      date: "2024-01-05",
      category: "mindset",
      views: "93K",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop",
      platforms: { youtube: "#", spotify: "#", apple: "#" }
    },
    {
      id: '5',
      title: "The Art of High-Value Relationships",
      description: "How to attract and maintain relationships that elevate your life and support your growth journey.",
      duration: "35:22",
      date: "2024-01-03",
      category: "relationships",
      views: "67K",
      thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=225&fit=crop",
      platforms: { youtube: "#", spotify: "#", apple: "#" }
    },
    {
      id: '6',
      title: "Mastering the Side Hustle Game",
      description: "Turn your skills into income streams with proven strategies for building profitable side businesses.",
      duration: "43:11",
      date: "2024-01-01",
      category: "business",
      views: "114K",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
      platforms: { youtube: "#", spotify: "#", apple: "#" }
    }
  ];

  const categories = [
    { id: 'all', label: 'All Episodes' },
    { id: 'mindset', label: 'Mindset' },
    { id: 'business', label: 'Business' },
    { id: 'health', label: 'Health' },
    { id: 'relationships', label: 'Relationships' }
  ];

  const filteredEpisodes = episodes.filter(episode => 
    selectedCategory === 'all' || episode.category === selectedCategory
  );

  const stats = [
    { value: '2M+', label: 'Downloads', icon: Download },
    { value: '150+', label: 'Episodes', icon: Mic },
    { value: '4.9', label: 'Rating', icon: TrendingUp },
    { value: '50K+', label: 'Subscribers', icon: Heart }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full px-6 py-3">
              <PodcastIcon className="w-5 h-5 text-red-400" />
              <span className="text-red-200 font-medium">NEW EPISODES EVERY WEEK</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                The BDBT Podcast
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Real talk, real results. Join thousands who tune in weekly for unfiltered conversations 
                about success, mindset, and transformation.
              </p>
            </div>

            {/* Podcast Stats */}
            <div className="flex justify-center gap-8 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-3xl font-bold text-white">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Subscribe Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105">
                <Youtube className="w-5 h-5" />
                YouTube
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                <Headphones className="w-5 h-5" />
                Spotify
              </button>
              <button className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-all duration-300 transform hover:scale-105">
                <PodcastIcon className="w-5 h-5" />
                Apple Podcasts
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Episode */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Episode</h2>
            <p className="text-xl text-gray-600">Our most impactful conversation yet</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid lg:grid-cols-2">
              {/* Video/Thumbnail */}
              <div className="relative aspect-video lg:aspect-auto">
                <img 
                  src={featuredEpisode.thumbnail} 
                  alt={featuredEpisode.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <button 
                    onClick={() => setPlayingEpisode(featuredEpisode.id)}
                    className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 transform hover:scale-110"
                  >
                    <Play className="w-8 h-8 text-gray-900 ml-1" />
                  </button>
                </div>
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  LATEST EPISODE
                </div>
              </div>

              {/* Content */}
              <div className="p-8 lg:p-12 text-white space-y-6">
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {featuredEpisode.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {featuredEpisode.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {featuredEpisode.views} views
                  </span>
                </div>

                <h3 className="text-3xl font-bold">{featuredEpisode.title}</h3>
                <p className="text-gray-200 text-lg">{featuredEpisode.description}</p>

                <div className="flex gap-4 pt-4">
                  <button className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-full hover:bg-gray-100 transition-all duration-300">
                    <Play className="w-5 h-5" />
                    Watch Now
                  </button>
                  <button className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300">
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episode Catalog */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">All Episodes</h2>
            <p className="text-xl text-gray-600">Browse our complete catalog of transformative conversations</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Episodes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEpisodes.map((episode) => (
              <div
                key={episode.id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={episode.thumbnail} 
                    alt={episode.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button 
                      onClick={() => setPlayingEpisode(episode.id)}
                      className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300"
                    >
                      {playingEpisode === episode.id ? (
                        <Pause className="w-6 h-6 text-gray-900" />
                      ) : (
                        <Play className="w-6 h-6 text-gray-900 ml-1" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      {episode.duration}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{episode.date}</span>
                    <span>{episode.views} views</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {episode.title}
                  </h3>

                  <p className="text-gray-600 line-clamp-2">
                    {episode.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize">
                      {episode.category}
                    </span>

                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
              <Volume2 className="w-5 h-5" />
              Load More Episodes
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold">Never Miss an Episode</h2>
          <p className="text-xl text-blue-100">
            Get notified about new episodes, exclusive content, and behind-the-scenes updates.
          </p>
          
          <form className="max-w-md mx-auto space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="w-full bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Subscribe to Podcast
            </button>
          </form>

          <p className="text-sm text-white/60">
            Join 50,000+ listeners. Unsubscribe anytime.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PodcastPage;