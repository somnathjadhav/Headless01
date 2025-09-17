export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Try to get theme options from WordPress REST API
    let themeOptions = null;
    
    try {
      // Try the custom eternitty theme options endpoint
      const response = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/theme-options`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        themeOptions = await response.json();
        console.log('✅ Found theme options from eternitty endpoint:', themeOptions);
      }
    } catch (error) {
      console.log('⚠️ Could not fetch from eternitty endpoint:', error.message);
    }

    // Try alternative endpoints if eternitty endpoint fails
    if (!themeOptions) {
      try {
        // Try to get from customizer settings
        const customizerResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/theme-options`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (customizerResponse.ok) {
          themeOptions = await customizerResponse.json();
          console.log('✅ Found theme options from customizer endpoint:', themeOptions);
        }
      } catch (error) {
        console.log('⚠️ Could not fetch from customizer endpoint:', error.message);
      }
    }

    // Fallback to default theme options
    if (!themeOptions) {
      themeOptions = {
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
        },
        recaptcha: {
          enabled: false,
          site_key: null,
          secret_key: null
        }
      };
      console.log('⚠️ Using fallback theme options:', themeOptions);
    }

    // Ensure reCAPTCHA settings exist in theme options
    if (!themeOptions.recaptcha) {
      themeOptions.recaptcha = {
        enabled: false,
        site_key: null,
        secret_key: null
      };
    }

    return res.status(200).json({
      success: true,
      data: themeOptions
    });

  } catch (error) {
    console.error('Error fetching theme options:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch theme options',
      data: {
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
        },
        recaptcha: {
          enabled: false,
          site_key: null,
          secret_key: null
        }
      }
    });
  }
}

