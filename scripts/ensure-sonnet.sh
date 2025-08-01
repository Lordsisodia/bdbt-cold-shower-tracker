#!/bin/bash

# Ensure all agents use Claude Sonnet model
# This prevents prompt waste on other models

echo "🎯 Ensuring all agents use Claude Sonnet..."

# Kill all existing Claude processes in tmux windows
for i in {1..8}; do
    echo "Stopping window $i..."
    tmux send-keys -t bdbt-orchestrator:$i C-c 2>/dev/null || true
    sleep 1
done

# Wait for processes to stop
sleep 3

# Restart all agents with Sonnet model explicitly
echo "🚀 Starting all agents with Sonnet model..."

# Store briefs for each team
mkdir -p /tmp/bdbt_agent_briefs

# Frontend PM
cat > /tmp/bdbt_agent_briefs/Frontend-PM.txt << 'EOF'
You are the Frontend Project Manager for BDBT. Use Claude Sonnet model. Your tasks:
- Manage UI/UX development for user platform and admin dashboard
- Coordinate with Frontend-Dev-1 and Frontend-Dev-2
- Ensure TypeScript compliance and component quality
- Report progress every 15 minutes
Current focus: Phase 1 tasks F2 (base UI components) and Phase 2 task U1 (user dashboard)
EOF

# Frontend Devs
cat > /tmp/bdbt_agent_briefs/Frontend-Dev-1.txt << 'EOF'
You are Frontend Developer 1 for BDBT. Use Claude Sonnet. Focus on:
- User platform components (dashboard, tip browsing, search)
- React + TypeScript + Tailwind CSS
- Implement from specs/frontend.spec.md
Work on task U1: User dashboard implementation
EOF

cat > /tmp/bdbt_agent_briefs/Frontend-Dev-2.txt << 'EOF'
You are Frontend Developer 2 for BDBT. Use Claude Sonnet. Focus on:
- Admin dashboard components
- Analytics visualizations
- Implement from specs/platform-complete.spec.md
Work on task A1: Admin authentication & layout
EOF

# Backend PM
cat > /tmp/bdbt_agent_briefs/Backend-PM.txt << 'EOF'
You are the Backend Project Manager for BDBT. Use Claude Sonnet. Your tasks:
- Manage API and database development
- Coordinate Supabase integration
- Ensure security and performance
- Use Supabase MCP tools
Current focus: F1 (Supabase auth) and F3 (database schema)
EOF

# Backend Devs
cat > /tmp/bdbt_agent_briefs/Backend-Dev-1.txt << 'EOF'
You are Backend Developer 1 for BDBT. Use Claude Sonnet. Focus on:
- Supabase authentication setup
- Database schema implementation
- Use Supabase MCP for all database operations
Work on tasks F1 and F3 from orchestrator-tasks.json
EOF

cat > /tmp/bdbt_agent_briefs/Backend-Dev-2.txt << 'EOF'
You are Backend Developer 2 for BDBT. Use Claude Sonnet. Focus on:
- API endpoints and services
- Background jobs and automation
- Grok API integration
Work on task U2: User activity tracking
EOF

# Integration Team
cat > /tmp/bdbt_agent_briefs/Integration-PM.txt << 'EOF'
You are the Integration Project Manager for BDBT. Use Claude Sonnet. Your tasks:
- Ensure frontend connects to backend properly
- Verify MCP tools are working
- Coordinate testing and deployment
- Monitor system health
EOF

cat > /tmp/bdbt_agent_briefs/Integration-Dev.txt << 'EOF'
You are the Integration Developer for BDBT. Use Claude Sonnet. Focus on:
- Connecting frontend to backend APIs
- Testing MCP tools and fixing issues
- Implementing fullstack features
- Deployment configuration
EOF

# Function to start agent with Sonnet
start_agent() {
    local window=$1
    local window_name=$2
    local brief_file="/tmp/bdbt_agent_briefs/${window_name}.txt"
    
    echo "Starting $window_name with Sonnet..."
    
    # Start Claude with explicit Sonnet model
    tmux send-keys -t bdbt-orchestrator:$window "claude --model claude-3-5-sonnet-20241022 --dangerously-skip-permissions" Enter
    sleep 5
    
    # Send the brief
    if [ -f "$brief_file" ]; then
        # Send line by line to avoid issues
        while IFS= read -r line; do
            tmux send-keys -t bdbt-orchestrator:$window "$line"
            tmux send-keys -t bdbt-orchestrator:$window Enter
        done < "$brief_file"
    fi
}

# Start all agents
start_agent 1 "Frontend-PM"
start_agent 2 "Frontend-Dev-1"
start_agent 3 "Frontend-Dev-2"
start_agent 4 "Backend-PM"
start_agent 5 "Backend-Dev-1"
start_agent 6 "Backend-Dev-2"
start_agent 7 "Integration-PM"
start_agent 8 "Integration-Dev"

echo "✅ All agents started with Claude Sonnet model!"
echo ""
echo "📊 Agent Brief Locations:"
echo "  /tmp/bdbt_agent_briefs/*.txt"
echo ""
echo "These briefs are used for auto-recovery if an agent gets stuck."