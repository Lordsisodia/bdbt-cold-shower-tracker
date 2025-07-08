/**
 * MCP Optimization Service
 * Maximizes efficiency when using Claude Code with MCP servers
 */

interface MCPRequest {
  id: string;
  type: 'ui' | 'search' | 'code' | 'inspiration';
  context: string;
  requirements: string[];
  expectedOutput: string;
  priority: 'high' | 'medium' | 'low';
  relatedRequests?: string[];
}

interface MCPResponse {
  requestId: string;
  success: boolean;
  output: any;
  contextUsed: number;
  iterations: number;
  efficiency: number;
}

interface OptimizationSession {
  id: string;
  startTime: Date;
  requests: MCPRequest[];
  responses: MCPResponse[];
  contextResets: number;
  totalPrompts: number;
  successRate: number;
}

class MCPOptimizer {
  private sessions: OptimizationSession[] = [];
  private currentSession: OptimizationSession | null = null;
  private contextThreshold = 70; // Percentage
  private maxContextBeforeReset = 80000; // Characters
  private currentContextUsage = 0;

  // Start a new optimization session
  startSession(sessionId: string): void {
    this.currentSession = {
      id: sessionId,
      startTime: new Date(),
      requests: [],
      responses: [],
      contextResets: 0,
      totalPrompts: 0,
      successRate: 0
    };
    this.sessions.push(this.currentSession);
  }

  // Optimize request for maximum efficiency
  optimizeRequest(request: MCPRequest): string {
    if (!this.currentSession) {
      throw new Error('No active session. Call startSession() first.');
    }

    this.currentSession.requests.push(request);

    // Build optimized prompt with context
    const optimizedPrompt = this.buildOptimizedPrompt(request);
    
    // Check if context reset is needed
    if (this.shouldResetContext()) {
      this.resetContext();
    }

    return optimizedPrompt;
  }

  // Build optimized prompt with maximum context
  private buildOptimizedPrompt(request: MCPRequest): string {
    const sections = [];

    // 1. Clear objective with context
    sections.push(`## 🎯 OBJECTIVE`);
    sections.push(`Type: ${request.type.toUpperCase()}`);
    sections.push(`Context: ${request.context}`);
    sections.push(`Expected Output: ${request.expectedOutput}`);
    sections.push('');

    // 2. Specific requirements
    if (request.requirements.length > 0) {
      sections.push(`## 📋 REQUIREMENTS`);
      request.requirements.forEach((req, index) => {
        sections.push(`${index + 1}. ${req}`);
      });
      sections.push('');
    }

    // 3. Project context for better results
    sections.push(`## 🏗️ PROJECT CONTEXT`);
    sections.push(`Project: BDBT Cold Shower Challenge App`);
    sections.push(`Framework: React 18.3.1 + TypeScript + Tailwind CSS`);
    sections.push(`UI Library: Custom components with CVA, Headless UI, Framer Motion`);
    sections.push(`Design System: Glassmorphism, modern SaaS styling like 21st.dev`);
    sections.push(`Current Features: Mood tracking, time tracking, habit stacking, analytics`);
    sections.push('');

    // 4. Existing code patterns for consistency
    sections.push(`## 🔧 CODE PATTERNS`);
    sections.push(`- Use 'cn()' utility for class merging`);
    sections.push(`- Follow CVA pattern for component variants`);
    sections.push(`- Use TypeScript interfaces for all props`);
    sections.push(`- Implement proper error handling`);
    sections.push(`- Include loading states and animations`);
    sections.push(`- Use localStorage for data persistence`);
    sections.push('');

    // 5. Success criteria
    sections.push(`## ✅ SUCCESS CRITERIA`);
    sections.push(`- First attempt success (no iterations needed)`);
    sections.push(`- TypeScript compilation without errors`);
    sections.push(`- Consistent with existing design system`);
    sections.push(`- Production-ready code quality`);
    sections.push(`- Accessibility compliance (ARIA, focus management)`);
    sections.push('');

    // 6. Parallel execution hint
    if (request.relatedRequests && request.relatedRequests.length > 0) {
      sections.push(`## 🚀 PARALLEL EXECUTION`);
      sections.push(`This request is related to: ${request.relatedRequests.join(', ')}`);
      sections.push(`Please execute all related operations simultaneously for maximum efficiency.`);
      sections.push('');
    }

    // 7. Specific tool usage instructions
    sections.push(`## 🛠️ TOOL USAGE`);
    switch (request.type) {
      case 'ui':
        sections.push(`- Use 21st.dev Magic MCP for professional UI components`);
        sections.push(`- Request 3 variations and select the best one`);
        sections.push(`- Integrate with existing design system`);
        break;
      case 'search':
        sections.push(`- Use web search MCP for design inspiration`);
        sections.push(`- Focus on modern SaaS and glassmorphism patterns`);
        sections.push(`- Filter results for React/TypeScript relevance`);
        break;
      case 'code':
        sections.push(`- Use filesystem MCP to understand existing patterns`);
        sections.push(`- Use GitHub MCP for implementation examples`);
        sections.push(`- Follow established code conventions`);
        break;
      case 'inspiration':
        sections.push(`- Use multiple search sources simultaneously`);
        sections.push(`- Combine UI patterns, design systems, and code examples`);
        sections.push(`- Focus on cold therapy and habit tracking UX patterns`);
        break;
    }

    return sections.join('\n');
  }

