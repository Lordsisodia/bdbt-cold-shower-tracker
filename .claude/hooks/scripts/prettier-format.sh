#!/bin/bash
# Prettier formatting hook for BDBT project

FILE_PATH="$1"

if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|json|css|md)$ ]]; then
    if command -v npx >/dev/null 2>&1; then
        npx prettier --write "$FILE_PATH" 2>/dev/null || true
        echo "✨ Formatted: $FILE_PATH"
    fi
fi