#!/bin/bash

# Auto-Improvement System
# Continuously improves the orchestrator and codebase

echo "🧠 Starting auto-improvement system..."

# Function to analyze and improve orchestrator performance
improve_orchestrator() {
    # Check task completion rate
    local completed=$(jq '[.master_task_list[][] | select(.status == "completed")] | length' orchestrator-tasks.json 2>/dev/null || echo "0")
    local total=$(jq '[.master_task_list[][]] | length' orchestrator-tasks.json 2>/dev/null || echo "1")
    local completion_rate=$((completed * 100 / total))
    
    # If completion rate is low, reassign tasks
    if [ "$completion_rate" -lt 50 ]; then
        echo "📊 Low completion rate ($completion_rate%). Optimizing task assignment..."
        
        # Create optimization message for orchestrator
        cat > /tmp/bdbt_optimization.txt << EOF
OPTIMIZATION NEEDED: Task completion at $completion_rate%.

Actions to take:
1. Review blocked tasks and reassign to available agents
2. Break down complex tasks into smaller subtasks
3. Prioritize Phase 1 foundation tasks
4. Check if any agents are stuck and need help
5. Use Planning-Agent to create better task breakdown

Send status update: ./scripts/agent-telegram.sh "Optimization: Reassigning tasks for better throughput"
EOF
        
        ./Tmux-Orchestrator/send-claude-message.sh bdbt-orchestrator:0 "$(cat /tmp/bdbt_optimization.txt)"
    fi
}

# Function to create new tasks based on discoveries
create_adaptive_tasks() {
    # Check recent commits for patterns
    local recent_files=$(git diff --name-only HEAD~5 2>/dev/null | head -10)
    
    # Generate new tasks based on activity
    cat > /tmp/bdbt_new_tasks.json << EOF
{
  "adaptive_tasks": {
    "testing": {
      "tasks": [
        {
          "id": "AT1",
          "title": "Create tests for recently modified files",
          "files": "$recent_files",
          "assigned": "Testing-Lead"
        }
      ]
    },
    "documentation": {
      "tasks": [
        {
          "id": "AD1",
          "title": "Document new components and APIs",
          "assigned": "Research-Agent"
        }
      ]
    },
    "optimization": {
      "tasks": [
        {
          "id": "AO1",
          "title": "Optimize bundle size and performance",
          "assigned": "CodeOrg-Agent"
        }
      ]
    }
  }
}
EOF
    
    # Send new tasks to Planning Agent
    ./Tmux-Orchestrator/send-claude-message.sh "Planning-Agent" "New adaptive tasks created. Please integrate into main task list: /tmp/bdbt_new_tasks.json"
}

# Function to ensure continuous progress
ensure_progress() {
    while true; do
        # Check each agent's activity
        for i in {0..14}; do
            local window_name=$(tmux list-windows -t bdbt-orchestrator -F "#{window_index}:#{window_name}" 2>/dev/null | grep "^$i:" | cut -d: -f2)
            if [ -n "$window_name" ]; then
                # Check last activity
                local last_line=$(tmux capture-pane -t bdbt-orchestrator:$i -p 2>/dev/null | tail -1)
                local activity_file="/tmp/bdbt_agent_${i}_activity"
                
                # Compare with previous activity
                if [ -f "$activity_file" ]; then
                    local prev_activity=$(cat "$activity_file")
                    if [ "$last_line" == "$prev_activity" ]; then
                        # Agent might be stuck
                        echo "⚠️  $window_name may be inactive"
                        
                        # Send wake-up message
                        ./Tmux-Orchestrator/send-claude-message.sh bdbt-orchestrator:$i "Status check: Are you actively working? Please send a Telegram update with your current progress."
                    fi
                fi
                
                echo "$last_line" > "$activity_file"
            fi
        done
        
        # Run improvements
        improve_orchestrator
        create_adaptive_tasks
        
        # Wait 15 minutes
        sleep 900
    done
}

# Start the improvement loop
ensure_progress &
IMPROVE_PID=$!

echo "✅ Auto-improvement system started (PID: $IMPROVE_PID)"
echo "The system will now:"
echo "- Monitor agent activity every 15 minutes"
echo "- Create new tasks based on progress"
echo "- Optimize task assignment"
echo "- Ensure continuous progress"

# Save PID for later
echo "$IMPROVE_PID" > /tmp/bdbt_improve_pid.txt