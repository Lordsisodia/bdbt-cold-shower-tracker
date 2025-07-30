import { Tip, TipCategory, TipDifficulty } from '../types/tip';
import { generateTipImageUrl } from '../utils/imageGenerator';

// Base tip templates for different categories
const healthTips = {
  morning: [
    {
      title: "Start Your Day with Movement",
      subtitle: "Thirty morning-move ideas from gentle stretch to kettlebells.",
      benefits: {
        primary: "Sets circadian rhythm naturally",
        secondary: "Triggers natural dopamine release",
        tertiary: "Pairs perfectly with coffee brew time"
      },
      whatsIncluded: [
        "30 different morning movement options",
        "5-minute routines for all fitness levels",
        "Habit stacking techniques"
      ]
    },
    {
      title: "The 2-Minute Morning Water Ritual",
      subtitle: "Hydrate before you caffeinate for optimal energy.",
      benefits: {
        primary: "Kickstarts metabolism by 30%",
        secondary: "Improves brain function",
        tertiary: "Prevents afternoon energy crash"
      },
      whatsIncluded: [
        "Optimal water temperature guide",
        "Mineral addition recommendations",
        "7-day tracking template"
      ]
    }
  ],
  nutrition: [
    {
      title: "Eat Protein with Every Meal",
      subtitle: "Simple macro rule for stable energy and better health.",
      benefits: {
        primary: "Stabilizes blood sugar levels",
        secondary: "Increases satiety by 40%",
        tertiary: "Supports muscle maintenance"
      },
      whatsIncluded: [
        "Palm-size portion guide included",
        "Mix plant and animal sources",
        "Quick protein prep strategies"
      ]
    },
    {
      title: "30 Benefits of Green Tea Over Coffee",
      subtitle: "The ancient beverage for modern wellness.",
      benefits: {
        primary: "Sustained energy without jitters",
        secondary: "L-theanine promotes calm focus",
        tertiary: "Rich in antioxidants"
      },
      whatsIncluded: [
        "Brewing temperature guide",
        "Best times to drink",
        "Quality tea selection tips"
      ]
    }
  ],
  exercise: [
    {
      title: "The Stair Climbing Workout",
      subtitle: "Turn every staircase into a free gym membership.",
      benefits: {
        primary: "Burns 3x more calories than walking",
        secondary: "Builds leg and glute strength",
        tertiary: "Improves cardiovascular health"
      },
      whatsIncluded: [
        "5 stair workout variations",
        "Progress tracking method",
        "Safety tips and form guide"
      ]
    },
    {
      title: "Desk Worker's Mobility Flow",
      subtitle: "5-minute stretches to undo 8 hours of sitting.",
      benefits: {
        primary: "Reduces back pain by 60%",
        secondary: "Improves posture instantly",
        tertiary: "Boosts afternoon productivity"
      },
      whatsIncluded: [
        "10 desk-friendly stretches",
        "Hourly reminder system",
        "Posture reset techniques"
      ]
    }
  ],
  sleep: [
    {
      title: "The 10-3-2-1-0 Sleep Formula",
      subtitle: "Science-backed countdown to perfect sleep.",
      benefits: {
        primary: "Fall asleep 50% faster",
        secondary: "Deeper REM cycles",
        tertiary: "Wake up more refreshed"
      },
      whatsIncluded: [
        "Complete evening routine template",
        "Sleep environment checklist",
        "Troubleshooting guide"
      ]
    },
    {
      title: "Natural Sleep Supplements Guide",
      subtitle: "Evidence-based alternatives to sleeping pills.",
      benefits: {
        primary: "Non-habit forming solutions",
        secondary: "Improved sleep quality",
        tertiary: "No morning grogginess"
      },
      whatsIncluded: [
        "Dosage recommendations",
        "Timing guidelines",
        "Interaction warnings"
      ]
    }
  ]
};

