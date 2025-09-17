import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to fetch WordPress main menu
 */
export function useMainMenu() {
  const [menuData, setMenuData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMainMenu = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/main-menu?' + Date.now(), {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setMenuData(data.data)
          setError(null)
        } else {
          throw new Error(data.error || 'Failed to fetch main menu')
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching main menu:', error)
      setError(error.message)
      setMenuData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh function to manually fetch latest data
  const refresh = useCallback(() => {
    setLoading(true)
    fetchMainMenu()
  }, [fetchMainMenu])

  useEffect(() => {
    fetchMainMenu()
  }, [fetchMainMenu])

  return {
    menuData,
    loading,
    error,
    refresh
  }
}
