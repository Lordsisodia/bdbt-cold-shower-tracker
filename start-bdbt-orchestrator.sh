#!/bin/bash

# BDBT Orchestrator Startup Script
# This script launches the complete autonomous system

set -e

echo "🚀 Starting BDBT Autonomous Orchestrator System..."

# Set project directory
PROJECT_DIR="/Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt"
cd "$PROJECT_DIR"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p /tmp/bdbt_status
mkdir -p /tmp/bdbt_tasks
mkdir -p /tmp/bdbt_errors
mkdir -p /tmp/bdbt_metrics
mkdir -p /tmp/bdbt_logs

# Kill any existing orchestrator session
echo "🔄 Cleaning up existing sessions..."
tmux kill-session -t bdbt-orchestrator 2>/dev/null || true

# Create main orchestrator session
echo "🎯 Creating orchestrator session..."
tmux new-session -d -s bdbt-orchestrator -c "$PROJECT_DIR"

# Rename first window to Orchestrator
tmux rename-window -t bdbt-orchestrator:0 "Orchestrator"

# Start Claude in orchestrator window
echo "🤖 Starting Claude orchestrator..."
tmux send-keys -t bdbt-orchestrator:0 "claude --dangerously-skip-permissions" Enter
sleep 5

# Send the enhanced orchestrator prompt
echo "📋 Briefing the orchestrator with enhanced capabilities..."
tmux send-keys -t bdbt-orchestrator:0 "cat orchestrator-prompt-enhanced.md" Enter
sleep 2

echo "✅ BDBT Orchestrator system started!"
echo ""
echo "📌 Quick Reference:"
echo "  - Connect: tmux attach-session -t bdbt-orchestrator"
echo "  - List windows: tmux list-windows -t bdbt-orchestrator"
echo "  - Send message: ./Tmux-Orchestrator/send-claude-message.sh [target] '[message]'"
echo "  - Schedule check: ./Tmux-Orchestrator/schedule_with_note.sh [minutes] '[note]' [target]"
echo ""
echo "🎯 The orchestrator will now:"
echo "  1. Verify the system is working"
echo "  2. Create teams (Frontend, Backend, Content)"
echo "  3. Deploy Project Managers and Developers"
echo "  4. Begin autonomous tip generation"
echo ""
echo "Monitor progress with: tmux attach-session -t bdbt-orchestrator"