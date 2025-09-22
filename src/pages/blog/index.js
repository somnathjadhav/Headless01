import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { usePosts } from '../../hooks/usePosts'
import { useBlogPage } from '../../hooks/useBlogPage'
import SEO from '../../components/layout/SEO'
import PageLayout from '../../components/layout/PageLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

export default function Blog() {
  const { posts, loading, error, fetchPosts, totalPages } = usePosts(6)
  const { blogPage, loading: blogPageLoading, error: blogPageError } = useBlogPage()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchPosts(currentPage, 6) // 6 posts per page
  }, [currentPage, fetchPosts])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if ((loading && posts.length === 0) || blogPageLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  if (error || blogPageError) {
    return (
      <PageLayout>
        <ErrorMessage message="Failed to load blog content. Please try again later." />
      </PageLayout>
    )
  }

  return (
    <>
      <SEO 
        title={blogPage?.title || "Blog - Latest Fashion & Style Tips"}
        description={blogPage?.excerpt || "Discover the latest fashion trends, style tips, and lifestyle advice from our expert team. Stay updated with fashion and culture insights."}
        url="/blog"
        type="blog"
        keywords="fashion blog, style tips, fashion trends, lifestyle, fashion culture"
      />

      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Blog Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {blogPage?.title || "Fashion & Style Blog"}
            </h1>
            <div className="text-xl text-gray-600 max-w-3xl mx-auto">
              {blogPage?.content ? (
                <div 
                  className="prose prose-lg mx-auto"
                  dangerouslySetInnerHTML={{ __html: blogPage.content }}
                />
              ) : (
                <p>
                  Discover the latest fashion trends, style tips, and lifestyle advice from our expert team. 
                  Stay updated with fashion and culture insights.
                </p>
              )}
            </div>
          </div>

          {/* Blog Posts Grid */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Featured Image */}
                    {post.featured_image && (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Post Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      
                      <div 
                        className="text-gray-600 mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                      
                      <div className="flex items-center justify-between">
                        <time className="text-sm text-gray-500">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                        
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Read More →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 border rounded-md transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
              <p className="text-gray-500">Check back later for new content!</p>
            </div>
          )}
        </div>
      </PageLayout>
    </>
  )
}
