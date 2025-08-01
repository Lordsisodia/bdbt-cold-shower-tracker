#!/bin/bash

# Telegram Bot Setup Script

echo "📱 Setting up Telegram notifications for BDBT Orchestrator"
echo ""
echo "You need to:"
echo "1. Create a Telegram bot:"
echo "   - Message @BotFather on Telegram"
echo "   - Send /newbot"
echo "   - Choose a name (e.g., BDBT Orchestrator Bot)"
echo "   - Choose a username (e.g., bdbt_orchestrator_bot)"
echo "   - Copy the bot token"
echo ""
echo "2. Get your chat ID:"
echo "   - Message your bot"
echo "   - Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
echo "   - Find your chat_id in the response"
echo ""

read -p "Enter your Telegram Bot Token: " BOT_TOKEN
read -p "Enter your Telegram Chat ID: " CHAT_ID

# Save to environment file
cat > "$HOME/.bdbt_telegram_config" << EOF
export TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
export TELEGRAM_CHAT_ID="$CHAT_ID"
EOF

# Add to shell profile
echo "" >> "$HOME/.zshrc"
echo "# BDBT Telegram Configuration" >> "$HOME/.zshrc"
echo "source $HOME/.bdbt_telegram_config" >> "$HOME/.zshrc"

# Test the configuration
source "$HOME/.bdbt_telegram_config"
./scripts/telegram-notifier.sh "🎉 Telegram notifications configured successfully!"

echo "✅ Configuration saved! Telegram notifications are ready."