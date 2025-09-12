export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing WooCommerce API connection...');
    
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local';
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
    
    console.log('🔑 Credentials check:', {
      hasConsumerKey: !!consumerKey,
      hasConsumerSecret: !!consumerSecret,
      wordpressUrl
    });
    
    if (!consumerKey || !consumerSecret) {
      return res.status(200).json({
        success: false,
        message: 'WooCommerce credentials not configured',
        credentials: {
          hasConsumerKey: !!consumerKey,
          hasConsumerSecret: !!consumerSecret
        }
      });
    }
    
    // Test WooCommerce API connection
    const testResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers?per_page=1`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`
      }
    });
    
    console.log('🧪 WooCommerce API test response status:', testResponse.status);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      return res.status(200).json({
        success: true,
        message: 'WooCommerce API connection successful',
        data: {
          status: testResponse.status,
          customerCount: data.length
        }
      });
    } else {
      const errorText = await testResponse.text();
      return res.status(200).json({
        success: false,
        message: 'WooCommerce API connection failed',
        error: {
          status: testResponse.status,
          message: errorText
        }
      });
    }
    
  } catch (error) {
    console.error('🧪 WooCommerce API test error:', error);
    return res.status(500).json({
      success: false,
      message: 'WooCommerce API test failed',
      error: error.message
    });
  }
}