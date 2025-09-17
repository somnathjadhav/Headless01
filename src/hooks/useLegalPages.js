import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch WordPress menu items for footer
 */
export function useLegalPages() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      console.log('🔄 Fetching WordPress menu items...');
      const response = await fetch('/api/legal-pages', {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Menu items received:', data);
        
        if (data.success) {
          setMenuItems(data.data || []);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to fetch menu items');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching menu items:', error);
      setError(error.message);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh function to manually fetch latest data
  const refresh = useCallback(() => {
    console.log('🔄 Manually refreshing menu items...');
    setLoading(true);
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    refresh
  };
}
