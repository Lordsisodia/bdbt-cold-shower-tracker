#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    BDBT PROJECT CONTEXT                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo

echo "📁 Current Branch & Status:"
git branch --show-current 2>/dev/null || echo "Not in a git repository"
git status -sb 2>/dev/null | head -5
echo

echo "📝 Recent Commits:"
git log --oneline -5 2>/dev/null || echo "No git history available"
echo

echo "🚀 Available Scripts:"
if [ -f package.json ]; then
    npm run 2>/dev/null | grep -E '^ {2}[a-z]' | head -10 || echo "No scripts found"
else
    echo "No package.json found"
fi
echo

echo "🔧 Environment:"
echo "Node: $(node -v 2>/dev/null || echo 'Not installed')"
echo "NPM: $(npm -v 2>/dev/null || echo 'Not installed')"
echo

echo "💡 Tips System Status:"
if [ -f .env.local ]; then
    echo "✅ Environment configured"
else
    echo "⚠️  No .env.local found"
fi

echo "════════════════════════════════════════════════════════════════"