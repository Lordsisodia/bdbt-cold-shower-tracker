import React from 'react';
import { 
  FaHeart, FaBrain, FaDumbbell, FaChartLine, FaRocket, FaTrophy,
  FaCheckCircle, FaLightbulb, FaCalendarCheck, FaClock, FaDollarSign,
  FaStar, FaUserCheck, FaHandHoldingHeart, FaMedal, FaFire
} from 'react-icons/fa';
import { BiTimer, BiTrendingUp } from 'react-icons/bi';
import { MdAutoGraph } from 'react-icons/md';

interface SinglePageTemplateProps {
  tip: any;
  colors: any;
}

export const ImprovedSinglePageTemplate: React.FC<SinglePageTemplateProps> = ({ tip, colors }) => (
  <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
    {/* Header with gradient and icon */}
    <div 
      className="absolute top-0 left-0 right-0 h-32"
      style={{ 
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
      }}
    />
    
    {/* Main Content Card */}
    <div className="relative z-10 p-8 h-full flex flex-col">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {tip.category === 'health' && <FaHeart className="text-3xl text-red-500" />}
              {tip.category === 'wealth' && <FaDollarSign className="text-3xl text-green-500" />}
              {tip.category === 'happiness' && <FaStar className="text-3xl text-yellow-500" />}
              <span className="text-sm font-bold uppercase tracking-wider text-gray-500">
                {tip.category} TRANSFORMATION
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{tip.title}</h1>
            <p className="text-lg text-gray-600">{tip.subtitle}</p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 ml-6">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <BiTimer className="text-2xl text-blue-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Time</div>
              <div className="font-bold text-sm">{tip.implementation_time}</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <FaCalendarCheck className="text-2xl text-green-500 mx-auto mb-1" />
              <div className="text-xs text-gray-600">Frequency</div>
              <div className="font-bold text-sm">{tip.frequency}</div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-700 leading-relaxed mb-6">
          {tip.description}
        </p>
        
        {/* Benefits Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaRocket className="text-xl text-blue-600" />
              <h3 className="font-bold text-sm text-gray-800">Primary</h3>
            </div>
            <p className="text-sm text-gray-700">{tip.primary_benefit}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BiTrendingUp className="text-xl text-green-600" />
              <h3 className="font-bold text-sm text-gray-800">Secondary</h3>
            </div>
            <p className="text-sm text-gray-700">{tip.secondary_benefit}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MdAutoGraph className="text-xl text-purple-600" />
              <h3 className="font-bold text-sm text-gray-800">Long-term</h3>
            </div>
            <p className="text-sm text-gray-700">{tip.tertiary_benefit}</p>
          </div>
        </div>
      </div>
      
      {/* Implementation Steps */}
      <div className="bg-white rounded-2xl shadow-xl p-6 flex-1">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaLightbulb className="text-yellow-500" />
          Quick Implementation Guide
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <FaCheckCircle className="text-green-500" />, text: "Start with just " + tip.implementation_time },
            { icon: <FaUserCheck className="text-blue-500" />, text: "Practice " + tip.frequency + " for best results" },
            { icon: <FaTrophy className="text-yellow-500" />, text: "Track your progress daily" },
            { icon: <FaFire className="text-orange-500" />, text: "Celebrate small wins" }
          ].map((step, index) => (
            <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              {step.icon}
              <span className="text-sm text-gray-700">{step.text}</span>
            </div>
          ))}
        </div>
        
        {/* Bottom section with CTA */}
        <div className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">Ready to Transform Your Life?</h3>
          <p className="text-sm opacity-90 mb-4">
            Start today and experience the benefits within days!
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-2xl font-bold">BDBT</div>
            <div className="w-px h-6 bg-white/30"></div>
            <div className="text-sm">Better Days, Better Tomorrow</div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Corner decoration */}
    <div className="absolute bottom-0 right-0 opacity-10">
      {tip.category === 'health' && <FaHeart className="text-[300px] -mr-20 -mb-20" />}
      {tip.category === 'wealth' && <FaDollarSign className="text-[300px] -mr-20 -mb-20" />}
      {tip.category === 'happiness' && <FaStar className="text-[300px] -mr-20 -mb-20" />}
    </div>
  </div>
);