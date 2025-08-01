# BDBT - Autonomous Tip Generation System

A React/TypeScript application with integrated Tmux-Orchestrator for 24/7 autonomous content generation, processing, and management.

## 🚀 Quick Start

### Regular Development
```bash
npm install
npm run dev
```

### Autonomous Agent System
```bash
# Setup autonomous agents
npm run setup-tmux

# Start orchestrator
npm run orchestrator

# Manual agent operations
npm run quality-audit
npm run pdf-batch
```

## 🤖 Autonomous System Overview

The BDBT system runs autonomous agents 24/7 using tmux sessions:

### Agent Architecture
- **Orchestrator**: Main coordinator managing all agents
- **Tip Generator**: Creates new tips using Grok API
- **Database Manager**: Handles Supabase operations
- **PDF Creator**: Generates PDF exports
- **Quality Auditor**: Reviews content for quality

### Scheduled Operations
- **Daily**: 5 new tips generated and processed
- **Hourly**: Database maintenance and imports
- **Twice Daily**: Quality audits at 10 AM and 4 PM
- **Evening**: PDF generation at 6 PM
- **Weekly**: Compilation PDFs on Sundays

## 📁 Project Structure

```
bdbt/
├── agents/                    # Autonomous agent scripts
│   ├── orchestrator.js       # Main coordinator
│   ├── quality-audit.js      # Content quality checker
│   └── pdf-batch.js          # PDF generation
├── src/
│   ├── components/           # React components
│   ├── services/            # Business logic
│   │   ├── tipsDatabaseService.ts
│   │   ├── grokApiService.ts
│   │   └── pdfGenerator.ts
│   └── scripts/             # Utility scripts
├── scripts/                 # Database and setup scripts
├── orchestrator-config.json # Agent configuration
└── tmux-setup.sh           # Tmux session setup
```

## 🛠 Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint

### Content Management
- `npm run process-tips` - Process tips with Grok API
- `npm run import-tips` - Import tips to Supabase
- `npm run manage-tips` - Manage tips database
- `npm run export-tips` - Export tips for external use

### Autonomous System
- `npm run setup-tmux` - Setup tmux sessions
- `npm run orchestrator` - Start main orchestrator
- `npm run quality-audit` - Run quality audit
- `npm run pdf-batch` - Generate PDF batch

## 🔧 Configuration

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROK_API_KEY=your_grok_api_key
```

### Orchestrator Config
Edit `orchestrator-config.json` to customize:
- Agent schedules
- Output targets
- Communication channels
- Quality thresholds

## 📊 Monitoring

### Status Files
- `/tmp/bdbt_status/` - Agent status updates
- `/tmp/bdbt_metrics/` - Performance metrics
- `/tmp/bdbt_errors/` - Error logs
- `/tmp/bdbt_tasks/` - Task queue

### Tmux Sessions
```bash
# Connect to orchestrator
tmux attach-session -t bdbt-orchestrator

# View specific agent
tmux attach-session -t bdbt-orchestrator:tip-generator
```

## 🎯 Automation Targets

- **5 tips/day** generated and processed
- **99% uptime** for autonomous system
- **80% approval rate** in quality audits
- **2 PDF batches/week** published
- **Automatic git backups** every 30 minutes

## 🏗 Architecture

### Database (Supabase)
- `bdbt_tips` - Main tips table
- `tip_includes` - What's included items
- `tip_metrics` - Performance metrics
- `tip_resources` - Related resources
- User analytics and progress tracking

### AI Integration
- **Grok API** for tip generation
- **Quality algorithms** for content review
- **Template system** for PDF generation
- **MCP integration** for Supabase operations

### Agent Communication
- **File-based IPC** via `/tmp/bdbt_*` directories
- **JSON status updates** for coordination
- **Git commits** for progress tracking
- **Tmux messaging** for real-time updates

## 🚦 System Health

### Daily Reports
- Tip generation metrics
- Quality audit results
- PDF creation status
- Database performance
- Error summaries

### Error Recovery
- Automatic retry mechanisms
- Graceful degradation
- Alert notifications
- Manual intervention points

## 📈 Scaling

The system is designed to scale autonomously:
- **Horizontal**: Add more agent instances
- **Vertical**: Increase processing power
- **Temporal**: Adjust schedules based on load
- **Quality**: Dynamic threshold adjustment

---

*Powered by Tmux-Orchestrator for 24/7 autonomous operations*
