import React from 'react';

export default function LoadingSpinner({ 
  size = 'medium', 
  className = '', 
  variant = 'default',
  showText = false,
  text = 'Loading...'
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    default: 'border-gray-300 border-t-blue-600',
    primary: 'border-blue-200 border-t-blue-600',
    secondary: 'border-purple-200 border-t-purple-600',
    success: 'border-green-200 border-t-green-600',
    warning: 'border-yellow-200 border-t-yellow-600',
    error: 'border-red-200 border-t-red-600',
    modern: 'border-transparent border-t-blue-600 border-r-purple-600'
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'modern') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200/50`}></div>
          <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-blue-600 border-r-purple-600 animate-spin`}></div>
          <div className={`absolute inset-1 ${sizeClasses[size === 'small' ? 'small' : 'small']} rounded-full border border-transparent border-b-indigo-600 border-l-pink-600 animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        {showText && (
          <span className={`mt-2 text-gray-600 font-medium ${textSizes[size]}`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 ${variants[variant]} ${sizeClasses[size]}`}></div>
      {showText && (
        <span className={`mt-2 text-gray-600 font-medium ${textSizes[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}