# BDBT Frontend Specification

## Overview
React-based web application for managing business tips with AI generation, database management, and export capabilities.

## Technical Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation
- Zustand for state management

## Key Components

### Pages
1. **Landing Page** (`/`)
   - Hero section with value proposition
   - Feature showcase
   - CTA to dashboard

2. **Dashboard** (`/dashboard`)
   - Tip statistics and metrics
   - Quick actions (generate, export, manage)
   - Recent tips preview

3. **Tips Manager** (`/tips`)
   - List view with filtering and search
   - Bulk operations toolbar
   - Individual tip preview

4. **Tip Generator** (`/generate`)
   - Batch generation interface
   - Category selection
   - Quality settings
   - Progress tracking

5. **Templates** (`/templates`)
   - PDF template preview and selection
   - Canva template management
   - Custom template builder

### Core Features to Implement

1. **Tip Generation Workflow**
   - Form for batch size and parameters
   - Real-time progress updates
   - Error handling and retry logic
   - Success notifications

2. **Database Integration**
   - Real-time sync with Supabase
   - Optimistic updates
   - Offline capability
   - Conflict resolution

3. **Export System**
   - Multi-format export (PDF, CSV, JSON)
   - Batch selection interface
   - Progress tracking
   - Download management

4. **Search & Filter**
   - Full-text search
   - Category filtering
   - Date range selection
   - Quality score filtering

## UI/UX Requirements
- Responsive design (mobile-first)
- Dark mode support
- Loading states for all async operations
- Clear error messaging
- Smooth animations and transitions

## Performance Targets
- Initial load: <3s
- Route transitions: <100ms
- Search results: <200ms
- Tip generation feedback: <500ms

## State Management
- Global state for user preferences
- Local state for form inputs
- Server state with React Query/SWR
- Optimistic updates for better UX

## Error Handling
- Network error recovery
- API rate limit handling
- Form validation feedback
- Graceful degradation

## Testing Requirements
- Component unit tests
- Integration tests for workflows
- E2E tests for critical paths
- Performance benchmarks