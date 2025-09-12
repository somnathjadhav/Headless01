export default async function handler(req, res) {
  try {
    // For local development, ignore SSL certificate issues
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    // Check if this is a request for the actual favicon image
    const isImageRequest = req.headers.accept && req.headers.accept.includes('image');
    
    // Fetch favicon configuration from WordPress
    const response = await fetch(`${process.env.WORDPRESS_URL}/wp-json/`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    // Get site info which includes favicon
    const siteInfo = await response.json();
    
    // Try to get favicon from site icon endpoint
    let faviconUrl = null;
    
    try {
      // Method 1: Try to get from public site info
      const siteIconResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/settings`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (siteIconResponse.ok) {
        const settings = await siteIconResponse.json();
        if (settings.site_icon_url) {
          faviconUrl = settings.site_icon_url;
          console.log('✅ Found site icon from settings:', faviconUrl);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch from settings endpoint:', error.message);
    }

    // Method 2: Try to get from site info
    if (!faviconUrl) {
      try {
        if (siteInfo.site_icon_url) {
          faviconUrl = siteInfo.site_icon_url;
          console.log('✅ Found site icon from site info:', faviconUrl);
        }
      } catch (error) {
        console.log('⚠️ Could not get site icon from site info');
      }
    }

    // Method 3: Try to get from customizer data
    if (!faviconUrl) {
      try {
        const customizerResponse = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/options`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (customizerResponse.ok) {
          const options = await customizerResponse.json();
          if (options.site_icon) {
            faviconUrl = `${process.env.WORDPRESS_URL}/wp-content/uploads/${options.site_icon}`;
            console.log('✅ Found site icon from options:', faviconUrl);
          }
        }
      } catch (error) {
        console.log('⚠️ Could not fetch from options endpoint:', error.message);
      }
    }

    // Method 4: Scan for common favicon locations
    if (!faviconUrl) {
      const commonFaviconPaths = [
        `${process.env.WORDPRESS_URL}/favicon.ico`,
        `${process.env.WORDPRESS_URL}/favicon.png`,
        `${process.env.WORDPRESS_URL}/wp-content/uploads/favicon.png`,
        `${process.env.WORDPRESS_URL}/wp-content/uploads/favicon.ico`,
        `${process.env.WORDPRESS_URL}/wp-content/uploads/site-icon.png`,
        `${process.env.WORDPRESS_URL}/wp-content/uploads/site-icon.ico`
      ];

      for (const path of commonFaviconPaths) {
        try {
          const response = await fetch(path, { method: 'HEAD' });
          if (response.ok) {
            faviconUrl = path;
            console.log('✅ Found favicon at common location:', faviconUrl);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Could not check ${path}:`, error.message);
        }
      }
    }

    // Fallback to default favicon location if no custom site icon
    if (!faviconUrl) {
      faviconUrl = `${process.env.WORDPRESS_URL}/wp-content/uploads/2025/09/logoipsum-370.png`;
      console.log('🔄 Using fallback favicon:', faviconUrl);
    } else {
      console.log('✅ Found custom site icon:', faviconUrl);
    }

    // If this is an image request, redirect to the actual favicon
    if (isImageRequest) {
      res.redirect(307, faviconUrl);
      return;
    }

    // Return favicon configuration for API requests
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({
      favicon: faviconUrl,
      site_name: siteInfo.name || 'Eternitty Headless WordPress',
      site_description: siteInfo.description || '',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Favicon API error:', error);
    
    // Fallback to default favicon
    const fallbackUrl = `${process.env.WORDPRESS_URL}/wp-content/uploads/2025/09/logoipsum-370.png`;
    
    // If this is an image request, redirect to fallback
    if (req.headers.accept && req.headers.accept.includes('image')) {
      res.redirect(307, fallbackUrl);
      return;
    }
    
    // Return fallback configuration for API requests
    res.status(200).json({
      favicon: fallbackUrl,
      site_name: 'Eternitty Headless WordPress',
      site_description: 'A modern, headless WordPress solution',
      timestamp: new Date().toISOString(),
      error: 'Using fallback favicon due to API error'
    });
  }
}
