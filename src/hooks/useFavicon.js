import { useState, useEffect } from 'react';

/**
 * Hook to fetch favicon/logo information from WordPress backend
 */
export function useFavicon() {
  const [faviconData, setFaviconData] = useState({
    favicon: null,
    site_name: null,
    site_description: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchFavicon = async () => {
      try {
        const response = await fetch('/api/favicon');
        if (response.ok) {
          const data = await response.json();
          setFaviconData({
            favicon: data.favicon,
            site_name: data.site_name,
            site_description: data.site_description,
            loading: false,
            error: null
          });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching favicon:', error);
        setFaviconData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchFavicon();
  }, []);

  return faviconData;
}
