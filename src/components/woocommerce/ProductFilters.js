import React from 'react';

/**
 * ProductFilters Component - Provides filtering and sorting options for products
 */
export default function ProductFilters({ categories, onCategoryFilter, onSortChange, onFilterChange, currentCategory, currentSort, currentFilter }) {
  const sortOptions = [
    { value: 'date', label: 'Latest', order: 'desc' },
    { value: 'date', label: 'Oldest', order: 'asc' },
    { value: 'price', label: 'Price: Low to High', order: 'asc' },
    { value: 'price', label: 'Price: High to Low', order: 'desc' },
    { value: 'title', label: 'Name: A to Z', order: 'asc' },
    { value: 'title', label: 'Name: Z to A', order: 'desc' },
    { value: 'popularity', label: 'Most Popular', order: 'desc' },
    { value: 'rating', label: 'Highest Rated', order: 'desc' }
  ];

  const filterOptions = [
    { value: 'new', label: 'New Arrivals', icon: '🆕' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'trending', label: 'Trending Now', icon: '📈' },
    { value: 'featured', label: 'Featured', icon: '⭐' },
    { value: 'on_sale', label: 'On Sale', icon: '🏷️' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
        <div className="space-y-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                currentFilter === option.value
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
          <button
            onClick={() => onFilterChange(null)}
            className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
              !currentFilter
                ? 'bg-gray-100 text-gray-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">🔄</span>
            All Products
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
        <div className="space-y-2">
          {/* All Categories Option */}
          <button
            onClick={() => onCategoryFilter(null)}
            className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
              !currentCategory 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="font-medium">All Categories</span>
          </button>
          
          {/* Category Options */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryFilter(category)}
              className={`flex items-center justify-between w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                currentCategory && currentCategory.id === category.id
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{category.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                currentCategory && currentCategory.id === category.id
                  ? 'text-blue-600 bg-blue-200' 
                  : 'text-gray-500 bg-gray-100'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort By</h3>
        <div className="space-y-2">
          {sortOptions.map((option, index) => {
            const isActive = currentSort && currentSort.sortBy === option.value && currentSort.sortOrder === option.order;
            return (
              <button
                key={index}
                onClick={() => onSortChange(option.value, option.order)}
                className={`flex items-center w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={() => onCategoryFilter(null)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            View All Products
          </button>
          
          <button
            onClick={() => {
              onSortChange('date', 'desc');
              onCategoryFilter(null);
            }}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tip</h4>
        <p className="text-xs text-blue-700">
          Use the filters above to find exactly what you&apos;re looking for. You can combine category filters with sorting options for the best results.
        </p>
      </div>
    </div>
  );
}
