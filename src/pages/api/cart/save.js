import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { userId, cartData } = req.body;

    // Validate required fields
    if (!userId || !cartData) {
      return res.status(400).json({
        success: false,
        message: 'User ID and cart data are required'
      });
    }

    console.log('🛒 Saving cart to WordPress for user:', userId, 'Items:', cartData.length);
    console.log('🔑 WooCommerce credentials check:', {
      hasConsumerKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
      hasConsumerSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
      wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local'
    });
    
    // Validate user ID format
    if (isNaN(userId) || userId <= 0) {
      console.log('❌ Invalid user ID format:', userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    // Create WooCommerce client
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Save cart data as customer meta
    const metaData = {
      key: 'saved_cart',
      value: JSON.stringify(cartData)
    };

    // Update customer meta data
    const response = await client.put(`customers/${userId}`, {
      meta_data: [metaData]
    });

    if (response.status === 200) {
      console.log('✅ Cart saved successfully to WordPress');
      return res.status(200).json({
        success: true,
        message: 'Cart saved successfully',
        data: {
          userId,
          itemCount: cartData.length,
          savedAt: new Date().toISOString()
        }
      });
    } else {
      throw new Error(`Failed to save cart: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Error saving cart to WordPress:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - check WooCommerce credentials'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to save cart',
      error: error.message
    });
  }
}

