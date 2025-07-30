import React from 'react';
import { Compass, Heart, Lightbulb, Trophy } from 'lucide-react';

const MissionSection: React.FC = () => {
  const values = [
    {
      icon: Compass,
      title: 'Guided Journey',
      description: 'Navigate your path with expert guidance',
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Build meaningful connections that last',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Embrace cutting-edge strategies',
    },
    {
      icon: Trophy,
      title: 'Results Driven',
      description: 'Focus on measurable outcomes',
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-white" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2">
                <Heart className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Our Mission</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Empowering Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Journey to Success
                </span>
              </h2>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              We believe that everyone has untapped potential waiting to be unleashed. Our mission is to provide the 
              tools, knowledge, and community support needed to help you achieve breakthrough results in both 
              your personal and professional life.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <value.icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual element */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-1">
              <div className="bg-white rounded-3xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                  alt="Team collaboration"
                  className="rounded-2xl w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-4 shadow-xl animate-float">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 rounded-full p-4 shadow-xl animate-float animation-delay-2000">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">10K+</div>
            <div className="text-gray-600 mt-2">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">95%</div>
            <div className="text-gray-600 mt-2">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600 mt-2">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">24/7</div>
            <div className="text-gray-600 mt-2">Community Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;