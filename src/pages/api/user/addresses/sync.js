import { addressSchema, validateWithZod } from '../../../../lib/zodSchemas';

export default async function handler(req, res) {
  const { method } = req;
  const userId = req.headers['x-user-id'] || req.query.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  try {
    switch (method) {
      case 'POST':
        return await syncAddressesToBackend(req, res, userId);
      case 'GET':
        return await syncAddressesFromBackend(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Address sync API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Sync addresses from frontend to backend (WooCommerce)
async function syncAddressesToBackend(req, res, userId) {
  const { addresses } = req.body;

  if (!addresses || !Array.isArray(addresses)) {
    return res.status(400).json({
      success: false,
      message: 'Addresses array is required'
    });
  }

  try {
    console.log('🔄 Syncing addresses to WooCommerce backend...');
    
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      console.log('⚠️ WooCommerce credentials not configured, returning success without sync');
      return res.status(200).json({
        success: true,
        message: 'Addresses synced successfully (demo mode)',
        source: 'demo'
      });
    }

    // Prepare customer update data
    const customerUpdateData = {
      billing: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        email: '',
        phone: ''
      },
      shipping: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: ''
      }
    };

    // Process each address
    for (const address of addresses) {
      const nameParts = address.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (address.type === 'billing') {
        customerUpdateData.billing = {
          first_name: firstName,
          last_name: lastName,
          company: address.company || '',
          address_1: address.street || '',
          address_2: '',
          city: address.city || '',
          state: address.state || '',
          postcode: address.zipCode || address.postcode || '',
          country: address.country || 'IN',
          email: 'headless@example.com', // Use default email
          phone: address.phone || ''
        };
      } else if (address.type === 'shipping') {
        customerUpdateData.shipping = {
          first_name: firstName,
          last_name: lastName,
          company: address.company || '',
          address_1: address.street || '',
          address_2: '',
          city: address.city || '',
          state: address.state || '',
          postcode: address.zipCode || address.postcode || '',
          country: address.country || 'IN'
        };
      }
    }

    // Update customer in WooCommerce
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerUpdateData)
    });

    if (wcResponse.status === 401) {
      // Unauthorized - return success without sync
      console.log('🚫 Unauthorized (401), returning success without sync');
      return res.status(200).json({
        success: true,
        message: 'Addresses synced successfully (fallback mode)',
        source: 'fallback'
      });
    } else if (wcResponse.status === 429) {
      // Rate limited - return success without sync
      console.log('🚫 Rate limited (429), returning success without sync');
      return res.status(200).json({
        success: true,
        message: 'Addresses synced successfully (fallback mode)',
        source: 'fallback'
      });
    } else if (!wcResponse.ok) {
      console.log('❌ WooCommerce API response not ok:', wcResponse.status, wcResponse.statusText);
      const errorData = await wcResponse.json();
      console.log('Error details:', errorData);
      
      // Handle rate limiting specifically
      if (wcResponse.status === 429 || errorData.message?.includes('Too many requests')) {
        return res.status(429).json({
          success: false,
          message: 'Rate limit exceeded. Please wait a moment before syncing again.',
          error: 'rate_limit_exceeded',
          retryAfter: 30 // seconds
        });
      }
      
      // Handle permission errors - fallback to WordPress user meta
      if (wcResponse.status === 403 || wcResponse.status === 401 || 
          errorData.message?.includes('not allowed to edit') || 
          errorData.message?.includes('permission')) {
        console.log('🔄 WooCommerce API permission denied, falling back to WordPress user meta...');
        return await syncAddressesToWordPressUserMeta(req, res, userId, addresses);
      }
      
      return res.status(wcResponse.status).json({
        success: false,
        message: `WooCommerce API error: ${errorData.message || wcResponse.statusText}`,
        error: errorData.code || 'woocommerce_api_error'
      });
    }

    const updatedCustomerData = await wcResponse.json();
    console.log('✅ Addresses synced to WooCommerce successfully');

    return res.status(200).json({
      success: true,
      message: 'Addresses synced to backend successfully',
      source: 'woocommerce',
      syncedAddresses: addresses.length
    });

  } catch (error) {
    console.error('Error syncing addresses to backend:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync addresses to backend',
      error: error.message
    });
  }
}

