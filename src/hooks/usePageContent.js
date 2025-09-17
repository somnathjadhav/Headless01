import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch WordPress page content by slug
 * @param {string} slug - The page slug to fetch
 * @returns {object} - { pageContent, loading, error, refresh }
 */
export function usePageContent(slug) {
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPageContent = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 Fetching page content for slug: ${slug}`);
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/page-content/${slug}`, {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Page content received for ${slug}:`, data);

        if (data.success) {
          setPageContent(data.data);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to fetch page content');
        }
      } else if (response.status === 404) {
        // Page not found
        setPageContent(null);
        setError('Page not found');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching page content for ${slug}:`, error);
      setError(error.message);
      setPageContent(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Refresh function to manually fetch latest data
  const refresh = useCallback(() => {
    console.log(`🔄 Manually refreshing page content for ${slug}...`);
    setLoading(true);
    fetchPageContent();
  }, [fetchPageContent, slug]);

  useEffect(() => {
    fetchPageContent();
  }, [fetchPageContent]);

  return {
    pageContent,
    loading,
    error,
    refresh
  };
}
