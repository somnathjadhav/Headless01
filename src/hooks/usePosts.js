import { useState, useEffect, useCallback } from 'react'

export function usePosts(initialLimit = 10) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchPosts = useCallback(async (page = 1, perPage = 10) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/posts?page=${page}&per_page=${perPage}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setPosts(data.data.posts || [])
        setTotalPages(data.data.totalPages || 1)
        setTotal(data.data.total || 0)
      } else {
        throw new Error(data.error || 'Failed to fetch posts')
      }
    } catch (err) {
      console.error('Error fetching posts:', err)
      setError(err.message)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchPosts(1, initialLimit)
  }, [fetchPosts, initialLimit])

  return { 
    posts, 
    loading, 
    error, 
    fetchPosts, 
    totalPages, 
    total 
  }
}
