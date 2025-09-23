import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWooCommerce } from '../../context/WooCommerceContext';
import ProductFilters from '../../components/woocommerce/ProductFilters';
import ProductCard from '../../components/woocommerce/ProductCard';
import PageLayout from '../../components/layout/PageLayout';

export default function ProductsPage() {
  const router = useRouter();
  const { filter, category } = router.query;
  const {
    products,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    currentCategory,
    sortBy,
    sortOrder,
    filterType,
    fetchProducts,
    fetchCategories,
    filterByCategory,
    setSortOptions,
    setFilterType
  } = useWooCommerce();


  // Handle URL filter parameter
  useEffect(() => {
    if (filter) {
      setFilterType(filter);
    }
  }, [filter, setFilterType]);

  // Handle URL category parameter
  useEffect(() => {
    if (category && categories.length > 0) {
      // Find the category by slug
      const foundCategory = categories.find(cat => 
        cat.slug === category || cat.name.toLowerCase() === category.toLowerCase()
      );
      if (foundCategory) {
        filterByCategory(foundCategory);
      }
    }
  }, [category, categories, filterByCategory]);

  // Fetch products and categories on initial mount
  useEffect(() => {
    console.log('🔍 Products page useEffect triggered, calling fetchProducts and fetchCategories');
    fetchProducts(1);
    fetchCategories();
  }, []);


  // Fetch products when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchProducts(currentPage);
    }
  }, [currentPage, fetchProducts]); // Add fetchProducts to dependencies


  // Handle category filter
  const handleCategoryFilter = (category) => {
    filterByCategory(category);
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    setSortOptions(sortBy, sortOrder);
  };

  // Handle filter change
  const handleFilterChange = (filterType) => {
    setFilterType(filterType);
  };

  // Fetch products when sort options change
  useEffect(() => {
    if (sortBy && sortOrder) {
      fetchProducts(1);
    }
  }, [sortBy, sortOrder, fetchProducts]);

  // Handle page change
  const handlePageChange = (page) => {
    fetchProducts(page);
  };



  // Get page title and description based on filter and category
  const getPageInfo = () => {
    // If filtering by category, show category name
    if (currentCategory) {
      return {
        title: `${currentCategory.name} Products`,
        description: `Browse our ${currentCategory.name.toLowerCase()} collection`
      };
    }
    
    // Otherwise, show filter-based titles
    switch (filterType) {
      case 'new':
        return {
          title: 'New Arrivals',
          description: 'Discover our latest product arrivals'
        };
      case 'popular':
        return {
          title: 'Most Popular',
          description: 'Browse our most popular products'
        };
      case 'trending':
        return {
          title: 'Trending Now',
          description: 'Check out what\'s trending right now'
        };
      case 'featured':
        return {
          title: 'Featured Products',
          description: 'Explore our featured product collection'
        };
      case 'on_sale':
        return {
          title: 'Products On Sale',
          description: 'Find great deals on sale items'
        };
      default:
        return {
          title: 'Our Products',
          description: 'Discover our amazing collection of products'
        };
    }
  };

  const pageInfo = getPageInfo();
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    ...(currentCategory ? [{ name: currentCategory.name }] : [])
  ];

  // Show loading state
  if (loading && (!products || products.length === 0)) {
    return (
      <PageLayout 
        title={pageInfo.title}
        description={pageInfo.description}
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Products</h3>
            <p className="text-gray-600 text-sm">Discovering amazing products for you...</p>
            <div className="mt-4 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout 
        title={pageInfo.title}
        description={pageInfo.description}
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchProducts(1)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={pageInfo.title}
      description={`${pageInfo.description}${totalProducts > 0 ? ` (${totalProducts} products available)` : ''}`}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8">
              <ProductFilters
                categories={categories}
                onCategoryFilter={handleCategoryFilter}
                onSortChange={handleSortChange}
                onFilterChange={handleFilterChange}
                currentCategory={currentCategory}
                currentSort={{ sortBy, sortOrder }}
                currentFilter={filterType}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Products Grid - 2 columns on mobile, 3 on desktop */}
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
