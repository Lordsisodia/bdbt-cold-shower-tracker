# 🤖 BDBT Autonomous Agent System

## Quick Start

```bash
# Install dependencies
cd agents
npm install

# Start the agent system
npm start

# Run in development mode with auto-restart
npm run start:dev

# View the dashboard
npm run dashboard
# Then open http://localhost:3001
```

## Agent Overview

### 🔌 Connection Monitor
- **Purpose**: Ensures Supabase connection is healthy
- **Frequency**: Every 5 minutes
- **Auto-Recovery**: Reconnects automatically
- **Monitors**: Database, auth, realtime, latency

### 🛠️ MCP Health Checker  
- **Purpose**: Keeps MCP servers running
- **Frequency**: Every 10 minutes
- **Auto-Recovery**: Restarts failed servers
- **Monitors**: Supabase, Notion, GitHub, Sequential Thinking

### 🔑 API Key Hunter
- **Purpose**: Automatically retrieves API keys using Puppeteer
- **Frequency**: Daily at 3 AM
- **Services**: Supabase, OpenAI, Notion
- **Security**: Stores keys in .env.local

### ✅ Functionality Tester
- **Purpose**: Runs comprehensive app tests
- **Frequency**: Every hour
- **Tests**: Database CRUD, API endpoints, UI components
- **Coverage**: Backend, frontend, user flows

### ⚡ Performance Monitor
- **Purpose**: Tracks system performance
- **Frequency**: Every 15 minutes
- **Metrics**: Memory, CPU, response times, bundle size
- **Alerts**: Performance degradation warnings

### 🚨 Error Handler
- **Purpose**: Centralized error logging and recovery
- **Features**: Pattern detection, auto-recovery, trend analysis
- **Storage**: `.logs/errors.json`

## Configuration

### Environment Variables
```bash
# Required for all agents
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional for specific agents
NOTION_API_KEY=your_notion_key
GITHUB_TOKEN=your_github_token
OPENAI_API_KEY=your_openai_key
```

### Agent Schedules
- **Connection Monitor**: `*/5 * * * *` (every 5 minutes)
- **MCP Health**: `*/10 * * * *` (every 10 minutes)  
- **Functionality Tests**: `0 * * * *` (every hour)
- **API Key Hunter**: `0 3 * * *` (daily at 3 AM)
- **Performance Monitor**: `*/15 * * * *` (every 15 minutes)

## Testing Individual Agents

```bash
# Test connection monitoring
npm run test-connection

# Test MCP health checking
npm run test-mcp

# Test API key hunting (be careful!)
npm run test-api-hunter

# Test functionality testing
npm run test-tester
```

## Dashboard Features

- **Real-time Status**: Live agent health monitoring
- **Performance Metrics**: System resource usage
- **Error Tracking**: Recent errors and recovery attempts
- **Historical Data**: Trends and patterns
- **Manual Controls**: Start/stop individual agents

## Auto-Recovery Features

### Connection Issues
- Automatic reconnection attempts
- Alternative connection methods
- Credential validation and reloading

### MCP Server Crashes
- Process restart with exponential backoff
- Configuration validation
- Dependency checking

### Performance Degradation
- Memory cleanup (garbage collection)
- Process restart for severe issues
- Alert escalation

### API Key Expiration
- Automatic key rotation
- Multi-source credential loading
- Secure storage updates

## Logging & Monitoring

### Log Locations
- **Agent Logs**: Console output with timestamps
- **Error Logs**: `.logs/errors.json`
- **Session Logs**: `~/.claude/bdbt-sessions.log`
- **Performance Metrics**: In-memory with history

### Health Checks
- **System Health**: Overall agent system status
- **Individual Agents**: Per-agent health and metrics
- **Dependencies**: External service connectivity
- **Performance**: Resource usage and response times

## Security Considerations

### API Key Management
- Keys stored in `.env.local` (gitignored)
- Encrypted session cookies in `.cookies/`
- No plaintext credentials in logs
- Automatic key rotation

### Browser Automation
- Headless Puppeteer for security
- No persistent browser sessions
- Automatic cleanup of temporary files
- Sandboxed execution

## Troubleshooting

### Common Issues

**Agents not starting:**
```bash
# Check dependencies
npm list

# Verify environment variables
echo $VITE_SUPABASE_URL

# Check permissions
ls -la agents/
```

**Connection failures:**
```bash
# Test Supabase manually
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/tips?limit=1"
```

**MCP issues:**
```bash
# Test MCP servers manually
npx -y @modelcontextprotocol/server-supabase
```

**Puppeteer problems:**
```bash
# Install dependencies
sudo apt-get install -y chromium-browser

# Or on macOS
brew install chromium
```

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm start

# Run single agent with debug
DEBUG=agent:connection npm run test-connection
```

## Integration with Main App

The agent system runs independently but integrates with:

- **Claude Code Hooks**: Session management and automation
- **Supabase**: Database monitoring and optimization
- **React App**: Performance monitoring and error tracking
- **Development Workflow**: Automated testing and deployment checks

## Future Enhancements

- **AI-Powered Predictions**: Use ML to predict failures
- **Multi-App Orchestration**: Manage multiple projects
- **Cloud Deployment**: AWS/GCP integration
- **Advanced Analytics**: Detailed performance insights
- **Slack/Discord Integration**: Real-time notifications