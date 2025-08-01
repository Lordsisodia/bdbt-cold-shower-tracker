#!/bin/bash

# Automated Git Commit Script
# Commits all changes with meaningful messages

cd /Users/shaansisodia/Desktop/Cursor/SIDE-QUEST-CLIENTS/bdbt

# Get current task from task tracking file
CURRENT_TASK="Development progress"
if [ -f "/tmp/bdbt_current_task.txt" ]; then
    CURRENT_TASK=$(cat /tmp/bdbt_current_task.txt)
fi

# Check if there are changes to commit
if [[ -n $(git status -s) ]]; then
    # Stage all changes
    git add -A
    
    # Generate commit message with timestamp
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
    COMMIT_MSG="Auto-commit: [$TIMESTAMP] - $CURRENT_TASK"
    
    # Get file statistics for detailed message
    STATS=$(git diff --cached --stat | tail -1)
    
    # Create detailed commit message
    FULL_MSG="$COMMIT_MSG

Changes: $STATS

Modified files:
$(git diff --cached --name-only | head -10)"
    
    # Commit changes
    git commit -m "$FULL_MSG"
    
    # Push to remote if available
    if git remote | grep -q origin; then
        git push origin main 2>/dev/null || git push origin master 2>/dev/null || echo "⚠️  Push failed - will retry later"
    fi
    
    echo "✅ Auto-committed: $CURRENT_TASK"
    
    # Log commit
    echo "$(date): Committed - $CURRENT_TASK" >> /tmp/bdbt_git_log.txt
else
    echo "ℹ️  No changes to commit"
fi