#!/bin/bash

# Enhance all existing agents with Telegram reporting

echo "🔧 Enhancing all agents with continuous Telegram updates..."

# Create enhanced instructions for existing agents
cat > /tmp/bdbt_telegram_enhancement.txt << 'EOF'
IMPORTANT UPDATE: You now have Telegram reporting capability.

Use this command to send updates:
./scripts/agent-telegram.sh "Your update message here"

Required updates to send:
1. When starting a new task: ./scripts/agent-telegram.sh "Starting: [task name]"
2. When completing a task: ./scripts/agent-telegram.sh "Completed: [task name]"
3. Every 30 minutes: ./scripts/agent-telegram.sh "Progress: [what you're working on]"
4. When encountering issues: ./scripts/agent-telegram.sh "Issue: [problem description]"
5. When making commits: ./scripts/agent-telegram.sh "Commit: [commit message]"

This keeps the team owner informed while they're away.
EOF

# Send enhancement to all existing agents
for i in {1..8}; do
    WINDOW_NAME=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}" | grep "^$i:" | cut -d: -f2)
    if [ -n "$WINDOW_NAME" ]; then
        echo "Enhancing $WINDOW_NAME..."
        ./Tmux-Orchestrator/send-claude-message.sh bdbt-orchestrator:$i "$(cat /tmp/bdbt_telegram_enhancement.txt)"
    fi
done

echo "✅ All agents enhanced with Telegram reporting!"