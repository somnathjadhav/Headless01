import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ProductImageGallery({ images, name }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Ensure we have at least one image
  const productImages = images && images.length > 0 ? images : [
    { src: '/placeholder-product.svg', alt: name || 'Product Image' }
  ];

  const selectedImage = productImages[selectedImageIndex];

  // Handle mouse move for zoom effect
  const handleMouseMove = (e) => {
    if (!imageRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Handle mouse enter for zoom
  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  // Handle mouse leave for zoom
  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Navigate to previous image
  const goToPrevious = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  // Navigate to next image
  const goToNext = () => {
    setSelectedImageIndex(prev => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  // Navigate thumbnail gallery up
  const navigateThumbnailsUp = () => {
    setThumbnailStartIndex(prev => Math.max(0, prev - 1));
  };

  // Navigate thumbnail gallery down
  const navigateThumbnailsDown = () => {
    setThumbnailStartIndex(prev => 
      Math.min(productImages.length - 6, prev + 1)
    );
  };

  // Get visible thumbnails (max 6)
  const getVisibleThumbnails = () => {
    const maxVisible = 6;
    const endIndex = Math.min(thumbnailStartIndex + maxVisible, productImages.length);
    const visibleThumbnails = productImages.slice(thumbnailStartIndex, endIndex);
    return visibleThumbnails;
  };

  // Check if thumbnail navigation is needed
  const needsThumbnailNavigation = productImages.length > 6;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll thumbnail gallery when selected image changes
  useEffect(() => {
    if (needsThumbnailNavigation) {
      const maxVisible = 6;
      const currentStart = thumbnailStartIndex;
      const currentEnd = currentStart + maxVisible - 1;
      
      // If selected image is outside visible range, adjust thumbnail start index
      if (selectedImageIndex < currentStart) {
        setThumbnailStartIndex(selectedImageIndex);
      } else if (selectedImageIndex > currentEnd) {
        setThumbnailStartIndex(selectedImageIndex - maxVisible + 1);
      }
    }
  }, [selectedImageIndex, needsThumbnailNavigation]);

  return (
    <div className="flex space-x-4">
      {/* Thumbnail Gallery - Left Side */}
      {productImages.length > 1 && (
        <div className="flex flex-col w-20">
          {/* Thumbnail Navigation Up */}
          {needsThumbnailNavigation && thumbnailStartIndex > 0 && (
            <button
              onClick={navigateThumbnailsUp}
              className="w-20 h-6 mb-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
              aria-label="Show previous thumbnails"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-600 rotate-90" />
            </button>
          )}

          {/* Thumbnail Container */}
          <div className="flex flex-col space-y-1.5">
            {getVisibleThumbnails().map((image, index) => {
              const actualIndex = thumbnailStartIndex + index;
              return (
                <button
                  key={actualIndex}
                  onClick={() => setSelectedImageIndex(actualIndex)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    actualIndex === selectedImageIndex
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `${name} thumbnail ${actualIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              );
            })}
          </div>

          {/* Thumbnail Navigation Down */}
          {needsThumbnailNavigation && thumbnailStartIndex < productImages.length - 6 && (
            <button
              onClick={navigateThumbnailsDown}
              className="w-20 h-6 mt-1 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center transition-colors"
              aria-label="Show next thumbnails"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600 rotate-90" />
            </button>
          )}
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1 space-y-4">
        {/* Main Image */}
        <div 
          ref={containerRef}
          className="relative aspect-[4/5] bg-white rounded-lg overflow-hidden border border-gray-200 group cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            ref={imageRef}
            src={selectedImage.src}
            alt={selectedImage.alt || name}
            width={600}
            height={750}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={{
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
          />

          {/* Zoom Indicator */}
          {isZoomed && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Zoom</span>
            </div>
          )}

          {/* Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {selectedImageIndex + 1} / {productImages.length}
            </div>
          )}
        </div>

        {/* Image Features */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>Hover to zoom</span>
            </span>
            {productImages.length > 1 && (
              <span className="flex items-center space-x-1">
                <ChevronLeftIcon className="w-4 h-4" />
                <ChevronRightIcon className="w-4 h-4" />
                <span>Use arrows to navigate</span>
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Click to view full size
          </div>
        </div>
      </div>
    </div>
  );
}
