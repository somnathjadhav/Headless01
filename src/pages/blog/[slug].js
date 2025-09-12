import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SEO from '../../components/layout/SEO'
import BlogHeader from '../../components/layout/BlogHeader'
import Footer from '../../components/layout/Footer'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ErrorMessage from '../../components/ui/ErrorMessage'

export async function getServerSideProps({ params, req }) {
  const { slug } = params
  
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers.host
    const baseUrl = `${protocol}://${host}`
    
    console.log('Fetching post for slug:', slug, 'from:', `${baseUrl}/api/posts/${slug}`)
    
    const response = await fetch(`${baseUrl}/api/posts/${slug}`)
    
    if (!response.ok) {
      console.error('API response not ok:', response.status, response.statusText)
      return {
        notFound: true,
      }
    }
    
    const data = await response.json()
    console.log('API response data:', data)
    
    if (!data.success || !data.data) {
      console.error('API response not successful:', data)
      return {
        notFound: true,
      }
    }
    
    return {
      props: {
        post: data.data,
        slug,
      },
    }
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return {
      notFound: true,
    }
  }
}

export default function BlogPost({ post: initialPost, slug: initialSlug }) {
  const router = useRouter()
  const { slug } = router.query
  const [post, setPost] = useState(initialPost)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const currentSlug = slug || initialSlug

  useEffect(() => {
    if (currentSlug && !initialPost) {
      setLoading(true)
      fetch(`/api/posts/${currentSlug}`)
        .then(res => res.json())
        .then(data => {
          setPost(data)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [currentSlug, initialPost])

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </PageLayout>
    )
  }

  if (error || !post) {
    console.log('Blog post error:', { error, post, currentSlug })
    return (
      <PageLayout>
        <ErrorMessage message="Blog post not found or failed to load." />
      </PageLayout>
    )
  }

  // Debug logging
  console.log('Blog post data:', { post, currentSlug })

  return (
    <>
      <SEO 
        useYoast={true}
        yoastType="post"
        yoastId={post.slug}
        yoastIdType="SLUG"
        fallbackToManual={true}
        title={post.title}
        description={post.excerpt?.replace(/<[^>]*>/g, '') || post.title}
        image={post.featured_image}
        url={`/blog/${post.slug}`}
        type="article"
        keywords={post.tags?.map(tag => tag.name).join(', ')}
      />

      <BlogHeader />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-900 font-medium truncate max-w-xs">
                {post.title}
              </li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Article Header with Overlay */}
              <header className="mb-8">
                {/* Featured Image with Enhanced Overlay */}
                {post.featured_image ? (
                  <div className="blog-header-hero mb-12">
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-80 md:h-[600px] lg:h-[700px] object-cover transform hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      
                      {/* Floating Elements */}
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                        {/* Category Badge - Top Left */}
                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {post.categories.map((category) => (
                              <span
                                key={category.id}
                                className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-semibold border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Reading Time - Top Right */}
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium border border-white/30 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>5 min read</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Main Content - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
                        {/* Title with Enhanced Typography */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-8 leading-tight tracking-tight">
                          <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent drop-shadow-2xl">
                            {post.title}
                          </span>
                        </h1>
                        
                        {/* Enhanced Meta Information */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6">
                          <div className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-md text-white rounded-2xl border border-white/25 shadow-xl hover:bg-white/25 transition-all duration-300 hover:scale-105">
                            <div className="p-2 bg-white/20 rounded-full">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Published</div>
                              <time dateTime={post.date} className="text-sm font-semibold">
                                {post.date ? new Date(post.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : 'Date not available'}
                              </time>
                            </div>
                          </div>
                          
                          {post.author && (
                            <div className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-md text-white rounded-2xl border border-white/25 shadow-xl hover:bg-white/25 transition-all duration-300 hover:scale-105">
                              <div className="p-2 bg-white/20 rounded-full">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Author</div>
                                <div className="text-sm font-semibold">By {post.author.name}</div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-3 px-6 py-3 bg-white/15 backdrop-blur-md text-white rounded-2xl border border-white/25 shadow-xl hover:bg-white/25 transition-all duration-300 hover:scale-105">
                            <div className="p-2 bg-white/20 rounded-full">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Category</div>
                              <div className="text-sm font-semibold">
                                {post.categories && post.categories.length > 0 
                                  ? post.categories[0].name 
                                  : 'Uncategorized'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Fallback Header without Image */
                  <div className="mb-8">
                    <div className="mb-4">
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.categories.map((category) => (
                            <span
                              key={category.id}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                      {post.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <time dateTime={post.date}>
                          {post.date ? new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Date not available'}
                        </time>
                      </div>
                      
                      {post.author && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span>By {post.author.name}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>5 min read</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Excerpt */}
                {post.excerpt && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500">
                    <div 
                      className="text-lg text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  </div>
                )}
              </header>

              {/* Article Content */}
              <article className="prose prose-lg prose-blue max-w-none mb-12">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </article>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-12 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${tag.slug}`}
                        className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border border-gray-200"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this article</h3>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                    <span>Twitter</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                    <span>LinkedIn</span>
                  </button>
                </div>
              </div>

              {/* Author Bio */}
              {post.author && (
                <div className="mb-12 p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        About {post.author.name}
                      </h4>
                      <p className="text-gray-600">
                        Fashion enthusiast and style expert with years of experience in the industry. 
                        Passionate about exploring the intersection of culture, fashion, and personal expression.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <Link 
                  href="/blog"
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Blog
                </Link>
                
                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Table of Contents */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    <a href="#introduction" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      Introduction
                    </a>
                    <a href="#fashion-culture" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      Fashion as Culture
                    </a>
                    <a href="#social-change" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      Social Change
                    </a>
                    <a href="#globalization" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      Globalization
                    </a>
                    <a href="#conclusion" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      Conclusion
                    </a>
                  </nav>
                </div>

                {/* Related Posts */}
                <div className="p-6 bg-white border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          <Link href="/blog/another-post" className="hover:text-blue-600 transition-colors">
                            Sustainable Fashion Trends
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          <Link href="/blog/another-post" className="hover:text-blue-600 transition-colors">
                            Street Style Inspiration
                          </Link>
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Newsletter Signup */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Get the latest fashion trends and style tips delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
