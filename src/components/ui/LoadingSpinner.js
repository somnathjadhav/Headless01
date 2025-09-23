import React from 'react';
import { SpinnerLoader } from './ModernLoader';

export default function LoadingSpinner({ size = 'medium', className = '', color = 'blue' }) {
  const sizeMap = {
    small: 'sm',
    medium: 'md',
    large: 'lg'
  };

  return (
    <SpinnerLoader 
      size={sizeMap[size] || 'md'} 
      color={color}
      className={className} 
    />
  );
}