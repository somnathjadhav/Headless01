import { useState, useEffect } from 'react';

export const useThemeOptions = () => {
  const [themeOptions, setThemeOptions] = useState({
    branding: {
      logo: null,
      light_logo: null,
      dark_logo: null,
      logo_alt: 'Site Logo',
      site_name: 'glozin',
      site_description: 'Your Store'
    },
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#F59E0B'
    },
    typography: {
      font_family: 'Inter',
      heading_font: 'Inter',
      body_font: 'Inter'
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThemeOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/theme-options');
        
        if (response.ok) {
          const data = await response.json();
          setThemeOptions(prevOptions => ({
            ...prevOptions,
            ...data
          }));
        } else {
          console.warn('Failed to fetch theme options, using defaults');
        }
      } catch (err) {
        console.warn('Error fetching theme options:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeOptions();
  }, []);

  return {
    themeOptions,
    loading,
    error,
    updateThemeOptions: setThemeOptions
  };
};

