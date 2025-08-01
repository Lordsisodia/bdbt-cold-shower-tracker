#!/bin/bash

echo "🔍 Manually checking for Telegram updates..."
echo ""

BOT_TOKEN="8401528910:AAGwHIBgBsViJPuw0LLNjTGyH1ah22_CowA"

# Try with offset to get all messages
for i in {0..10}; do
    echo "Attempt $i..."
    RESPONSE=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getUpdates?offset=-$i")
    
    if echo "$RESPONSE" | grep -q '"chat"'; then
        echo "✅ Found messages!"
        echo "$RESPONSE" | python3 -m json.tool
        
        CHAT_ID=$(echo "$RESPONSE" | grep -o '"chat":{"id":[0-9]*' | grep -o '[0-9]*' | head -1)
        if [ -n "$CHAT_ID" ]; then
            echo ""
            echo "✅ Your Chat ID is: $CHAT_ID"
            
            # Save configuration
            cat > "$HOME/.bdbt_telegram_config" << EOF
export TELEGRAM_BOT_TOKEN="$BOT_TOKEN"
export TELEGRAM_CHAT_ID="$CHAT_ID"
EOF
            
            echo "Configuration saved!"
            exit 0
        fi
    fi
    sleep 1
done

echo ""
echo "❌ Still no messages found. Please:"
echo "1. Make sure you clicked 'Start' in the bot chat"
echo "2. Send another message"
echo "3. Wait a few seconds and try again"