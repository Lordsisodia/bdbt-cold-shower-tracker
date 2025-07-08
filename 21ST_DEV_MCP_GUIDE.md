# 🎨 21st.dev Magic MCP Integration Guide

## Overview
Connect 21st.dev's Magic MCP server to Claude Code for AI-powered UI component generation directly in your development workflow.

## 🚀 What You Get

### **AI-Powered Component Generation**
- Create React + Tailwind components from natural language
- Generate professional, production-ready UI components
- Access curated component library with modern designs
- Get 3 variations of each component request

### **21st.dev Magic Features**
- **Like v0 but in your IDE**: Direct integration with development tools
- **Professional Components**: Pre-tested, production-grade designs
- **TypeScript Support**: Full type safety and developer experience
- **Logo Integration**: Access SVGL icon library
- **Always Updated**: Latest components from the community

## 📋 Setup Instructions

### **Step 1: Get Your API Key**
1. Visit [21st.dev/magic](https://21st.dev/magic)
2. Sign up for an account
3. Get your API key (5 free requests, then $20/month)
4. Save your API key securely

### **Step 2: Run the Setup Script**
```bash
# Make the script executable and run it
chmod +x setup-21st-dev-mcp.sh
./setup-21st-dev-mcp.sh
```

### **Step 3: Set Your API Key**
```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export MAGIC_API_KEY='your-actual-api-key-here'

# Or set for current session
export MAGIC_API_KEY='your-actual-api-key-here'
```

### **Step 4: Configure Claude Code**
The setup script creates this configuration automatically:

```json
{
  "mcpServers": {
    "21st-dev-magic": {
      "command": "npx",
      "args": ["@21st-dev/magic"],
      "env": {
        "MAGIC_API_KEY": "${MAGIC_API_KEY}"
      }
    }
  }
}
```

### **Step 5: Start Claude Code with MCP**
```bash
# Start Claude Code with MCP configuration
claude-code --mcp-config ~/.config/claude-code/mcp_servers.json
```

## 🎯 Usage Examples

### **Component Creation Commands**
```
/ui create a modern button component with glassmorphism effect
/ui design a pricing table with 3 tiers and dark mode support
/ui build a navigation header with logo and mobile menu
/ui make a contact form with validation styles
/ui create a dashboard card with statistics
```

### **Search and Inspiration**
```
/ui search for modern dashboard layouts
/ui find inspiration for authentication forms
/ui show examples of pricing components
/ui get cold shower app UI ideas
```

### **Specific Component Types**
```
/ui create button - modern, glassmorphic style
/ui create card - dashboard stats with icons
/ui create modal - confirmation dialog
/ui create form - user registration with validation
/ui create nav - responsive header with dropdown
```

## 🛠️ Integration with Your BDBT Project

### **For Cold Shower Challenge Features**
```
/ui create habit tracker component with streak counter
/ui design mood tracking interface with emoji selectors
/ui build progress dashboard for cold shower statistics
/ui create achievement badge component with animations
/ui design calendar view for habit tracking
```

### **For Modern UI Enhancement**
```
/ui create glassmorphic card component
/ui design modern button variants with hover effects
/ui build responsive navigation with mobile support
/ui create toast notification component
/ui design loading states with skeleton screens
```

## 📁 File Structure After Setup

```
your-project/
├── claude-mcp-config.json          # MCP configuration
├── setup-21st-dev-mcp.sh          # Setup script
├── 21ST_DEV_MCP_GUIDE.md          # This guide
└── ~/.config/claude-code/
    └── mcp_servers.json            # Claude Code MCP config
```

## 🔧 Troubleshooting

### **Common Issues**

1. **API Key Not Found**
   ```bash
   # Check if API key is set
   echo $MAGIC_API_KEY
   
   # Set it temporarily
   export MAGIC_API_KEY='your-key'
   ```

2. **MCP Server Not Connecting**
   ```bash
   # Test MCP server directly
   npx @21st-dev/magic --help
   
   # Check Claude Code MCP status
   claude-code --list-mcp-servers
   ```

3. **Permission Issues**
   ```bash
   # Make sure script is executable
   chmod +x setup-21st-dev-mcp.sh
   
   # Check config directory permissions
   ls -la ~/.config/claude-code/
   ```

### **Alternative Setup Methods**

#### **Manual Configuration**
If the script doesn't work, manually create:

1. **Create config directory:**
   ```bash
   mkdir -p ~/.config/claude-code
   ```

2. **Create MCP config file:**
   ```bash
   cat > ~/.config/claude-code/mcp_servers.json << 'EOF'
   {
     "mcpServers": {
       "21st-dev-magic": {
         "command": "npx",
         "args": ["@21st-dev/magic"],
         "env": {
           "MAGIC_API_KEY": "${MAGIC_API_KEY}"
         }
       }
     }
   }
   EOF
   ```

#### **Using 21st.dev CLI**
```bash
# Install via their official CLI
npx @21st-dev/cli@latest install claude --api-key your-api-key
```

## 🎨 Best Practices

### **Component Requests**
- Be specific about styling (modern, glassmorphic, minimal)
- Mention framework preferences (React, TypeScript)
- Specify responsive behavior if needed
- Include accessibility requirements

### **Example Good Requests**
```
❌ "create a button"
✅ "create a modern button component with glassmorphism effect, hover animations, and disabled state support"

❌ "make a form"  
✅ "design a user registration form with email/password fields, validation styling, and submit button with loading state"
```

## 📊 Pricing & Limits

- **Free Tier**: 5 component requests
- **Paid Plan**: $20/month for unlimited requests
- **Production Ready**: All components are production-grade
- **Always Updated**: Access to latest community components

## 🔗 Useful Links

- [21st.dev Magic](https://21st.dev/magic) - Main platform
- [GitHub Repository](https://github.com/21st-dev/magic-mcp) - Source code
- [MCP Documentation](https://modelcontextprotocol.io/) - Protocol docs
- [Claude Code MCP Guide](https://docs.anthropic.com/en/docs/claude-code/mcp) - Official guide

---

## 🎉 Next Steps

1. **Get your API key** from 21st.dev
2. **Run the setup script** to configure everything
3. **Start creating components** with natural language
4. **Enhance your BDBT app** with professional UI components

Your BDBT Cold Shower Challenge app will now have access to professional, modern UI components generated on-demand! 🧊✨