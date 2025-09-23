import React from 'react';
import { InlineLoader } from './ModernLoader';

/**
 * Modern Button Loader Component
 * Provides loading states for buttons with beautiful animations
 */

export function ButtonLoader({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  size = "sm",
  color = "blue",
  ...props 
}) {
  if (loading) {
    return (
      <button 
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed ${className}`}
        disabled
        {...props}
      >
        <InlineLoader 
          text={loadingText}
          size={size}
          color="white"
          className="text-white"
        />
      </button>
    );
  }

  return (
    <button 
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

// Primary Button with Loader
export function PrimaryButton({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  
  return (
    <ButtonLoader
      loading={loading}
      loadingText={loadingText}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </ButtonLoader>
  );
}

// Secondary Button with Loader
export function SecondaryButton({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  
  return (
    <ButtonLoader
      loading={loading}
      loadingText={loadingText}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </ButtonLoader>
  );
}

// Danger Button with Loader
export function DangerButton({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  
  return (
    <ButtonLoader
      loading={loading}
      loadingText={loadingText}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </ButtonLoader>
  );
}

// Success Button with Loader
export function SuccessButton({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  
  return (
    <ButtonLoader
      loading={loading}
      loadingText={loadingText}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </ButtonLoader>
  );
}

// Large Button with Loader
export function LargeButton({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  variant = "primary",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  
  const variantClasses = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    success: "border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500"
  };
  
  return (
    <ButtonLoader
      loading={loading}
      loadingText={loadingText}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </ButtonLoader>
  );
}

// Small Button with Loader
export function SmallButton({ 
  loading = false, 
  children, 
  loadingText = "Loading...",
  className = "",
  variant = "primary",
  ...props 
}) {
  const baseClasses = "inline-flex items-center justify-center px-3 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
  
  const variantClasses = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    success: "border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500"
  };
  
  return (
    <ButtonLoader
      loading={loading}
      loadingText={loadingText}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </ButtonLoader>
  );
}

export default {
  ButtonLoader,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  LargeButton,
  SmallButton
};
