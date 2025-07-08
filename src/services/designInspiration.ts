interface DesignResource {
  name: string;
  url: string;
  description: string;
  category: 'component' | 'pattern' | 'inspiration' | 'tool';
  tags: string[];
}

interface SearchResult {
  title: string;
  description: string;
  url: string;
  category: string;
  relevance: number;
}

// Curated design resources similar to 21st.dev
export const designResources: DesignResource[] = [
  // Component Libraries
  {
    name: "Shadcn/ui",
    url: "https://ui.shadcn.com/docs/components/button",
    description: "Copy-paste components with Tailwind CSS and Radix UI",
    category: "component",
    tags: ["react", "tailwind", "radix", "typescript", "accessible"]
  },
  {
    name: "Headless UI",
    url: "https://headlessui.com/",
    description: "Completely unstyled, accessible UI components",
    category: "component", 
    tags: ["react", "vue", "accessible", "unstyled", "tailwind"]
  },
  {
    name: "NextUI",
    url: "https://nextui.org/",
    description: "Modern React UI library with beautiful default theme",
    category: "component",
    tags: ["react", "nextjs", "framer-motion", "modern", "typescript"]
  },
  
  // Design Patterns
  {
    name: "UI Patterns",
    url: "https://ui-patterns.com/",
    description: "User interface design patterns and examples",
    category: "pattern",
    tags: ["ux", "ui", "patterns", "examples", "design"]
  },
  {
    name: "Page Flows",
    url: "https://pageflows.com/",
    description: "User flow recordings from top SaaS companies", 
    category: "pattern",
    tags: ["saas", "flows", "ux", "onboarding", "conversion"]
  },
  
  // Modern Inspiration
  {
    name: "21st.dev Style Apps",
    url: "https://collect.so/",
    description: "Modern SaaS application with glassmorphism design",
    category: "inspiration",
    tags: ["saas", "glassmorphism", "modern", "dashboard", "productivity"]
  },
  {
    name: "Linear App",
    url: "https://linear.app/",
    description: "Beautiful project management tool with modern design",
    category: "inspiration",
    tags: ["project-management", "modern", "dark-mode", "animations"]
  },
  {
    name: "Notion",
    url: "https://notion.so/",
    description: "Clean, functional design with excellent UX",
    category: "inspiration",
    tags: ["productivity", "clean", "functional", "database"]
  },
  
  // Cold Therapy / Health Apps
  {
    name: "Wim Hof Method App",
    url: "https://wimhofmethod.com/",
    description: "Official app for breathing exercises and cold exposure",
    category: "inspiration",
    tags: ["cold-therapy", "breathing", "health", "tracking"]
  },
  {
    name: "MyFitnessPal",
    url: "https://myfitnesspal.com/",
    description: "Health tracking with excellent data visualization",
    category: "inspiration", 
    tags: ["health", "tracking", "charts", "habits", "data-viz"]
  },
  
  // Tools
  {
    name: "Framer Motion",
    url: "https://framer.com/motion/",
    description: "Production-ready motion library for React",
    category: "tool",
    tags: ["animation", "react", "motion", "transitions"]
  },
  {
    name: "Lottie Animations",
    url: "https://lottiefiles.com/",
    description: "Lightweight animations for web and mobile",
    category: "tool", 
    tags: ["animation", "micro-interactions", "json", "after-effects"]
  }
];

export class DesignInspirationService {
  private resources = designResources;

  searchInspiration(query: string, category?: string): SearchResult[] {
    const normalizedQuery = query.toLowerCase();
    const queryTerms = normalizedQuery.split(' ');
    
    return this.resources
      .filter(resource => category ? resource.category === category : true)
      .map(resource => {
        // Calculate relevance score
        let relevance = 0;
        
        // Check name match
        if (resource.name.toLowerCase().includes(normalizedQuery)) {
          relevance += 0.5;
        }
        
        // Check description match
        if (resource.description.toLowerCase().includes(normalizedQuery)) {
          relevance += 0.3;
        }
        
        // Check tag matches
        const tagMatches = resource.tags.filter(tag => 
          queryTerms.some(term => tag.includes(term))
        ).length;
        relevance += tagMatches * 0.2;
        
        return {
          title: resource.name,
          description: resource.description,
          url: resource.url,
          category: resource.category,
          relevance
        };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10); // Top 10 results
  }

  getComponentInspiration(componentType: string): SearchResult[] {
    const queries = [
      componentType,
      `${componentType} component`,
      `${componentType} react`,
      `${componentType} design`
    ];
    
    const allResults: SearchResult[] = [];
    queries.forEach(query => {
      allResults.push(...this.searchInspiration(query, 'component'));
    });
    
    // Remove duplicates and return top results
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.url === result.url)
    );
    
    return uniqueResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 8);
  }

  getTrendingPatterns(): string[] {
    return [
      "Glassmorphism UI Design",
      "Neumorphism Components", 
      "Dark Mode Interfaces",
      "Micro-interactions",
      "Data Visualization Dashboards",
      "Mobile-first Design",
      "Accessibility-focused UI",
      "Progressive Web Apps",
      "Voice User Interfaces",
      "AI-powered Interfaces",
      "Habit Tracking UX Patterns",
      "Health App Design Patterns",
      "Gamification Elements",
      "Social Sharing Components",
      "Real-time Notifications",
      "Onboarding Flow Design",
      "Progress Visualization",
      "Calendar & Date Pickers",
      "Form Validation UX",
      "Loading State Animations"
    ];
  }

  getColdTherapyInspiration(): SearchResult[] {
    return this.searchInspiration("cold therapy health tracking habit");
  }

  getSaaSInspiration(): SearchResult[] {
    return this.searchInspiration("saas dashboard modern ui");
  }
}

export const designInspiration = new DesignInspirationService();