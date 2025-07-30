import React from 'react';
import { Quote, Star, Award, Users, TrendingUp, Target } from 'lucide-react';

const SuccessStories: React.FC = () => {
  const stories = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      company: 'TechStart Inc.',
      story: 'Transformed my startup from idea to $1M revenue in 18 months',
      achievement: '10x Revenue Growth',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Marketing Director',
      company: 'Growth Labs',
      story: 'Built a team of 25 and increased market share by 300%',
      achievement: 'Team Excellence',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      company: 'InnovateCo',
      story: 'Launched 3 successful products with 95% customer satisfaction',
      achievement: 'Product Innovation',
      icon: Award,
      gradient: 'from-orange-500 to-red-500',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    },
    {
      id: 4,
      name: 'David Park',
      role: 'Sales Executive',
      company: 'SalesPro',
      story: 'Exceeded targets by 250% and became top performer nationally',
      achievement: 'Sales Champion',
      icon: Target,
      gradient: 'from-green-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Consultant',
      company: 'Strategy Plus',
      story: 'Helped 50+ businesses achieve their transformation goals',
      achievement: 'Impact Leader',
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=400&fit=crop',
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'CEO',
      company: 'FutureTech',
      story: 'Scaled from startup to IPO in just 4 years',
      achievement: 'Visionary Leader',
      icon: Award,
      gradient: 'from-indigo-500 to-purple-500',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2">
            <Star className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Success Stories</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Real People, Real Results
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how our members are transforming their careers and businesses with our proven strategies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${story.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative p-8">
                {/* Achievement badge */}
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${story.gradient} text-white text-sm font-medium px-3 py-1 rounded-full mb-6`}>
                  <story.icon className="w-4 h-4" />
                  {story.achievement}
                </div>

                {/* Profile */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.role} at {story.company}</p>
                  </div>
                </div>

                {/* Story */}
                <Quote className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-gray-700 italic mb-6">
                  "{story.story}"
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">5.0</span>
                </div>
              </div>

              {/* Hover effect border */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${story.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105">
            Share Your Success Story
            <Star className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;