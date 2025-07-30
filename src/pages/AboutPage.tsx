import React from 'react';
import Navigation from '../components/landing/Navigation';
import Footer from '../components/landing/Footer';
import { Users, Heart, Star, Target, TrendingUp, Award, Sparkles, Calendar } from 'lucide-react';

const AboutPage: React.FC = () => {
  const coreValues = [
    {
      icon: Heart,
      title: 'Authenticity',
      description: 'We believe in genuine, honest communication and real results over hype.',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Community First',
      description: "Our community's success is our success. We're in this journey together.",
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Star,
      title: 'Excellence',
      description: 'We strive for the highest quality in everything we create and deliver.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Target,
      title: 'Consistency',
      description: 'Sustainable growth comes from consistent action and reliable systems.',
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  const teamMembers = [
    {
      name: 'John Davidson',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'Visionary leader with 15+ years in personal development',
    },
    {
      name: 'Sarah Mitchell',
      role: 'Head of Community',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      bio: 'Community builder passionate about member success',
    },
    {
      name: 'Michael Chen',
      role: 'Content Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Creative strategist with expertise in educational content',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Growth',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Growth expert focused on scaling impact',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Community Members', icon: Users },
    { value: '10K+', label: 'Success Stories', icon: Award },
    { value: '100+', label: 'Free Resources', icon: Sparkles },
    { value: '95%', label: 'Satisfaction Rate', icon: TrendingUp },
  ];

  const milestones = [
    { year: '2020', event: 'Founded with a vision to democratize success strategies' },
    { year: '2021', event: 'Reached 10,000 community members' },
    { year: '2022', event: 'Launched premium membership and coaching programs' },
    { year: '2023', event: 'Expanded to 50,000+ members globally' },
    { year: '2024', event: 'Building the future of personal development' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900">
              Our Story & Mission
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Founded on the belief that everyone deserves to live their best life, we've dedicated 
              ourselves to creating a community where growth, success, and transformation are not 
              just possible—they're inevitable.
            </p>
          </div>

          {/* Sub-navigation */}
          <div className="flex justify-center gap-8 mt-12">
            <a href="#origin" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Company Origins
            </a>
            <a href="#values" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Our Values
            </a>
            <a href="#team" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Our Team
            </a>
            <a href="#work" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Work With Us
            </a>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section id="origin" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">How It All Began</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
              </div>
              
              <div className="space-y-6 text-gray-600">
                <p className="text-lg">
                  What started as a passion project in 2020 has grown into a thriving community of 
                  over 50,000 ambitious individuals. Our founder recognized a gap in the market for 
                  authentic, actionable content that actually helps people achieve their goals.
                </p>
                
                <p className="text-lg">
                  Through countless hours of research, testing, and community feedback, we've developed 
                  a proven methodology that has helped thousands of people transform their lives and 
                  businesses.
                </p>
                
                <p className="text-lg">
                  Today, we're proud to be a trusted resource for entrepreneurs, professionals, and 
                  anyone committed to personal growth and success.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-blue-600 shadow-lg">
                      <span className="text-sm font-bold text-blue-600">{milestone.year}</span>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-6 shadow-sm">
                      <p className="text-gray-700">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section id="values" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The People Behind the Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team is a diverse group of experts, creators, and growth enthusiasts who share a 
              common vision: to help as many people as possible achieve their dreams and live 
              fulfilling lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 text-center">
            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              We're not just colleagues—we're a family united by purpose, driven by results, and 
              committed to making a difference in the lives of those we serve.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Impact by the Numbers</h2>
            <p className="text-xl text-blue-100">
              These numbers represent real people who have transformed their lives through our 
              community and resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work With Us CTA */}
      <section id="work" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Join Our Mission?</h2>
          <p className="text-xl text-gray-600 mb-12">
            Whether you want to join our team, partner with us, or become part of our community, 
            we're excited to connect with you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/careers"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Join Our Team
            </a>
            <a
              href="/partnership"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:border-gray-400 transition-all duration-300"
            >
              Become a Partner
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;