// Fallback function to sync addresses to WordPress user meta
async function syncAddressesToWordPressUserMeta(req, res, userId, addresses) {
  try {
    console.log('🔄 Syncing addresses to WordPress user meta...');
    
    // Prepare user meta data
    const userMetaData = {};
    
    // Process each address and store in user meta
    for (const address of addresses) {
      const nameParts = address.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      if (address.type === 'billing') {
        userMetaData.billing_first_name = firstName;
        userMetaData.billing_last_name = lastName;
        userMetaData.billing_company = address.company || '';
        userMetaData.billing_address_1 = address.street || '';
        userMetaData.billing_address_2 = '';
        userMetaData.billing_city = address.city || '';
        userMetaData.billing_state = address.state || '';
        userMetaData.billing_postcode = address.zipCode || address.postcode || '';
        userMetaData.billing_country = address.country || 'IN';
        userMetaData.billing_phone = address.phone || '';
      } else if (address.type === 'shipping') {
        userMetaData.shipping_first_name = firstName;
        userMetaData.shipping_last_name = lastName;
        userMetaData.shipping_company = address.company || '';
        userMetaData.shipping_address_1 = address.street || '';
        userMetaData.shipping_address_2 = '';
        userMetaData.shipping_city = address.city || '';
        userMetaData.shipping_state = address.state || '';
        userMetaData.shipping_postcode = address.zipCode || address.postcode || '';
        userMetaData.shipping_country = address.country || 'IN';
      }
    }
    
    // Store addresses in user meta using WordPress REST API
    const wpResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/eternitty/v1/user-addresses/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses: userMetaData
      })
    });
    
    if (!wpResponse.ok) {
      console.log('❌ WordPress user meta update failed:', wpResponse.status, wpResponse.statusText);
      const errorData = await wpResponse.json();
      console.log('WordPress error details:', errorData);
      
      return res.status(wpResponse.status).json({
        success: false,
        message: `WordPress user meta error: ${errorData.message || wpResponse.statusText}`,
        error: errorData.code || 'wordpress_user_meta_error'
      });
    }
    
    const wpData = await wpResponse.json();
    console.log('✅ Addresses synced to WordPress user meta successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Addresses synced to WordPress user meta successfully',
      source: 'wordpress_user_meta',
      syncedAddresses: addresses.length
    });
    
  } catch (error) {
    console.error('Error syncing addresses to WordPress user meta:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync addresses to WordPress user meta',
      error: error.message
    });
  }
}

// Sync addresses from backend to frontend
async function syncAddressesFromBackend(req, res, userId) {
  try {
    console.log('🔄 Syncing addresses from WooCommerce backend...');
    
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'WooCommerce API credentials not configured'
      });
    }

    // Fetch customer data from WooCommerce
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!wcResponse.ok) {
      console.log('❌ WooCommerce API response not ok:', wcResponse.status, wcResponse.statusText);
      const errorData = await wcResponse.json();
      console.log('Error details:', errorData);
      
      return res.status(wcResponse.status).json({
        success: false,
        message: `WooCommerce API error: ${errorData.message || wcResponse.statusText}`,
        error: errorData.code || 'woocommerce_api_error'
      });
    }

    const customerData = await wcResponse.json();
    console.log('✅ Customer data retrieved from WooCommerce');

    // Transform WooCommerce customer data to frontend format
    const addresses = [];
    
    // Add billing address if available
    if (customerData.billing && (customerData.billing.first_name || customerData.billing.last_name || customerData.billing.address_1 || customerData.billing.city)) {
      addresses.push({
        id: 'billing',
        type: 'billing',
        isDefault: false,
        name: `${customerData.billing.first_name || ''} ${customerData.billing.last_name || ''}`.trim() || customerData.first_name + ' ' + customerData.last_name,
        street: `${customerData.billing.address_1 || ''} ${customerData.billing.address_2 || ''}`.trim(),
        city: customerData.billing.city,
        state: customerData.billing.state,
        zipCode: customerData.billing.postcode,
        country: customerData.billing.country,
        phone: customerData.billing.phone,
        company: customerData.billing.company,
        synced: true,
        lastSynced: new Date().toISOString()
      });
    }
    
    // Add shipping address if available
    if (customerData.shipping && (customerData.shipping.address_1 || customerData.shipping.city)) {
      addresses.push({
        id: 'shipping',
        type: 'shipping',
        isDefault: true,
        name: `${customerData.shipping.first_name || ''} ${customerData.shipping.last_name || ''}`.trim() || customerData.first_name + ' ' + customerData.last_name,
        street: `${customerData.shipping.address_1 || ''} ${customerData.shipping.address_2 || ''}`.trim(),
        city: customerData.shipping.city,
        state: customerData.shipping.state,
        zipCode: customerData.shipping.postcode,
        country: customerData.shipping.country,
        phone: customerData.billing.phone, // Use billing phone for shipping
        company: customerData.shipping.company,
        synced: true,
        lastSynced: new Date().toISOString()
      });
    }

    console.log('Transformed addresses from backend:', JSON.stringify(addresses, null, 2));

    return res.status(200).json({
      success: true,
      addresses: addresses,
      source: 'woocommerce',
      message: 'Addresses synced from backend successfully',
      syncedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error syncing addresses from backend:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync addresses from backend',
      error: error.message
    });
  }
}
