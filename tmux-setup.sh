#!/bin/bash

# BDBT Tmux-Orchestrator Setup Script
# Creates persistent tmux sessions for autonomous agent workflow

set -e

PROJECT_NAME="bdbt-orchestrator"
BASE_DIR="/Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt"

echo "🚀 Setting up BDBT Autonomous Agent System..."

# Kill existing sessions if they exist
tmux kill-session -t $PROJECT_NAME 2>/dev/null || true

# Create main orchestrator session
tmux new-session -d -s $PROJECT_NAME -c "$BASE_DIR"

# Window 1: Orchestrator (Main Coordinator)
tmux rename-window -t $PROJECT_NAME:0 "orchestrator"
tmux send-keys -t $PROJECT_NAME:orchestrator "echo '🎯 BDBT Orchestrator Online'" C-m

# Window 2: Tip Generator Agent
tmux new-window -t $PROJECT_NAME -n "tip-generator" -c "$BASE_DIR"
tmux send-keys -t $PROJECT_NAME:tip-generator "echo '✍️ Tip Generator Agent Ready'" C-m

# Window 3: Database Manager Agent  
tmux new-window -t $PROJECT_NAME -n "database-mgr" -c "$BASE_DIR"
tmux send-keys -t $PROJECT_NAME:database-mgr "echo '🗄️ Database Manager Agent Ready'" C-m

# Window 4: PDF Creator Agent
tmux new-window -t $PROJECT_NAME -n "pdf-creator" -c "$BASE_DIR"
tmux send-keys -t $PROJECT_NAME:pdf-creator "echo '📄 PDF Creator Agent Ready'" C-m

# Window 5: Quality Auditor Agent
tmux new-window -t $PROJECT_NAME -n "quality-audit" -c "$BASE_DIR"
tmux send-keys -t $PROJECT_NAME:quality-audit "echo '🔍 Quality Auditor Agent Ready'" C-m

# Window 6: System Monitor
tmux new-window -t $PROJECT_NAME -n "monitor" -c "$BASE_DIR"
tmux send-keys -t $PROJECT_NAME:monitor "echo '📊 System Monitor Online'" C-m

# Create communication directories
mkdir -p /tmp/bdbt_status
mkdir -p /tmp/bdbt_tasks  
mkdir -p /tmp/bdbt_errors
mkdir -p /tmp/bdbt_metrics

echo "✅ Tmux sessions created successfully!"
echo "🔗 Connect with: tmux attach-session -t $PROJECT_NAME"
echo "📋 Available windows:"
echo "  - orchestrator: Main coordination"
echo "  - tip-generator: Content creation"
echo "  - database-mgr: Data operations" 
echo "  - pdf-creator: PDF generation"
echo "  - quality-audit: Quality assurance"
echo "  - monitor: System monitoring"

# Start the orchestrator
tmux send-keys -t $PROJECT_NAME:orchestrator "cd $BASE_DIR && node agents/orchestrator.js" C-m