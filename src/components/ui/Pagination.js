import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';

/**
 * Pagination Component - Provides navigation between pages
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Don't render if there's only one page
  if (totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          currentPage === 1
            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          currentPage === totalPages
            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
