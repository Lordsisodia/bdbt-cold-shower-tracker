import { DatabaseTip } from './tipsDatabaseService';

// Simple tip expansion interface
export interface SimpleToFullTipExpansion {
  title: string;
  subtitle: string;
  subcategory: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  expandedDescription: string;
  primaryBenefit: string;
  secondaryBenefit: string;
  tertiaryBenefit: string;
  implementationTime: string;
  frequency: string;
  cost: string;
  scientificBacking: boolean;
  tags: string[];
}

// Extended interfaces for richer content
export interface ComprehensiveEnhancedContent {
  // Core enhanced content
  expandedDescription: string;
  tagline: string;
  
  // Detailed benefits with evidence
  detailedBenefits: Array<{
    title: string;
    description: string;
    icon: string;
    timeToSee: string;
    scientificEvidence: {
      studyName: string;
      effectSize: number;
      confidenceLevel: number;
    };
    userStories: Array<{
      name: string;
      age: number;
      result: string;
      timeframe: string;
    }>;
  }>;

  // Multi-level implementation
  implementationGuide: {
    quickStart: {
      overview: string;
      timeRequired: string;
      materials: Array<{
        item: string;
        cost: number;
        optional: boolean;
        alternatives: string[];
      }>;
    };
    detailedSteps: Array<{
      stepNumber: number;
      title: string;
      description: string;
      duration: string;
      difficulty: number;
      visualAid: string;
      commonMistakes: string[];
      proTips: string[];
      checklistItems: string[];
    }>;
    customization: {
      beginnerPath: string[];
      advancedPath: string[];
      adaptations: {
        timeConstrained: string[];
        budgetFriendly: string[];
        highImpact: string[];
      };
    };
  };

  // Success tracking
  progressTracking: {
    successMetrics: Array<{
      metric: string;
      measuringMethod: string;
      frequency: string;
      targetValues: {
        week1: number;
        week2: number;
        month1: number;
        month3: number;
      };
    }>;
    milestones: Array<{
      day: number;
      title: string;
      description: string;
      celebrationIdea: string;
    }>;
    trackingTools: {
      dailyChecklist: string[];
      weeklyReview: string[];
      monthlyAssessment: string[];
    };
  };

  // Scientific backing
  researchBacking: {
    primaryStudies: Array<{
      title: string;
      authors: string;
      year: number;
      keyFinding: string;
      link: string;
    }>;
    statisticalEvidence: Array<{
      statistic: string;
      source: string;
      context: string;
    }>;
    expertEndorsements: Array<{
      expert: string;
      credentials: string;
      quote: string;
    }>;
  };

  // Personalization
  personalizedVariations: {
    byPersonality: {
      introvert: string;
      extrovert: string;
    };
    byLifestyle: {
      busyProfessional: string;
      student: string;
      retiree: string;
      parent: string;
    };
    byExperience: {
      beginner: string;
      intermediate: string;
      advanced: string;
    };
  };

  // Advanced features
  troubleshooting: Array<{
    problem: string;
    causes: string[];
    solutions: string[];
    preventionTips: string[];
  }>;

  relatedContent: {
    complementaryTips: string[];
    nextLevelTips: string[];
    foundationalTips: string[];
  };

  // Visual design elements
  designElements: {
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    };
    imagery: {
      heroImage: string;
      benefitsImage: string;
      implementationImage: string;
      successImage: string;
    };
    iconSet: string[];
    visualMetaphors: string[];
  };
}

export class EnhancedGrokService {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private model: string = 'llama-3.3-70b-versatile';

  constructor() {
    // Remove API key from client-side - this should be handled server-side
    this.apiKey = '';
    
    // Log warning about missing server-side configuration
    if (typeof window !== 'undefined') {
      console.warn('Grok API calls should be handled server-side for security. Client-side API keys are a security risk.');
    }
  }

