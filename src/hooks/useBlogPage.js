import { useState, useEffect, useCallback } from 'react'

export function useBlogPage() {
  const [blogPage, setBlogPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBlogPage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/blog-page')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blog page: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setBlogPage(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch blog page')
      }
    } catch (err) {
      console.error('Error fetching blog page:', err)
      setError(err.message)
      setBlogPage(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchBlogPage()
  }, [fetchBlogPage])

  return { 
    blogPage, 
    loading, 
    error, 
    refetch: fetchBlogPage
  }
}
