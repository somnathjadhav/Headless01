import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, XIcon } from '../icons';

/**
 * ProductSearch Component - Provides search functionality for products
 */
export default function ProductSearch({ value, onSearch, placeholder = 'Search products...' }) {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // Update local state when prop changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  // Handle search input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    
    // Debounce search to avoid too many API calls
    if (searchRef.current) {
      clearTimeout(searchRef.current);
    }
    
    searchRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 300);
  };

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchRef.current) {
      clearTimeout(searchRef.current);
    }
    onSearch(searchValue);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsFocused(false);
      e.target.blur();
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          
          {/* Clear Button */}
          {searchValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Search
        </button>
      </form>

      {/* Search Suggestions */}
      {isFocused && searchValue && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="py-2">
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
              Press Enter to search for &quot;{searchValue}&quot;
            </div>
            
            {/* Quick Search Tips */}
            <div className="px-4 py-2">
              <div className="text-xs text-gray-500 mb-2">Quick search tips:</div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>• Use quotes for exact phrases: &quot;wireless headphones&quot;</div>
                <div>• Add category: &quot;shoes&quot; in &quot;footwear&quot;</div>
                <div>• Price range: &quot;$50&quot; to &quot;$100&quot;</div>
                <div>• Brand names: &quot;Nike&quot;, &quot;Apple&quot;, etc.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Status */}
      {searchValue && (
        <div className="mt-2 text-sm text-gray-500">
          {searchValue.length > 0 && (
            <span>
              Searching for: <span className="font-medium text-gray-700">&quot;{searchValue}&quot;</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
