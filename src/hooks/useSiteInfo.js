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
        const response = await fetch('/api/site-info');
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
        console.error('Error fetching site info:', error);
        setSiteInfo(prev => ({
          ...prev,
          loading: false
        }));
      }
    };

    fetchSiteInfo();
  }, []);

  return siteInfo;
}