const wealthTips = {
  budgeting: [
    {
      title: "The 5-Minute Sunday Money Date",
      subtitle: "Weekly financial check-in for lasting wealth.",
      benefits: {
        primary: "Saves average $200/month",
        secondary: "Reduces money anxiety",
        tertiary: "Builds financial awareness"
      },
      whatsIncluded: [
        "Weekly review template",
        "Spending pattern tracker",
        "Goal setting framework"
      ]
    },
    {
      title: "Zero-Based Budget Blueprint",
      subtitle: "Give every dollar a job before it arrives.",
      benefits: {
        primary: "Eliminates overspending",
        secondary: "Accelerates debt payoff",
        tertiary: "Creates investment capital"
      },
      whatsIncluded: [
        "Monthly budget template",
        "Category optimization guide",
        "Emergency fund calculator"
      ]
    }
  ],
  saving: [
    {
      title: "The Invisible Savings Method",
      subtitle: "Save money you'll never miss.",
      benefits: {
        primary: "Automates wealth building",
        secondary: "Removes willpower requirement",
        tertiary: "Compounds over time"
      },
      whatsIncluded: [
        "Bank automation setup",
        "Percentage increase strategy",
        "Hidden money sources list"
      ]
    },
    {
      title: "52-Week Money Challenge 2.0",
      subtitle: "Modern twist on the classic savings hack.",
      benefits: {
        primary: "Saves $1,378+ annually",
        secondary: "Builds saving habit",
        tertiary: "Flexible to income levels"
      },
      whatsIncluded: [
        "Printable tracking sheet",
        "Digital app recommendations",
        "Catch-up strategies"
      ]
    }
  ],
  investing: [
    {
      title: "Your First $1000 Investment",
      subtitle: "Simple start to compound wealth.",
      benefits: {
        primary: "Beats inflation consistently",
        secondary: "Learns by doing",
        tertiary: "Opens investment mindset"
      },
      whatsIncluded: [
        "Platform comparison guide",
        "Risk assessment quiz",
        "First investment checklist"
      ]
    },
    {
      title: "Index Fund Basics for Beginners",
      subtitle: "Set-and-forget wealth building strategy.",
      benefits: {
        primary: "Diversified automatically",
        secondary: "Low fees maximize returns",
        tertiary: "Minimal time investment"
      },
      whatsIncluded: [
        "Top 5 index funds compared",
        "Dollar-cost averaging explained",
        "Rebalancing schedule"
      ]
    }
  ],
  income: [
    {
      title: "Side Hustle Starter Pack",
      subtitle: "Turn skills into extra income streams.",
      benefits: {
        primary: "Extra $500-2000/month potential",
        secondary: "Builds entrepreneurial skills",
        tertiary: "Creates financial cushion"
      },
      whatsIncluded: [
        "50 side hustle ideas",
        "Time commitment matrix",
        "Income tracking spreadsheet"
      ]
    },
    {
      title: "Negotiate Your Next Raise",
      subtitle: "Scripts and strategies for salary success.",
      benefits: {
        primary: "Average 10-20% increase",
        secondary: "Builds confidence",
        tertiary: "Compounds over career"
      },
      whatsIncluded: [
        "Market research template",
        "Negotiation scripts",
        "Timing strategy guide"
      ]
    }
  ]
};

const happinessTips = {
  mindfulness: [
    {
      title: "The 30-Second Gratitude Reset",
      subtitle: "Instant mood boost with micro-appreciation.",
      benefits: {
        primary: "Reduces stress hormones",
        secondary: "Improves relationships",
        tertiary: "Costs absolutely nothing"
      },
      whatsIncluded: [
        "5 gratitude prompts",
        "Text template library",
        "21-day challenge tracker"
      ]
    },
    {
      title: "Walking Meditation Made Simple",
      subtitle: "Moving mindfulness for busy people.",
      benefits: {
        primary: "Combines exercise with meditation",
        secondary: "Reduces anxiety naturally",
        tertiary: "No special equipment needed"
      },
      whatsIncluded: [
        "Step-by-step guide",
        "5 walking routes ideas",
        "Progress tracking method"
      ]
    }
  ],
  relationships: [
    {
      title: "Weekly Connection Rituals",
      subtitle: "Strengthen bonds with intentional time.",
      benefits: {
        primary: "Deeper relationships",
        secondary: "Reduced loneliness",
        tertiary: "Support network growth"
      },
      whatsIncluded: [
        "Conversation starter cards",
        "Activity suggestions",
        "Scheduling templates"
      ]
    },
    {
      title: "The Art of Active Listening",
      subtitle: "Transform conversations and connections.",
      benefits: {
        primary: "Improves all relationships",
        secondary: "Reduces misunderstandings",
        tertiary: "Builds trust faster"
      },
      whatsIncluded: [
        "LISTEN technique breakdown",
        "Practice exercises",
        "Common mistakes to avoid"
      ]
    }
  ],
  personal: [
    {
      title: "Design Your Ideal Morning",
      subtitle: "Create a routine that energizes your day.",
      benefits: {
        primary: "Starts day with intention",
        secondary: "Reduces decision fatigue",
        tertiary: "Improves overall mood"
      },
      whatsIncluded: [
        "Morning routine builder",
        "Time-blocking template",
        "Habit stacking guide"
      ]
    },
    {
      title: "The Joy List Project",
      subtitle: "Curate activities that spark happiness.",
      benefits: {
        primary: "Increases daily joy",
        secondary: "Combats boredom",
        tertiary: "Discovers new interests"
      },
      whatsIncluded: [
        "100 joy activity ideas",
        "Mood tracking system",
        "Seasonal joy calendar"
      ]
    }
  ],
  growth: [
    {
      title: "Learn Something New in 5 Minutes",
      subtitle: "Daily micro-learning for continuous growth.",
      benefits: {
        primary: "Builds knowledge daily",
        secondary: "Boosts confidence",
        tertiary: "Sparks curiosity"
      },
      whatsIncluded: [
        "Learning resource list",
        "Skill progression tracker",
        "Knowledge sharing tips"
      ]
    },
    {
      title: "The Monthly Challenge System",
      subtitle: "Push comfort zones systematically.",
      benefits: {
        primary: "Accelerates personal growth",
        secondary: "Builds resilience",
        tertiary: "Creates exciting stories"
      },
      whatsIncluded: [
        "12 monthly challenges",
        "Difficulty progression",
        "Reflection journal prompts"
      ]
    }
  ]
};

