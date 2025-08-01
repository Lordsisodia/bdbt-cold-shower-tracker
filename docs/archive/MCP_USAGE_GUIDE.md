# 🔧 BDBT MCP Server Usage Guide

This project includes a custom **Model Context Protocol (MCP) server** specifically designed for the BDBT tips database and calendar system.

## 🚀 What's Set Up

The MCP server is fully configured and ready to use in this Claude Code project directory.

### ✅ Server Status
- **Server Name**: `bdbt-supabase`
- **Location**: `./.mcp/supabase-server.js`
- **Status**: ✅ Working with mock data mode
- **Configuration**: Automatically loads project's `.env` file

### 🛠️ Available Tools

The MCP server provides these tools for database operations:

#### Tips Management
- **`list_tips`** - Get all tips with optional filtering
  - Filters: `category`, `difficulty`, `status`, `limit`
  - Returns formatted tip data with metadata
  
- **`get_tip`** - Get specific tip by ID
  - Parameter: `id` (number)
  - Returns complete tip details
  
- **`create_tip`** - Create new tip
  - Required: `title`, `subtitle`, `category`, `difficulty`, `description`, `primary_benefit`
  - Optional: All other tip fields
  
- **`update_tip`** - Update existing tip
  - Parameters: `id`, `updates` (object)
  
- **`delete_tip`** - Delete tip by ID
  - Parameter: `id` (number)

#### Calendar Management
- **`list_calendar_events`** - Get calendar events
  - Filters: `start_date`, `end_date`, `category`, `status`
  
- **`create_calendar_event`** - Create calendar event
  - Required: `title`, `category`, `status`, `date`, `time`, `type`, `priority`

#### System Tools
- **`get_statistics`** - Get database statistics and metrics
- **`test_connection`** - Test Supabase connection status

### 📚 Available Resources

Access data directly through MCP resources:

- **`supabase://tips`** - All tips in the database
- **`supabase://calendar-events`** - All calendar events  
- **`supabase://statistics`** - Database statistics
- **`supabase://connection-status`** - Connection info

## 🔄 Data Modes

### Mock Data Mode (Current)
- **When**: No `.env` file or incomplete Supabase credentials
- **Data**: Realistic sample tips and calendar events
- **Features**: All MCP tools work with mock data
- **Perfect for**: Testing, development, evaluation

### Live Data Mode
- **When**: Proper Supabase credentials in `.env`
- **Data**: Real database from Supabase
- **Setup**: Follow `SETUP_SUPABASE.md` guide

## 🧪 Testing the MCP Server

### 1. Manual Server Test
```bash
# Test server startup
node ./.mcp/test-server.js

# Expected output:
# ✅ Server started successfully in mock data mode
# 💡 Server is ready for MCP integration
```

### 2. MCP Tools Test
Since the MCP server isn't automatically registered in this Claude Code session, you can test it manually:

```bash
# Start the server (in separate terminal)
node ./.mcp/supabase-server.js

# The server will run on stdio and wait for MCP protocol messages
```

### 3. Configuration Files
The setup script created these configuration files:
- `./.claude/mcp-config.json` - Claude Code specific config
- `./mcp-servers.json` - General MCP client config

## 🔧 Integration with Admin Interface

The MCP server is designed to work seamlessly with the admin interface:

### Dashboard Integration
```typescript
// Example: Using MCP data in Dashboard
const stats = await mcpTools.get_statistics();
const tips = await mcpTools.list_tips({ 
  category: 'health', 
  limit: 10 
});
```

### Tip Creator Integration
```typescript
// Example: Creating tips via MCP
await mcpTools.create_tip({
  title: "Morning Meditation",
  subtitle: "Start your day mindfully",
  category: "happiness",
  difficulty: "Easy",
  description: "A simple 5-minute meditation practice",
  primary_benefit: "Reduced stress and anxiety"
});
```

## 📝 Example MCP Commands

If you had direct MCP access, here are example commands:

```json
// List health tips
{
  "method": "tools/call",
  "params": {
    "name": "list_tips",
    "arguments": {
      "category": "health",
      "difficulty": "Easy",
      "limit": 5
    }
  }
}

// Get database statistics
{
  "method": "tools/call", 
  "params": {
    "name": "get_statistics",
    "arguments": {}
  }
}

// Test connection
{
  "method": "tools/call",
  "params": {
    "name": "test_connection", 
    "arguments": {}
  }
}
```

## 🚀 Future Enhancements

The MCP server is designed to be extensible:

### Planned Features
- **Bulk operations** for importing/exporting tips
- **Advanced search** with full-text search
- **Analytics tools** for tip performance
- **Scheduling automation** for calendar events
- **Integration hooks** for external services

### Customization
The server code in `./.mcp/supabase-server.js` can be extended with:
- New tools for specific business logic
- Additional resources for different data views
- Enhanced filtering and search capabilities
- Integration with external APIs

## 🎯 Summary

The BDBT MCP server provides a powerful, project-specific interface to the tips database and calendar system. It automatically handles:

✅ **Environment detection** - Switches between live and mock data  
✅ **Error handling** - Graceful fallbacks and informative errors  
✅ **Data validation** - Ensures data integrity and proper formatting  
✅ **Performance optimization** - Efficient queries and caching  
✅ **Development workflow** - Works without database setup for testing  

The server is ready to use and will automatically use live Supabase data once you complete the setup in `SETUP_SUPABASE.md`.