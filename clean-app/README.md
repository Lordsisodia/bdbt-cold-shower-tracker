# Cold Shower Tracker - BDBT

A mobile-first React app for tracking your cold shower challenge, built for Big Daddy's Big Tips (BDBT) brand.

## Features

- **Monthly Calendar View**: Visual tracking with emoji indicators
- **Streak Tracking**: Current streak and best streak counters
- **Progress Milestones**: 7, 14, 21, and 30-day milestone tracking
- **Local Storage**: Data persists between sessions
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **PWA Ready**: Can be installed as a mobile app

## Components

### ColdShowerTracker
Main component that orchestrates the entire app with:
- Benefits display (Mental Clarity, Increased Energy, etc.)
- Progress statistics
- Monthly calendar
- Instructions and legend

### Calendar
Interactive calendar with:
- Month navigation
- Day completion tracking
- Long-press for additional options (extra cold, felt amazing)
- Visual indicators for different states

### ProgressStats
Displays:
- Current streak (prominently featured)
- Best streak achieved
- Monthly completion count
- Progress milestones with checkmarks
- Motivational messages based on streak

## Design System

### Colors
- **Primary**: Deep blue (#1E3A8A) - BDBT brand color
- **Secondary**: Light blue (#60A5FA) - Accent color
- **Success**: Green (#10B981) - Completed days
- **Background**: Gradient from blue to teal

### Typography
- **Headers**: Bold, modern sans-serif
- **Body**: Clean, readable fonts
- **Mobile-first**: Optimized text sizes for mobile screens

## Data Structure

```typescript
interface TrackedDay {
  date: string;        // ISO format: "2024-01-01"
  completed: boolean;  // Basic completion
  extraCold?: boolean; // Extra cold shower
  feltAmazing?: boolean; // Felt great afterward
}
```

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

### Option 2: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Deploy automatically on push

### Option 3: Manual Deploy
1. Run `npm run build`
2. Upload `dist` folder to Vercel

## Mobile Features

### Touch Interactions
- **Tap**: Toggle day completion
- **Long press**: Open detailed options modal
- **Swipe-friendly**: Month navigation

### PWA Features
- **Installable**: Add to home screen
- **Offline-ready**: Works without internet
- **App-like**: Fullscreen experience

### iOS Optimization
- **Safari-friendly**: Proper viewport settings
- **Home screen**: Custom app icon and name
- **Status bar**: Integrated design

## BDBT Brand Integration

### Messaging
- Aligns with BDBT's "small changes, massive results" philosophy
- Emphasizes health, wealth, and happiness benefits
- Motivational copy matches brand voice

### Visual Identity
- Cool color palette (blues, teals)
- Clean, modern design
- Wellness-focused aesthetic

## Technical Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast development and builds
- **Local Storage**: Client-side data persistence

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **PWA support**: Chrome, Safari, Firefox

## Future Enhancements

- **Data export**: CSV/PDF export functionality
- **Social sharing**: Share progress to social media
- **Reminder notifications**: Push notifications for daily reminders
- **Stats dashboard**: Weekly/monthly analytics
- **Habit stacking**: Integration with other BDBT habits