// Generate unique combinations and variations
export function generateTips(): Tip[] {
  const tips: Tip[] = [];
  let tipId = 1;

  const categories: TipCategory[] = ['health', 'wealth', 'happiness'];
  const difficulties: TipDifficulty[] = ['Easy', 'Moderate', 'Advanced'];
  
  const categoryTips = {
    health: healthTips,
    wealth: wealthTips,
    happiness: happinessTips
  };

  // Generate base tips from templates
  categories.forEach(category => {
    const tipData = categoryTips[category];
    Object.entries(tipData).forEach(([subcategory, tipTemplates]) => {
      tipTemplates.forEach((template, index) => {
        difficulties.forEach(difficulty => {
          const tip: Tip = {
            id: `tip-${tipId}`,
            category,
            difficulty,
            content: {
              ...template,
              description: generateDescription(template, category, difficulty),
              readTime: calculateReadTime(difficulty)
            },
            tags: generateTags(category, subcategory, difficulty),
            imageUrl: generateTipImageUrl({ id: `tip-${tipId}`, category, title: template.title }),
            downloadUrl: `/downloads/tips/${tipId}.pdf`,
            createdAt: new Date(),
            updatedAt: new Date(),
            viewCount: Math.floor(Math.random() * 1000),
            downloadCount: Math.floor(Math.random() * 500)
          };
          tips.push(tip);
          tipId++;
        });
      });
    });
  });

  // Generate additional variations to reach 1000 tips
  while (tips.length < 1000) {
    const baseTip = tips[Math.floor(Math.random() * tips.length)];
    const variation = createTipVariation(baseTip, tipId);
    tips.push(variation);
    tipId++;
  }

  return tips;
}

function generateDescription(template: any, category: TipCategory, difficulty: TipDifficulty): string {
  const intros = {
    health: {
      Easy: "Start your wellness journey with this simple",
      Moderate: "Take your health to the next level with this proven",
      Advanced: "Master your physical potential with this advanced"
    },
    wealth: {
      Easy: "Begin building wealth with this straightforward",
      Moderate: "Accelerate your financial growth with this strategic",
      Advanced: "Optimize your wealth building with this sophisticated"
    },
    happiness: {
      Easy: "Boost your happiness with this simple",
      Moderate: "Deepen your fulfillment with this meaningful",
      Advanced: "Transform your life satisfaction with this powerful"
    }
  };

  const difficultyModifiers = {
    Easy: "approach that anyone can implement today",
    Moderate: "method that builds on basic foundations",
    Advanced: "system for those ready to commit fully"
  };

  return `${intros[category][difficulty]} ${difficultyModifiers[difficulty]}. ${template.subtitle}`;
}

function calculateReadTime(difficulty: TipDifficulty): number {
  const times = {
    Easy: 3 + Math.floor(Math.random() * 2),
    Moderate: 5 + Math.floor(Math.random() * 3),
    Advanced: 8 + Math.floor(Math.random() * 4)
  };
  return times[difficulty];
}

function generateTags(category: TipCategory, subcategory: string, difficulty: TipDifficulty): string[] {
  const baseTags = [category, subcategory, difficulty.toLowerCase()];
  
  const categoryTags = {
    health: ['wellness', 'fitness', 'nutrition', 'energy', 'vitality'],
    wealth: ['money', 'finance', 'investing', 'savings', 'prosperity'],
    happiness: ['mindfulness', 'joy', 'fulfillment', 'peace', 'contentment']
  };

  const additionalTags = categoryTags[category];
  const selectedTags = additionalTags
    .sort(() => Math.random() - 0.5)
    .slice(0, 2 + Math.floor(Math.random() * 2));

  return [...baseTags, ...selectedTags];
}

function createTipVariation(baseTip: Tip, newId: number): Tip {
  const variations = [
    "Advanced ",
    "Beginner's ",
    "Quick ",
    "Ultimate ",
    "Essential ",
    "Complete ",
    "Simple ",
    "Proven ",
    "Modern ",
    "Traditional "
  ];

  const variation = variations[Math.floor(Math.random() * variations.length)];
  
  const newTitle = variation + baseTip.content.title;
  return {
    ...baseTip,
    id: `tip-${newId}`,
    content: {
      ...baseTip.content,
      title: newTitle,
      description: baseTip.content.description.replace(/this \w+/, `this ${variation.trim().toLowerCase()}`),
      readTime: baseTip.content.readTime + (Math.random() > 0.5 ? 1 : -1)
    },
    tags: [...baseTip.tags, variation.trim().toLowerCase()],
    imageUrl: generateTipImageUrl({ id: `tip-${newId}`, category: baseTip.category, title: newTitle }),
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    viewCount: Math.floor(Math.random() * 2000),
    downloadCount: Math.floor(Math.random() * 1000)
  };
}