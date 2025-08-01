import { ComprehensiveEnhancedContent, enhancedGrokService } from './enhancedGrokService';
import { enhancedPdfGenerator } from './enhancedPdfGenerator';
import { DatabaseTip } from './tipsDatabaseService';

/**
 * Integration Manager
 * Coordinates between enhanced Grok content generation and PDF creation
 * Ensures rich, comprehensive content flows through to beautiful PDFs
 */

export interface EnhancedPDFData {
  tip: DatabaseTip;
  comprehensiveContent: ComprehensiveEnhancedContent;
  design: {
    colorPalette: any;
    visualElements: any;
    layout: 'standard' | 'premium' | 'ultimate';
  };
}

export class IntegrationManager {
  
  /**
   * Master function: Generate comprehensive enhanced PDF
   * 1. Uses Grok to generate rich, detailed content
   * 2. Transforms content for PDF layout optimization
   * 3. Creates premium PDF with all enhanced features
   */
  async generateComprehensivePDF(tip: DatabaseTip): Promise<Blob> {
    try {
      // Step 1: Generate comprehensive content with Grok
      console.log(`🤖 Generating comprehensive content for: ${tip.title}`);
      const comprehensiveContent = await enhancedGrokService.generateComprehensiveContent(tip);
      
      // Step 2: Transform content for PDF optimization
      const pdfOptimizedContent = this.optimizeContentForPDF(comprehensiveContent);
      
      // Step 3: Create enhanced PDF data structure
      const enhancedPDFData: EnhancedPDFData = {
        tip,
        comprehensiveContent: pdfOptimizedContent,
        design: {
          colorPalette: comprehensiveContent.designElements.colorPalette,
          visualElements: comprehensiveContent.designElements,
          layout: 'ultimate'
        }
      };
      
      // Step 4: Generate premium PDF
      console.log(`📄 Creating premium PDF with enhanced content...`);
      const pdfBlob = await this.createUltimatePDF(enhancedPDFData);
      
      console.log(`✅ Successfully generated comprehensive PDF for: ${tip.title}`);
      return pdfBlob;
      
    } catch (error) {
      console.error(`❌ Error generating comprehensive PDF:`, error);
      // Fallback to standard enhanced PDF
      return enhancedPdfGenerator.generatePremiumTipPDF(tip, null);
    }
  }

  /**
   * Optimize comprehensive content specifically for PDF layout
   * Ensures text length, visual elements, and data structure work well in PDF
   */
  private optimizeContentForPDF(content: ComprehensiveEnhancedContent): ComprehensiveEnhancedContent {
    return {
      ...content,
      // Optimize descriptions for PDF page flow
      expandedDescription: this.optimizeTextForPDF(content.expandedDescription, 800),
      
      // Ensure benefits fit nicely in card layouts
      detailedBenefits: content.detailedBenefits.map(benefit => ({
        ...benefit,
        description: this.optimizeTextForPDF(benefit.description, 300)
      })),
      
      // Optimize implementation steps for visual layout
      implementationGuide: {
        ...content.implementationGuide,
        detailedSteps: content.implementationGuide.detailedSteps.slice(0, 8).map(step => ({
          ...step,
          description: this.optimizeTextForPDF(step.description, 200),
          proTips: step.proTips.slice(0, 3),
          commonMistakes: step.commonMistakes.slice(0, 3)
        }))
      },
      
      // Optimize progress tracking for PDF charts
      progressTracking: {
        ...content.progressTracking,
        successMetrics: content.progressTracking.successMetrics.slice(0, 6),
        milestones: content.progressTracking.milestones.slice(0, 8)
      }
    };
  }

  /**
   * Optimize text length for PDF layout constraints
   */
  private optimizeTextForPDF(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Find the last complete sentence within the limit
    const truncated = text.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }
    
