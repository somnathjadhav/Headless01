import { useState, useEffect } from 'react';

export function useSiteInfo() {
  const [siteInfo, setSiteInfo] = useState({
    name: 'Your WordPress Site',
    description: 'A modern WordPress site',
    url: '',
    loading: true
  });

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/site-info', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'max-age=300' // Cache for 5 minutes
          }
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (data.success && data.data) {
          setSiteInfo({
            ...data.data,
            loading: false
          });
        } else {
          setSiteInfo(prev => ({
            ...prev,
            loading: false
          }));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching site info:', error);
        }
        setSiteInfo(prev => ({
          ...prev,
          loading: false
        }));
      }
    };

    // Delay the API call slightly to allow page to render first
    const timeoutId = setTimeout(fetchSiteInfo, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return siteInfo;
}
