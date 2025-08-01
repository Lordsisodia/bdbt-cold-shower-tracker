import React, { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
  fallbackText?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackColor = '#e0e7ff',
  fallbackText = 'Image Placeholder'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: fallbackColor }}
      >
        <span className="text-gray-600 font-medium text-lg">{fallbackText}</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`flex items-center justify-center ${className}`}
          style={{ backgroundColor: fallbackColor }}
        >
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
};

export default ImageWithFallback;