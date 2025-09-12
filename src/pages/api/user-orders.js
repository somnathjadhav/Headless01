export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_WORDPRESS_URL || !process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'WooCommerce credentials not configured'
      });
    }

    // Fetch orders from WooCommerce for the specific user
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders?customer=${userId}&per_page=50`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const orders = await response.json();

    // Transform WooCommerce orders to match our frontend format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      number: order.number,
      date: order.date_created,
      status: order.status,
      total: parseFloat(order.total),
      currency: order.currency,
      items: order.line_items.map(item => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total),
        image: item.image?.src || '/placeholder-product.svg'
      })),
      billing: {
        first_name: order.billing?.first_name || '',
        last_name: order.billing?.last_name || '',
        company: order.billing?.company || '',
        address_1: order.billing?.address_1 || '',
        address_2: order.billing?.address_2 || '',
        city: order.billing?.city || '',
        state: order.billing?.state || '',
        postcode: order.billing?.postcode || '',
        country: order.billing?.country || '',
        email: order.billing?.email || '',
        phone: order.billing?.phone || ''
      },
      shipping: {
        first_name: order.shipping?.first_name || '',
        last_name: order.shipping?.last_name || '',
        company: order.shipping?.company || '',
        address_1: order.shipping?.address_1 || '',
        address_2: order.shipping?.address_2 || '',
        city: order.shipping?.city || '',
        state: order.shipping?.state || '',
        postcode: order.shipping?.postcode || '',
        country: order.shipping?.country || ''
      },
      paymentMethod: order.payment_method_title || 'Unknown',
      paymentStatus: order.payment_status || 'unknown',
      trackingNumber: null, // WooCommerce doesn't provide tracking by default
      notes: order.customer_note || '',
      dateModified: order.date_modified,
      dateCompleted: order.date_completed
    }));

    console.log('User orders fetched:', {
      userId,
      ordersCount: transformedOrders.length,
      orders: transformedOrders.map(o => ({ id: o.id, number: o.number, status: o.status, total: o.total }))
    });

    return res.status(200).json({
      success: true,
      orders: transformedOrders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
}