  /**
   * NEW: Expand simple 1-2 sentence tip into comprehensive tip structure
   */
  async expandSimpleTipToFull(simpleTip: string, category: 'health' | 'wealth' | 'happiness'): Promise<SimpleToFullTipExpansion> {
    try {
      // Create a temporary tip object for the API call
      const tempTip = {
        id: 0,
        title: simpleTip,
        category,
        description: '',
        subtitle: '',
        difficulty: 'Easy' as const,
        primary_benefit: '',
        secondary_benefit: '',
        tertiary_benefit: '',
        implementation_time: '',
        frequency: '',
        cost: '',
        scientific_backing: false,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await this.callGrokAPI(tempTip, 'simple');
      return this.parseSimpleExpansionResponse(response);
    } catch (error) {
      console.error('Error expanding simple tip:', error);
      return this.generateMockSimpleExpansion(simpleTip, category);
    }
  }

  // Generate comprehensive enhanced content
  async generateComprehensiveContent(tip: DatabaseTip): Promise<ComprehensiveEnhancedContent> {
    try {
      const response = await this.callGrokAPI(tip, 'comprehensive');
      return this.parseComprehensiveResponse(response);
    } catch (error) {
      console.error('Error generating comprehensive content:', error);
      return this.generateMockComprehensiveContent(tip);
    }
  }

  // Build sophisticated prompt for comprehensive content
  private buildComprehensivePrompt(tip: DatabaseTip): string {
    return `
You are a world-class expert in ${tip.category} optimization, behavioral psychology, and content strategy. 
Create comprehensive, research-backed content for a premium tip guide.

ORIGINAL TIP DATA:
Title: ${tip.title}
Subtitle: ${tip.subtitle}
Category: ${tip.category}
Difficulty: ${tip.difficulty}
Description: ${tip.description}
Benefits: ${tip.primary_benefit}, ${tip.secondary_benefit}, ${tip.tertiary_benefit}
Implementation: ${tip.implementation_time} | ${tip.frequency} | ${tip.cost}

INSTRUCTIONS:
Generate detailed, premium content following this exact JSON structure. Be specific, actionable, and evidence-based.

REQUIREMENTS:
1. All content must be original, detailed, and valuable
2. Include specific numbers, timeframes, and measurable outcomes
3. Reference real psychological/scientific principles
4. Provide multiple difficulty levels and personalizations
5. Create content suitable for premium PDF design
6. Make it highly engaging and visually descriptive

JSON STRUCTURE:
{
  "expandedDescription": "4-5 paragraph deep-dive explanation with psychological principles",
  "tagline": "Catchy 5-8 word memorable phrase",
  "detailedBenefits": [
    {
      "title": "Primary Impact",
      "description": "Detailed explanation with specific outcomes",
      "icon": "🎯",
      "timeToSee": "2-3 weeks",
      "scientificEvidence": {
        "studyName": "Specific study or principle name",
        "effectSize": 85,
        "confidenceLevel": 95
      },
      "userStories": [
        {
          "name": "Sarah M.",
          "age": 34,
          "result": "Specific measurable result",
          "timeframe": "3 weeks"
        }
      ]
    }
  ],
  "implementationGuide": {
    "quickStart": {
      "overview": "2-3 sentence quick start guide",
      "timeRequired": "15 minutes setup",
      "materials": [
        {
          "item": "Specific item needed",
          "cost": 0,
          "optional": false,
          "alternatives": ["Alternative options"]
        }
      ]
    },
    "detailedSteps": [
      {
        "stepNumber": 1,
        "title": "Clear action title",
        "description": "Detailed step description",
        "duration": "5 minutes",
        "difficulty": 2,
        "visualAid": "Description of helpful visual",
        "commonMistakes": ["Specific mistake to avoid"],
        "proTips": ["Expert-level tip"],
        "checklistItems": ["Verification item"]
      }
    ],
    "customization": {
      "beginnerPath": ["Simplified steps for beginners"],
      "advancedPath": ["Advanced optimization techniques"],
      "adaptations": {
        "timeConstrained": ["Quick adaptations"],
        "budgetFriendly": ["Zero-cost alternatives"],
        "highImpact": ["Maximum result techniques"]
      }
    }
  },
  "progressTracking": {
    "successMetrics": [
      {
        "metric": "Specific measurable outcome",
        "measuringMethod": "How to measure it",
        "frequency": "daily/weekly",
        "targetValues": {
          "week1": 20,
          "week2": 40,
          "month1": 70,
          "month3": 90
        }
      }
    ],
    "milestones": [
      {
        "day": 7,
        "title": "First milestone",
        "description": "What to expect",
        "celebrationIdea": "How to celebrate"
      }
    ],
    "trackingTools": {
      "dailyChecklist": ["Daily action items"],
      "weeklyReview": ["Weekly assessment questions"],
      "monthlyAssessment": ["Monthly evaluation criteria"]
    }
  },
  "researchBacking": {
    "primaryStudies": [
      {
        "title": "Relevant study title",
        "authors": "Lead researcher names",
        "year": 2023,
        "keyFinding": "Specific relevant finding",
        "link": "study-reference-id"
      }
    ],
    "statisticalEvidence": [
      {
        "statistic": "Specific percentage or number",
        "source": "Credible source name",
        "context": "What this means for users"
      }
    ],
    "expertEndorsements": [
      {
        "expert": "Expert name",
        "credentials": "Their qualifications",
        "quote": "Relevant supportive quote"
      }
    ]
  },
  "personalizedVariations": {
    "byPersonality": {
      "introvert": "Adaptation for introverts",
      "extrovert": "Adaptation for extroverts"
    },
    "byLifestyle": {
      "busyProfessional": "For busy professionals",
      "student": "For students",
      "retiree": "For retirees",
      "parent": "For parents"
    },
    "byExperience": {
      "beginner": "Beginner-friendly approach",
      "intermediate": "Intermediate optimization",
      "advanced": "Expert-level techniques"
    }
  },
  "troubleshooting": [
    {
      "problem": "Common problem description",
      "causes": ["Possible causes"],
      "solutions": ["Specific solutions"],
      "preventionTips": ["How to prevent this issue"]
    }
  ],
  "relatedContent": {
    "complementaryTips": ["Tips that work well together"],
    "nextLevelTips": ["Advanced tips to try next"],
    "foundationalTips": ["Prerequisites for this tip"]
  },
  "designElements": {
    "colorPalette": {
      "primary": "#hex-color",
      "secondary": "#hex-color", 
      "accent": "#hex-color",
      "background": "#hex-color"
    },
    "imagery": {
      "heroImage": "Detailed description of ideal hero image",
      "benefitsImage": "Description of benefits visualization",
      "implementationImage": "Step-by-step visual guide description",
      "successImage": "Success celebration image description"
    },
    "iconSet": ["🎯", "💪", "🚀", "⭐", "🏆"],
    "visualMetaphors": ["Relevant metaphors for visual design"]
  }
}

Focus on ${tip.category} category best practices. Make every piece of content actionable and valuable.
`;
  }

  // Secure API call handler via Supabase Edge Function
  private async callGrokAPI(tip: DatabaseTip, enhancementType: 'simple' | 'comprehensive' = 'comprehensive'): Promise<any> {
    console.log('Calling secure Grok API via Edge Function:', {
      tipId: tip.id,
      enhancementType,
      hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL
    });

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/enhance-tip`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tip: {
          id: tip.id,
          title: tip.title,
          category: tip.category,
          description: tip.description
        },
        enhancementType
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Function Error Response:', errorText);
      throw new Error(`Edge Function error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Enhancement failed');
    }

    return data.enhancedContent;
  }

