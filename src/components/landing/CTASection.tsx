import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import React from 'react';

const CTASection: React.FC = () => {
  const benefits = [
    'Access to exclusive content',
    'Weekly coaching sessions',
    'Private community access',
    '30-day money-back guarantee',
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">Limited Time Offer</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
            Ready to Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              Success Journey?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Join thousands of ambitious individuals who have already started their transformation. 
            Take the first step today and unlock your full potential.
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="group bg-white text-gray-900 px-8 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-2xl">
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="bg-transparent hover:bg-white/10 text-white border-2 border-white/30 px-8 py-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2">
              Schedule a Call
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-sm text-gray-300">Customer Rating</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-sm text-gray-300">Happy Members</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">95%</div>
              <div className="text-sm text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;