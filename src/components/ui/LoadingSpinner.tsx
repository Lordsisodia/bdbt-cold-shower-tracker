import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'success' | 'error' | 'warning';
  className?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'ring';
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  type = 'spinner',
  label,
  labelPosition = 'bottom'
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-teal-600',
    white: 'text-white',
    gray: 'text-gray-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600'
  };

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
                style={{
                  animationDelay: `${index * 0.15}s`,
                  backgroundColor: 'currentColor'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div className={`absolute inset-0 ${colorClasses[color]} rounded-full opacity-75 animate-ping`} />
            <div className={`relative ${colorClasses[color]} rounded-full h-full w-full`} style={{ backgroundColor: 'currentColor' }} />
          </div>
        );

      case 'ring':
        return (
          <div className={`${sizeClasses[size]} ${className}`}>
            <div className={`animate-spin rounded-full h-full w-full border-2 border-current ${colorClasses[color]}`} 
                 style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
          </div>
        );

      case 'spinner':
      default:
        return (
          <div className={`inline-block animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        );
    }
  };

  const labelClasses = `text-sm ${colorClasses[color]} ${
    size === 'xs' || size === 'sm' ? 'text-xs' : ''
  }`;

  const containerClasses = `inline-flex items-center ${
    labelPosition === 'left' || labelPosition === 'right' ? 'flex-row' : 'flex-col'
  } ${labelPosition === 'left' || labelPosition === 'top' ? 'flex-row-reverse' : ''} gap-2`;

  if (label) {
    return (
      <div className={containerClasses} role="status" aria-label={label}>
        {renderSpinner()}
        <span className={labelClasses}>{label}</span>
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading">
      {renderSpinner()}
    </div>
  );
};

// Specialized spinner for buttons
export const ButtonSpinner: React.FC<{ size?: 'xs' | 'sm' | 'md' }> = ({ size = 'sm' }) => {
  return <LoadingSpinner size={size} color="white" type="spinner" />;
};

// Specialized spinner for inline text
export const InlineSpinner: React.FC<{ color?: LoadingSpinnerProps['color'] }> = ({ color = 'gray' }) => {
  return <LoadingSpinner size="xs" color={color} type="spinner" className="inline-block mx-1" />;
};