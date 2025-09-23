import React, { useState, useEffect } from 'react';

/**
 * Optimized Loader Component
 * Provides fast, modern loading states with minimal performance impact
 */

// Fast skeleton loader for immediate feedback
export function FastSkeleton({ 
  variant = 'text',
  className = '',
  count = 1,
  width = '100%',
  height = 'auto'
}) {
  const variants = {
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-6 bg-gray-200 rounded',
    avatar: 'w-12 h-12 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-lg',
    button: 'h-10 bg-gray-200 rounded-lg',
    image: 'h-48 bg-gray-200 rounded-lg',
    line: 'h-1 bg-gray-200 rounded-full'
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height
  };

  if (count > 1) {
    return (
      <div className={className}>
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index} 
            className={`${variants[variant]} animate-pulse mb-2`}
            style={index === count - 1 ? style : {}}
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`${variants[variant]} animate-pulse ${className}`}
      style={style}
    ></div>
  );
}

// Ultra-fast spinner with minimal DOM
export function FastSpinner({ 
  size = 'medium',
  color = 'blue',
  className = ''
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  );
}

// Progress indicator with smooth animation
export function ProgressIndicator({ 
  progress = 0,
  size = 'medium',
  showPercentage = false,
  className = ''
}) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const strokeWidth = size === 'small' ? 2 : 3;
  const radius = size === 'small' ? 14 : size === 'medium' ? 18 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 60 60">
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-600 transition-all duration-300 ease-out"
          strokeLinecap="round"
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-700">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Smart loader that adapts based on loading time
export function SmartLoader({ 
  loading = false,
  message = 'Loading...',
  timeout = 2000,
  className = ''
}) {
  const [showDetailedLoader, setShowDetailedLoader] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowDetailedLoader(false);
      return;
    }

    // Show detailed loader after timeout
    const timer = setTimeout(() => {
      setShowDetailedLoader(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [loading, timeout]);

  if (!loading) return null;

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {showDetailedLoader ? (
        // Detailed loader for longer operations
        <div className="text-center">
          <ProgressIndicator progress={75} size="large" className="mb-4" />
          <p className="text-sm text-gray-600 font-medium">{message}</p>
          <p className="text-xs text-gray-500 mt-1">This may take a moment...</p>
        </div>
      ) : (
        // Fast loader for quick operations
        <div className="text-center">
          <FastSpinner size="large" className="mb-3" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      )}
    </div>
  );
}

// Inline loader for buttons and small areas
export function InlineLoader({ 
  size = 'small',
  color = 'white',
  className = ''
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    blue: 'border-blue-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent'
  };

  return (
    <div className={`${className}`}>
      <div 
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin`}
      ></div>
    </div>
  );
}

// Main optimized loader component
export default function OptimizedLoader({ 
  variant = 'spinner',
  size = 'medium',
  color = 'blue',
  loading = true,
  message = 'Loading...',
  showMessage = false,
  className = '',
  timeout = 2000
}) {
  if (!loading) return null;

  const renderLoader = () => {
    switch (variant) {
      case 'skeleton':
        return <FastSkeleton className={className} />;
      case 'progress':
        return <ProgressIndicator size={size} className={className} />;
      case 'smart':
        return <SmartLoader loading={loading} message={message} timeout={timeout} className={className} />;
      case 'inline':
        return <InlineLoader size={size} color={color} className={className} />;
      default:
        return <FastSpinner size={size} color={color} className={className} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      {showMessage && (
        <span className="mt-2 text-sm text-gray-600 font-medium">
          {message}
        </span>
      )}
    </div>
  );
}
