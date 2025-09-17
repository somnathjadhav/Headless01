export default async function handler(req, res) {
  try {
    // For local development, ignore SSL certificate issues
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost';
    
    // Try to get favicon from header-footer settings first
    let faviconUrl = null;
    
    try {
      const headerFooterResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/header-footer`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (headerFooterResponse.ok) {
        const headerFooterData = await headerFooterResponse.json();
        if (headerFooterData.favicon) {
          // Get the actual media URL
          const mediaResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/media/${headerFooterData.favicon}`, {
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json();
            faviconUrl = mediaData.source_url;
            console.log('✅ Found favicon from header-footer settings:', faviconUrl);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Could not fetch from header-footer endpoint:', error.message);
    }

    // Fallback: Try to get from WordPress site settings
    if (!faviconUrl) {
      try {
        const siteIconResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/settings`, {
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
    }

    // Final fallback: Use default favicon
    if (!faviconUrl) {
      faviconUrl = 'https://staging.eternitty.com/headless-woo/wp-content/uploads/2025/09/logoipsum-370.png';
      console.log('🔄 Using fallback favicon:', faviconUrl);
    }

    // Return the favicon data
    const response = {
      favicon: faviconUrl,
      site_name: 'NextGen Ecommerce',
      site_description: 'Headless WooCommerce for Next-Gen eCommerce',
      timestamp: new Date().toISOString()
    };

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching favicon:', error);
    
    // Return fallback favicon on error
    const fallbackResponse = {
      favicon: 'https://staging.eternitty.com/headless-woo/wp-content/uploads/2025/09/logoipsum-370.png',
      site_name: 'NextGen Ecommerce',
      site_description: 'Headless WooCommerce for Next-Gen eCommerce',
      timestamp: new Date().toISOString()
    };
    
    return res.status(200).json(fallbackResponse);
  }
}