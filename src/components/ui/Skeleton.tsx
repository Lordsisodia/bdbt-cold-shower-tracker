import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
  children
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'card':
        return 'rounded-lg p-4';
      default:
        return 'rounded';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'wave':
        return 'animate-shimmer';
      case 'none':
        return '';
      default:
        return 'animate-pulse';
    }
  };

  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? undefined : '100%')
  };

  if (variant === 'circular' && !width && !height) {
    style.width = '40px';
    style.height = '40px';
  }

  return (
    <div
      className={`${baseClasses} ${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    >
      {children}
    </div>
  );
};

// Composed skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="flex space-x-2 mt-4">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} variant="text" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-3 grid grid-cols-4 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width="90%" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};