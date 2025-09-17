/**
 * Logo API Endpoint
 * 
 * Fetches logo and branding information from WordPress backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
    
    // Get logo information from WordPress
    const logoResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/logo`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!logoResponse.ok) {
      throw new Error(`WordPress API error: ${logoResponse.status}`)
    }

    const logoData = await logoResponse.json()

    // Get site info for fallback
    const siteInfoResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/site-info`, {
      headers: {
        'Accept': 'application/json',
      },
    })

    let siteInfo = null
    if (siteInfoResponse.ok) {
      siteInfo = await siteInfoResponse.json()
    }

    // Process logo data
    const processedLogoData = {
      // Custom logo (if set in WordPress)
      custom_logo: logoData.custom_logo || null,
      
      // Site icon (favicon)
      site_icon: logoData.site_icon || null,
      
      // Header logo
      header_logo: logoData.header_logo || null,
      
      // Footer logo
      footer_logo: logoData.footer_logo || null,
      
      // Default logo fallback
      default_logo: {
        url: '/logo.svg',
        type: 'default'
      },
      
      // Site branding info
      branding: {
        site_name: siteInfo?.name || 'NextGen Ecommerce',
        site_description: siteInfo?.tagline || 'Headless WooCommerce for Next-Gen eCommerce',
        site_url: siteInfo?.url || wordpressUrl
      }
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return res.status(200).json({
      success: true,
      data: processedLogoData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Logo API error:', error)
    
    // Return fallback data
    return res.status(200).json({
      success: true,
      data: {
        custom_logo: null,
        site_icon: null,
        header_logo: null,
        footer_logo: null,
        default_logo: {
          url: '/logo.svg',
          type: 'default'
        },
        branding: {
          site_name: 'NextGen Ecommerce',
          site_description: 'Headless WooCommerce for Next-Gen eCommerce',
          site_url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
        }
      },
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
