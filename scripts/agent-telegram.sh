#!/bin/bash

# Agent Telegram Reporter
# Allows any agent to send updates to Telegram

source "$HOME/.bdbt_telegram_config"

# Get agent name from tmux window
AGENT_NAME=$(tmux display-message -p '#{window_name}' 2>/dev/null || echo "Unknown-Agent")
MESSAGE="$1"

# Format message with agent identifier
FORMATTED_MSG="👤 $AGENT_NAME
$MESSAGE"

# Send to Telegram
curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$FORMATTED_MSG" \
    -d parse_mode="HTML" > /dev/null

# Log locally
echo "$(date '+%Y-%m-%d %H:%M:%S') [$AGENT_NAME] $MESSAGE" >> /tmp/bdbt_agent_updates.log