  // Check if context should be reset
  private shouldResetContext(): boolean {
    const contextUsagePercent = (this.currentContextUsage / this.maxContextBeforeReset) * 100;
    return contextUsagePercent > this.contextThreshold;
  }

  // Reset context for better performance
  private resetContext(): void {
    if (this.currentSession) {
      this.currentSession.contextResets++;
      this.currentContextUsage = 0;
      console.log(`🔄 Context reset #${this.currentSession.contextResets} for session ${this.currentSession.id}`);
    }
  }

  // Record response for analysis
  recordResponse(response: MCPResponse): void {
    if (!this.currentSession) return;

    this.currentSession.responses.push(response);
    this.currentSession.totalPrompts++;
    this.currentContextUsage += response.contextUsed;

    // Update success rate
    const successfulResponses = this.currentSession.responses.filter(r => r.success).length;
    this.currentSession.successRate = (successfulResponses / this.currentSession.responses.length) * 100;
  }

  // Get session analytics
  getSessionAnalytics(): {
    efficiency: number;
    successRate: number;
    avgIterations: number;
    contextResets: number;
    recommendations: string[];
  } {
    if (!this.currentSession) {
      return {
        efficiency: 0,
        successRate: 0,
        avgIterations: 0,
        contextResets: 0,
        recommendations: ['No active session']
      };
    }

    const responses = this.currentSession.responses;
    const avgIterations = responses.reduce((sum, r) => sum + r.iterations, 0) / responses.length;
    const avgEfficiency = responses.reduce((sum, r) => sum + r.efficiency, 0) / responses.length;

    const recommendations = [];
    if (this.currentSession.successRate < 80) {
      recommendations.push('Increase prompt specificity');
    }
    if (avgIterations > 2) {
      recommendations.push('Provide more context upfront');
    }
    if (this.currentSession.contextResets > 3) {
      recommendations.push('Consider batching related requests');
    }

    return {
      efficiency: avgEfficiency,
      successRate: this.currentSession.successRate,
      avgIterations,
      contextResets: this.currentSession.contextResets,
      recommendations
    };
  }

  // Generate batch request for related operations
  generateBatchRequest(requests: MCPRequest[]): string {
    const batchPrompt = [];
    
    batchPrompt.push(`## 🚀 BATCH OPERATION - ${requests.length} RELATED REQUESTS`);
    batchPrompt.push(`Please execute all of these operations simultaneously for maximum efficiency:\n`);

    requests.forEach((request, index) => {
      batchPrompt.push(`### Request ${index + 1}: ${request.type.toUpperCase()}`);
      batchPrompt.push(`**Context:** ${request.context}`);
      batchPrompt.push(`**Requirements:**`);
      request.requirements.forEach(req => batchPrompt.push(`- ${req}`));
      batchPrompt.push(`**Expected Output:** ${request.expectedOutput}\n`);
    });

    batchPrompt.push(`## 🎯 EXECUTION STRATEGY`);
    batchPrompt.push(`1. Execute all requests in parallel using available MCP tools`);
    batchPrompt.push(`2. Maintain consistency across all generated components`);
    batchPrompt.push(`3. Ensure all outputs follow the established design system`);
    batchPrompt.push(`4. Provide integrated solution that works together seamlessly`);

    return batchPrompt.join('\n');
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations = [];
    
    if (this.sessions.length === 0) {
      return ['Start a session to get optimization recommendations'];
    }

    // const recentSession = this.sessions[this.sessions.length - 1]; // Unused
    const analytics = this.getSessionAnalytics();

    if (analytics.successRate < 80) {
      recommendations.push('🎯 Increase prompt specificity - include more context and requirements');
    }

    if (analytics.avgIterations > 2) {
      recommendations.push('📋 Provide complete context upfront to avoid back-and-forth');
    }

    if (analytics.contextResets > 2) {
      recommendations.push('🔄 Consider batching related requests to reduce context resets');
    }

    if (analytics.efficiency < 70) {
      recommendations.push('⚡ Use parallel tool execution for independent operations');
    }

    return recommendations;
  }
}

export const mcpOptimizer = new MCPOptimizer();