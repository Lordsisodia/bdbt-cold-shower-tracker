#!/bin/bash

# Run tests and capture output
TEST_OUTPUT=$(npx playwright test 2>&1)

# Extract test results
PASSED=$(echo "$TEST_OUTPUT" | grep -o '[0-9]* passed' | awk '{print $1}')
FAILED=$(echo "$TEST_OUTPUT" | grep -o '[0-9]* failed' | awk '{print $1}')

# Default to 0 if no results found
PASSED=${PASSED:-0}
FAILED=${FAILED:-0}

# Send Telegram update
./scripts/agent-telegram.sh "E2E Tests: $PASSED passed, $FAILED failed."