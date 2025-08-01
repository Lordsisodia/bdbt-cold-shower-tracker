import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  blur?: boolean;
  opacity?: number;
  spinnerSize?: 'sm' | 'md' | 'lg';
  spinnerColor?: 'primary' | 'secondary' | 'white';
  children?: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  fullScreen = false,
  blur = true,
  opacity = 0.75,
  spinnerSize = 'lg',
  spinnerColor = 'primary',
  children,
  className = ''
}) => {
  if (!isLoading && !children) return null;

  const overlayClasses = fullScreen
    ? 'fixed inset-0 z-50'
    : 'absolute inset-0 z-40';

  const backdropClasses = `
    ${overlayClasses}
    bg-white dark:bg-gray-900
    flex items-center justify-center
    transition-opacity duration-300
    ${blur ? 'backdrop-blur-sm' : ''}
    ${className}
  `;

  const containerClasses = 'relative w-full h-full';

  return (
    <div className={fullScreen ? '' : containerClasses}>
      {children && (
        <div className={isLoading && blur ? 'blur-sm' : ''}>
          {children}
        </div>
      )}
      
      {isLoading && (
        <div 
          className={backdropClasses}
          style={{ opacity }}
          aria-busy="true"
          role="status"
        >
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size={spinnerSize} color={spinnerColor} />
            {message && (
              <p className={`text-sm font-medium ${
                spinnerColor === 'white' ? 'text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Specialized loading overlay for page transitions
export const PageLoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <LoadingOverlay
      isLoading={isLoading}
      fullScreen
      message="Loading..."
      spinnerColor="primary"
    />
  );
};

// Specialized loading overlay for form submissions
export const FormLoadingOverlay: React.FC<{ 
  isLoading: boolean; 
  message?: string;
  children: React.ReactNode;
}> = ({ 
  isLoading, 
  message = "Submitting...",
  children 
}) => {
  return (
    <LoadingOverlay
      isLoading={isLoading}
      message={message}
      blur
      opacity={0.8}
      spinnerSize="md"
    >
      {children}
    </LoadingOverlay>
  );
};

// Hook for managing loading overlay state
export const useLoadingOverlay = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [message, setMessage] = React.useState<string>('');

  const show = (msg?: string) => {
    if (msg) setMessage(msg);
    setIsLoading(true);
  };

  const hide = () => {
    setIsLoading(false);
    setMessage('');
  };

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    show(loadingMessage);
    try {
      const result = await asyncFn();
      hide();
      return result;
    } catch (error) {
      hide();
      throw error;
    }
  };

  return {
    isLoading,
    message,
    show,
    hide,
    withLoading
  };
};