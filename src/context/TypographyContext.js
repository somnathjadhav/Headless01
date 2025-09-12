import { createContext, useContext, useEffect, useState } from 'react';

const TypographyContext = createContext();

export const useTypography = () => {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }
  return context;
};

export const TypographyProvider = ({ children }) => {
  const [typography, setTypography] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wordpressStatus, setWordpressStatus] = useState('unknown');
  const [wordpressUrl, setWordpressUrl] = useState('');
  const [customTypographyFound, setCustomTypographyFound] = useState(false);

  useEffect(() => {
    const loadTypography = async () => {
      try {
        setLoading(true);
        // console.log('🔄 Starting typography load...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch('/api/typography', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // console.log('📡 API response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Typography API error: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log('📦 Typography data received:', data);
        
        setTypography(data.typography);
        setWordpressStatus(data.wordpress_status || 'unknown');
        setWordpressUrl(data.wordpress_url || '');
        setCustomTypographyFound(data.custom_typography_found || false);
        setError(null);
        
        // Apply typography to CSS custom properties
        applyTypographyToCSS(data.typography);
        
        // console.log('🎨 Typography loaded:', data.source);
        // console.log('🔗 WordPress status:', data.wordpress_status);
        // console.log('🎯 Custom typography found:', data.custom_typography_found);
      } catch (err) {
        console.error('❌ Error loading typography:', err);
        setError(err.message);
        setWordpressStatus('error');
        
        // Apply fallback typography
        const fallbackTypography = {
          fonts: {
            primary: { family: 'Inter', fallback: 'system-ui, sans-serif', weights: [400, 500, 600, 700] },
            secondary: { family: 'Poppins', fallback: 'Georgia, serif', weights: [400, 500, 600] }
          },
          sizes: { base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' },
          headings: { h1: { size: '2xl', weight: 700 }, h2: { size: 'xl', weight: 600 } },
          body: { size: 'base', weight: 400, lineHeight: 1.6 },
          colors: {
            text: {
              primary: '#111827',
              secondary: '#6B7280',
              muted: '#9CA3AF',
              inverse: '#FFFFFF'
            },
            headings: {
              primary: '#111827',
              secondary: '#374151',
              accent: '#3B82F6'
            },
            background: {
              primary: '#FFFFFF',
              secondary: '#F9FAFB',
              accent: '#F3F4F6'
            },
            accent: {
              primary: '#3B82F6',
              secondary: '#8B5CF6',
              success: '#10B981',
              warning: '#F59E0B',
              error: '#EF4444'
            }
          }
        };
        
        setTypography(fallbackTypography);
        applyTypographyToCSS(fallbackTypography);
      } finally {
        setLoading(false);
      }
    };

    loadTypography();
  }, []);

  // Add MutationObserver to automatically apply typography to new elements
  useEffect(() => {
    if (typeof window === 'undefined' || !typography) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Apply typography to new elements
              applyTypographyToElement(node);
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [typography]);

  const applyTypographyToElement = (element) => {
    if (!element || !typography) return;

    // Apply to the element itself
    if (element.tagName && element.tagName.match(/^H[1-6]$/)) {
      element.style.fontFamily = `var(--font-primary)`;
      element.style.fontWeight = '600';
    } else if (element.tagName === 'CODE' || element.tagName === 'PRE') {
      element.style.fontFamily = `var(--font-mono)`;
    } else if (element.tagName === 'EM' || element.tagName === 'I' || element.tagName === 'BLOCKQUOTE') {
      element.style.fontFamily = `var(--font-secondary)`;
    } else {
      element.style.fontFamily = `var(--font-primary)`;
    }

    // Apply to all child elements
    const children = element.querySelectorAll('*');
    children.forEach((child) => {
      if (child.tagName && child.tagName.match(/^H[1-6]$/)) {
        child.style.fontFamily = `var(--font-primary)`;
        child.style.fontWeight = '600';
      } else if (child.tagName === 'CODE' || child.tagName === 'PRE') {
        child.style.fontFamily = `var(--font-mono)`;
      } else if (child.tagName === 'EM' || child.tagName === 'I' || child.tagName === 'BLOCKQUOTE') {
        child.style.fontFamily = `var(--font-secondary)`;
      } else {
        child.style.fontFamily = `var(--font-primary)`;
      }
    });
  };

  const applyTypographyToCSS = (typographySettings) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // console.log('🎨 Applying typography to CSS:', typographySettings);
    
    // Apply font families
    if (typographySettings.fonts) {
      Object.entries(typographySettings.fonts).forEach(([key, font]) => {
        const fontFamily = `"${font.family}", ${font.fallback}`;
        root.style.setProperty(`--font-${key}`, fontFamily);
        if (font.weights) {
          root.style.setProperty(`--font-${key}-weights`, font.weights.join(', '));
        }
        
        // Also apply directly to body for immediate effect
        if (key === 'primary') {
          document.body.style.fontFamily = fontFamily;
          // console.log('🎨 Applied primary font to body:', fontFamily);
          
          // Wait for font to load before applying to all elements
          if (font.family && !font.family.includes('system-ui')) {
            document.fonts.ready.then(() => {
              // Check if the specific font is loaded
              if (document.fonts.check(`12px "${font.family}"`)) {
                // console.log('✅ Font loaded successfully:', font.family);
                // Force reapply to ensure font is visible
                document.body.style.fontFamily = fontFamily;
                // Trigger a repaint
                document.body.offsetHeight;
              } else {
                // console.log('⚠️ Font not loaded yet:', font.family);
              }
            });
          }
        }
      });
    }

    // Apply font sizes
    if (typographySettings.sizes) {
      Object.entries(typographySettings.sizes).forEach(([key, size]) => {
        root.style.setProperty(`--text-${key}`, size);
        if (key === 'base') {
          document.body.style.fontSize = size;
          // console.log('🎨 Applied base font size to body:', size);
        }
      });
    }

    // Apply heading styles
    if (typographySettings.headings) {
      Object.entries(typographySettings.headings).forEach(([key, heading]) => {
        root.style.setProperty(`--heading-${key}-size`, `var(--text-${heading.size})`);
        root.style.setProperty(`--heading-${key}-weight`, heading.weight);
        root.style.setProperty(`--heading-${key}-line-height`, heading.lineHeight);
        root.style.setProperty(`--heading-${key}-letter-spacing`, heading.letterSpacing);
      });
    }

    // Apply body styles
    if (typographySettings.body) {
      const body = typographySettings.body;
      root.style.setProperty('--body-size', `var(--text-${body.size})`);
      root.style.setProperty('--body-weight', body.weight);
      root.style.setProperty('--body-line-height', body.lineHeight);
      root.style.setProperty('--body-letter-spacing', body.letterSpacing);
      
      // Apply line height directly
      if (body.lineHeight) {
        document.body.style.lineHeight = body.lineHeight;
        // console.log('🎨 Applied line height to body:', body.lineHeight);
      }
    }

    // Apply button styles
    if (typographySettings.buttons) {
      Object.entries(typographySettings.buttons).forEach(([key, button]) => {
        root.style.setProperty(`--button-${key}-size`, `var(--text-${button.size})`);
        root.style.setProperty(`--button-${key}-weight`, button.weight);
        root.style.setProperty(`--button-${key}-line-height`, button.lineHeight);
      });
    }

    // Apply colors
    if (typographySettings.colors) {
      Object.entries(typographySettings.colors).forEach(([category, colors]) => {
        Object.entries(colors).forEach(([key, color]) => {
          root.style.setProperty(`--color-${category}-${key}`, color);
        });
      });
    }

    // Apply spacing
    if (typographySettings.spacing) {
      Object.entries(typographySettings.spacing).forEach(([category, values]) => {
        Object.entries(values).forEach(([key, value]) => {
          root.style.setProperty(`--${category}-${key}`, value);
        });
      });
    }

    // Force a repaint to ensure changes are visible
    document.body.offsetHeight;
    
    // console.log('🎨 Typography applied to CSS custom properties and body styles');
    // console.log('🎨 Current CSS custom properties:', {
    //   '--font-primary': root.style.getPropertyValue('--font-primary'),
    //   '--font-secondary': root.style.getPropertyValue('--font-secondary'),
    //   '--text-base': root.style.getPropertyValue('--text-base'),
    //   '--body-line-height': root.style.getPropertyValue('--body-line-height')
    // });
  };

  const refreshTypography = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/typography');
      
      if (!response.ok) {
        throw new Error(`Typography API error: ${response.status}`);
      }
      
      const data = await response.json();
      setTypography(data.typography);
      setWordpressStatus(data.wordpress_status || 'unknown');
      setWordpressUrl(data.wordpress_url || '');
      setCustomTypographyFound(data.custom_typography_found || false);
      setError(null);
      
      // Re-apply typography to CSS
      applyTypographyToCSS(data.typography);
      
      // console.log('🔄 Typography refreshed:', data.source);
      // console.log('🔗 WordPress status:', data.wordpress_status);
      // console.log('🎯 Custom typography found:', data.custom_typography_found);
    } catch (err) {
      console.error('❌ Error refreshing typography:', err);
      setError(err.message);
      setWordpressStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    typography,
    loading,
    error,
    wordpressStatus,
    wordpressUrl,
    customTypographyFound,
    refreshTypography,
    applyTypographyToCSS
  };

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
};
