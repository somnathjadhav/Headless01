import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTagProducts } from '../../hooks/useTags';
import { wooCommerceUtils } from '../../lib/woocommerce';
import SEO from '../../components/layout/SEO';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductCard from '../../components/woocommerce/ProductCard';

export async function getServerSideProps({ params, req }) {
  const { slug } = params;
  
  try {
    // Fetch tag data on the server
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/tags/${slug}`);
    
    if (!response.ok) {
      return {
        notFound: true,
      };
    }
    
    const data = await response.json();
    const tag = data.tag;
    
    if (!tag) {
      return {
        notFound: true,
      };
    }
    
    return {
      props: {
        tag,
        slug,
      },
    };
  } catch (error) {
    console.error('Error fetching tag:', error);
    return {
      notFound: true,
    };
  }
}

export default function TagPage({ tag: initialTag, slug }) {
  const router = useRouter();
  const formatPrice = wooCommerceUtils.formatPrice;
  const [tag, setTag] = useState(initialTag);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { products, loading, error, pagination } = useTagProducts(
    tag?.slug,
    {
      page: currentPage,
      per_page: 12,
      orderby: sortBy,
      order: sortOrder
    }
  );

  // Update tag if it changes
  useEffect(() => {
    if (initialTag) {
      setTag(initialTag);
    }
  }, [initialTag]);

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!tag) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="Tag not found" />
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Tags', href: '/tags' },
    { name: tag.name, href: `/tags/${tag.slug}` }
  ];

  return (
    <>
      <Head>
        <title>{tag.name} - Eternitty</title>
        <meta name="description" content={tag.description || `Browse ${tag.name} products at Eternitty`} />
      </Head>
      
      <SEO 
        title={tag.name}
        description={tag.description || `Browse ${tag.name} products at Eternitty`}
        canonical={`/tags/${tag.slug}`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Tag Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {tag.name}
              </h1>
              {tag.description && (
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                  {tag.description.replace(/<[^>]*>/g, '')}
                </p>
              )}
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Sort by:</span>
                <div className="flex space-x-2">
                  {[
                    { key: 'date', label: 'Newest' },
                    { key: 'popularity', label: 'Popular' },
                    { key: 'price', label: 'Price' },
                    { key: 'name', label: 'Name' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleSortChange(option.key)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                        sortBy === option.key
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                      {sortBy === option.key && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, pagination.total)} of {pagination.total} products
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <ErrorMessage message={error} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No products found with this tag
              </div>
              <Link
                href="/tags"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
              >
                Browse other tags
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
