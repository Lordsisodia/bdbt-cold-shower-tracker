# BDBT Backend Specification

## Overview
Backend services for BDBT including API endpoints, database operations, AI integration, and file processing.

## Architecture
- **Database**: Supabase (PostgreSQL)
- **API**: Supabase Functions / Edge Functions
- **AI Service**: Grok API integration
- **File Processing**: PDF generation, image handling
- **Storage**: Supabase Storage for generated files

## Database Schema

### Tables
1. **tips**
   - id (uuid, primary key)
   - title (text)
   - content (text)
   - category (text)
   - quality_score (float)
   - generated_at (timestamp)
   - processed (boolean)
   - metadata (jsonb)

2. **categories**
   - id (uuid, primary key)
   - name (text, unique)
   - description (text)
   - icon (text)
   - color (text)
   - tip_count (integer)

3. **exports**
   - id (uuid, primary key)
   - type (enum: pdf, csv, json)
   - tip_ids (uuid[])
   - file_url (text)
   - created_at (timestamp)
   - expires_at (timestamp)

4. **templates**
   - id (uuid, primary key)
   - name (text)
   - type (enum: pdf, canva)
   - config (jsonb)
   - preview_url (text)
   - is_active (boolean)

## API Endpoints

### Tips Management
- `POST /api/tips/generate` - Generate new tips
- `GET /api/tips` - List tips with pagination
- `GET /api/tips/:id` - Get single tip
- `PUT /api/tips/:id` - Update tip
- `DELETE /api/tips/:id` - Delete tip
- `POST /api/tips/bulk` - Bulk operations

### AI Integration
- `POST /api/grok/generate` - Generate tips via Grok
- `POST /api/grok/enhance` - Enhance existing tip
- `POST /api/grok/categorize` - Auto-categorize tips

### Export Operations
- `POST /api/export/pdf` - Generate PDF export
- `POST /api/export/csv` - Generate CSV export
- `POST /api/export/json` - Generate JSON export
- `GET /api/export/:id` - Download export

### Template Management
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

## Service Modules

### Grok Service (`services/grokApiService.ts`)
- Batch tip generation
- Rate limiting and retry logic
- Response parsing and validation
- Error handling and logging

### PDF Generator (`services/pdfGenerator.ts`)
- Template-based generation
- Batch processing
- Asset embedding
- Compression and optimization

### Database Service (`services/tipsDatabaseService.ts`)
- Connection pooling
- Transaction management
- Query optimization
- Cache integration

### Export Service (`services/exportService.ts`)
- Multi-format support
- Streaming for large exports
- Temporary file management
- Cleanup scheduling

## Background Jobs

1. **Daily Tip Generation**
   - Schedule: 9 AM daily
   - Generate 50-100 tips
   - Auto-categorize and score
   - Store in database

2. **Export Cleanup**
   - Schedule: Every 6 hours
   - Remove expired exports
   - Clean temporary files

3. **Database Maintenance**
   - Schedule: 2 AM daily
   - Vacuum and analyze
   - Update statistics
   - Archive old data

## Performance Requirements
- API response time: <200ms
- Tip generation: <30s for 50 tips
- PDF generation: <2s per tip
- Database queries: <50ms

## Security
- Row Level Security (RLS) on all tables
- API key authentication
- Rate limiting per endpoint
- Input validation and sanitization

## Error Handling
- Structured error responses
- Retry logic for external APIs
- Circuit breakers for services
- Comprehensive logging