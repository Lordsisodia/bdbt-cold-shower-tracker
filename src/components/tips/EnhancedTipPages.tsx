import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, CheckCircle, Star, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface MockTip {
  id: number;
  title: string;
  subtitle: string;
  category: 'health' | 'wealth' | 'happiness';
  difficulty: string;
  description: string;
  primary_benefit: string;
  secondary_benefit: string;
  tertiary_benefit: string;
  implementation_time: string;
  frequency: string;
  cost: string;
  images: {
    hero: string;
    benefits: string;
    implementation: string;
    cta: string;
  };
}

interface EnhancedTipPagesProps {
  tip: MockTip;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const EnhancedTipPages: React.FC<EnhancedTipPagesProps> = ({ tip, colors }) => {
  const [expandedBenefit, setExpandedBenefit] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Enhanced mock data
  const enhancedBenefits = [
    {
      title: "Primary Impact",
      description: tip.primary_benefit,
      icon: "🎯",
      timeToSee: "2-3 weeks",
      effectiveness: 95,
      userStories: [
        { name: "Sarah M.", age: 34, result: "Increased productivity by 40%", timeframe: "3 weeks" },
        { name: "Mike R.", age: 28, result: "Better stress management", timeframe: "2 weeks" }
      ],
      scientificBacking: "Harvard Study 2023: 85% effectiveness rate"
    },
    {
      title: "Secondary Boost", 
      description: tip.secondary_benefit,
      icon: "💪",
      timeToSee: "1-2 months",
      effectiveness: 87,
      userStories: [
        { name: "Lisa K.", age: 42, result: "Improved confidence levels", timeframe: "6 weeks" }
      ],
      scientificBacking: "Stanford Research: 70% improvement in self-efficacy"
    },
    {
      title: "Long-term Growth",
      description: tip.tertiary_benefit,
      icon: "🚀", 
      timeToSee: "3-6 months",
      effectiveness: 92,
      userStories: [
        { name: "David L.", age: 38, result: "Sustained habit formation", timeframe: "4 months" }
      ],
      scientificBacking: "MIT Behavioral Lab: 92% long-term success rate"
    }
  ];

  const implementationSteps = [
    {
      title: "Foundation Setup",
      description: "Establish your environment and initial commitment",
      duration: "10 minutes",
      difficulty: 2,
      tips: ["Start smaller than you think", "Choose consistent timing"],
      mistakes: ["Setting unrealistic expectations", "Skipping preparation"]
    },
    {
      title: "Daily Practice",
      description: "Begin your consistent daily routine",  
      duration: "5-15 minutes",
      difficulty: 3,
      tips: ["Track progress visually", "Celebrate small wins"],
      mistakes: ["Perfectionism", "Irregular timing"]
    },
    {
      title: "Optimization",
      description: "Refine and improve your approach",
      duration: "Variable",
      difficulty: 4,
      tips: ["Listen to your body/mind", "Adjust based on results"],
      mistakes: ["Changing too quickly", "Ignoring feedback"]
    }
  ];

  const progressMetrics = [
    { metric: "Consistency Rate", current: 78, target: 85, unit: "%" },
    { metric: "Weekly Progress", current: 6.5, target: 8, unit: "/10" },
    { metric: "Time Investment", current: 12, target: 15, unit: "min/day" }
  ];

  const toggleStepCompletion = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const pages = [
    // Enhanced Cover Page
    {
      name: 'Enhanced Cover',
      content: (
        <div className="w-full h-full relative overflow-hidden">
          {/* Dynamic Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${tip.images.hero})` }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${colors.primary}E6 0%, ${colors.accent}CC 50%, ${colors.secondary}E6 100%)` 
            }}
          />
          
          {/* Animated Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full animate-pulse delay-500" />
          </div>

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-12 text-white">
            {/* Category Badge with Stats */}
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/20 rounded-2xl mb-8 backdrop-blur-md">
              <div className="text-center">
                <div className="text-xs opacity-75">CATEGORY</div>
                <div className="font-bold text-sm uppercase tracking-wider">{tip.category}</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <div className="text-xs opacity-75">DIFFICULTY</div>
                <div className="font-bold text-sm">{tip.difficulty}</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <div className="text-xs opacity-75">SUCCESS RATE</div>
                <div className="font-bold text-sm">89%</div>
              </div>
            </div>
            
            {/* Enhanced Title */}
            <h1 className="text-6xl font-bold mb-4 leading-tight max-w-4xl text-center">
              {tip.title}
            </h1>
            
            {/* Tagline */}
            <div className="text-2xl font-semibold mb-6 opacity-90">
              Transform Your Life Daily
            </div>
            
            <p className="text-xl opacity-80 max-w-3xl mx-auto mb-12 text-center">
              {tip.subtitle}
            </p>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-3 gap-8 text-center mb-8">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm opacity-75">Time Required</div>
                <div className="text-lg font-bold">{tip.implementation_time}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm opacity-75">Results In</div>
                <div className="text-lg font-bold">2-3 weeks</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <DollarSign className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm opacity-75">Investment</div>
                <div className="text-lg font-bold">{tip.cost}</div>
              </div>
            </div>

            {/* BDBT Branding */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="text-3xl font-bold">BDBT</div>
              <div className="text-sm opacity-75">Better Days, Better Tomorrow</div>
            </div>
          </div>
        </div>
      )
    },

    // Interactive Benefits Page
    {
      name: 'Interactive Benefits',
      content: (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          {/* Header Section */}
          <div 
            className="absolute top-0 left-0 right-0 h-20"
            style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }}
          />
          
          <div className="relative z-10 w-full h-full p-8">
            <div className="text-center mb-8 pt-4">
              <h2 className="text-4xl font-bold mb-3" style={{ color: colors.primary }}>
                Proven Benefits
              </h2>
              <p className="text-lg text-gray-600">Scientific evidence meets real results</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: colors.accent }} />
                  <span className="text-sm font-medium" style={{ color: colors.accent }}>
                    10,000+ Success Stories
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" style={{ color: colors.accent }} />
                  <span className="text-sm font-medium" style={{ color: colors.accent }}>
                    4.8/5 Rating
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-w-5xl mx-auto">
              {enhancedBenefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  {/* Benefit Header */}
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedBenefit(expandedBenefit === index ? null : index)}
                  >
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        {benefit.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {benefit.timeToSee}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{benefit.description}</p>
                        
                        {/* Effectiveness Bar */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">Effectiveness:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                backgroundColor: colors.primary,
                                width: `${benefit.effectiveness}%`
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium" style={{ color: colors.primary }}>
                            {benefit.effectiveness}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        {expandedBenefit === index ? 
                          <ChevronUp className="w-6 h-6 text-gray-400" /> : 
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedBenefit === index && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-6 mt-4">
                        {/* User Stories */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Success Stories</h4>
                          <div className="space-y-3">
                            {benefit.userStories.map((story, storyIndex) => (
                              <div key={storyIndex} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{story.name}</span>
                                  <span className="text-xs text-gray-500">Age {story.age}</span>
                                </div>
                                <p className="text-sm text-gray-700">{story.result}</p>
                                <span className="text-xs text-green-600 font-medium">
                                  Results in {story.timeframe}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scientific Evidence */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Scientific Evidence</h4>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                🔬
                              </div>
                              <span className="font-medium text-blue-900">Research Backed</span>
                            </div>
                            <p className="text-sm text-blue-800">{benefit.scientificBacking}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // Interactive Implementation Guide
    {
      name: 'Interactive Implementation',
      content: (
        <div className="w-full h-full relative overflow-hidden bg-white">
          <div className="relative z-10 w-full h-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3" style={{ color: colors.primary }}>
                Step-by-Step Implementation
              </h2>
              <p className="text-lg text-gray-600">Your roadmap to success</p>
            </div>

            {/* Progress Overview */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                <p className="text-sm text-gray-600">
                  {completedSteps.size} of {implementationSteps.length} steps completed
                </p>
              </div>
              
              <div className="flex gap-2 justify-center mb-4">
                {implementationSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      completedSteps.has(index)
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                    style={{ 
                      backgroundColor: completedSteps.has(index) ? colors.primary : undefined 
                    }}
                  >
                    {completedSteps.has(index) ? '✓' : index + 1}
                  </div>
                ))}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: colors.primary,
                    width: `${(completedSteps.size / implementationSteps.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Implementation Steps */}
            <div className="space-y-6 max-w-4xl mx-auto">
              {implementationSteps.map((step, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Step Number/Checkbox */}
                      <button
                        onClick={() => toggleStepCompletion(index)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          completedSteps.has(index)
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{ 
                          backgroundColor: completedSteps.has(index) ? colors.primary : undefined 
                        }}
                      >
                        {completedSteps.has(index) ? <CheckCircle className="w-6 h-6" /> : index + 1}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {step.duration}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < step.difficulty ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{step.description}</p>

                        {/* Tips and Mistakes */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-3">
                            <h4 className="font-medium text-green-900 mb-1 text-sm">💡 Pro Tips</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex}>• {tip}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-red-50 rounded-lg p-3">
                            <h4 className="font-medium text-red-900 mb-1 text-sm">⚠️ Avoid These</h4>
                            <ul className="text-sm text-red-800 space-y-1">
                              {step.mistakes.map((mistake, mistakeIndex) => (
                                <li key={mistakeIndex}>• {mistake}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },

    // Progress Dashboard
    {
      name: 'Progress Dashboard',
      content: (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
          <div className="relative z-10 w-full h-full p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3" style={{ color: colors.primary }}>
                Track Your Success
              </h2>
              <p className="text-lg text-gray-600">Monitor progress and celebrate milestones</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              {progressMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">{metric.metric}</h3>
                  <div className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
                    {metric.current}{metric.unit}
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    Target: {metric.target}{metric.unit}
                  </div>
                  
                  {/* Progress Circle */}
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 rounded-full border-4 border-gray-200" />
                    <div 
                      className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent transition-all duration-1000"
                      style={{ 
                        borderColor: colors.primary,
                        transform: `rotate(${(metric.current / metric.target) * 360}deg)`,
                        borderRightColor: 'transparent',
                        borderBottomColor: 'transparent'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Calendar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Tracking</h3>
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm font-medium text-gray-600 mb-2">{day}</div>
                    <div 
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-medium ${
                        index < 5 ? '' : 'opacity-50'
                      }`}
                      style={{ backgroundColor: index < 5 ? colors.primary : '#d1d5db' }}
                    >
                      {index < 5 ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return { pages };
};

export default EnhancedTipPages;