// Site configuration constants
export const SITE_CONFIG = {
  name: 'Headless WordPress',
  description: 'A modern headless WordPress site built with Next.js',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.WORDPRESS_API_URL || 'http://localhost:8000/graphql',
  postsPerPage: 10,
  enableCache: process.env.NODE_ENV === 'production',
  enableAnalytics: process.env.NODE_ENV === 'production'
}

export const API_ENDPOINTS = {
  posts: '/api/posts',
  categories: '/api/categories',
  preview: '/api/preview'
}

export const CACHE_TTL = {
  posts: 300000, // 5 minutes
  categories: 600000, // 10 minutes
  seo: 3600000 // 1 hour
}