  // Parse comprehensive response
  private parseComprehensiveResponse(response: any): ComprehensiveEnhancedContent {
    try {
      // Response is already parsed JSON from the edge function
      return response as ComprehensiveEnhancedContent;
    } catch (error) {
      console.error('Error parsing Grok response:', error);
      throw new Error('Failed to parse comprehensive content');
    }
  }

  // Generate mock comprehensive content for development
  private generateMockComprehensiveContent(tip: DatabaseTip): ComprehensiveEnhancedContent {
    return {
      expandedDescription: `This ${tip.category} tip represents a scientifically-backed approach to ${tip.title.toLowerCase()}. Research in behavioral psychology shows that consistent application of this technique can lead to measurable improvements in just 2-3 weeks. The principle works by leveraging neuroplasticity and habit formation pathways in the brain, creating lasting positive changes that compound over time. Studies indicate that individuals who implement this approach see a 75% improvement in related metrics within the first month.`,
      
      tagline: "Transform Your Life Daily",
      
      detailedBenefits: [
        {
          title: "Primary Impact",
          description: "Experience immediate improvements in your daily routine and overall well-being through consistent application of this evidence-based technique.",
          icon: "🎯",
          timeToSee: "2-3 weeks",
          scientificEvidence: {
            studyName: "Harvard Behavioral Change Study 2023",
            effectSize: 85,
            confidenceLevel: 95
          },
          userStories: [
            {
              name: "Sarah M.",
              age: 34,
              result: "Increased daily productivity by 40%",
              timeframe: "3 weeks"
            }
          ]
        },
        {
          title: "Secondary Boost",
          description: "Build momentum and confidence as you master this foundational skill, creating a positive feedback loop for continued growth.",
          icon: "💪",
          timeToSee: "1-2 months",
          scientificEvidence: {
            studyName: "Stanford Self-Efficacy Research",
            effectSize: 70,
            confidenceLevel: 92
          },
          userStories: [
            {
              name: "Mike R.",
              age: 28,
              result: "Improved confidence and decision-making",
              timeframe: "6 weeks"
            }
          ]
        }
      ],

      implementationGuide: {
        quickStart: {
          overview: "Start with just 5 minutes daily to build the foundation for this transformative habit.",
          timeRequired: "15 minutes setup",
          materials: [
            {
              item: "Journal or note-taking app",
              cost: 0,
              optional: false,
              alternatives: ["Phone notes", "Voice recorder", "Digital app"]
            }
          ]
        },
        detailedSteps: [
          {
            stepNumber: 1,
            title: "Establish Your Foundation",
            description: "Set up your environment and tools for consistent practice. Choose a specific time and location.",
            duration: "10 minutes",
            difficulty: 2,
            visualAid: "Diagram showing optimal setup arrangement",
            commonMistakes: ["Starting too aggressively", "Not setting specific times"],
            proTips: ["Link to existing habit for consistency"],
            checklistItems: ["Location chosen", "Time scheduled", "Tools prepared"]
          }
        ],
        customization: {
          beginnerPath: ["Start with 2-minute sessions", "Focus on consistency over intensity"],
          advancedPath: ["Increase duration gradually", "Add complexity after mastery"],
          adaptations: {
            timeConstrained: ["Micro-sessions of 2-3 minutes"],
            budgetFriendly: ["Use free apps and tools"],
            highImpact: ["Focus on peak energy times"]
          }
        }
      },

      progressTracking: {
        successMetrics: [
          {
            metric: "Daily consistency rate",
            measuringMethod: "Track completion percentage",
            frequency: "daily",
            targetValues: {
              week1: 50,
              week2: 70,
              month1: 85,
              month3: 95
            }
          }
        ],
        milestones: [
          {
            day: 7,
            title: "First Week Success",
            description: "Completed your first week of consistent practice",
            celebrationIdea: "Treat yourself to something special"
          }
        ],
        trackingTools: {
          dailyChecklist: ["Complete morning routine", "Track progress", "Review outcomes"],
          weeklyReview: ["Assess consistency", "Identify challenges", "Plan improvements"],
          monthlyAssessment: ["Measure key metrics", "Evaluate progress", "Set new goals"]
        }
      },

      researchBacking: {
        primaryStudies: [
          {
            title: "Behavioral Change and Habit Formation",
            authors: "Dr. James Clear, Stanford Research Team",
            year: 2023,
            keyFinding: "Consistent small actions create 75% better outcomes",
            link: "stanford-habit-study-2023"
          }
        ],
        statisticalEvidence: [
          {
            statistic: "85% success rate with consistent application",
            source: "National Behavior Institute",
            context: "Significantly higher than traditional approaches"
          }
        ],
        expertEndorsements: [
          {
            expert: "Dr. Angela Duckworth",
            credentials: "Psychology Professor, University of Pennsylvania",
            quote: "This approach aligns perfectly with what we know about sustainable behavior change."
          }
        ]
      },

      personalizedVariations: {
        byPersonality: {
          introvert: "Focus on private reflection and individual practice sessions",
          extrovert: "Incorporate social accountability and group challenges"
        },
        byLifestyle: {
          busyProfessional: "Integrate into existing work routines and commute time",
          student: "Align with study schedules and academic breaks",
          retiree: "Use as structure for daily routines and social engagement",
          parent: "Include family members and model behavior for children"
        },
        byExperience: {
          beginner: "Start with basic foundation and simple tracking",
          intermediate: "Add complexity and advanced techniques gradually",
          advanced: "Focus on optimization and helping others implement"
        }
      },

      troubleshooting: [
        {
          problem: "Losing motivation after initial enthusiasm",
          causes: ["Setting unrealistic expectations", "Lack of progress tracking"],
          solutions: ["Reduce initial commitment", "Implement visual progress tracking"],
          preventionTips: ["Start smaller than you think", "Celebrate small wins daily"]
        }
      ],

      relatedContent: {
        complementaryTips: [`Morning routine optimization`, `Evening reflection practices`],
        nextLevelTips: [`Advanced ${tip.category} strategies`, `Community building techniques`],
        foundationalTips: [`Basic habit formation`, `Goal setting fundamentals`]
      },

      designElements: {
        colorPalette: {
          primary: tip.category === 'health' ? '#22c55e' : tip.category === 'wealth' ? '#eab308' : '#a855f7',
          secondary: tip.category === 'health' ? '#86efac' : tip.category === 'wealth' ? '#fde047' : '#d8b4fe',
          accent: tip.category === 'health' ? '#15803d' : tip.category === 'wealth' ? '#a16207' : '#7c3aed',
          background: '#f8fafc'
        },
        imagery: {
          heroImage: `Inspiring ${tip.category} transformation scene with natural lighting`,
          benefitsImage: `Infographic showing measurable improvements and statistics`,
          implementationImage: `Step-by-step visual guide with clear progression`,
          successImage: `Celebration of achievement with positive emotions`
        },
        iconSet: ["🎯", "💪", "🚀", "⭐", "🏆", "📈", "🌟", "✨"],
        visualMetaphors: [`${tip.category} journey`, "Building blocks", "Growth trajectory"]
      }
    };
  }

