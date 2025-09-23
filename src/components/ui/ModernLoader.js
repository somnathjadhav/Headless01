import React from 'react';

/**
 * Modern Loading Components
 * Beautiful, fast, and engaging loading experiences
 */

// 1. Pulse Loader - Modern and minimal
export function PulseLoader({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}></div>
    </div>
  );
}

// 2. Bounce Loader - Playful and energetic
export function BounceLoader({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
      <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
}

// 3. Spinner Loader - Classic but modern
export function SpinnerLoader({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
    </div>
  );
}

// 4. Wave Loader - Smooth and elegant
export function WaveLoader({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-1 h-4',
    md: 'w-1.5 h-6',
    lg: 'w-2 h-8',
    xl: 'w-2.5 h-10'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          style={{ animationDelay: `${i * 0.1}s` }}
        ></div>
      ))}
    </div>
  );
}

// 5. Dots Loader - Modern and clean
export function DotsLoader({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
    xl: 'w-2.5 h-2.5'
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500'
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        ></div>
      ))}
    </div>
  );
}

// 6. Ring Loader - Sophisticated
export function RingLoader({ size = 'md', color = 'blue', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: 'border-gray-500'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-gray-200 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}>
        <div className={`w-full h-full border-2 border-transparent ${colorClasses[color]} border-r-transparent rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
    </div>
  );
}

// 7. Gradient Loader - Premium feel
export function GradientLoader({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin`}>
        <div className={`w-full h-full rounded-full bg-white m-0.5`}></div>
      </div>
    </div>
  );
}

// 8. Shimmer Loader - For content loading
export function ShimmerLoader({ className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded"></div>
    </div>
  );
}

// 9. Full Page Loader - For page transitions
export function FullPageLoader({ 
  title = "Loading...", 
  subtitle = "Please wait while we prepare everything for you",
  loaderType = "gradient",
  className = "" 
}) {
  const LoaderComponent = {
    pulse: PulseLoader,
    bounce: BounceLoader,
    spinner: SpinnerLoader,
    wave: WaveLoader,
    dots: DotsLoader,
    ring: RingLoader,
    gradient: GradientLoader
  }[loaderType] || GradientLoader;

  return (
    <div className={`fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-100">
        <div className="text-center">
          {/* Modern Loader */}
          <div className="mb-6">
            <LoaderComponent size="xl" />
          </div>
          
          {/* Loading Text */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
          
          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. Inline Loader - For buttons and small areas
export function InlineLoader({ 
  text = "Loading...", 
  size = "sm", 
  color = "blue",
  className = "" 
}) {
  const LoaderComponent = {
    pulse: PulseLoader,
    bounce: BounceLoader,
    spinner: SpinnerLoader,
    wave: WaveLoader,
    dots: DotsLoader,
    ring: RingLoader,
    gradient: GradientLoader
  }[size === 'sm' ? 'dots' : 'spinner'] || DotsLoader;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <LoaderComponent size={size} color={color} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

// 11. Card Skeleton Loader - For product cards
export function CardSkeletonLoader({ className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      <ShimmerLoader className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <ShimmerLoader className="h-5 w-3/4" />
        <ShimmerLoader className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <ShimmerLoader className="h-6 w-16" />
          <ShimmerLoader className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

// 12. List Skeleton Loader - For lists
export function ListSkeletonLoader({ items = 5, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100">
          <ShimmerLoader className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerLoader className="h-4 w-3/4" />
            <ShimmerLoader className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default {
  PulseLoader,
  BounceLoader,
  SpinnerLoader,
  WaveLoader,
  DotsLoader,
  RingLoader,
  GradientLoader,
  ShimmerLoader,
  FullPageLoader,
  InlineLoader,
  CardSkeletonLoader,
  ListSkeletonLoader
};
