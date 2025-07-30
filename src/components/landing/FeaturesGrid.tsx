import React from 'react';
import { Target, Users, TrendingUp, Star, Zap, Shield, BookOpen, HeartHandshake, ArrowRight } from 'lucide-react';

const FeaturesGrid: React.FC = () => {
  const mainFeatures = [
    {
      icon: Target,
      title: 'Strategic Guidance',
      description: 'Expert-led frameworks to help you set and achieve meaningful goals with precision.',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Users,
      title: 'Community Network',
      description: 'Connect with ambitious professionals and entrepreneurs on similar journeys.',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Proven Strategies',
      description: 'Time-tested methodologies that deliver measurable business outcomes.',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: Star,
      title: 'Premium Content',
      description: 'Exclusive access to high-quality resources, tools, and expert insights.',
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
    },
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: 'Fast Implementation',
      description: 'Quick-start templates and actionable blueprints for immediate results.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: 'Success Guarantee',
      description: 'Our proven framework comes with a 30-day satisfaction guarantee.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: BookOpen,
      title: 'Learning Paths',
      description: 'Structured courses designed for different experience levels and goals.',
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      icon: HeartHandshake,
      title: '1-on-1 Coaching',
      description: 'Personal mentorship from industry leaders and successful entrepreneurs.',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Why Choose BDBT</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools, resources, and support you need to transform your journey
          </p>
        </div>

        {/* Main features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.gradient}`} />
              
              {/* Icon container */}
              <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            </div>
          ))}
        </div>

        {/* Additional features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h4>
              
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
            Explore All Features
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;