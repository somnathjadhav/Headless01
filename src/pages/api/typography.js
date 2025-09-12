export default async function handler(req, res) {
  try {
    // For local development, ignore SSL certificate issues
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const wordpressUrl = process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Default typography settings (fallback)
    const defaultTypography = {
      fonts: {
        primary: {
          family: 'Instrument Sans',
          fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          weights: [400, 500, 600, 700],
          google: true
        },
        secondary: {
          family: 'Nunito Sans',
          fallback: 'Georgia, "Times New Roman", serif',
          weights: [400, 500, 600, 700],
          google: true
        },
        mono: {
          family: 'JetBrains Mono',
          fallback: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
          weights: [400, 500],
          google: true
        }
      },
      sizes: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        '6xl': '3.75rem',   // 60px
        '7xl': '4.5rem',    // 72px
        '8xl': '6rem',      // 96px
        '9xl': '8rem'       // 128px
      },
      headings: {
        h1: { size: '4xl', weight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' },
        h2: { size: '3xl', weight: 600, lineHeight: 1.2, letterSpacing: '-0.025em' },
        h3: { size: '2xl', weight: 600, lineHeight: 1.3, letterSpacing: '-0.025em' },
        h4: { size: 'xl', weight: 600, lineHeight: 1.4, letterSpacing: '-0.025em' },
        h5: { size: 'lg', weight: 600, lineHeight: 1.5, letterSpacing: '-0.025em' },
        h6: { size: 'base', weight: 600, lineHeight: 1.5, letterSpacing: '-0.025em' }
      },
      body: {
        size: 'base',
        weight: 400,
        lineHeight: 1.6,
        letterSpacing: '0em'
      },
      buttons: {
        small: { size: 'sm', weight: 500, lineHeight: 1.4 },
        medium: { size: 'base', weight: 500, lineHeight: 1.4 },
        large: { size: 'lg', weight: 500, lineHeight: 1.4 }
      },
      colors: {
        text: {
          primary: '#111827',    // gray-900
          secondary: '#6B7280',  // gray-500
          muted: '#9CA3AF',      // gray-400
          inverse: '#FFFFFF'     // white
        },
        headings: {
          primary: '#111827',    // gray-900
          secondary: '#374151',  // gray-700
          accent: '#3B82F6'      // blue-500
        },
        background: {
          primary: '#FFFFFF',    // white
          secondary: '#F9FAFB',  // gray-50
          accent: '#F3F4F6'      // gray-100
        },
        accent: {
          primary: '#3B82F6',    // blue-500
          secondary: '#8B5CF6',  // violet-500
          success: '#10B981',    // emerald-500
          warning: '#F59E0B',    // amber-500
          error: '#EF4444'       // red-500
        }
      },
      spacing: {
        lineHeight: {
          tight: 1.25,
          snug: 1.375,
          normal: 1.5,
          relaxed: 1.625,
          loose: 2
        },
        letterSpacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
          wider: '0.05em',
          widest: '0.1em'
        }
      }
    };

    // Try to get custom typography from WordPress
    let customTypography = null;
    let wordpressStatus = 'disconnected';
    let customTypographyFound = false;
    
    try {
      // First, check if WordPress is accessible
      const healthCheck = await fetch(`${wordpressUrl}/wp-json/`, {
        headers: { 'Accept': 'application/json' },
        timeout: 5000
      });
      
      if (healthCheck.ok) {
        wordpressStatus = 'connected';
        const siteInfo = await healthCheck.json();
        
        // For now, we'll use the default typography since no custom plugin is installed
        // In the future, this could be extended to fetch from WordPress theme options
        // or custom endpoints when they become available
        
        console.log('✅ WordPress connected, using default typography settings');
        console.log('ℹ️ To use custom typography from WordPress, install the typography plugin');
      }
    } catch (error) {
      console.log('⚠️ WordPress connection failed:', error.message);
      wordpressStatus = 'error';
    }

    // Merge custom settings with defaults
    let finalTypography = defaultTypography;
    if (customTypography) {
      // Deep merge custom typography with defaults, ensuring font properties are complete
      finalTypography = {
        ...defaultTypography,
        fonts: {
          ...defaultTypography.fonts,
          ...Object.keys(customTypography.fonts || {}).reduce((acc, key) => {
            const customFont = customTypography.fonts[key];
            const defaultFont = defaultTypography.fonts[key];
            
            // Merge font properties, ensuring fallback and weights are preserved
            acc[key] = {
              ...defaultFont,
              ...customFont,
              // Ensure fallback is always present
              fallback: customFont.fallback || defaultFont.fallback,
              // Ensure weights are always present
              weights: customFont.weights || defaultFont.weights,
              // Ensure google flag is preserved
              google: customFont.google !== undefined ? customFont.google : defaultFont.google
            };
            return acc;
          }, {})
        },
        sizes: {
          ...defaultTypography.sizes,
          ...customTypography.sizes
        },
        headings: {
          ...defaultTypography.headings,
          ...customTypography.headings
        },
        body: {
          ...defaultTypography.body,
          ...customTypography.body
        }
      };
    }

    // Return typography configuration
    res.status(200).json({
      typography: finalTypography,
      site_name: 'Eternitty Headless WordPress',
      timestamp: new Date().toISOString(),
      source: customTypography ? 'WordPress Customizer' : 'Default System',
      wordpress_status: wordpressStatus,
      wordpress_url: wordpressUrl,
      custom_typography_found: customTypographyFound,
      debug: {
        custom_typography: customTypography,
        merged_typography: finalTypography
      }
    });

  } catch (error) {
    console.error('Typography API error:', error);
    
    // Return default typography on error
    res.status(200).json({
      typography: {
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
      },
      site_name: 'Eternitty Headless WordPress',
      timestamp: new Date().toISOString(),
      error: 'Using default typography due to API error',
      source: 'Fallback System',
      wordpress_status: 'error'
    });
  }
}
