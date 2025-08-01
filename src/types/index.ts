// Core Types - Common interfaces and types used throughout the application

// Auth Types
export interface User {
  id: string;
  email: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: any | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

// UI Component Types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface CardProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

// Timer and Tracking Types
export interface TimerPhase {
  name: string;
  duration: number; // in seconds
  message: string;
  color: string;
  audioFile?: string;
}

export interface TimerState {
  isRunning: boolean;
  timeElapsed: number;
  currentPhase: number;
  mode: 'guided' | 'custom';
  customDuration?: number;
}

export interface TrackingData {
  date: string;
  duration: number;
  temperature?: number;
  mood?: number;
  notes?: string;
}

// Feature Types
export interface HabitStack {
  id: string;
  name: string;
  tasks: HabitTask[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitTask {
  id: string;
  description: string;
  isCompleted: boolean;
  order: number;
}

export interface MoodTracking {
  date: string;
  score: number; // 1-5
  notes?: string;
  tags?: string[];
}

// Analytics Types
export interface AnalyticsData {
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  streakCount: number;
  bestStreak: number;
  weeklyProgress: WeeklyProgress[];
  monthlyProgress: MonthlyProgress[];
}

export interface WeeklyProgress {
  weekStart: Date;
  sessionsCount: number;
  totalDuration: number;
  averageDuration: number;
}

export interface MonthlyProgress {
  month: Date;
  sessionsCount: number;
  totalDuration: number;
  averageDuration: number;
  longestStreak: number;
}

// Theme and Styling Types
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// Utility Types
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: Status;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Re-export existing types
export * from './tip';