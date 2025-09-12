import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Log environment variables for debugging
    console.log('Orders API [id] - Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_WORDPRESS_URL,
      hasKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
      hasSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET,
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'Not set',
      keyLength: process.env.WOOCOMMERCE_CONSUMER_KEY?.length || 0,
      secretLength: process.env.WOOCOMMERCE_CONSUMER_SECRET?.length || 0
    });

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_WORDPRESS_URL || !process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      console.error('Missing WooCommerce credentials:', {
        hasUrl: !!process.env.NEXT_PUBLIC_WORDPRESS_URL,
        hasKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
        hasSecret: !!process.env.WOOCOMMERCE_CONSUMER_SECRET
      });
      return res.status(500).json({
        success: false,
        message: 'WooCommerce credentials not configured',
        error: 'Missing required environment variables'
      });
    }

    // Initialize WooCommerce API client
    const WooCommerce = new WooCommerceRestApi({
      url: process.env.NEXT_PUBLIC_WORDPRESS_URL,
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
      version: 'wc/v3'
    });

    console.log('Orders API [id] - Fetching order:', { orderId: id });

    // Fetch the order from WooCommerce
    const response = await WooCommerce.get(`orders/${id}`);

    if (response.status === 200) {
      const order = response.data;
      console.log('Order fetched successfully:', {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total
      });
      
      // Transform the order data to match our frontend expectations
      const transformedOrder = {
        id: order.id,
        number: order.number,
        date: order.date_created,
        status: order.status,
        total: order.total,
        currency: order.currency,
        paymentMethod: order.payment_method_title || order.payment_method || 'Credit Card',
        paymentStatus: order.status === 'completed' ? 'Paid' : 'Pending',
        billing: order.billing,
        shipping: order.shipping,
        items: order.line_items?.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          image: item.image?.src || '/placeholder-product.svg',
          taxRate: item.taxes?.[0]?.rate_percent || 0
        })) || [],
        shippingTotal: order.shipping_total,
        discountTotal: order.discount_total,
        taxTotal: order.total_tax
      };
      
      return res.status(200).json({
        success: true,
        order: transformedOrder
      });
    } else {
      throw new Error('Failed to fetch order');
    }

  } catch (error) {
    console.error('Order fetch error:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('WooCommerce API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
}

