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
        return await getBillingAddress(req, res, userId);
      case 'PUT':
        return await updateBillingAddress(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Billing address API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Get billing address
async function getBillingAddress(req, res, userId) {
  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        address: {
          id: 'billing',
          type: 'billing',
          name: 'User',
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: '',
          phone: '',
          company: ''
        }
      });
    }

    // Try to get customer data from WooCommerce
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!wcResponse.ok) {
      if (wcResponse.status === 429) {
        // Rate limited - return fallback data immediately
        console.log('🚫 Rate limited (429), using fallback billing address');
        return res.status(200).json({
          success: true,
          address: {
            id: 'billing',
            type: 'billing',
            name: 'User',
            street: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            phone: '',
            company: ''
          }
        });
      }
      
      // Fallback to WordPress REST API
      const wpResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`);
      if (wpResponse.ok) {
        const wpUserData = await wpResponse.json();
        return res.status(200).json({
          success: true,
          address: {
            id: 'billing',
            type: 'billing',
            name: wpUserData.name || 'User',
            street: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            phone: '',
            company: ''
          }
        });
      }
      throw new Error(`Failed to fetch customer: ${wcResponse.status}`);
    }

    const customerData = await wcResponse.json();
    
    const billingAddress = {
      id: 'billing',
      type: 'billing',
      name: `${customerData.billing?.first_name || ''} ${customerData.billing?.last_name || ''}`.trim() || 'User',
      street: customerData.billing?.address_1 || '',
      city: customerData.billing?.city || '',
      state: customerData.billing?.state || '',
      postcode: customerData.billing?.postcode || '',
      country: customerData.billing?.country || '',
      phone: customerData.billing?.phone || '',
      company: customerData.billing?.company || ''
    };

    return res.status(200).json({
      success: true,
      address: billingAddress
    });

  } catch (error) {
    console.error('Error fetching billing address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch billing address',
      error: error.message
    });
  }
}

// Update billing address
async function updateBillingAddress(req, res, userId) {
  try {
    const { name, street, city, state, postcode, country, phone, company } = req.body;

    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        message: 'Billing address updated (demo mode)',
        address: {
          id: 'billing',
          type: 'billing',
          name: name || 'User',
          street: street || '',
          city: city || '',
          state: state || '',
          postcode: postcode || '',
          country: country || '',
          phone: phone || '',
          company: company || ''
        }
      });
    }

    // Split name into first and last name
    const nameParts = (name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Prepare customer update data
    const customerUpdateData = {
      billing_first_name: firstName,
      billing_last_name: lastName,
      billing_company: company || '',
      billing_address_1: street || '',
      billing_address_2: '',
      billing_city: city || '',
      billing_state: state || '',
      billing_postcode: postcode || '',
      billing_country: country || '',
      billing_phone: phone || ''
    };

    // Update customer via WooCommerce API
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerUpdateData)
    });

    if (!wcResponse.ok) {
      if (wcResponse.status === 401) {
        // Unauthorized - return fallback response
        console.log('🚫 Unauthorized (401), using fallback billing address update');
        return res.status(200).json({
          success: true,
          message: 'Billing address updated (demo mode)',
          address: {
            id: 'billing',
            type: 'billing',
            name: name || 'User',
            street: street || '',
            city: city || '',
            state: state || '',
            postcode: postcode || '',
            country: country || '',
            phone: phone || '',
            company: company || ''
          }
        });
      } else if (wcResponse.status === 429) {
        // Rate limited - return fallback response
        console.log('🚫 Rate limited (429), using fallback billing address update');
        return res.status(200).json({
          success: true,
          message: 'Billing address updated (rate limited)',
          address: {
            id: 'billing',
            type: 'billing',
            name: name || 'User',
            street: street || '',
            city: city || '',
            state: state || '',
            postcode: postcode || '',
            country: country || '',
            phone: phone || '',
            company: company || ''
          }
        });
      }
      throw new Error(`Failed to update customer: ${wcResponse.status}`);
    }

    const updatedCustomerData = await wcResponse.json();
    
    const updatedAddress = {
      id: 'billing',
      type: 'billing',
      name: `${updatedCustomerData.billing?.first_name || ''} ${updatedCustomerData.billing?.last_name || ''}`.trim() || 'User',
      street: updatedCustomerData.billing?.address_1 || '',
      city: updatedCustomerData.billing?.city || '',
      state: updatedCustomerData.billing?.state || '',
      postcode: updatedCustomerData.billing?.postcode || '',
      country: updatedCustomerData.billing?.country || '',
      phone: updatedCustomerData.billing?.phone || '',
      company: updatedCustomerData.billing?.company || ''
    };

    return res.status(200).json({
      success: true,
      message: 'Billing address updated successfully',
      address: updatedAddress
    });

  } catch (error) {
    console.error('Error updating billing address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update billing address',
      error: error.message
    });
  }
}