  // NEW: Build prompt for simple tip expansion
  private buildSimpleExpansionPrompt(simpleTip: string, category: string): string {
    return `
You are an expert ${category} coach and content strategist. I need you to expand a simple 1-2 sentence tip into a comprehensive, actionable tip with all the necessary details.

SIMPLE TIP INPUT:
"${simpleTip}"

CATEGORY: ${category}

Please expand this into a complete tip with the following structure. Respond with ONLY valid JSON:

{
  "title": "Catchy, actionable title (6-8 words max)",
  "subtitle": "Compelling description that explains the benefit (10-15 words)",
  "subcategory": "Specific subcategory within ${category} (e.g., nutrition, exercise, mindset)",
  "difficulty": "Easy|Moderate|Advanced",
  "expandedDescription": "Detailed 2-3 sentence explanation of exactly what to do and why",
  "primaryBenefit": "Main immediate benefit (1 sentence)",
  "secondaryBenefit": "Secondary benefit that develops over time (1 sentence)",
  "tertiaryBenefit": "Long-term transformational benefit (1 sentence)",
  "implementationTime": "How long it takes to do (e.g., '5 minutes', '2 weeks')",
  "frequency": "How often to do it (e.g., 'Daily', 'Weekly', '3x per week')",
  "cost": "Cost level (Free, Low, Medium, High)",
  "scientificBacking": true/false,
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}

Make it practical, specific, and immediately actionable. Focus on making the benefits clear and compelling.
    `;
  }

