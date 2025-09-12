import React from 'react';

/**
 * Skeleton Loader Components for better UX
 */

export function SkeletonBox({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <SkeletonBox className="aspect-square w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <SkeletonBox className="h-4 w-3/4" />
        
        {/* Rating skeleton */}
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-4 rounded" />
          ))}
        </div>
        
        {/* Price skeleton */}
        <SkeletonBox className="h-5 w-1/3" />
        
        {/* Color swatches skeleton */}
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-4 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Image gallery skeleton */}
      <div className="space-y-4">
        <SkeletonBox className="aspect-[4/5] w-full rounded-lg" />
        <div className="flex space-x-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="w-20 h-20 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Product info skeleton */}
      <div className="space-y-6">
        {/* Title */}
        <SkeletonBox className="h-8 w-3/4" />
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <SkeletonBox key={i} className="h-4 w-4 rounded" />
            ))}
          </div>
          <SkeletonBox className="h-4 w-16" />
        </div>
        
        {/* Price */}
        <SkeletonBox className="h-6 w-24" />
        
        {/* Description */}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-2/3" />
        </div>
        
        {/* Options */}
        <div className="space-y-4">
          <SkeletonBox className="h-4 w-20" />
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <SkeletonBox key={i} className="h-10 w-16 rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Quantity and buttons */}
        <div className="flex space-x-4">
          <SkeletonBox className="h-12 w-24 rounded-lg" />
          <SkeletonBox className="h-12 w-32 rounded-lg" />
          <SkeletonBox className="h-12 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search header skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <SkeletonBox className="h-10 w-64" />
          <div className="flex items-center space-x-4">
            <SkeletonBox className="h-10 w-32" />
            <SkeletonBox className="h-10 w-20" />
          </div>
        </div>
      </div>
      
      {/* Results skeleton */}
      <ProductGridSkeleton count={12} />
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="space-y-6">
      {/* Category header skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <SkeletonBox className="h-8 w-64 mx-auto" />
            <SkeletonBox className="h-4 w-96 mx-auto" />
            <SkeletonBox className="h-6 w-24 mx-auto" />
          </div>
        </div>
      </div>
      
      {/* Filters skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <SkeletonBox className="h-10 w-32" />
            <SkeletonBox className="h-10 w-24" />
            <SkeletonBox className="h-10 w-20" />
          </div>
        </div>
      </div>
      
      {/* Products skeleton */}
      <ProductGridSkeleton count={12} />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cart header */}
      <SkeletonBox className="h-8 w-32" />
      
      {/* Cart items */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
            <SkeletonBox className="w-16 h-16 rounded" />
            <div className="flex-1 space-y-2">
              <SkeletonBox className="h-4 w-3/4" />
              <SkeletonBox className="h-4 w-1/4" />
            </div>
            <SkeletonBox className="h-8 w-20" />
            <SkeletonBox className="h-4 w-16" />
          </div>
        ))}
      </div>
      
      {/* Cart summary */}
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="flex justify-between">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <SkeletonBox className="h-5 w-12" />
            <SkeletonBox className="h-5 w-20" />
          </div>
        </div>
        <SkeletonBox className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

