import React from 'react';
import { BiCalendarEvent, BiHappyBeaming, BiTargetLock, BiTimer, BiTrendingUp } from 'react-icons/bi';
import {
    FaBalanceScale, FaCalendarCheck, FaChartLine, FaCheckCircle, FaClock, FaCompass, FaDollarSign, FaFire, FaGem, FaHeart, FaLeaf, FaLightbulb, FaMountain, FaRocket, FaSeedling, FaSmile, FaStar, FaSun, FaTrophy, FaUserCheck
} from 'react-icons/fa';
import { GiHealthNormal, GiProgression, GiStairsGoal } from 'react-icons/gi';
import { MdAutoGraph, MdSelfImprovement, MdTimeline } from 'react-icons/md';
import { RiEmotionHappyLine, RiHeartPulseFill, RiMentalHealthLine, RiPlantFill } from 'react-icons/ri';

interface TemplatePageProps {
  tip: any;
  colors: any;
}

// Helper function to get category icon
const getCategoryIcon = (category: string, size: string = "text-4xl") => {
  const icons = {
    health: <FaHeart className={`${size} text-red-500`} />,
    wealth: <FaDollarSign className={`${size} text-green-500`} />,
    happiness: <FaSmile className={`${size} text-yellow-500`} />
  };
  return icons[category as keyof typeof icons] || icons.happiness;
};

// Helper function to get random benefit icon
const getBenefitIcon = (index: number) => {
  const icons = [
    <BiTargetLock className="text-3xl text-blue-500" />,
    <FaRocket className="text-3xl text-purple-500" />,
    <GiProgression className="text-3xl text-green-500" />,
    <MdAutoGraph className="text-3xl text-orange-500" />,
    <FaTrophy className="text-3xl text-yellow-500" />,
    <RiHeartPulseFill className="text-3xl text-red-500" />
  ];
  return icons[index % icons.length];
};

export const ImprovedCoverPage: React.FC<TemplatePageProps> = ({ tip, colors }) => (
  <div className="w-full h-full relative overflow-hidden">
    {/* Gradient Background with Pattern */}
    <div 
      className="absolute inset-0"
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
      }}
    />
    
    {/* Decorative Elements */}
    <div className="absolute top-10 right-10 opacity-20">
      {getCategoryIcon(tip.category, "text-[200px]")}
    </div>
    
    {/* Main Content Card */}
    <div className="relative z-10 flex items-center justify-center h-full p-12">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-3xl w-full">
        
        {/* Category Badge with Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-6 py-3 flex items-center gap-3">
            {getCategoryIcon(tip.category, "text-2xl")}
            <span className="text-lg font-semibold text-gray-700">
              {tip.category.toUpperCase()} TRANSFORMATION
            </span>
          </div>
        </div>
        
        {/* Title with Icon */}
        <h1 className="text-5xl font-bold text-center mb-6 text-gray-800">
          {tip.title}
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-center text-gray-600 mb-12">
          {tip.subtitle}
        </p>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
            <BiTimer className="text-3xl text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Time</div>
            <div className="font-bold text-gray-800">{tip.implementation_time}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
            <BiCalendarEvent className="text-3xl text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Frequency</div>
            <div className="font-bold text-gray-800">{tip.frequency}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
            <FaDollarSign className="text-3xl text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Investment</div>
            <div className="font-bold text-gray-800">{tip.cost}</div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
            <FaChartLine className="text-3xl text-orange-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Difficulty</div>
            <div className="font-bold text-gray-800">{tip.difficulty}</div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg">
            <FaRocket className="text-xl" />
            Start Your Journey Today
          </div>
        </div>
      </div>
    </div>
    
    {/* Page Number */}
    <div className="absolute bottom-8 right-8 text-white/80 font-medium">
      Page 1
    </div>
  </div>
);

