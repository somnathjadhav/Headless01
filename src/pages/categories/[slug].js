import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SEO from '../../components/layout/SEO'
import PageLayout from '../../components/layout/PageLayout'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

export async function getServerSideProps({ params, req }) {
  const { slug } = params
  
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host
    const baseUrl = `${protocol}://${host}`
    
    // Fetch category information
    const categoryResponse = await fetch(`${baseUrl}/api/categories/${slug}`)
    if (!categoryResponse.ok) {
      return { notFound: true }
    }
    
    const categoryData = await categoryResponse.json()
    if (!categoryData.success) {
      return { notFound: true }
    }
    
    // Fetch posts for this category
    const postsResponse = await fetch(`${baseUrl}/api/posts?category=${categoryData.data.id}&per_page=12`)
    if (!postsResponse.ok) {
      return { notFound: true }
    }
    
    const postsData = await postsResponse.json()
    
    return {
      props: {
        category: categoryData.data,
        posts: postsData.success ? postsData.data.posts : [],
        totalPages: postsData.success ? postsData.data.totalPages : 1,
        total: postsData.success ? postsData.data.total : 0,
        slug,
      },
    }
  } catch (error) {
    console.error('Error fetching category data:', error)
    return { notFound: true }
  }
}

export default function CategoryPage({ category: initialCategory, posts: initialPosts, totalPages: initialTotalPages, total: initialTotal, slug: initialSlug }) {
  const router = useRouter()
  const { slug } = router.query
  const [category, setCategory] = useState(initialCategory)
  const [posts, setPosts] = useState(initialPosts)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [total, setTotal] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const currentSlug = slug || initialSlug

  const fetchPosts = async (page = 1) => {
    if (!category) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/posts?category=${category.id}&page=${page}&per_page=12`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPosts(data.data.posts)
          setTotalPages(data.data.totalPages)
          setTotal(data.data.total)
          setCurrentPage(page)
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    fetchPosts(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && posts.length === 0) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  if (error || !category) {
    return (
      <PageLayout>
        <ErrorMessage message="Category not found or failed to load." />
      </PageLayout>
    )
  }

  return (
    <>
      <SEO 
        title={`${category.name} - Fashion Blog`}
        description={`Explore the latest ${category.name.toLowerCase()} trends, tips, and inspiration. Discover curated content about ${category.name.toLowerCase()} from our fashion experts.`}
        url={`/categories/${category.slug}`}
        type="website"
        keywords={`${category.name}, fashion, trends, style, blog`}
      />

      <PageLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title Bar - Blog Style */}
          <div className="text-center mb-16 py-8">
            {/* Large Bold Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {category.name}
            </h1>
            
            {/* Simple Breadcrumb */}
            <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
              <span className="mx-2">&gt;</span>
              <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
              <span className="mx-2">&gt;</span>
              <span className="text-gray-900 font-medium">{category.name}</span>
            </nav>
          </div>

          {/* Posts Grid */}
          {posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
                      {/* Category Badge */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {post.categories[0].name}
                          </span>
                        </div>
                      )}
                      
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      
                      <div 
                        className="text-gray-600 mb-4 line-clamp-3 text-sm"
                        dangerouslySetInnerHTML={{ __html: post.excerpt }}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <time>
                            {new Date(post.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                          <span>•</span>
                          <span>5 min read</span>
                        </div>
                        
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Read More
                          <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
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
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-6">We're working on adding more content to this category.</p>
              <Link 
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Blog
              </Link>
            </div>
          )}

          {/* Related Categories */}
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore More Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Fashion Trends', slug: 'fashion-trends', icon: '👗' },
                { name: 'Street Style', slug: 'street-style', icon: '🛍️' },
                { name: 'Beauty & Makeup', slug: 'beauty-makeup', icon: '💄' },
                { name: "Men's Fashion", slug: 'mens-fashion', icon: '👔' }
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-center"
                >
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  )
}