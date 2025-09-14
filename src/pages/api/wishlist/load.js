import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('❤️ Loading wishlist from WordPress for user:', userId);

    // Create WooCommerce client
    const client = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://woo.local',
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
      version: 'wc/v3',
      queryStringAuth: false,
    });

    // Get customer data including meta data
    const response = await client.get(`customers/${userId}`);

    if (response.status === 200) {
      const customer = response.data;
      
      // Find saved wishlist in meta data
      const savedWishlistMeta = customer.meta_data?.find(meta => meta.key === 'saved_wishlist');
      
      let wishlistData = [];
      if (savedWishlistMeta && savedWishlistMeta.value) {
        try {
          wishlistData = JSON.parse(savedWishlistMeta.value);
          console.log('✅ Wishlist loaded successfully from WordPress:', wishlistData.length, 'items');
        } catch (parseError) {
          console.error('❌ Error parsing saved wishlist data:', parseError);
          wishlistData = [];
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Wishlist loaded successfully',
        data: {
          userId,
          wishlist: wishlistData,
          itemCount: wishlistData.length,
          loadedAt: new Date().toISOString()
        }
      });
    } else {
      throw new Error(`Failed to load wishlist: ${response.status}`);
    }

  } catch (error) {
    console.error('❌ Error loading wishlist from WordPress:', error);
    
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

    // Provide fallback empty wishlist when WooCommerce is not configured
    console.log('⚠️ WooCommerce not configured, providing empty wishlist');
    
    return res.status(200).json({
      success: true,
      message: 'Wishlist loaded successfully (fallback)',
      data: {
        userId: req.query.userId,
        wishlist: [],
        itemCount: 0,
        loadedAt: new Date().toISOString(),
        source: 'fallback'
      }
    });
  }
}