export const ImprovedBenefitsPage: React.FC<TemplatePageProps> = ({ tip, colors }) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-12">
    {/* Header */}
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-3 mb-4">
        <FaGem className="text-4xl text-purple-600" />
        <h2 className="text-4xl font-bold text-gray-800">Transform Your Life</h2>
        <FaGem className="text-4xl text-purple-600" />
      </div>
      <p className="text-xl text-gray-600">Discover the incredible benefits awaiting you</p>
    </div>
    
    {/* Benefits Grid */}
    <div className="grid grid-cols-1 gap-8 mb-12">
      {/* Primary Benefit */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start gap-6">
          <div className="bg-white/20 rounded-full p-4">
            <BiTargetLock className="text-4xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">Primary Benefit</h3>
            <p className="text-lg leading-relaxed">{tip.primary_benefit}</p>
            <div className="mt-4 flex items-center gap-2">
              <FaCheckCircle className="text-green-300" />
              <span className="text-sm">Immediate Impact</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary Benefit */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start gap-6">
          <div className="bg-white/20 rounded-full p-4">
            <GiProgression className="text-4xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">Secondary Benefit</h3>
            <p className="text-lg leading-relaxed">{tip.secondary_benefit}</p>
            <div className="mt-4 flex items-center gap-2">
              <MdTimeline className="text-yellow-300" />
              <span className="text-sm">Builds Over Time</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Long-term Benefit */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start gap-6">
          <div className="bg-white/20 rounded-full p-4">
            <FaRocket className="text-4xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">Long-term Transformation</h3>
            <p className="text-lg leading-relaxed">{tip.tertiary_benefit}</p>
            <div className="mt-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-300" />
              <span className="text-sm">Life-Changing Results</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Bottom Icons Row */}
    <div className="flex justify-center items-center gap-8">
      <div className="text-center">
        <RiMentalHealthLine className="text-5xl text-indigo-500 mx-auto mb-2" />
        <span className="text-sm text-gray-600">Mental Clarity</span>
      </div>
      <div className="text-center">
        <FaBalanceScale className="text-5xl text-green-500 mx-auto mb-2" />
        <span className="text-sm text-gray-600">Life Balance</span>
      </div>
      <div className="text-center">
        <BiHappyBeaming className="text-5xl text-yellow-500 mx-auto mb-2" />
        <span className="text-sm text-gray-600">Daily Joy</span>
      </div>
      <div className="text-center">
        <GiStairsGoal className="text-5xl text-purple-500 mx-auto mb-2" />
        <span className="text-sm text-gray-600">Continuous Growth</span>
      </div>
    </div>
    
    {/* Page Number */}
    <div className="absolute bottom-8 right-8 text-gray-500 font-medium">
      Page 2
    </div>
  </div>
);

export const ImprovedImplementationPage: React.FC<TemplatePageProps> = ({ tip, colors }) => (
  <div className="w-full h-full bg-white p-12">
    {/* Header */}
    <div className="flex items-center justify-between mb-12">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-16 bg-gradient-to-b from-${colors.primary} to-${colors.secondary} rounded-full`} 
             style={{ backgroundColor: colors.primary }} />
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Your Action Plan</h2>
          <p className="text-lg text-gray-600">Simple steps to lasting change</p>
        </div>
      </div>
      <FaCompass className="text-6xl text-gray-300" />
    </div>
    
    {/* Implementation Steps */}
    <div className="grid grid-cols-2 gap-6 mb-12">
      {[
        { icon: <FaSun />, title: "Morning Ritual", desc: "Start your day with intention" },
        { icon: <FaClock />, title: "Perfect Timing", desc: `Dedicate ${tip.implementation_time} daily` },
        { icon: <FaCalendarCheck />, title: "Consistency", desc: `Practice ${tip.frequency} for best results` },
        { icon: <FaMountain />, title: "Build Momentum", desc: "Progress compounds over time" },
        { icon: <FaUserCheck />, title: "Track Progress", desc: "Monitor your transformation" },
        { icon: <FaTrophy />, title: "Celebrate Wins", desc: "Acknowledge every milestone" }
      ].map((step, index) => (
        <div key={index} className="flex items-start gap-4 bg-gray-50 rounded-xl p-6">
          <div className={`text-3xl text-${colors.primary}`} style={{ color: colors.primary }}>
            {step.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">{step.title}</h3>
            <p className="text-gray-600">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
    
    {/* Pro Tips Section */}
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaLightbulb className="text-3xl text-yellow-500" />
        <h3 className="text-2xl font-bold text-gray-800">Pro Tips for Success</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {[
          "Start small and build gradually",
          "Set reminders on your phone",
          "Find an accountability partner",
          "Track your daily progress",
          "Celebrate small victories",
          "Be patient with yourself"
        ].map((tip, index) => (
          <div key={index} className="flex items-center gap-3">
            <FaCheckCircle className="text-green-500" />
            <span className="text-gray-700">{tip}</span>
          </div>
        ))}
      </div>
    </div>
    
    {/* Bottom Motivational Quote */}
    <div className="mt-12 text-center">
      <div className="inline-flex items-center gap-3 bg-gray-100 rounded-full px-8 py-4">
        <FaFire className="text-2xl text-orange-500" />
        <span className="text-lg font-medium text-gray-700">
          "Success is the sum of small efforts repeated daily"
        </span>
        <FaFire className="text-2xl text-orange-500" />
      </div>
    </div>
    
    {/* Page Number */}
    <div className="absolute bottom-8 right-8 text-gray-500 font-medium">
      Page 3
    </div>
  </div>
);

export const ImprovedProgressPage: React.FC<TemplatePageProps> = ({ tip, colors }) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-12">
    {/* Header */}
    <div className="text-center mb-12">
      <MdTimeline className="text-6xl text-indigo-600 mx-auto mb-4" />
      <h2 className="text-4xl font-bold text-gray-800 mb-2">Track Your Journey</h2>
      <p className="text-xl text-gray-600">Every step counts towards your transformation</p>
    </div>
    
    {/* Progress Timeline */}
    <div className="relative mb-12">
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-300"></div>
      
      {[
        { day: "Day 1", icon: <FaSeedling />, title: "Plant the Seed", desc: "Begin your journey" },
        { day: "Week 1", icon: <FaLeaf />, title: "First Sprouts", desc: "Notice initial changes" },
        { day: "Month 1", icon: <RiPlantFill />, title: "Growing Strong", desc: "Habits taking root" },
        { day: "Month 3", icon: <FaMountain />, title: "Peak Performance", desc: "Transformation complete" }
      ].map((milestone, index) => (
        <div key={index} className={`flex items-center mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
            <div className={`inline-block bg-white rounded-xl shadow-lg p-6 ${index % 2 === 0 ? 'mr-0' : 'ml-0'}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl text-green-500">{milestone.icon}</span>
                <div className={index % 2 === 0 ? 'text-right' : ''}>
                  <div className="text-sm text-gray-500 font-medium">{milestone.day}</div>
                  <div className="font-bold text-lg text-gray-800">{milestone.title}</div>
                </div>
              </div>
              <p className="text-gray-600">{milestone.desc}</p>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white"></div>
          <div className="w-1/2"></div>
        </div>
      ))}
    </div>
    
    {/* Success Metrics */}
    <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Success Indicators</h3>
      
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: <BiTrendingUp />, label: "Energy Level", color: "text-green-600" },
          { icon: <RiEmotionHappyLine />, label: "Mood Boost", color: "text-yellow-600" },
          { icon: <MdSelfImprovement />, label: "Self-Confidence", color: "text-purple-600" },
          { icon: <GiHealthNormal />, label: "Overall Health", color: "text-red-600" }
        ].map((metric, index) => (
          <div key={index} className="text-center">
            <div className={`text-5xl ${metric.color} mb-2`}>{metric.icon}</div>
            <div className="text-sm font-medium text-gray-700">{metric.label}</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                style={{ width: `${(index + 1) * 25}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Page Number */}
    <div className="absolute bottom-8 right-8 text-gray-500 font-medium">
      Page 4
    </div>
  </div>
);

