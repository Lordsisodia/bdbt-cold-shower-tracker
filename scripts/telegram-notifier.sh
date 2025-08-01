#!/bin/bash

# Telegram Notification Script
# Sends updates to your Telegram when tasks complete

# Configuration - You'll need to set these
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-your_bot_token_here}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-your_chat_id_here}"

# Function to send telegram message
send_telegram() {
    local message="$1"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Format message with project info
    local full_message="🤖 BDBT Orchestrator Update
⏰ $timestamp

$message

📊 Status: Running autonomously"
    
    # Send to Telegram
    curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
        -d chat_id="$TELEGRAM_CHAT_ID" \
        -d text="$full_message" \
        -d parse_mode="HTML" > /dev/null
    
    # Also log locally
    echo "[$timestamp] $message" >> /tmp/bdbt_telegram_log.txt
}

# Check if this is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being executed directly
    send_telegram "$1"
fi