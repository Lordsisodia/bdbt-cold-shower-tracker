# BDBT Project Guide

## Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run typecheck` - Run TypeScript checks
- `npm run lint` - Run ESLint
- `npm run process-tips` - Process tips with Grok
- `npm run manage-tips` - Manage tips database

## Architecture
- **Main app**: React + TypeScript + Vite
- **Database**: Supabase
- **AI Integration**: Grok API for tip processing
- **PDF Generation**: Custom service in `src/services/pdfGenerator.ts`
- **Multiple app variants**: `minimal-app/`, `clean-app/`, `core-app/`

## Key Files
- `src/App.tsx` - Main application
- `src/services/tipsDatabaseService.ts` - Database operations
- `src/services/grokApiService.ts` - AI tip processing
- `src/components/tips/` - Tip-related components
- `package.json` - Main project dependencies

## Code Style
- Use ES modules (import/export), not CommonJS
- Destructure imports: `import { foo } from 'bar'`
- Use TypeScript types consistently
- Follow existing patterns in components

## Testing & Deployment
- Always run `npm run typecheck` and `npm run lint` before committing
- Use Vercel for deployment
- Database migrations in `database/migrations/`

## MCP Integration
- Supabase MCP server configured in `mcp-servers.json`
- Custom server at `./.mcp/supabase-server.js`