export const ImprovedCTAPage: React.FC<TemplatePageProps> = ({ tip, colors }) => (
  <div className="w-full h-full relative overflow-hidden">
    {/* Animated Background */}
    <div 
      className="absolute inset-0"
      style={{
        background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`
      }}
    />
    
    {/* Overlay Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="grid grid-cols-8 grid-rows-8 h-full">
        {[...Array(64)].map((_, i) => (
          <div key={i} className="border border-white/20"></div>
        ))}
      </div>
    </div>
    
    {/* Content */}
    <div className="relative z-10 flex items-center justify-center h-full p-12">
      <div className="text-center text-white max-w-4xl">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white/20 rounded-full backdrop-blur-sm">
            <FaTrophy className="text-6xl text-yellow-300" />
          </div>
        </div>
        
        {/* Main Message */}
        <h2 className="text-5xl font-bold mb-6">
          Your Journey Starts Now!
        </h2>
        
        <p className="text-2xl mb-12 opacity-90">
          You have everything you need to transform your life.
          Take the first step today and never look back.
        </p>
        
        {/* Action Items */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <h3 className="text-3xl font-bold mb-6">Next Steps</h3>
          
          <div className="grid grid-cols-2 gap-6 text-left">
            {[
              { icon: <FaCheckCircle />, text: "Download this guide for reference" },
              { icon: <FaCalendarCheck />, text: "Schedule your first session" },
              { icon: <FaUserCheck />, text: "Share with a friend for accountability" },
              { icon: <FaRocket />, text: "Start implementing today" }
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-2xl text-green-300">{step.icon}</span>
                <span className="text-lg">{step.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Final CTA */}
        <div className="space-y-4">
          <div className="text-6xl font-bold tracking-wider">BDBT</div>
          <p className="text-2xl opacity-90">Better Days, Better Tomorrow</p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <FaStar className="text-3xl text-yellow-300" />
            <FaStar className="text-3xl text-yellow-300" />
            <FaStar className="text-3xl text-yellow-300" />
            <FaStar className="text-3xl text-yellow-300" />
            <FaStar className="text-3xl text-yellow-300" />
          </div>
          <p className="text-lg opacity-80 mt-4">Join thousands who've transformed their lives</p>
        </div>
      </div>
    </div>
    
    {/* Page Number */}
    <div className="absolute bottom-8 right-8 text-white/80 font-medium">
      Page 5
    </div>
  </div>
);