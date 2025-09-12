import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useBrands } from '../hooks/useBrands';
import SEO from '../components/layout/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import BrandCard from '../components/woocommerce/BrandCard';
import Pagination from '../components/ui/Pagination';

export default function BrandsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(8); // 8 brands per page for better grid layout
  
  const { brands, loading, error, pagination } = useBrands({
    page: currentPage,
    per_page: perPage
  });

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Product Brands - Eternitty</title>
        <meta name="description" content="Browse all product brands at Eternitty" />
      </Head>
      
      <SEO 
        title="Product Brands"
        description="Browse all product brands at Eternitty"
        canonical="/brands"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Product Brands
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Discover products by their brands and manufacturers. Shop from trusted brands you know and love.
              </p>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {brands.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <div className="text-gray-500 text-xl font-medium mb-2">
                No brands found
              </div>
              <div className="text-gray-400 text-sm">
                Brands will appear here once they are added to your store
              </div>
            </div>
          ) : (
            <>
              {/* Brands Stats */}
              <div className="mb-12 text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  {pagination.total} {pagination.total === 1 ? 'Brand' : 'Brands'} Available
                  {pagination.totalPages > 1 && (
                    <span className="ml-2 text-indigo-600">
                      (Page {pagination.currentPage} of {pagination.totalPages})
                    </span>
                  )}
                </div>
              </div>

              {/* Brands Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {brands.map((brand) => (
                  <BrandCard key={`${brand.attribute_id}-${brand.id}`} brand={brand} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Can't find what you're looking for?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Browse all our products or use our search feature
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  View All Products
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Browse Categories
                </Link>
                <Link
                  href="/tags"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Browse Tags
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
