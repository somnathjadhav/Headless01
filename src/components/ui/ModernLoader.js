import React, { useState, useEffect } from 'react';

/**
 * Modern Loader Component with multiple variants
 * Provides better UX with skeleton loading and progress indicators
 */

// Skeleton Loader for content areas
export function SkeletonLoader({ 
  variant = 'text', 
  className = '',
  count = 1,
  animated = true 
}) {
  const baseClasses = animated ? 'animate-pulse' : '';
  
  const variants = {
    text: 'h-4 bg-gray-200 rounded',
    title: 'h-6 bg-gray-200 rounded',
    avatar: 'w-12 h-12 bg-gray-200 rounded-full',
    card: 'h-32 bg-gray-200 rounded-lg',
    button: 'h-10 bg-gray-200 rounded-lg',
    image: 'h-48 bg-gray-200 rounded-lg',
    line: 'h-1 bg-gray-200 rounded-full'
  };

  if (count > 1) {
    return (
      <div className={className}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={`${variants[variant]} ${baseClasses} mb-2`}></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${variants[variant]} ${baseClasses} ${className}`}></div>
  );
}

// Modern Pulse Loader
export function PulseLoader({ 
  size = 'medium',
  color = 'blue',
  className = ''
}) {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );
}

// Modern Spinner with progress
export function ProgressSpinner({ 
  progress = 0,
  size = 'large',
  showPercentage = true,
  className = ''
}) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const strokeWidth = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
  const radius = size === 'small' ? 14 : size === 'medium' ? 18 : size === 'large' ? 24 : 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 60 60">
        {/* Background circle */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="30"
          cy="30"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
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

// Wave Loader
export function WaveLoader({ 
  size = 'medium',
  color = 'blue',
  className = ''
}) {
  const sizeClasses = {
    small: 'w-1 h-3',
    medium: 'w-1.5 h-4',
    large: 'w-2 h-6'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          style={{
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 40%, 100% {
            transform: scaleY(0.4);
          }
          20% {
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

// Dots Loader
export function DotsLoader({ 
  size = 'medium',
  color = 'blue',
  className = ''
}) {
  const sizeClasses = {
    small: 'w-1 h-1',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );
}

// Main Modern Loader Component
export default function ModernLoader({ 
  variant = 'spinner',
  size = 'medium',
  color = 'blue',
  progress = 0,
  showText = false,
  text = 'Loading...',
  className = ''
}) {
  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader size={size} color={color} className={className} />;
      case 'progress':
        return <ProgressSpinner progress={progress} size={size} className={className} />;
      case 'wave':
        return <WaveLoader size={size} color={color} className={className} />;
      case 'dots':
        return <DotsLoader size={size} color={color} className={className} />;
      case 'skeleton':
        return <SkeletonLoader variant="text" className={className} />;
      default:
        return (
          <div className={`relative ${className}`}>
            <div className={`w-${size === 'small' ? '4' : size === 'medium' ? '8' : '12'} h-${size === 'small' ? '4' : size === 'medium' ? '8' : '12'} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {renderLoader()}
      {showText && (
        <span className="mt-2 text-sm text-gray-600 font-medium">
          {text}
        </span>
      )}
    </div>
  );
}
