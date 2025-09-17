import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch header/footer settings from WordPress backend
 */
export function useHeaderFooter() {
  const [headerFooterData, setHeaderFooterData] = useState({
    lightLogo: null,
    darkLogo: null,
    favicon: null,
    topHeaderText: null,
    headerCtaText: null,
    headerCtaLink: null,
    footerContent: null,
    footerCopyrightText: null,
    useWidgets: false,
    loading: true,
    error: null
  });

  const fetchHeaderFooter = useCallback(async () => {
    try {
      console.log('🔄 Fetching header/footer data...');
      const response = await fetch('/api/header-footer', {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Header/footer data received:', data);
        if (data.success) {
          setHeaderFooterData({
            ...data.data,
            loading: false,
            error: null
          });
          console.log('✅ Header/footer data set successfully');
        } else {
          throw new Error(data.message || 'Failed to fetch header/footer data');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching header/footer data:', error);
      setHeaderFooterData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, []);

  // Refresh function to manually fetch latest data
  const refresh = useCallback(() => {
    console.log('🔄 Manually refreshing header/footer data...');
    fetchHeaderFooter();
  }, [fetchHeaderFooter]);

  useEffect(() => {
    fetchHeaderFooter();
  }, [fetchHeaderFooter]);

  return {
    ...headerFooterData,
    refresh
  };
}