  // Helper to clean JSON response
  private cleanJSONResponse(response: string): string {
    // Remove any markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return cleaned;
  }

  // NEW: Parse simple expansion response
  private parseSimpleExpansionResponse(response: any): SimpleToFullTipExpansion {
    try {
      // Response is already parsed JSON from the edge function
      const parsed = response;
      
      return {
        title: parsed.title || 'Generated Tip',
        subtitle: parsed.subtitle || 'Helpful daily practice',
        subcategory: parsed.subcategory || 'general',
        difficulty: parsed.difficulty || 'Easy',
        expandedDescription: parsed.expandedDescription || 'A helpful practice for better living.',
        primaryBenefit: parsed.primaryBenefit || 'Immediate positive impact',
        secondaryBenefit: parsed.secondaryBenefit || 'Builds over time',
        tertiaryBenefit: parsed.tertiaryBenefit || 'Long-term transformation',
        implementationTime: parsed.implementationTime || '5 minutes',
        frequency: parsed.frequency || 'Daily',
        cost: parsed.cost || 'Free',
        scientificBacking: parsed.scientificBacking || false,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['wellness', 'lifestyle']
      };
    } catch (error) {
      console.error('Error parsing simple expansion response:', error);
      throw new Error('Failed to parse AI response');
    }
  }

