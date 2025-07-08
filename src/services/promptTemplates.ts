/**
 * Optimized Prompt Templates for Claude Code MCP
 * Maximizes efficiency and context utilization
 */

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  type: 'ui' | 'search' | 'code' | 'inspiration' | 'batch';
  estimatedTokens: number;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'ui-component-optimal',
    name: 'Optimized UI Component Generation',
    description: 'Generate production-ready React components with maximum efficiency',
    type: 'ui',
    estimatedTokens: 800,
    variables: ['componentType', 'specificRequirements', 'designStyle', 'functionality'],
    template: `
## 🎯 OBJECTIVE: CREATE PRODUCTION-READY {{componentType}} COMPONENT

### 📋 REQUIREMENTS
- Component Type: {{componentType}}
- Design Style: {{designStyle}}
- Functionality: {{functionality}}
- Specific Requirements: {{specificRequirements}}

### 🏗️ PROJECT CONTEXT
- Framework: React 18.3.1 + TypeScript + Tailwind CSS
- UI System: Custom components with CVA, Headless UI, Framer Motion
- Design Language: Glassmorphism, modern SaaS styling (21st.dev inspired)
- Current Architecture: Feature-based organization with shared UI components

### 🔧 TECHNICAL SPECIFICATIONS
- Use class-variance-authority (CVA) for component variants
- Implement TypeScript interfaces for all props
- Use 'cn()' utility from lib/utils for class merging
- Include proper error handling and loading states
- Add Framer Motion animations where appropriate
- Ensure accessibility (ARIA labels, focus management)
- Use localStorage for data persistence if needed

### 🛠️ EXECUTION STRATEGY
1. **Use 21st.dev Magic MCP** to generate 3 component variations
2. **Select the best variation** based on design system compatibility
3. **Integrate with existing codebase** following established patterns
4. **Ensure TypeScript compilation** without errors
5. **Test component** for accessibility and responsiveness

### ✅ SUCCESS CRITERIA
- First-attempt success (no iterations needed)
- TypeScript compilation without errors
- Consistent with existing design system
- Production-ready code quality
- Accessibility compliance
- Responsive design implementation

### 🚀 PARALLEL EXECUTION
Execute all related operations simultaneously for maximum efficiency.
`
  },

  {
    id: 'batch-feature-development',
    name: 'Batch Feature Development',
    description: 'Develop multiple related features in a single optimized request',
    type: 'batch',
    estimatedTokens: 1200,
    variables: ['featureName', 'components', 'integrations', 'dataFlow'],
    template: `
## 🚀 BATCH OPERATION: {{featureName}} FEATURE DEVELOPMENT

### 📋 FEATURE OVERVIEW
- Feature Name: {{featureName}}
- Components Needed: {{components}}
- Integrations Required: {{integrations}}
- Data Flow: {{dataFlow}}

### 🎯 EXECUTION STRATEGY
Execute all components simultaneously using parallel tool calling:

1. **UI Components** (via 21st.dev Magic MCP)
2. **Integration Logic** (via GitHub MCP for examples)
3. **Data Management** (via filesystem MCP for patterns)
4. **Type Definitions** (consistent with existing interfaces)

### 🏗️ BDBT PROJECT CONTEXT
- App: Cold Shower Challenge tracking application
- Current Features: Mood tracking, time tracking, habit stacking, analytics
- Architecture: React components with localStorage persistence
- Design System: Glassmorphism with blue/teal color scheme
- UI Library: Custom components with CVA, Headless UI, Framer Motion

### 🔧 TECHNICAL REQUIREMENTS
- Follow established patterns in src/components/features/
- Use existing TrackedDay interface for data consistency
- Integrate with SimpleColdShowerTracker main component
- Add navigation tab for new feature
- Update localStorage persistence logic
- Include mobile-responsive design

### ✅ DELIVERABLES
1. **Main Feature Component** - Complete implementation
2. **Type Definitions** - TypeScript interfaces
3. **Integration Code** - Hook into main app
4. **Documentation** - Usage and implementation notes
5. **Testing Strategy** - How to verify functionality

### 🚀 OPTIMIZATION NOTES
- Use parallel tool execution for all independent operations
- Provide complete context to avoid iterations
- Generate production-ready code on first attempt
- Ensure all components work together seamlessly
`
  },

  {
    id: 'design-research-optimal',
    name: 'Optimized Design Research',
    description: 'Comprehensive design research with maximum context efficiency',
    type: 'search',
    estimatedTokens: 600,
    variables: ['researchTopic', 'specificUseCase', 'targetAudience', 'designGoals'],
    template: `
## 🔍 DESIGN RESEARCH: {{researchTopic}}

### 📋 RESEARCH PARAMETERS
- Topic: {{researchTopic}}
- Use Case: {{specificUseCase}}
- Target Audience: {{targetAudience}}
- Design Goals: {{designGoals}}

### 🎯 RESEARCH OBJECTIVES
1. **Modern UI Patterns** - Latest design trends for 2024
2. **SaaS Design Inspiration** - Professional application interfaces
3. **Component Examples** - React/TypeScript implementation patterns
4. **Accessibility Standards** - WCAG compliance examples
5. **Mobile Responsiveness** - Responsive design patterns

### 🛠️ EXECUTION STRATEGY
Use multiple MCP tools simultaneously:
- **Web Search MCP**: Modern design patterns and trends
- **GitHub MCP**: Code implementation examples
- **21st.dev Magic MCP**: Component inspiration and patterns

### 🏗️ BDBT CONTEXT
- App Focus: Cold shower challenge and habit tracking
- Current Style: Glassmorphism with blue/teal gradients
- Target Users: Health-conscious individuals seeking habit formation
- Key Features: Tracking, analytics, social sharing, gamification

### 📊 EXPECTED OUTPUTS
1. **Design Pattern Collection** - 5-10 relevant patterns
2. **Component Examples** - Code implementations
3. **Color Scheme Recommendations** - Consistent with current design
4. **Accessibility Guidelines** - Specific to use case
5. **Mobile Considerations** - Responsive design strategies

### ✅ SUCCESS CRITERIA
- Comprehensive research completed in single request
- All findings relevant to BDBT project context
- Actionable recommendations provided
- Code examples included where applicable
- Design system consistency maintained
`
  },

  {
    id: 'code-integration-optimal',
    name: 'Optimized Code Integration',
    description: 'Integrate new code with existing codebase efficiently',
    type: 'code',
    estimatedTokens: 900,
    variables: ['integrationTarget', 'newCode', 'existingPatterns', 'dataFlow'],
    template: `
## 🔧 CODE INTEGRATION: {{integrationTarget}}

### 📋 INTEGRATION REQUIREMENTS
- Target: {{integrationTarget}}
- New Code: {{newCode}}
- Existing Patterns: {{existingPatterns}}
- Data Flow: {{dataFlow}}

### 🏗️ CODEBASE CONTEXT
- Main Component: SimpleColdShowerTracker.tsx
- Feature Location: src/components/features/
- UI Components: src/components/ui/
- Services: src/services/
- Utilities: src/lib/utils.ts

### 🔧 INTEGRATION STRATEGY
1. **Analyze Existing Code** (via filesystem MCP)
2. **Follow Established Patterns** (consistent with current architecture)
3. **Update Type Definitions** (extend existing interfaces)
4. **Add Navigation Logic** (integrate with main component)
5. **Test Integration** (ensure no breaking changes)

### 📊 EXISTING PATTERNS TO FOLLOW
- Use useState/useEffect for state management
- Implement localStorage for data persistence
- Follow CVA pattern for component variants
- Use 'cn()' utility for class merging
- Include proper TypeScript typing
- Add loading states and error handling

### 🛠️ TECHNICAL REQUIREMENTS
- TypeScript compilation without errors
- Consistent with existing design system
- Proper error handling and edge cases
- Mobile-responsive implementation
- Accessibility compliance
- Performance optimization

### ✅ SUCCESS CRITERIA
- Seamless integration with existing codebase
- No breaking changes to current functionality
- Consistent code quality and patterns
- Proper documentation and comments
- Production-ready implementation

### 🚀 PARALLEL EXECUTION
Execute all integration tasks simultaneously for maximum efficiency.
`
  },

  {
    id: 'inspiration-synthesis',
    name: 'Design Inspiration Synthesis',
    description: 'Synthesize design inspiration into actionable recommendations',
    type: 'inspiration',
    estimatedTokens: 700,
    variables: ['inspirationTopic', 'applicationArea', 'currentDesign', 'targetImprovement'],
    template: `
## 💡 INSPIRATION SYNTHESIS: {{inspirationTopic}}

### 📋 SYNTHESIS PARAMETERS
- Topic: {{inspirationTopic}}
- Application Area: {{applicationArea}}
- Current Design: {{currentDesign}}
- Target Improvement: {{targetImprovement}}

### 🎯 SYNTHESIS OBJECTIVES
1. **Trend Analysis** - Current design trends relevant to topic
2. **Pattern Identification** - Successful UI/UX patterns
3. **Implementation Strategy** - How to apply to BDBT project
4. **Code Examples** - Practical implementation approaches
5. **Design System Integration** - Consistency with existing style

### 🛠️ RESEARCH SOURCES
Use multiple MCP tools in parallel:
- **Web Search**: Latest design trends and patterns
- **21st.dev Magic**: Professional component examples
- **GitHub**: Implementation code samples
- **Design Inspiration Service**: Curated design resources

### 🏗️ BDBT APPLICATION CONTEXT
- Current Design: Glassmorphism with blue/teal gradients
- Architecture: React + TypeScript + Tailwind CSS
- UI Library: Custom components with CVA, Headless UI
- Target: Cold shower challenge and habit tracking
- Users: Health-conscious individuals seeking habit formation

### 📊 DELIVERABLES
1. **Trend Summary** - 3-5 relevant design trends
2. **Pattern Library** - Applicable UI patterns
3. **Implementation Guide** - Step-by-step approach
4. **Code Snippets** - Ready-to-use examples
5. **Design Tokens** - Colors, spacing, typography recommendations

### ✅ SUCCESS CRITERIA
- Comprehensive analysis completed efficiently
- All recommendations actionable and relevant
- Code examples ready for implementation
- Design system consistency maintained
- Clear implementation roadmap provided

### 🚀 OPTIMIZATION NOTES
- Execute all research operations simultaneously
- Provide complete context to avoid follow-up questions
- Generate immediately actionable recommendations
- Ensure all suggestions align with project goals
`
  }
];

export class PromptTemplateService {
  private templates = promptTemplates;

  getTemplate(id: string): PromptTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  getTemplatesByType(type: string): PromptTemplate[] {
    return this.templates.filter(t => t.type === type);
  }

  renderTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let rendered = template.template;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return rendered;
  }

  estimateTokenUsage(templateId: string): number {
    const template = this.getTemplate(templateId);
    return template ? template.estimatedTokens : 0;
  }

  getAllTemplates(): PromptTemplate[] {
    return this.templates;
  }
}

export const promptTemplateService = new PromptTemplateService();