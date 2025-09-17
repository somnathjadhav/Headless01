import React from 'react';

/**
 * SvgIcon Component - Reusable SVG icon wrapper
 */
export default function SvgIcon({ 
  icon: Icon, 
  size = 24, 
  className = '', 
  color = 'currentColor',
  ...props 
}) {
  if (!Icon) return null;

  return (
    <Icon
      width={size}
      height={size}
      className={className}
      style={{ color }}
      {...props}
    />
  );
}

/**
 * IconButton Component - Button with SVG icon
 */
export function IconButton({ 
  icon: Icon, 
  onClick, 
  size = 24, 
  className = '', 
  disabled = false,
  variant = 'default',
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      <Icon width={size} height={size} />
    </button>
  );
}

/**
 * IconText Component - Icon with text label
 */
export function IconText({ 
  icon: Icon, 
  children, 
  size = 20, 
  className = '', 
  iconClassName = '',
  textClassName = '',
  ...props 
}) {
  return (
    <div className={`inline-flex items-center ${className}`} {...props}>
      {Icon && (
        <Icon 
          width={size} 
          height={size} 
          className={`mr-2 ${iconClassName}`} 
        />
      )}
      <span className={textClassName}>{children}</span>
    </div>
  );
}
