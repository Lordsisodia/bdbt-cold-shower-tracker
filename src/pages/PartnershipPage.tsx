import React, { useState } from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Users, Rocket, Target, Star, CheckCircle, Globe, Heart, Mail, Phone, Building, ArrowRight, Loader } from 'lucide-react';
import { submitContact, validateEmail, showSuccessToast, showErrorToast } from '../utils/formUtils';

interface PartnershipType {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  icon: React.FC<any>;
  color: string;
  gradient: string;
}

const PartnershipPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    partnershipType: '',
    message: ''
  });

  const partnershipTypes: PartnershipType[] = [
    {
      id: 'brand',
      title: 'Brand Partnerships',
      description: 'Align your brand with our engaged community of growth-minded individuals.',
      benefits: [
        'Access to 50,000+ active members',
        'Sponsored content opportunities',
        'Custom campaign development',
        'Performance tracking & analytics',
        'Multi-channel promotion'
      ],
      icon: Building,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'creator',
      title: 'Creator Collaborations',
      description: 'Join forces with us to create impactful content that transforms lives.',
      benefits: [
        'Co-creation opportunities',
        'Revenue sharing models',
        'Cross-promotion channels',
        'Production support',
        'Community amplification'
      ],
      icon: Rocket,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'corporate',
      title: 'Corporate Wellness',
      description: 'Bring the BDBT methodology to your organization for employee growth.',
      benefits: [
        'Custom workshop development',
        'Employee wellness programs',
        'Leadership training',
        'Team building sessions',
        'Progress tracking tools'
      ],
      icon: Users,
      color: 'green',
      gradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'affiliate',
      title: 'Affiliate Program',
      description: 'Earn while helping others transform their lives with our proven system.',
      benefits: [
        'Competitive commission rates',
        'Marketing materials provided',
        'Dedicated affiliate support',
        'Real-time tracking dashboard',
        'Monthly bonus opportunities'
      ],
      icon: Target,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const successStories = [
    {
      company: 'TechCorp Solutions',
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop',
      quote: 'The BDBT corporate wellness program transformed our company culture. Employee satisfaction is at an all-time high.',
      author: 'Sarah Johnson, HR Director',
      metric: '87% increase in employee engagement'
    },
    {
      company: 'FitLife Brand',
      logo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=200&h=100&fit=crop',
      quote: 'Partnering with BDBT gave us access to the most engaged health-conscious community we\'ve ever worked with.',
      author: 'Mike Chen, Marketing Director',
      metric: '3.2x ROI on campaign spend'
    },
    {
      company: 'Success Academy',
      logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=100&fit=crop',
      quote: 'Our content collaboration reached millions and genuinely helped people improve their lives. It\'s a win-win.',
      author: 'Lisa Rodriguez, Founder',
      metric: '2M+ combined reach'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Active Community', icon: Users },
    { value: '10M+', label: 'Monthly Impressions', icon: Globe },
    { value: '95%', label: 'Engagement Rate', icon: Heart },
    { value: '200+', label: 'Brand Partners', icon: Building }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!contactForm.name.trim()) {
      showErrorToast('Please enter your name');
      return;
    }
    if (!contactForm.email || !validateEmail(contactForm.email)) {
      showErrorToast('Please enter a valid email address');
      return;
    }
    if (!contactForm.message.trim()) {
      showErrorToast('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitContact({
        name: contactForm.name,
        email: contactForm.email,
        company: contactForm.company,
        partnershipType: contactForm.partnershipType,
        message: contactForm.message
      });

      if (success) {
        showSuccessToast('Thank you! We\'ll get back to you within 24 hours.');
        setContactForm({
          name: '',
          email: '',
          company: '',
          partnershipType: '',
          message: ''
        });
      } else {
        showErrorToast('Something went wrong. Please try again.');
      }
    } catch (error) {
      showErrorToast('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
              <Users className="w-5 h-5 text-white" />
              <span className="text-white font-medium">PARTNERSHIP OPPORTUNITIES</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white">
                Grow Together
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Partner with BDBT to create meaningful impact. Whether you're a brand, creator, or 
                organization, let's build something extraordinary together.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <stat.icon className="w-8 h-8 text-white/70 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Partnership Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the partnership model that aligns with your goals and let's create value together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {partnershipTypes.map((type) => (
              <div
                key={type.id}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
                  selectedType === type.id ? 'ring-4 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${type.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-6">{type.description}</p>

                  <div className="space-y-3">
                    {type.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`mt-8 w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedType === type.id
                      ? 'bg-gradient-to-r ' + type.gradient + ' text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our partners have achieved remarkable results through collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <img 
                  src={story.logo} 
                  alt={story.company}
                  className="h-12 object-contain mb-6"
                />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 italic mb-6">"{story.quote}"</p>
                
                <div className="border-t pt-6">
                  <p className="font-semibold text-gray-900">{story.author}</p>
                  <p className="text-sm text-gray-600 mb-3">{story.company}</p>
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {story.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our partnership process is designed to be simple, transparent, and mutually beneficial.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Initial Consultation',
                  description: 'We discuss your goals, expectations, and how we can create value together.'
                },
                {
                  step: '02',
                  title: 'Custom Proposal',
                  description: 'Our team crafts a tailored partnership proposal aligned with your objectives.'
                },
                {
                  step: '03',
                  title: 'Launch & Execute',
                  description: 'We implement the partnership with full support and regular communication.'
                },
                {
                  step: '04',
                  title: 'Measure & Optimize',
                  description: 'Track performance, gather insights, and continuously improve results.'
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Let's Start a Conversation</h2>
            <p className="text-xl text-blue-100">
              Ready to explore partnership opportunities? We'd love to hear from you.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="john@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/80 mb-2">Partnership Type</label>
                  <select 
                    value={contactForm.partnershipType}
                    onChange={(e) => setContactForm(prev => ({ ...prev, partnershipType: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="">Select Type</option>
                    <option value="brand">Brand Partnership</option>
                    <option value="creator">Creator Collaboration</option>
                    <option value="corporate">Corporate Wellness</option>
                    <option value="affiliate">Affiliate Program</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Message</label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Tell us about your partnership ideas..."
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isSubmitting 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Partnership Inquiry'
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/20 text-center">
              <p className="text-white/80 mb-4">Prefer to reach out directly?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:partnerships@bdbt.com" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                  <Mail className="w-5 h-5" />
                  partnerships@bdbt.com
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors">
                  <Phone className="w-5 h-5" />
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PartnershipPage;