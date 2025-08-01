#!/bin/bash

# Autonomous Orchestrator Monitor
# Ensures the system runs for 12+ hours without intervention

PROJECT_DIR="/Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt"
cd "$PROJECT_DIR"

# Source telegram notifier
source ./scripts/telegram-notifier.sh

# Function to check if using Sonnet model
verify_model() {
    local window="$1"
    local capture=$(tmux capture-pane -t bdbt-orchestrator:$window -p | tail -100)
    
    # Check if window is using correct model
    if echo "$capture" | grep -q "claude-3-5-sonnet"; then
        echo "✅ Window $window using Sonnet"
        return 0
    else
        echo "⚠️  Window $window may not be using Sonnet"
        return 1
    fi
}

# Function to check prompt count
check_prompt_usage() {
    local usage_file="/tmp/bdbt_prompt_usage.json"
    local current_hour=$(date +"%H")
    local prompts_this_hour=$(cat "$usage_file" 2>/dev/null | jq ".hour_$current_hour" 2>/dev/null || echo "0")
    
    echo "$prompts_this_hour"
}

# Function to restart stuck agents
restart_stuck_agent() {
    local window="$1"
    local window_name="$2"
    
    echo "🔄 Restarting stuck agent in $window_name"
    
    # Kill current process
    tmux send-keys -t bdbt-orchestrator:$window C-c
    sleep 2
    
    # Restart with Sonnet
    tmux send-keys -t bdbt-orchestrator:$window "claude --model claude-3-5-sonnet-20241022 --dangerously-skip-permissions" Enter
    sleep 5
    
    # Re-brief the agent
    local brief_file="/tmp/bdbt_agent_briefs/${window_name}.txt"
    if [ -f "$brief_file" ]; then
        tmux send-keys -t bdbt-orchestrator:$window "$(cat $brief_file)" Enter
    fi
    
    send_telegram "🔄 Restarted $window_name - was stuck or inactive"
}

# Function to monitor task completion
monitor_tasks() {
    local tasks_file="$PROJECT_DIR/orchestrator-tasks.json"
    local last_tasks_hash=$(md5sum "$tasks_file" 2>/dev/null | cut -d' ' -f1)
    
    while true; do
        # Check for task updates
        local current_hash=$(md5sum "$tasks_file" 2>/dev/null | cut -d' ' -f1)
        if [ "$current_hash" != "$last_tasks_hash" ]; then
            # Tasks updated - check what completed
            local completed=$(jq -r '.master_task_list[][] | select(.status == "completed") | .title' "$tasks_file" 2>/dev/null | tail -1)
            if [ -n "$completed" ]; then
                send_telegram "✅ Task Completed: $completed"
            fi
            last_tasks_hash="$current_hash"
        fi
        
        # Check Git commits
        local last_commit=$(git log -1 --pretty=format:"%h %s" 2>/dev/null)
        if [ "$last_commit" != "$LAST_SEEN_COMMIT" ]; then
            send_telegram "📦 New Commit: $last_commit"
            LAST_SEEN_COMMIT="$last_commit"
        fi
        
        # Check each window for activity
        for i in {0..8}; do
            local window_name=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}" | grep "^$i:" | cut -d: -f2)
            local last_output=$(tmux capture-pane -t bdbt-orchestrator:$i -p | tail -1)
            
            # Check if window is stuck (same output for 30 minutes)
            local stuck_check_file="/tmp/bdbt_window_${i}_last"
            if [ -f "$stuck_check_file" ]; then
                local old_output=$(cat "$stuck_check_file")
                if [ "$last_output" == "$old_output" ]; then
                    local stuck_count=$(cat "/tmp/bdbt_window_${i}_stuck_count" 2>/dev/null || echo "0")
                    stuck_count=$((stuck_count + 1))
                    echo "$stuck_count" > "/tmp/bdbt_window_${i}_stuck_count"
                    
                    if [ "$stuck_count" -gt 6 ]; then  # 30 minutes
                        restart_stuck_agent "$i" "$window_name"
                        echo "0" > "/tmp/bdbt_window_${i}_stuck_count"
                    fi
                else
                    echo "0" > "/tmp/bdbt_window_${i}_stuck_count"
                fi
            fi
            echo "$last_output" > "$stuck_check_file"
        done
        
        # Sleep for 5 minutes before next check
        sleep 300
    done
}

# Function to organize code periodically
organize_code() {
    while true; do
        # Wait 2 hours
        sleep 7200
        
        echo "🧹 Running code organization..."
        
        # Run prettier/eslint if available
        if [ -f "package.json" ]; then
            npm run lint --fix 2>/dev/null || true
            npm run format 2>/dev/null || true
        fi
        
        # Organize imports
        find src -name "*.ts" -o -name "*.tsx" | xargs -I {} npx organize-imports-cli {} 2>/dev/null || true
        
        # Remove unused files
        find . -name "*.tmp" -o -name "*.log" -mtime +1 -delete 2>/dev/null || true
        
        # Update documentation
        if command -v typedoc &> /dev/null; then
            npx typedoc --out docs src 2>/dev/null || true
        fi
        
        send_telegram "🧹 Code organization completed"
    done
}

# Main monitoring loop
echo "🚀 Starting 12-hour autonomous monitor..."
send_telegram "🚀 BDBT Orchestrator starting 12-hour autonomous session"

# Start background monitors
monitor_tasks &
MONITOR_PID=$!

organize_code &
ORGANIZE_PID=$!

# Store agent briefs for restart capability
mkdir -p /tmp/bdbt_agent_briefs

# Initial system status
send_telegram "📊 Initial Status:
- 8 agent windows active
- Git automation enabled
- Task monitoring active
- Code organization scheduled
- Using Claude Sonnet model"

# Keep running
echo "Monitor PIDs: $MONITOR_PID (tasks), $ORGANIZE_PID (code)"
echo "Press Ctrl+C to stop monitoring"

# Trap to clean up on exit
trap "kill $MONITOR_PID $ORGANIZE_PID 2>/dev/null; exit" INT TERM

# Wait indefinitely
wait