#!/bin/bash

# Get Telegram Chat ID
BOT_TOKEN="8401528910:AAGwHIBgBsViJPuw0LLNjTGyH1ah22_CowA"

echo "📱 Getting your Telegram Chat ID..."
echo ""
echo "1. First, message your bot at: https://t.me/Sisodevsystemmanagerbot"
echo "2. Send any message like 'Hello'"
echo "3. Press Enter here after sending the message..."
read

# Get updates from Telegram
RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getUpdates")

# Extract chat ID
CHAT_ID=$(echo "$RESPONSE" | grep -o '"chat":{"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -n "$CHAT_ID" ]; then
    echo "✅ Found your Chat ID: $CHAT_ID"
    
    # Update the config
    cat > "$HOME/.bdbt_telegram_config" << EOF
export TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
export TELEGRAM_CHAT_ID="$CHAT_ID"
EOF
    
    # Update .env.telegram
    cat > .env.telegram << EOF
export TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
export TELEGRAM_CHAT_ID="$CHAT_ID"
EOF
    
    # Add to shell profile if not already there
    if ! grep -q "bdbt_telegram_config" "$HOME/.zshrc" 2>/dev/null; then
        echo "" >> "$HOME/.zshrc"
        echo "# BDBT Telegram Configuration" >> "$HOME/.zshrc"
        echo "source $HOME/.bdbt_telegram_config" >> "$HOME/.zshrc"
    fi
    
    # Test the configuration
    source "$HOME/.bdbt_telegram_config"
    ./scripts/telegram-notifier.sh "🎉 BDBT Orchestrator connected! You'll receive updates here."
    
    echo ""
    echo "✅ Telegram bot configured successfully!"
    echo "📱 Bot: @Sisodevsystemmanagerbot"
    echo "💬 Chat ID: $CHAT_ID"
    
else
    echo "❌ Could not find chat ID. Make sure you:"
    echo "1. Messaged the bot at https://t.me/Sisodevsystemmanagerbot"
    echo "2. Sent a message before running this script"
    echo ""
    echo "Raw response for debugging:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
fi