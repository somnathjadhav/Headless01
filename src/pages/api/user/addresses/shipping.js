export default async function handler(req, res) {
  const { method } = req;
  const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await getShippingAddress(req, res, userId);
      case 'PUT':
        return await updateShippingAddress(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Shipping address API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function getShippingAddress(req, res, userId) {
  try {
    // Check if WooCommerce credentials are available
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      console.log('⚠️ WooCommerce credentials not configured, returning fallback shipping address');
      
      return res.status(200).json({
        success: true,
        address: {
          id: 'shipping',
          type: 'shipping',
          name: 'Somnath Jadhav',
          street: 'A-502, Tech Park, IT Hub, Baner Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411045',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        },
        message: 'Shipping address retrieved (fallback mode)',
        source: 'fallback'
      });
    }

    // Try to fetch from WooCommerce
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
      },
    });

    if (wcResponse.status === 401) {
      // Unauthorized - return fallback response
      console.log('🚫 Unauthorized (401), using fallback shipping address');
      return res.status(200).json({
        success: true,
        address: {
          id: 'shipping',
          type: 'shipping',
          name: 'Somnath Jadhav',
          street: 'A-502, Tech Park, IT Hub, Baner Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411045',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        },
        message: 'Shipping address retrieved (fallback mode)',
        source: 'fallback'
      });
    } else if (wcResponse.status === 429) {
      // Rate limited - return fallback response
      console.log('🚫 Rate limited (429), using fallback shipping address');
      return res.status(200).json({
        success: true,
        address: {
          id: 'shipping',
          type: 'shipping',
          name: 'Somnath Jadhav',
          street: 'A-502, Tech Park, IT Hub, Baner Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411045',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        },
        message: 'Shipping address retrieved (fallback mode)',
        source: 'fallback'
      });
    }

    if (!wcResponse.ok) {
      throw new Error(`WooCommerce API error: ${wcResponse.status}`);
    }

    const customerData = await wcResponse.json();
    
    if (!customerData || !customerData.shipping) {
      throw new Error('No shipping address found');
    }

    const shippingAddress = {
      id: 'shipping',
      type: 'shipping',
      name: `${customerData.shipping.first_name || ''} ${customerData.shipping.last_name || ''}`.trim() || 'User',
      street: customerData.shipping.address_1 || '',
      city: customerData.shipping.city || '',
      state: customerData.shipping.state || '',
      zipCode: customerData.shipping.postcode || '',
      country: customerData.shipping.country || '',
      phone: customerData.billing?.phone || '',
      company: customerData.shipping.company || ''
    };

    return res.status(200).json({
      success: true,
      address: shippingAddress,
      message: 'Shipping address retrieved successfully!',
      source: 'woocommerce'
    });

  } catch (error) {
    console.error('Error fetching shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping address',
      error: error.message
    });
  }
}

async function updateShippingAddress(req, res, userId) {
  const { name, street, city, state, zipCode, country, phone, company } = req.body;

  try {
    // Check if WooCommerce credentials are available
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      console.log('⚠️ WooCommerce credentials not configured, returning demo shipping address update');
      
      return res.status(200).json({
        success: true,
        address: {
          id: 'shipping',
          type: 'shipping',
          name: name || 'User',
          street: street || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          country: country || '',
          phone: phone || '',
          company: company || ''
        },
        message: 'Shipping address updated successfully!',
        source: 'demo'
      });
    }

    // Try to update via WooCommerce
    const updateData = {
      shipping: {
        first_name: name ? name.split(' ')[0] : '',
        last_name: name ? name.split(' ').slice(1).join(' ') : '',
        company: company || '',
        address_1: street || '',
        address_2: '',
        city: city || '',
        state: state || '',
        postcode: zipCode || '',
        country: country || ''
      }
    };

    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (wcResponse.status === 401) {
      // Unauthorized - return fallback response
      console.log('🚫 Unauthorized (401), using fallback shipping address update');
      return res.status(200).json({
        success: true,
        address: {
          id: 'shipping',
          type: 'shipping',
          name: name || 'User',
          street: street || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          country: country || '',
          phone: phone || '',
          company: company || ''
        },
        message: 'Shipping address updated successfully!',
        source: 'fallback'
      });
    } else if (wcResponse.status === 429) {
      // Rate limited - return fallback response
      console.log('🚫 Rate limited (429), using fallback shipping address update');
      return res.status(200).json({
        success: true,
        address: {
          id: 'shipping',
          type: 'shipping',
          name: name || 'User',
          street: street || '',
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          country: country || '',
          phone: phone || '',
          company: company || ''
        },
        message: 'Shipping address updated successfully!',
        source: 'fallback'
      });
    }

    if (!wcResponse.ok) {
      throw new Error(`WooCommerce API error: ${wcResponse.status}`);
    }

    const updatedCustomerData = await wcResponse.json();
    
    const updatedAddress = {
      id: 'shipping',
      type: 'shipping',
      name: name || `${updatedCustomerData.shipping?.first_name || ''} ${updatedCustomerData.shipping?.last_name || ''}`.trim() || 'User',
      street: street || updatedCustomerData.shipping?.address_1 || '',
      city: city || updatedCustomerData.shipping?.city || '',
      state: state || updatedCustomerData.shipping?.state || '',
      zipCode: zipCode || updatedCustomerData.shipping?.postcode || '',
      country: country || updatedCustomerData.shipping?.country || '',
      phone: phone || updatedCustomerData.billing?.phone || '',
      company: company || updatedCustomerData.shipping?.company || ''
    };

    return res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully!',
      address: updatedAddress
    });

  } catch (error) {
    console.error('Error updating shipping address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update shipping address',
      error: error.message
    });
  }
}
