#!/bin/bash

# Expand BDBT Teams with Testing, Research, and Planning Agents

echo "🚀 Expanding BDBT team with specialized agents..."

# Create new windows for additional agents
tmux new-window -t bdbt-orchestrator -n "Testing-Lead" -c "$(pwd)"
tmux new-window -t bdbt-orchestrator -n "Testing-E2E" -c "$(pwd)"
tmux new-window -t bdbt-orchestrator -n "Research-Agent" -c "$(pwd)"
tmux new-window -t bdbt-orchestrator -n "Planning-Agent" -c "$(pwd)"
tmux new-window -t bdbt-orchestrator -n "CodeOrg-Agent" -c "$(pwd)"

# Create briefs for new agents
mkdir -p /tmp/bdbt_agent_briefs

# Testing Lead
cat > /tmp/bdbt_agent_briefs/Testing-Lead.txt << 'EOF'
You are the Testing Lead for BDBT. Use Claude Sonnet model. Your responsibilities:

1. Use Puppeteer MCP to create E2E tests for all features
2. Test user flows: registration, login, tip browsing, downloads
3. Test admin dashboard functionality
4. Create visual regression tests
5. Report test results to Telegram every 30 minutes

Use these MCP tools:
- mcp__puppeteer__puppeteer_navigate
- mcp__puppeteer__puppeteer_screenshot
- mcp__puppeteer__puppeteer_click
- mcp__puppeteer__puppeteer_fill

Send updates using: ./scripts/agent-telegram.sh "Test: [what you tested] - [pass/fail]"

Focus on testing whatever the Frontend and Backend teams have built.
EOF

# E2E Testing Agent
cat > /tmp/bdbt_agent_briefs/Testing-E2E.txt << 'EOF'
You are the E2E Testing Agent. Use Claude Sonnet. Your tasks:

1. Write Playwright/Puppeteer tests for critical user paths
2. Create test files in tests/e2e/
3. Test API endpoints with automated scripts
4. Verify database operations work correctly
5. Send Telegram updates on test coverage

Every 30 minutes, run tests and report:
./scripts/agent-telegram.sh "E2E Tests: X passed, Y failed. Coverage: Z%"

Coordinate with Testing-Lead for test priorities.
EOF

# Research Agent
cat > /tmp/bdbt_agent_briefs/Research-Agent.txt << 'EOF'
You are the Research Agent for BDBT. Use Claude Sonnet. Your continuous tasks:

1. Analyze the codebase every hour
2. Identify areas for improvement
3. Research best practices for current implementations
4. Find performance optimization opportunities
5. Look for security vulnerabilities
6. Create improvement proposals

Every hour:
- Review all code changes
- Create reports in docs/research/
- Send findings: ./scripts/agent-telegram.sh "Research: Found [issue/opportunity] in [area]"

Use WebSearch tool to find latest best practices. Focus on making the platform better.
EOF

# Planning Agent
cat > /tmp/bdbt_agent_briefs/Planning-Agent.txt << 'EOF'
You are the Planning Agent for BDBT. Use Claude Sonnet. Your responsibilities:

1. Monitor progress on orchestrator-tasks.json
2. Create detailed plans for upcoming phases
3. Break down complex tasks into subtasks
4. Identify dependencies and blockers
5. Optimize task allocation across teams

Every 30 minutes:
- Review task completion status
- Update task priorities
- Create new tasks as needed
- Send summary: ./scripts/agent-telegram.sh "Planning: Phase X at Y% complete. Next priority: [task]"

Maintain a planning document in docs/planning/roadmap.md
EOF

# Code Organization Agent
cat > /tmp/bdbt_agent_briefs/CodeOrg-Agent.txt << 'EOF'
You are the Code Organization Agent for BDBT. Use Claude Sonnet. Your continuous tasks:

1. Refactor code for better organization
2. Extract common components and utilities
3. Improve file structure and naming
4. Add missing TypeScript types
5. Create shared interfaces and types
6. Optimize imports and dependencies

Every hour:
- Run linting and formatting
- Organize code into logical modules
- Create barrel exports (index.ts files)
- Update documentation
- Send updates: ./scripts/agent-telegram.sh "CodeOrg: Refactored [area], improved [metric]"

Follow these principles:
- DRY (Don't Repeat Yourself)
- SOLID principles
- Clean Architecture
- Consistent naming conventions
EOF

# Function to start agent with Telegram capability
start_enhanced_agent() {
    local window=$1
    local window_name=$2
    local brief_file="/tmp/bdbt_agent_briefs/${window_name}.txt"
    
    echo "Starting $window_name with enhanced capabilities..."
    
    # Start Claude with Sonnet
    tmux send-keys -t bdbt-orchestrator:$window "claude --model claude-3-5-sonnet-20241022 --dangerously-skip-permissions" Enter
    sleep 5
    
    # Send the brief
    if [ -f "$brief_file" ]; then
        while IFS= read -r line; do
            tmux send-keys -t bdbt-orchestrator:$window "$line"
            tmux send-keys -t bdbt-orchestrator:$window Enter
        done < "$brief_file"
    fi
}

# Get window numbers for new agents
WINDOWS=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}")
TESTING_LEAD=$(echo "$WINDOWS" | grep "Testing-Lead" | cut -d: -f1)
TESTING_E2E=$(echo "$WINDOWS" | grep "Testing-E2E" | cut -d: -f1)
RESEARCH=$(echo "$WINDOWS" | grep "Research-Agent" | cut -d: -f1)
PLANNING=$(echo "$WINDOWS" | grep "Planning-Agent" | cut -d: -f1)
CODEORG=$(echo "$WINDOWS" | grep "CodeOrg-Agent" | cut -d: -f1)

# Start all new agents
start_enhanced_agent $TESTING_LEAD "Testing-Lead"
start_enhanced_agent $TESTING_E2E "Testing-E2E"
start_enhanced_agent $RESEARCH "Research-Agent"
start_enhanced_agent $PLANNING "Planning-Agent"
start_enhanced_agent $CODEORG "CodeOrg-Agent"

echo "✅ Expanded team with 5 new specialized agents!"