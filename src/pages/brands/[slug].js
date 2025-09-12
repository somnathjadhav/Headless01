import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useBrandProducts } from '../../hooks/useBrands';
import SEO from '../../components/layout/SEO';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import ProductCard from '../../components/woocommerce/ProductCard';
import Pagination from '../../components/ui/Pagination';
import Breadcrumb from '../../components/ui/Breadcrumb';

export default function BrandPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  
  const { products, brand, loading, error, pagination } = useBrandProducts(slug, {
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

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Brand Not Found</h1>
          <p className="text-gray-600 mb-6">The brand you're looking for doesn't exist.</p>
          <Link
            href="/brands"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            View All Brands
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{brand.name} Products - Eternitty</title>
        <meta name="description" content={`Shop ${brand.name} products at Eternitty. ${brand.description}`} />
      </Head>
      
      <SEO 
        title={`${brand.name} Products`}
        description={`Shop ${brand.name} products at Eternitty. ${brand.description}`}
        canonical={`/brands/${brand.slug}`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Brands', href: '/brands' },
                { label: brand.name, href: `/brands/${brand.slug}` }
              ]}
            />
          </div>
        </div>

        {/* Brand Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-6 md:mb-0">
                {/* Brand Logo */}
                <div className="w-20 h-20 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center mr-6">
                  {brand.logo ? (
                    <img 
                      src={brand.logo}
                      alt={`${brand.name} logo`}
                      className="max-h-16 max-w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="text-2xl font-bold text-gray-600" style={{display: brand.logo ? 'none' : 'flex'}}>
                    {brand.name.charAt(0)}
                  </div>
                </div>
                
                {/* Brand Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    {brand.name}
                  </h1>
                  {brand.description && (
                    <p className="mt-2 text-lg text-gray-600 max-w-2xl">
                      {brand.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Brand Stats */}
              <div className="text-center md:text-right">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  {pagination.total} {pagination.total === 1 ? 'Product' : 'Products'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Products Found
              </h2>
              <p className="text-gray-600 mb-6">
                This brand doesn't have any products available at the moment.
              </p>
              <Link
                href="/brands"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                View All Brands
              </Link>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
                Explore More Brands
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Discover products from other trusted brands
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/brands"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  View All Brands
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  View All Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}