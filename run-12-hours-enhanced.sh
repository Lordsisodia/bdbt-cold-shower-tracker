#!/bin/bash

# BDBT 12-Hour ENHANCED Autonomous Runner
# With testing, research, planning, and continuous improvements

set -e

PROJECT_DIR="/Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt"
cd "$PROJECT_DIR"

echo "🚀 BDBT 12-Hour ENHANCED Autonomous Session Starting..."
echo "⏰ Start time: $(date)"
echo "🏁 End time: $(date -v +12H 2>/dev/null || date -d '+12 hours' 2>/dev/null)"
echo ""

# Source Telegram config
source "$HOME/.bdbt_telegram_config" 2>/dev/null || true

# Step 1: Expand teams with new agents
echo "📈 Expanding team with specialized agents..."
./scripts/expand-teams.sh

# Step 2: Enhance all agents with Telegram
echo "📱 Enhancing all agents with Telegram reporting..."
./scripts/enhance-all-agents.sh

# Step 3: Start auto-improvement system
echo "🧠 Starting auto-improvement system..."
./scripts/auto-improve-system.sh

# Step 4: Configure testing capabilities
echo "🧪 Configuring testing capabilities..."
cat > /tmp/bdbt_testing_config.txt << 'EOF'
Testing Configuration Active:

1. Testing-Lead will use Puppeteer MCP to test all features
2. Testing-E2E will create comprehensive test suites
3. Tests will run every hour and report results
4. Visual regression tests will capture screenshots

Available MCP tools for testing:
- mcp__puppeteer__puppeteer_navigate
- mcp__puppeteer__puppeteer_screenshot
- mcp__puppeteer__puppeteer_click
- mcp__puppeteer__puppeteer_fill
- mcp__puppeteer__puppeteer_evaluate

Start testing once Frontend team has basic UI ready.
EOF

./Tmux-Orchestrator/send-claude-message.sh "Testing-Lead" "$(cat /tmp/bdbt_testing_config.txt)"

# Step 5: Set up continuous monitoring
echo "📊 Setting up enhanced monitoring..."
./scripts/orchestrator-monitor.sh &
MONITOR_PID=$!

# Step 6: Create comprehensive status dashboard
cat > /tmp/bdbt_enhanced_status.sh << 'EOF'
#!/bin/bash
clear
echo "📊 BDBT Enhanced Orchestrator Dashboard"
echo "======================================"
echo "⏰ Running since: $(cat /tmp/bdbt_start_time.txt 2>/dev/null)"
echo ""
echo "👥 Team Status (13 Agents):"
echo "Core Teams:"
for i in {0..8}; do
    window_name=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}" 2>/dev/null | grep "^$i:" | cut -d: -f2)
    if [ -n "$window_name" ]; then
        status=$(tmux capture-pane -t bdbt-orchestrator:$i -p 2>/dev/null | grep -E "(Starting:|Working on:|Completed:)" | tail -1 | cut -c1-60)
        printf "  %-15s: %s\n" "$window_name" "${status:-Initializing...}"
    fi
done
echo ""
echo "Specialized Teams:"
for name in "Testing-Lead" "Testing-E2E" "Research-Agent" "Planning-Agent" "CodeOrg-Agent"; do
    window_num=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}" | grep "$name" | cut -d: -f1)
    if [ -n "$window_num" ]; then
        status=$(tmux capture-pane -t bdbt-orchestrator:$window_num -p 2>/dev/null | grep -E "(Starting:|Working on:|Testing:|Research:)" | tail -1 | cut -c1-60)
        printf "  %-15s: %s\n" "$name" "${status:-Initializing...}"
    fi
