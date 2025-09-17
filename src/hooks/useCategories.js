import { useState, useEffect } from 'react'
import { fetchAPI } from '../lib/api'
import { GET_CATEGORIES } from '../lib/queries/categories'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const data = await fetchAPI(GET_CATEGORIES)
        setCategories(data.categories.nodes)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