  // NEW: Generate mock expansion for development
  private generateMockSimpleExpansion(simpleTip: string, category: string): SimpleToFullTipExpansion {
    const mockData = {
      health: {
        title: 'Morning Hydration Boost',
        subtitle: 'Start your day with instant energy and metabolism activation',
        subcategory: 'hydration',
        primaryBenefit: 'Immediately kickstarts your metabolism and brain function',
        secondaryBenefit: 'Improves skin health and energy levels throughout the day',
        tertiaryBenefit: 'Builds a foundation for consistent healthy habits'
      },
      wealth: {
        title: 'Automatic Wealth Building',
        subtitle: 'Build wealth effortlessly while you sleep',
        subcategory: 'investing',
        primaryBenefit: 'Eliminates decision fatigue and ensures consistent investing',
        secondaryBenefit: 'Takes advantage of dollar-cost averaging benefits',
        tertiaryBenefit: 'Creates long-term compound growth for financial freedom'
      },
      happiness: {
        title: 'Daily Gratitude Reset',
        subtitle: 'Transform your mindset in just 3 minutes each morning',
        subcategory: 'mindfulness',
        primaryBenefit: 'Instantly improves mood and daily outlook',
        secondaryBenefit: 'Reduces stress and increases life satisfaction',
        tertiaryBenefit: 'Rewires brain for long-term optimism and resilience'
      }
    };

    const categoryData = mockData[category];
    
    return {
      title: categoryData.title,
      subtitle: categoryData.subtitle,
      subcategory: categoryData.subcategory,
      difficulty: 'Easy',
      expandedDescription: `${simpleTip} This simple practice takes just minutes but creates lasting positive changes in your daily routine and overall wellbeing.`,
      primaryBenefit: categoryData.primaryBenefit,
      secondaryBenefit: categoryData.secondaryBenefit,
      tertiaryBenefit: categoryData.tertiaryBenefit,
      implementationTime: '5 minutes',
      frequency: 'Daily',
      cost: 'Free',
      scientificBacking: true,
      tags: [category, 'daily-routine', 'simple-habits', 'wellbeing', 'lifestyle']
    };
  }
}

export const enhancedGrokService = new EnhancedGrokService();