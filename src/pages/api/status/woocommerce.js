export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    
    if (!wordpressUrl) {
      return res.status(200).json({
        success: false,
        message: 'WordPress URL not configured'
      });
    }

    if (!consumerKey || !consumerSecret) {
      return res.status(200).json({
        success: false,
        message: 'WooCommerce API keys not configured',
        data: {
          status: 'needs_setup',
          requires: ['consumer_key', 'consumer_secret']
        }
      });
    }

    // Test WooCommerce API connection
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await fetch(`${wordpressUrl}/wp-json/wc/v3/`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'WooCommerce API is accessible',
        data: {
          status: 'installed',
          apiVersion: 'v3'
        }
      });
    } else if (response.status === 401) {
      return res.status(200).json({
        success: false,
        message: 'WooCommerce API keys are invalid',
        data: {
          status: 'auth_error',
          statusCode: response.status
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'WooCommerce API is not accessible',
        data: {
          status: 'error',
          statusCode: response.status
        }
      });
    }
  } catch (error) {
    console.error('WooCommerce status check error:', error);
    return res.status(200).json({
      success: false,
      message: 'WooCommerce connection failed',
      error: error.message
    });
  }
}
