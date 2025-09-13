import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const fetchHeaderFooter = async () => {
      try {
        console.log('🔄 Fetching header/footer data...');
        const response = await fetch('/api/header-footer');
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
    };

    fetchHeaderFooter();
  }, []);

  return headerFooterData;
}
