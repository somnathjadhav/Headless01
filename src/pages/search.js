import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProductCard from '../components/woocommerce/ProductCard';
import { useCategoriesRest } from '../hooks/useCategoriesRest';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { SearchResultsSkeleton } from '../components/ui/SkeletonLoader';
import { SearchIcon, FilterIcon, SortAscendingIcon } from '../components/icons';
import { useCurrency } from '../context/CurrencyContext';

export default function SearchResultsPage({
  initialProducts = [],
  initialTotal = 0,
  initialTotalPages = 0,
  initialSearchQuery = '',
  initialCurrentPage = 1,
  initialSortBy = 'relevance',
  initialSortOrder = 'desc',
  initialSelectedCategory = '',
  initialPriceRange = { min: '', max: '' }
}) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { categories, loading: categoriesLoading } = useCategoriesRest();
  
  // State management
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalProducts, setTotalProducts] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        search: searchQuery,
        page: currentPage.toString(),
        per_page: '12',
        orderby: sortBy,
        order: sortOrder
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (priceRange.min) {
        params.append('min_price', priceRange.min);
      }
      if (priceRange.max) {
        params.append('max_price', priceRange.max);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, currentPage, sortBy, sortOrder, selectedCategory, priceRange]);

  // Fetch results when dependencies change (only for client-side updates)
  useEffect(() => {
    // Only fetch if we have a search query and it's different from initial
    if (searchQuery && searchQuery !== initialSearchQuery) {
      fetchSearchResults();
    }
  }, [searchQuery, sortBy, sortOrder, selectedCategory, priceRange, currentPage, fetchSearchResults, initialSearchQuery]);

  // Update URL when filters change
  const updateURL = useCallback((newParams) => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('q', searchQuery);
    if (newParams.page && newParams.page > 1) params.append('page', newParams.page);
    if (newParams.sort && newParams.sort !== 'relevance') params.append('sort', newParams.sort);
    if (newParams.order && newParams.order !== 'desc') params.append('order', newParams.order);
    if (newParams.category) params.append('category', newParams.category);
    if (newParams.min_price) params.append('min_price', newParams.min_price);
    if (newParams.max_price) params.append('max_price', newParams.max_price);

    const newURL = `/search?${params.toString()}`;
    router.push(newURL, undefined, { shallow: true });
  }, [searchQuery, router]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL({ page: 1 });
  };

  // Handle sort change
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    updateURL({ sort: newSortBy, order: newSortOrder, page: 1 });
  };

  // Handle category filter
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateURL({ category: categoryId, page: 1 });
  };

  // Handle price range filter
  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
    updateURL({ min_price: min, max_price: max, page: 1 });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL({ page });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
    updateURL({ category: '', min_price: '', max_price: '', page: 1 });
  };

  // Sort options
  const sortOptions = [
    { value: 'menu_order', label: 'Default', order: 'asc' },
    { value: 'date', label: 'Newest First', order: 'desc' },
    { value: 'date', label: 'Oldest First', order: 'asc' },
    { value: 'price', label: 'Price: Low to High', order: 'asc' },
    { value: 'price', label: 'Price: High to Low', order: 'desc' },
    { value: 'popularity', label: 'Most Popular', order: 'desc' },
    { value: 'rating', label: 'Highest Rated', order: 'desc' }
  ];

  return (
    <>
      <Head>
        <title>
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Results'} - {process.env.NEXT_PUBLIC_SITE_NAME || 'Store'}
        </title>
        <meta name="description" content={`Search results for "${searchQuery}" - Find the perfect products`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <SearchIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Results'}
              </h1>
            </div>
            
            {totalProducts > 0 && (
              <p className="text-gray-600 text-lg">
                {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search Input */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort and Filter Controls */}
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <div className="flex items-center space-x-2">
                  <SortAscendingIcon className="w-5 h-5 text-gray-400" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      handleSortChange(newSortBy, newSortOrder);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map((option, index) => (
                      <option key={index} value={`${option.value}-${option.order}`}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FilterIcon className="w-5 h-5 text-gray-400" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-6">
                  {/* First Row: Category and Price Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category Filter */}
                    <div>
                      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => handlePriceRangeChange(e.target.value, priceRange.max)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          aria-label="Minimum price"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => handlePriceRangeChange(priceRange.min, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          aria-label="Maximum price"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Clear Filters */}
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <SearchResultsSkeleton />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No products found' : 'Enter a search term'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `We couldn't find any products matching "${searchQuery}". Try adjusting your search or filters.`
                  : 'Use the search bar above to find products.'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const { q, page, sort, order, category, min_price, max_price } = context.query;
  
  // If no search query, return empty results
  if (!q) {
    return {
      props: {
        initialProducts: [],
        initialTotal: 0,
        initialTotalPages: 0,
        initialSearchQuery: '',
        initialCurrentPage: 1,
        initialSortBy: 'menu_order',
        initialSortOrder: 'desc',
        initialSelectedCategory: '',
        initialPriceRange: { min: '', max: '' }
      }
    };
  }

  try {
    // Build search parameters
    const searchParams = new URLSearchParams({
      search: q,
      page: page || '1',
      per_page: '12',
      orderby: sort || 'relevance',
      order: order || 'desc'
    });

    if (category) {
      searchParams.append('category', category);
    }
    if (min_price) {
      searchParams.append('min_price', min_price);
    }
    if (max_price) {
      searchParams.append('max_price', max_price);
    }

    // Fetch search results directly from WooCommerce API
    const { wooCommerceAPI } = await import('../lib/woocommerce');
    
    const params = {
      search: q,
      page: parseInt(page) || 1,
      per_page: 12,
      orderby: sort || 'menu_order',
      order: order || 'desc',
      category: category || '',
      min_price: min_price || '',
      max_price: max_price || ''
    };

    const data = await wooCommerceAPI.getProducts(params);
    
    return {
      props: {
        initialProducts: data.products || [],
        initialTotal: data.total || 0,
        initialTotalPages: data.totalPages || 0,
        initialSearchQuery: q,
        initialCurrentPage: parseInt(page) || 1,
        initialSortBy: sort || 'menu_order',
        initialSortOrder: order || 'desc',
        initialSelectedCategory: category || '',
        initialPriceRange: { 
          min: min_price || '', 
          max: max_price || '' 
        }
      }
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    
    return {
      props: {
        initialProducts: [],
        initialTotal: 0,
        initialTotalPages: 0,
        initialSearchQuery: q || '',
        initialCurrentPage: 1,
        initialSortBy: 'menu_order',
        initialSortOrder: 'desc',
        initialSelectedCategory: '',
        initialPriceRange: { min: '', max: '' }
      }
    };
  }
}
