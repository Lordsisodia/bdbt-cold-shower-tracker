import React from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Star, Download, Clock, FileText, CheckCircle, TrendingUp, Target, Zap, ArrowRight, BookOpen, Users } from 'lucide-react';
import { downloadBlueprint } from '../utils/downloadUtils';

const BlueprintPage: React.FC = () => {
  const keyTakeaways = [
    {
      icon: TrendingUp,
      title: 'Momentum over motivation',
      description: 'One tick is a "vote" for your future self',
    },
    {
      icon: Zap,
      title: 'Wins spark wins',
      description: 'Identity shifts trigger better choices and higher energy',
    },
    {
      icon: Target,
      title: 'Track patterns, not perfection',
      description: 'See which habits ignite positive chain reactions',
    },
  ];

  const blueprintContents = [
    '20 Daily Wins Framework',
    '20 Daily Drifts to Avoid',
    'Weekly Identity Check-in System',
    'Habit Stacking Templates',
    'Progress Tracking Sheets',
    'Transformation Triggers',
    'Accountability Systems',
    'Success Metrics Dashboard',
  ];

  const relatedResources = [
    {
      title: 'Morning Routine Mastery',
      category: 'health',
      difficulty: 'Easy',
      readTime: 5,
    },
    {
      title: 'Financial Freedom Roadmap',
      category: 'wealth',
      difficulty: 'Moderate',
      readTime: 8,
    },
    {
      title: 'Happiness Habits Handbook',
      category: 'happiness',
      difficulty: 'Easy',
      readTime: 6,
    },
    {
      title: 'Peak Performance Protocols',
      category: 'health',
      difficulty: 'Advanced',
      readTime: 10,
    },
  ];

  const testimonials = [
    {
      name: 'David Miller',
      role: 'Entrepreneur',
      quote: 'This blueprint completely transformed how I approach my daily habits. The results speak for themselves.',
      rating: 5,
    },
    {
      name: 'Lisa Chen',
      role: 'Marketing Director',
      quote: 'Finally, a system that actually works! The Daily Wins framework changed my life.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-6 py-3">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-200 font-medium">⭐ CORNERSTONE GUIDE</span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                The Source Blueprint
              </h1>
              <div className="flex items-center justify-center gap-4 text-white/80">
                <span className="px-4 py-2 bg-white/10 rounded-full text-sm">Moderate</span>
                <span className="text-lg">by Big Daddy</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              The complete operating system for health, wealth & happiness. 20 Daily Wins + 20 Daily Drifts, 
              weekly identity check-in, plug-in habit library – a full operating system for transformation.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">12 min</div>
                <div className="text-white/60">Read Time</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">19</div>
                <div className="text-white/60">Pages</div>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-white/60">Downloads</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Key Takeaways</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {keyTakeaways.map((takeaway, index) => (
              <div key={index} className="text-center space-y-4 p-8 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto transform hover:scale-110 transition-transform">
                  <takeaway.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{takeaway.title}</h3>
                <p className="text-gray-600">{takeaway.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blueprint Contents */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">What's Inside</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              </div>
              
              <p className="text-lg text-gray-600">
                This comprehensive blueprint contains everything you need to build a sustainable system 
                for personal transformation. Each component is designed to work together seamlessly.
              </p>

              <div className="space-y-3">
                {blueprintContents.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={downloadBlueprint}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Now
                </button>
                <button className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full hover:border-gray-400 transition-all duration-300">
                  <BookOpen className="w-5 h-5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  {/* Sample pages preview */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Daily Wins Tracker</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-blue-500 rounded" />
                        <span className="text-sm text-gray-600">Morning meditation (5 min)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        <span className="text-sm text-gray-600">Healthy breakfast</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded" />
                        <span className="text-sm text-gray-600">10-minute walk</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-3">Weekly Check-in</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">85%</div>
                        <div className="text-xs text-gray-600">Completion</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">21</div>
                        <div className="text-xs text-gray-600">Day Streak</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">+15</div>
                        <div className="text-xs text-gray-600">Win Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">What Members Say</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Transform Your Life?</h2>
          <p className="text-xl text-blue-100">
            Join thousands who have already started their transformation journey with The Source Blueprint.
          </p>
          
          <form className="max-w-md mx-auto space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button 
              onClick={downloadBlueprint}
              className="w-full bg-white text-gray-900 px-8 py-4 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download The Blueprint
            </button>
          </form>

          <p className="text-sm text-white/60">
            Free instant download. No spam, unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Related Resources</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedResources.map((resource, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    resource.category === 'health' ? 'bg-green-100 text-green-700' :
                    resource.category === 'wealth' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {resource.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    resource.difficulty === 'Easy' ? 'bg-gray-100 text-gray-700' :
                    resource.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {resource.difficulty}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {resource.readTime} min
                  </span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BlueprintPage;