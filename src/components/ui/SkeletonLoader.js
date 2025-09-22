/**
 * Skeleton Loader Component
 * Provides loading placeholders for better UX
 */

export function SkeletonBox({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-4 mb-2 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <SkeletonBox className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <SkeletonBox className="h-6 w-32 mb-2" />
          <SkeletonBox className="h-4 w-24" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonStatusCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SkeletonBox className="w-12 h-12 rounded-xl" />
          <SkeletonBox className="h-6 w-40" />
        </div>
        <SkeletonBox className="h-8 w-24 rounded-full" />
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-20" />
            <SkeletonBox className="h-4 w-24" />
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-16" />
            <SkeletonBox className="h-4 w-20" />
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}

export function SearchResultsSkeleton({ className = "" }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <SkeletonBox className="h-8 w-64 mb-4" />
        <SkeletonBox className="h-4 w-48" />
      </div>
      
      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-4">
          <SkeletonBox className="h-10 w-32" />
          <SkeletonBox className="h-10 w-32" />
          <SkeletonBox className="h-10 w-32" />
        </div>
      </div>
      
      {/* Results Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <SkeletonBox className="h-48 w-full" />
            <div className="p-4">
              <SkeletonBox className="h-5 w-3/4 mb-2" />
              <SkeletonBox className="h-4 w-1/2 mb-3" />
              <div className="flex justify-between items-center">
                <SkeletonBox className="h-6 w-16" />
                <SkeletonBox className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  SkeletonBox,
  SkeletonText,
  SkeletonCard,
  SkeletonStatusCard,
  SkeletonSpinner,
  SearchResultsSkeleton
};