done
echo ""
echo "📈 Progress Metrics:"
echo "  Git Commits: $(git rev-list --count HEAD 2>/dev/null || echo "0")"
echo "  Tasks Completed: $(jq '[.master_task_list[][] | select(.status == "completed")] | length' orchestrator-tasks.json 2>/dev/null || echo "0")"
echo "  Test Coverage: $(find tests -name "*.test.*" 2>/dev/null | wc -l) test files"
echo "  Code Quality: $(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}') lines of code"
echo ""
echo "📱 Recent Telegram Updates:"
tail -5 /tmp/bdbt_telegram_log.txt 2>/dev/null | sed 's/^/  /'
echo ""
echo "🔄 Auto-Improvements Active:"
if [ -f /tmp/bdbt_improve_pid.txt ]; then
    IMPROVE_PID=$(cat /tmp/bdbt_improve_pid.txt)
    if ps -p $IMPROVE_PID > /dev/null; then
        echo "  ✅ Auto-improvement system running (PID: $IMPROVE_PID)"
    else
        echo "  ❌ Auto-improvement system stopped"
    fi
fi
EOF
chmod +x /tmp/bdbt_enhanced_status.sh

# Step 7: Send comprehensive start notification
./scripts/telegram-notifier.sh "🚀 Enhanced 12-hour session started!

👥 13 Agents Active:
- 8 Core development agents
- 2 Testing agents (with Puppeteer)
- 1 Research agent
- 1 Planning agent  
- 1 Code organization agent

🎯 Features:
- Continuous Telegram updates from all agents
- Auto-testing with Puppeteer MCP
- Self-improvement system
- Adaptive task creation
- Code organization every hour

I'll keep you updated on all progress!"

# Step 8: Schedule major milestone checks
cat > /tmp/bdbt_milestone_checker.sh << 'EOF'
#!/bin/bash
source "$HOME/.bdbt_telegram_config"

check_milestones() {
    # Check Phase 1 completion
    local phase1_complete=$(jq '[.master_task_list.phase_1_foundation.tasks[] | select(.status == "completed")] | length' orchestrator-tasks.json)
    local phase1_total=$(jq '.master_task_list.phase_1_foundation.tasks | length' orchestrator-tasks.json)
    
    if [ "$phase1_complete" == "$phase1_total" ]; then
        ./scripts/telegram-notifier.sh "🎉 MILESTONE: Phase 1 (Foundation) Complete! Moving to Phase 2."
    fi
    
    # Check test coverage
    local test_count=$(find tests -name "*.test.*" 2>/dev/null | wc -l)
    if [ "$test_count" -gt 10 ]; then
        ./scripts/telegram-notifier.sh "🧪 MILESTONE: Test coverage established with $test_count test files!"
    fi
    
    # Check user platform progress
    if [ -f "src/pages/Dashboard.tsx" ] && [ -f "src/pages/TipsManager.tsx" ]; then
        ./scripts/telegram-notifier.sh "💻 MILESTONE: User platform core pages implemented!"
    fi
}

# Run every hour
while true; do
    sleep 3600
    check_milestones
done
EOF
chmod +x /tmp/bdbt_milestone_checker.sh
/tmp/bdbt_milestone_checker.sh &
MILESTONE_PID=$!

# Save start time
date > /tmp/bdbt_start_time.txt

# Final instructions
echo ""
echo "✅ Enhanced 12-Hour Session Active!"
echo ""
echo "📱 You'll receive Telegram updates for:"
echo "  - Every task start/completion"
echo "  - Progress updates every 30 minutes"
echo "  - Test results"
echo "  - Research findings"
echo "  - Code improvements"
echo "  - Major milestones"
echo ""
echo "📊 Check status: /tmp/bdbt_enhanced_status.sh"
echo "🚨 Emergency: /tmp/bdbt_emergency_recovery.sh"
echo ""
echo "The system will build your complete platform with:"
echo "- User authentication and dashboard"
echo "- Admin panel with analytics"
echo "- E2E tests using Puppeteer"
echo "- Continuous improvements"
echo "- Clean, organized code"
echo ""
echo "See you in 12 hours with a working platform! 🚀"

# Keep running
trap "kill $MONITOR_PID $MILESTONE_PID 2>/dev/null; exit" INT TERM
wait