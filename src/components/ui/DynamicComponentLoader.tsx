import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Dynamic Component Loader
 * Provides lazy loading capabilities for heavy components
 */

// Lazy load heavy components
const MotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.div 
  }))
);

const MotionButton = lazy(() => 
  import('framer-motion').then(module => ({ 
    default: module.motion.button 
  }))
);

// Chart components for analytics
const BarChart = lazy(() => import('react-icons/fa').then(module => ({
  default: module.FaChartBar
})));

const LineChart = lazy(() => import('react-icons/fa').then(module => ({
  default: module.FaChartLine
})));

// PDF components
const PDFViewer = lazy(() => import('../tips/CustomPDFGenerator'));

// Calendar components
const FullCalendar = lazy(() => import('../Calendar'));

interface DynamicComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const DynamicMotionDiv: React.FC<any> = (props) => (
  <Suspense fallback={<div {...props} />}>
    <MotionDiv {...props} />
  </Suspense>
);

export const DynamicMotionButton: React.FC<any> = (props) => (
  <Suspense fallback={<button {...props} />}>
    <MotionButton {...props} />
  </Suspense>
);

export const DynamicBarChart: React.FC<any> = (props) => (
  <Suspense fallback={<div className="w-4 h-4 bg-gray-300 rounded" />}>
    <BarChart {...props} />
  </Suspense>
);

export const DynamicLineChart: React.FC<any> = (props) => (
  <Suspense fallback={<div className="w-4 h-4 bg-gray-300 rounded" />}>
    <LineChart {...props} />
  </Suspense>
);

export const DynamicPDFViewer: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <PDFViewer {...props} />
  </Suspense>
);

export const DynamicCalendar: React.FC<any> = (props) => (
  <Suspense fallback={<LoadingSpinner />}>
    <FullCalendar {...props} />
  </Suspense>
);

// Generic dynamic component wrapper
export const DynamicComponent: React.FC<DynamicComponentProps> = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);