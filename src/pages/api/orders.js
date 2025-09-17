import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orderData = req.body;

    // Log environment variables for debugging
    console.log('Orders API - Environment check:', {
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

    // Log order data for debugging
    console.log('Orders API - Creating order with data:', {
      customer_id: orderData.customer_id,
      billing: {
        first_name: orderData.billing?.first_name,
        last_name: orderData.billing?.last_name,
        email: orderData.billing?.email,
        phone: orderData.billing?.phone
      },
      items_count: orderData.line_items?.length || 0,
      total: orderData.total
    });

    // Validate and clean line items
    const validLineItems = orderData.line_items?.filter(item => 
      item.product_id && 
      item.quantity && 
      item.price && 
      item.price !== '' && 
      !isNaN(parseFloat(item.price))
    ) || [];

    if (validLineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid line items found',
        error: 'All line items must have valid product_id, quantity, and price'
      });
    }

    console.log('Orders API - Validated line items:', {
      original_count: orderData.line_items?.length || 0,
      valid_count: validLineItems.length,
      items: validLineItems
    });

    // Create the order in WooCommerce
    const response = await WooCommerce.post('orders', {
      customer_id: orderData.customer_id,
      payment_method: orderData.payment_method,
      payment_method_title: orderData.payment_method_title,
      set_paid: orderData.set_paid || false,
      billing: orderData.billing,
      shipping: orderData.shipping,
      line_items: validLineItems,
      shipping_lines: orderData.shipping_lines || [],
      fee_lines: orderData.fee_lines || [],
      coupon_lines: orderData.coupon_lines || [],
      total: orderData.total || '0.00'
    });

    if (response.status === 201) {
      const order = response.data;
      console.log('Order created successfully:', {
        id: order.id,
        number: order.number,
        status: order.status,
        total: order.total
      });
      
      return res.status(201).json({
        success: true,
        order: {
          id: order.id,
          number: order.number,
          status: order.status,
          total: order.total,
          date_created: order.date_created
        }
      });
    } else {
      throw new Error('Failed to create order');
    }

  } catch (error) {
    console.error('Order creation error:', error);
    
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
      message: 'Failed to create order',
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
}
