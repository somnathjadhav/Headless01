import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { userId, wishlistData } = req.body;

    // Validate required fields
    if (!userId || !wishlistData) {
      return res.status(400).json({
        success: false,
        message: 'User ID and wishlist data are required'
      });
    }

    console.log('❤️ Saving wishlist to WordPress for user:', userId, 'Items:', wishlistData.length);

    // Create WooCommerce client
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Save wishlist data as customer meta
    const metaData = {
      key: 'saved_wishlist',
      value: JSON.stringify(wishlistData)
    };

    // Update customer meta data
    const response = await client.put(`customers/${userId}`, {
      meta_data: [metaData]
    });

    if (response.status === 200) {
      console.log('✅ Wishlist saved successfully to WordPress');
      return res.status(200).json({
        success: true,
        message: 'Wishlist saved successfully',
        data: {
          userId,
          itemCount: wishlistData.length,
          savedAt: new Date().toISOString()
        }
      });
    } else {
      throw new Error(`Failed to save wishlist: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Error saving wishlist to WordPress:', error);
    
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
        message: 'Unauthorized access'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to save wishlist',
      error: error.message
    });
  }
}

