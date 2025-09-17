import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTags } from '../hooks/useTags';
import SEO from '../components/layout/SEO';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import TagCard from '../components/woocommerce/TagCard';
import { TagIcon, SparklesIcon, TrendingUpIcon, StarIcon, ShoppingBagIcon } from '../components/icons';

export default function TagsPage() {
  const { tags, loading, error } = useTags();

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
        <title>Product Tags - Eternitty</title>
        <meta name="description" content="Browse all product tags at Eternitty" />
      </Head>
      
      <SEO 
        title="Product Tags"
        description="Browse all product tags at Eternitty"
        canonical="/tags"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
                  <TagIcon className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Product Tags
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Discover products by their unique characteristics and find exactly what you're looking for
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <div className="flex items-center text-blue-100">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  <span>Curated Collections</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <TrendingUpIcon className="w-5 h-5 mr-2" />
                  <span>Trending Tags</span>
                </div>
                <div className="flex items-center text-blue-100">
                  <StarIcon className="w-5 h-5 mr-2" />
                  <span>Featured Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {tags.length === 0 ? (
            <div className="text-center py-20">
              <div className="p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
                <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tags found</h3>
                <p className="text-gray-600">Check back later for new product tags</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-200 rounded-lg">
                        <TagIcon className="w-6 h-6 text-blue-700" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-blue-900">{tags.length}</p>
                        <p className="text-blue-700">Total Tags</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-200 rounded-lg">
                        <TrendingUpIcon className="w-6 h-6 text-green-700" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-green-900">
                          {tags.reduce((sum, tag) => sum + (tag.count || 0), 0)}
                        </p>
                        <p className="text-green-700">Total Products</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-200 rounded-lg">
                        <SparklesIcon className="w-6 h-6 text-purple-700" />
                      </div>
                      <div className="ml-4">
                        <p className="text-2xl font-bold text-purple-900">
                          {Math.round(tags.reduce((sum, tag) => sum + (tag.count || 0), 0) / tags.length)}
                        </p>
                        <p className="text-purple-700">Avg per Tag</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {tags.map((tag) => (
                  <TagCard key={tag.id} tag={tag} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Explore our full product catalog or use our advanced search to discover more
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  View All Products
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <TagIcon className="w-5 h-5 mr-2" />
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
