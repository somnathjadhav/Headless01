/**
 * System Status API Route
 * Provides comprehensive status of WordPress backend and WooCommerce
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local';
    const woocommerceUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local';
    
    // Check WordPress backend connection
    let wordpressStatus = 'unknown';
    let wordpressError = null;
    
    try {
      const wpResponse = await fetch(`${wordpressUrl}/wp-json/`);
      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        wordpressStatus = 'connected';
      } else {
        wordpressStatus = 'error';
        wordpressError = `HTTP ${wpResponse.status}`;
      }
    } catch (error) {
      wordpressStatus = 'failed';
      wordpressError = error.message;
    }

    // Check WooCommerce status
    let woocommerceStatus = 'unknown';
    let woocommerceError = null;
    let productCount = 0;
    
    try {
      const wcResponse = await fetch(`${woocommerceUrl}/wp-json/wc/v3/products?consumer_key=${process.env.WOOCOMMERCE_CONSUMER_KEY}&consumer_secret=${process.env.WOOCOMMERCE_CONSUMER_SECRET}`);
      if (wcResponse.ok) {
        const wcData = await wcResponse.json();
        woocommerceStatus = 'active';
        productCount = Array.isArray(wcData) ? wcData.length : 0;
      } else {
        woocommerceStatus = 'error';
        woocommerceError = `HTTP ${wcResponse.status}`;
      }
    } catch (error) {
      woocommerceStatus = 'failed';
      woocommerceError = error.message;
    }

    // Check Typography API
    let typographyStatus = 'unknown';
    let typographyError = null;
    
    try {
      const typographyResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/typography`);
      if (typographyResponse.ok) {
        const typographyData = await typographyResponse.json();
        typographyStatus = 'active';
      } else {
        typographyStatus = 'error';
        typographyError = `HTTP ${typographyResponse.status}`;
      }
    } catch (error) {
      typographyStatus = 'failed';
      typographyError = error.message;
    }

    // Check Colors API
    let colorsStatus = 'unknown';
    let colorsError = null;
    
    try {
      const colorsResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/colors`);
      if (colorsResponse.ok) {
        const colorsData = await colorsResponse.json();
        colorsStatus = 'active';
      } else {
        colorsStatus = 'error';
        colorsError = `HTTP ${colorsResponse.status}`;
      }
    } catch (error) {
      colorsStatus = 'failed';
      colorsError = error.message;
    }

    const systemStatus = {
      timestamp: new Date().toISOString(),
      frontend: {
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
      },
      wordpress: {
        status: wordpressStatus,
        url: wordpressUrl,
        error: wordpressError
      },
      woocommerce: {
        status: woocommerceStatus,
        url: woocommerceUrl,
        productCount: productCount,
        error: woocommerceError
      },
      customApis: {
        typography: {
          status: typographyStatus,
          error: typographyError
        },
        colors: {
          status: colorsStatus,
          error: colorsError
        }
      }
    };

    res.status(200).json(systemStatus);
  } catch (error) {
    console.error('System status check error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