    return truncated.substring(0, maxLength - 3) + '...';
  }

  /**
   * Create ultimate PDF with all comprehensive content
   * Uses enhanced PDF generator with rich Grok-generated content
   */
  private async createUltimatePDF(data: EnhancedPDFData): Promise<Blob> {
    // Transform comprehensive content to work with existing PDF generator
    const grokEnhancedTip = {
      originalTip: data.tip,
      enhancedContent: {
        expandedDescription: data.comprehensiveContent.expandedDescription,
        detailedBenefits: data.comprehensiveContent.detailedBenefits.map(b => b.description),
        implementationSteps: data.comprehensiveContent.implementationGuide.detailedSteps.map(s => s.description),
        proTips: data.comprehensiveContent.implementationGuide.detailedSteps.flatMap(s => s.proTips).slice(0, 5),
        commonMistakes: data.comprehensiveContent.implementationGuide.detailedSteps.flatMap(s => s.commonMistakes).slice(0, 5),
        successMetrics: data.comprehensiveContent.progressTracking.successMetrics.map(m => m.metric),
        relatedTips: data.comprehensiveContent.relatedContent.complementaryTips,
        visualDescription: `Premium design with ${data.design.colorPalette.primary} primary colors`,
        socialMediaPosts: {
          twitter: `Transform your ${data.tip.category} with this proven tip! 🚀 #BDBT`,
          instagram: `✨ Ready for positive change? Try this ${data.tip.category} tip! 💪 #BetterDaysBetterTomorrow`,
          linkedin: `Discover how this evidence-based ${data.tip.category} strategy can transform your daily routine.`
        },
        emailContent: `Subject: Your ${data.tip.category} transformation starts today\n\n${data.comprehensiveContent.expandedDescription.substring(0, 200)}...`,
        landingPageCopy: `Transform Your ${data.tip.category} Journey\n\n${data.comprehensiveContent.tagline}\n\n${data.comprehensiveContent.expandedDescription}`
      },
      metadata: {
        processingTime: Date.now(),
        enhancementDate: new Date().toISOString(),
        model: 'grok-comprehensive-v1',
        tokens: 3500
      }
    };

    // Generate the premium PDF with comprehensive content
    return enhancedPdfGenerator.generatePremiumTipPDF(data.tip, grokEnhancedTip);
  }

  /**
   * Batch process multiple tips with comprehensive enhancement
   */
  async batchGenerateComprehensivePDFs(
    tips: DatabaseTip[],
    onProgress?: (current: number, total: number, tipTitle: string) => void
  ): Promise<{ fileName: string; blob: Blob; tip: DatabaseTip }[]> {
    const results: { fileName: string; blob: Blob; tip: DatabaseTip }[] = [];
    const total = tips.length;

    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      
      if (onProgress) {
        onProgress(i + 1, total, tip.title);
      }

      try {
        const blob = await this.generateComprehensivePDF(tip);
        const fileName = `comprehensive_${tip.id}_${tip.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        
        results.push({ fileName, blob, tip });
        
        // Rate limiting - 1 request per second for Grok API
        if (i < tips.length - 1) {
          await this.delay(1000);
        }
        
      } catch (error) {
        console.error(`Failed to generate comprehensive PDF for tip ${tip.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Generate preview data for template system
   * Creates rich mock data that shows what comprehensive content looks like
   */
  generatePreviewData(tip: DatabaseTip): ComprehensiveEnhancedContent {
    return {
      expandedDescription: `This ${tip.category} optimization technique represents a breakthrough in behavioral science and personal development. Drawing from decades of research in neuroplasticity, habit formation, and positive psychology, this approach leverages the brain's natural learning mechanisms to create lasting change. Studies from Harvard, Stanford, and MIT have consistently shown that individuals who apply this methodology experience measurable improvements within 2-3 weeks, with compound benefits accelerating over time. The technique works by targeting the prefrontal cortex and limbic system simultaneously, creating new neural pathways while reinforcing positive behavioral patterns.`,
      
      tagline: "Transform Your Life Daily",
      
      detailedBenefits: [
        {
          title: "Immediate Impact",
          description: "Experience measurable improvements in your daily routine within the first week of implementation. Users report 35% better focus and 28% improved mood.",
          icon: "🎯",
          timeToSee: "5-7 days",
          scientificEvidence: {
            studyName: "Harvard Neuroplasticity Research 2023",
            effectSize: 87,
            confidenceLevel: 94
          },
          userStories: [
            {
              name: "Sarah M.",
              age: 34,
              result: "Increased daily productivity by 40% and reduced decision fatigue",
              timeframe: "2 weeks"
            },
            {
              name: "James K.",
              age: 29,
              result: "Better emotional regulation and stress management",
              timeframe: "10 days"
            }
          ]
        },
        {
          title: "Momentum Building",
          description: "Build unstoppable momentum as neural pathways strengthen and new habits become automatic. Create positive feedback loops that accelerate your progress.",
          icon: "💪",
          timeToSee: "2-4 weeks",
          scientificEvidence: {
            studyName: "Stanford Habit Formation Study",
            effectSize: 73,
            confidenceLevel: 91
          },
          userStories: [
            {
              name: "Maria L.",
              age: 41,
              result: "Developed consistent morning routine and improved work performance",
              timeframe: "3 weeks"
            }
          ]
        },
        {
          title: "Long-term Transformation",
          description: "Experience profound, lasting changes that compound over months and years. Build the foundation for continuous growth and self-improvement.",
          icon: "🚀",
          timeToSee: "2-6 months",
          scientificEvidence: {
            studyName: "MIT Longitudinal Behavior Study",
            effectSize: 91,
            confidenceLevel: 96
          },
          userStories: [
            {
              name: "David R.",
              age: 47,
              result: "Complete lifestyle transformation with sustained improvements",
              timeframe: "4 months"
            }
          ]
        }
      ],

      implementationGuide: {
        quickStart: {
          overview: "Begin with our scientifically-designed 5-minute daily routine that builds the foundation for lasting change.",
          timeRequired: "15 minutes initial setup",
          materials: [
            {
              item: "Journal or tracking app",
              cost: 0,
              optional: false,
              alternatives: ["Physical notebook", "Phone notes app", "Digital habit tracker"]
            },
            {
              item: "Timer or alarm",
              cost: 0,
              optional: false,
              alternatives: ["Phone timer", "Smart watch", "Desktop app"]
            }
          ]
        },
        detailedSteps: [
          {
            stepNumber: 1,
            title: "Foundation Setup",
            description: "Establish your optimal environment and timing for consistent practice. Choose a specific location and time that aligns with your natural rhythms.",
            duration: "10 minutes",
            difficulty: 2,
            visualAid: "Diagram showing optimal setup with lighting, seating, and tool placement",
            commonMistakes: ["Choosing inconsistent times", "Not preparing environment", "Setting unrealistic expectations"],
            proTips: ["Link to existing strong habit", "Start with 2-minute sessions", "Use environmental cues"],
            checklistItems: ["Location identified", "Time blocked in calendar", "Tools prepared and accessible"]
          },
          {
            stepNumber: 2,
            title: "Initial Practice Phase",
            description: "Begin with short, focused sessions that build confidence and establish the neural pathways for success.",
            duration: "5-10 minutes daily",
            difficulty: 3,
            visualAid: "Visual guide showing proper technique and form",
            commonMistakes: ["Trying to do too much", "Skipping rest days", "Not tracking progress"],
            proTips: ["Focus on consistency over intensity", "Celebrate small wins", "Use the 2-minute rule"],
            checklistItems: ["Daily practice completed", "Progress recorded", "Adjustments noted"]
          },
          {
            stepNumber: 3,
            title: "Habit Reinforcement",
            description: "Strengthen your practice through systematic progression and positive reinforcement mechanisms.",
            duration: "10-15 minutes daily",
            difficulty: 4,
            visualAid: "Progress chart showing typical improvement trajectory",
            commonMistakes: ["Inconsistent progression", "Ignoring setbacks", "Not adapting to life changes"],
            proTips: ["Use implementation intentions", "Create backup plans", "Find accountability partner"],
            checklistItems: ["Habit stack established", "Contingency plans ready", "Support system activated"]
          }
        ],
        customization: {
          beginnerPath: ["Start with 2-minute sessions", "Focus only on consistency for first week", "Use simple tracking method"],
          advancedPath: ["Increase complexity gradually", "Add measurement metrics", "Optimize timing and environment"],
          adaptations: {
            timeConstrained: ["Micro-sessions of 90 seconds", "Integrate into existing routines", "Use transition times"],
            budgetFriendly: ["Use free apps and tools", "Create DIY tracking systems", "Leverage existing resources"],
            highImpact: ["Focus on peak energy periods", "Combine with other positive habits", "Use advanced tracking metrics"]
          }
        }
      },

      progressTracking: {
        successMetrics: [
          {
            metric: "Daily Consistency Rate",
            measuringMethod: "Track completion percentage using journal or app",
            frequency: "daily",
            targetValues: {
              week1: 60,
              week2: 75,
              month1: 85,
              month3: 92
            }
          },
          {
            metric: "Quality Score",
            measuringMethod: "Rate session quality from 1-10 based on focus and engagement",
            frequency: "daily",
            targetValues: {
              week1: 6,
              week2: 7,
              month1: 8,
              month3: 8.5
            }
          },
          {
            metric: "Impact Assessment",
            measuringMethod: "Weekly reflection on life improvements and goal progress",
            frequency: "weekly",
            targetValues: {
              week1: 5,
              week2: 6.5,
              month1: 7.5,
              month3: 8.2
            }
          }
        ],
        milestones: [
          {
            day: 7,
            title: "First Week Victory",
            description: "Completed your first week of consistent practice - neural pathways are beginning to form",
            celebrationIdea: "Treat yourself to something special that supports your journey"
          },
          {
            day: 21,
            title: "Habit Formation Milestone",
            description: "Three weeks of consistency - you're in the habit formation zone",
            celebrationIdea: "Share your success with friends or on social media"
          },
          {
            day: 66,
            title: "Automatic Behavior Achievement",
            description: "Research shows habits become automatic around day 66 - you've made it!",
            celebrationIdea: "Plan a bigger reward and consider teaching others"
          }
        ],
        trackingTools: {
          dailyChecklist: ["Complete morning practice", "Rate session quality", "Note insights or breakthroughs"],
          weeklyReview: ["Calculate consistency percentage", "Assess quality trends", "Identify obstacles and solutions"],
          monthlyAssessment: ["Evaluate overall life improvements", "Adjust goals and methods", "Plan next level challenges"]
        }
      },

      researchBacking: {
        primaryStudies: [
          {
            title: "Neuroplasticity and Habit Formation in Adults",
            authors: "Dr. Ann Graybiel, MIT; Dr. Charles Duhigg, Yale",
            year: 2023,
            keyFinding: "Consistent small actions create 73% stronger neural pathways than sporadic intense efforts",
            link: "mit-neuroplasticity-study-2023"
          },
          {
            title: "The Science of Behavioral Change",
            authors: "Stanford Behavior Design Lab",
            year: 2023,
            keyFinding: "Environment design accounts for 68% of behavior change success",
            link: "stanford-behavior-change-2023"
          }
        ],
        statisticalEvidence: [
          {
            statistic: "89% success rate with consistent daily practice",
            source: "Harvard School of Public Health Meta-Analysis",
            context: "Significantly higher than traditional willpower-based approaches (34% success rate)"
          },
          {
            statistic: "Average 47% improvement in target metrics within 30 days",
            source: "Longitudinal Behavior Research Institute",
            context: "Measured across 12,000 participants over 18 months"
          }
        ],
        expertEndorsements: [
          {
            expert: "Dr. BJ Fogg",
            credentials: "Director, Stanford Behavior Design Lab",
            quote: "This approach perfectly aligns with what we know about sustainable behavior change - start small, be consistent, and celebrate progress."
          },
          {
            expert: "Dr. Wendy Wood",
            credentials: "Professor of Psychology, USC",
            quote: "The environmental design principles here are exactly what decades of habit research have shown to be most effective."
          }
        ]
      },

      personalizedVariations: {
        byPersonality: {
          introvert: "Focus on private reflection, individual practice, and internal motivation. Use quiet spaces and minimize social accountability pressure.",
          extrovert: "Incorporate social elements, group challenges, and external accountability. Share progress and celebrate wins with others."
        },
        byLifestyle: {
          busyProfessional: "Integrate into work routines, use micro-sessions during commutes, and leverage existing professional habits as anchors.",
          student: "Align with study schedules, use academic breaks for practice, and connect to learning and performance goals.",
          retiree: "Use as structure for daily routine, incorporate social elements, and focus on health and wellness benefits.",
          parent: "Include family members when appropriate, model behavior for children, and use parenting routines as habit anchors."
        },
        byExperience: {
          beginner: "Start with basic 2-minute sessions, focus purely on consistency, and use simple tracking methods.",
          intermediate: "Add complexity gradually, introduce quality metrics, and begin optimizing timing and environment.",
          advanced: "Focus on refinement and mastery, mentor others, and integrate with other development practices."
        }
      },

      troubleshooting: [
        {
          problem: "Losing motivation after initial enthusiasm wears off",
          causes: ["Unrealistic expectations", "Lack of visible progress", "Missing social support"],
          solutions: ["Reduce session length", "Implement visual progress tracking", "Find accountability partner"],
          preventionTips: ["Start smaller than feels necessary", "Plan for motivation dips", "Create multiple tracking methods"]
        },
        {
          problem: "Inconsistent schedule disrupting habit formation",
          causes: ["Inflexible routine", "Travel or life changes", "Time conflicts"],
          solutions: ["Create multiple routine options", "Use minimum viable sessions", "Focus on consistency over perfection"],
          preventionTips: ["Build flexibility into routine", "Have backup plans ready", "Use implementation intentions"]
        }
      ],

      relatedContent: {
        complementaryTips: [`Morning routine optimization for ${tip.category}`, `Evening reflection practices`, `Energy management strategies`],
        nextLevelTips: [`Advanced ${tip.category} techniques`, `Leadership in ${tip.category}`, `Community building around ${tip.category}`],
        foundationalTips: [`Basic habit formation principles`, `Goal setting fundamentals`, `Mindfulness basics`]
      },

      designElements: {
        colorPalette: {
          primary: tip.category === 'health' ? '#22c55e' : tip.category === 'wealth' ? '#eab308' : '#a855f7',
          secondary: tip.category === 'health' ? '#86efac' : tip.category === 'wealth' ? '#fde047' : '#d8b4fe',
          accent: tip.category === 'health' ? '#15803d' : tip.category === 'wealth' ? '#a16207' : '#7c3aed',
          background: '#f8fafc'
        },
        imagery: {
          heroImage: `Professional ${tip.category} transformation scene with modern, clean aesthetic and natural lighting`,
          benefitsImage: `Infographic-style visualization showing measurable improvements, statistics, and success metrics`,
          implementationImage: `Step-by-step visual guide with clear progression arrows, numbered elements, and helpful icons`,
          successImage: `Celebration and achievement imagery with positive emotions, progress charts, and success indicators`
        },
        iconSet: ["🎯", "💪", "🚀", "⭐", "🏆", "📈", "🌟", "✨", "🔥", "💎"],
        visualMetaphors: [`${tip.category} journey and growth`, "Building blocks of success", "Upward trajectory", "Transformation pathway"]
      }
    };
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const integrationManager = new IntegrationManager();