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

    // Check if WordPress server is available
    if (!process.env.NEXT_PUBLIC_WORDPRESS_URL || !process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      console.log('WordPress server not configured, returning mock orders');
      
      // Return mock orders for development/demo purposes
      const mockOrders = [
        {
          id: 1,
          number: '1001',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          total: 89.99,
          currency: 'USD',
          items: [
            {
              id: 1,
              name: 'Premium Cotton T-Shirt',
              quantity: 2,
              price: 29.99,
              total: 59.98,
              image: '/placeholder-product.svg'
            },
            {
              id: 2,
              name: 'Denim Jeans',
              quantity: 1,
              price: 29.99,
              total: 29.99,
              image: '/placeholder-product.svg'
            }
          ],
          billing: {
            first_name: 'Somnath',
            last_name: 'Jadhav',
            email: 'somnathhjadhav@gmail.com',
            phone: '+919270153230',
            address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
            city: 'Pune',
            state: 'Maharashtra',
            postcode: '412308',
            country: 'IN'
          },
          shipping: {
            first_name: 'Somnath',
            last_name: 'Doe',
            address_1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postcode: '10001',
            country: 'US'
          },
          paymentMethod: 'Credit Card',
          paymentStatus: 'paid',
          trackingNumber: 'TRK123456789',
          notes: 'Please deliver during business hours',
          dateModified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          dateCompleted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          number: '1002',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'processing',
          total: 45.50,
          currency: 'USD',
          items: [
            {
              id: 3,
              name: 'Running Shoes',
              quantity: 1,
              price: 45.50,
              total: 45.50,
              image: '/placeholder-product.svg'
            }
          ],
          billing: {
            first_name: 'Somnath',
            last_name: 'Jadhav',
            email: 'somnathhjadhav@gmail.com',
            phone: '+919270153230',
            address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
            city: 'Pune',
            state: 'Maharashtra',
            postcode: '412308',
            country: 'IN'
          },
          shipping: {
            first_name: 'Somnath',
            last_name: 'Doe',
            address_1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postcode: '10001',
            country: 'US'
          },
          paymentMethod: 'PayPal',
          paymentStatus: 'paid',
          trackingNumber: null,
          notes: '',
          dateModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dateCompleted: null
        }
      ];

      return res.status(200).json({
        success: true,
        orders: mockOrders,
        message: 'Mock orders returned (WordPress server not configured)'
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
      // If WordPress server is not accessible or rate limited, return mock orders
      if (response.status === 401 || response.status === 404 || response.status === 429 || response.status >= 500) {
        console.log('WordPress server not accessible, returning mock orders');
        
        const mockOrders = [
          {
            id: 1,
            number: '1001',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            total: 89.99,
            currency: 'USD',
            items: [
              {
                id: 1,
                name: 'Premium Cotton T-Shirt',
                quantity: 2,
                price: 29.99,
                total: 59.98,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop&crop=center'
              },
              {
                id: 2,
                name: 'Denim Jeans',
                quantity: 1,
                price: 29.99,
                total: 29.99,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop&crop=center'
              }
            ],
            billing: {
              first_name: 'Somnath',
              last_name: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              address_1: '123 Main St',
              city: 'New York',
              state: 'NY',
              postcode: '10001',
              country: 'US'
            },
            shipping: {
              first_name: 'Somnath',
              last_name: 'Doe',
              address_1: '123 Main St',
              city: 'New York',
              state: 'NY',
              postcode: '10001',
              country: 'US'
            },
            paymentMethod: 'Credit Card',
            paymentStatus: 'paid',
            trackingNumber: 'TRK123456789',
            notes: 'Please deliver during business hours',
            dateModified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            dateCompleted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            number: '1002',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'processing',
            total: 45.50,
            currency: 'USD',
            items: [
              {
                id: 3,
                name: 'Running Shoes',
                quantity: 1,
                price: 45.50,
                total: 45.50,
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&crop=center'
              }
            ],
            billing: {
              first_name: 'Somnath',
              last_name: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              address_1: '123 Main St',
              city: 'New York',
              state: 'NY',
              postcode: '10001',
              country: 'US'
            },
            shipping: {
              first_name: 'Somnath',
              last_name: 'Doe',
              address_1: '123 Main St',
              city: 'New York',
              state: 'NY',
              postcode: '10001',
              country: 'US'
            },
            paymentMethod: 'PayPal',
            paymentStatus: 'paid',
            trackingNumber: null,
            notes: '',
            dateModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            dateCompleted: null
          }
        ];

        return res.status(200).json({
          success: true,
          orders: mockOrders,
          message: 'Mock orders returned (WordPress server not accessible)'
        });
      }
      
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

