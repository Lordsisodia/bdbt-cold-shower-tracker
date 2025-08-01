#!/bin/bash

# BDBT 12-Hour Autonomous Runner
# This script ensures the orchestrator runs for 12+ hours using Sonnet

set -e

PROJECT_DIR="/Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt"
cd "$PROJECT_DIR"

echo "🚀 BDBT 12-Hour Autonomous Session Starting..."
echo "⏰ Start time: $(date)"
echo "🏁 End time: $(date -v +12H 2>/dev/null || date -d '+12 hours' 2>/dev/null)"
echo ""

# Step 1: Set up Telegram (if not already done)
if [ ! -f "$HOME/.bdbt_telegram_config" ]; then
    echo "📱 First, let's set up Telegram notifications..."
    ./scripts/setup-telegram.sh
else
    source "$HOME/.bdbt_telegram_config"
    echo "✅ Telegram configured"
fi

# Step 2: Ensure all agents use Sonnet
echo "🎯 Configuring all agents to use Claude Sonnet..."
./scripts/ensure-sonnet.sh

# Step 3: Update orchestrator to track progress
echo "📊 Updating orchestrator with progress tracking..."
cat > /tmp/bdbt_orchestrator_addon.txt << 'EOF'
Additional instructions for 12-hour autonomous session:

1. Commit code every 15 minutes using ./scripts/auto-commit.sh
2. Update /tmp/bdbt_current_task.txt with current task before commits
3. Track completed tasks in orchestrator-tasks.json
4. Use TodoWrite to maintain task progress
5. Schedule regular check-ins:
   ./Tmux-Orchestrator/schedule_with_note.sh 15 "Progress check" "bdbt-orchestrator:0"
6. If any team gets stuck, restart them with the brief from /tmp/bdbt_agent_briefs/
7. Prioritize completing Phase 1 and Phase 2 tasks
8. Ensure all database operations use Supabase MCP

Remember: This is a 12-hour marathon. Pace the work, maintain quality, commit often.
EOF

# Send additional instructions to orchestrator
./Tmux-Orchestrator/send-claude-message.sh bdbt-orchestrator:0 "$(cat /tmp/bdbt_orchestrator_addon.txt)"

# Step 4: Start the monitoring system
echo "🔍 Starting autonomous monitoring system..."
./scripts/orchestrator-monitor.sh &
MONITOR_PID=$!

# Step 5: Create status dashboard
cat > /tmp/bdbt_status.sh << 'EOF'
#!/bin/bash
clear
echo "📊 BDBT Orchestrator Status Dashboard"
echo "====================================="
echo "⏰ Running since: $(cat /tmp/bdbt_start_time.txt 2>/dev/null || echo 'Unknown')"
echo "📦 Last commit: $(git log -1 --pretty=format:'%h %s' 2>/dev/null || echo 'None yet')"
echo "📋 Current task: $(cat /tmp/bdbt_current_task.txt 2>/dev/null || echo 'Starting up...')"
echo ""
echo "👥 Team Status:"
for i in {0..8}; do
    window_name=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}" 2>/dev/null | grep "^$i:" | cut -d: -f2)
    if [ -n "$window_name" ]; then
        last_line=$(tmux capture-pane -t bdbt-orchestrator:$i -p 2>/dev/null | tail -1 | cut -c1-50)
        echo "  $window_name: $last_line..."
    fi
done
echo ""
echo "📈 Git Activity:"
git log --oneline -5 2>/dev/null || echo "  No commits yet"
echo ""
echo "🔄 Last Telegram update:"
tail -1 /tmp/bdbt_telegram_log.txt 2>/dev/null || echo "  None yet"
EOF
chmod +x /tmp/bdbt_status.sh

# Step 6: Save start time
date > /tmp/bdbt_start_time.txt

# Step 7: Create emergency recovery script
cat > /tmp/bdbt_emergency_recovery.sh << 'EOF'
#!/bin/bash
echo "🚨 Emergency Recovery Activated"
source "$HOME/.bdbt_telegram_config"
./scripts/telegram-notifier.sh "🚨 Emergency recovery initiated"

# Restart orchestrator
tmux send-keys -t bdbt-orchestrator:0 C-c
sleep 2
tmux send-keys -t bdbt-orchestrator:0 "claude --model claude-3-5-sonnet-20241022 --dangerously-skip-permissions" Enter
sleep 5
tmux send-keys -t bdbt-orchestrator:0 "cat orchestrator-prompt-enhanced.md" Enter

# Restart all teams
./scripts/ensure-sonnet.sh

./scripts/telegram-notifier.sh "✅ Recovery complete - all systems restarted"
EOF
chmod +x /tmp/bdbt_emergency_recovery.sh

# Final message
echo ""
echo "✅ 12-Hour Autonomous Session Active!"
echo ""
echo "📱 Telegram notifications will keep you updated"
echo "📊 Check status: /tmp/bdbt_status.sh"
echo "🚨 Emergency recovery: /tmp/bdbt_emergency_recovery.sh"
echo "🔍 Monitor PID: $MONITOR_PID"
echo ""
echo "The system will now:"
echo "- Build the complete BDBT platform"
echo "- Use only Claude Sonnet (no prompt waste)"
echo "- Commit every 15 minutes"
echo "- Send Telegram updates on progress"
echo "- Auto-recover stuck agents"
echo "- Organize code every 2 hours"
echo ""
echo "Safe travels! Check Telegram for updates. 🚀"

# Send start notification
source "$HOME/.bdbt_telegram_config" 2>/dev/null
./scripts/telegram-notifier.sh "🚀 12-hour session started! I'll send updates as tasks complete. The team is building the BDBT platform autonomously."

# Keep script running
echo ""
echo "Press Ctrl+C to stop early (not recommended)"
trap "kill $MONITOR_PID 2>/dev/null; exit" INT TERM

# Wait for monitor to run
wait $MONITOR_PID