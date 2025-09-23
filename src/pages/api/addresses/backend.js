import { z } from 'zod';

// Address schema for validation
const addressSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['billing', 'shipping']),
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export default async function handler(req, res) {
  const userId = req.headers['x-user-id'] || req.query.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized: User ID missing' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('🔄 Getting backend addresses for user:', userId);
    
    // Try multiple methods to get backend addresses
    const backendAddresses = await getBackendAddresses(userId);
    
    if (backendAddresses && backendAddresses.length > 0) {
      return res.status(200).json({
        success: true,
        addresses: backendAddresses,
        source: 'backend',
        message: 'Addresses loaded from backend'
      });
    }
    
    return res.status(200).json({
      success: true,
      addresses: [],
      source: 'backend',
      message: 'No backend addresses found'
    });
  } catch (error) {
    console.error('Error getting backend addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get backend addresses',
      error: error.message
    });
  }
}

// Try multiple methods to get backend addresses
async function getBackendAddresses(userId) {
  console.log('🔍 Attempting to get backend addresses...');
  
  // Method 1: Try WooCommerce API (if permissions are fixed)
  try {
    console.log('📡 Method 1: Trying WooCommerce API...');
    const wcAddresses = await getWooCommerceAddresses(userId);
    if (wcAddresses && wcAddresses.length > 0) {
      console.log('✅ WooCommerce API successful');
      return wcAddresses;
    }
  } catch (error) {
    console.log('❌ WooCommerce API failed:', error.message);
  }
  
  // Method 2: Try WordPress user meta (if available)
  try {
    console.log('📡 Method 2: Trying WordPress user meta...');
    const metaAddresses = await getWordPressUserMetaAddresses(userId);
    if (metaAddresses && metaAddresses.length > 0) {
      console.log('✅ WordPress user meta successful');
      return metaAddresses;
    }
  } catch (error) {
    console.log('❌ WordPress user meta failed:', error.message);
  }
  
  // Method 3: Try custom WordPress plugin endpoint
  try {
    console.log('📡 Method 3: Trying custom WordPress plugin...');
    const pluginAddresses = await getCustomPluginAddresses(userId);
    if (pluginAddresses && pluginAddresses.length > 0) {
      console.log('✅ Custom WordPress plugin successful');
      return pluginAddresses;
    }
  } catch (error) {
    console.log('❌ Custom WordPress plugin failed:', error.message);
  }
  
  // Method 4: Try WordPress REST API with user meta
  try {
    console.log('📡 Method 4: Trying WordPress REST API with meta...');
    const restAddresses = await getWordPressRESTAddresses(userId);
    if (restAddresses && restAddresses.length > 0) {
      console.log('✅ WordPress REST API successful');
      return restAddresses;
    }
  } catch (error) {
    console.log('❌ WordPress REST API failed:', error.message);
  }
  
  console.log('❌ All backend methods failed');
  return null;
}

// Method 1: WooCommerce API
async function getWooCommerceAddresses(userId) {
  if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
    throw new Error('WooCommerce credentials not configured');
  }

  const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!wcResponse.ok) {
    throw new Error(`WooCommerce API error: ${wcResponse.status}`);
  }

  const customerData = await wcResponse.json();
  
  // Transform WooCommerce customer data to frontend format
  const addresses = [];
  
  // Add billing address if available
  if (customerData.billing && (customerData.billing.address_1 || customerData.billing.city)) {
    addresses.push({
      id: 'billing',
      type: 'billing',
      isDefault: false,
      name: `${customerData.billing.first_name || ''} ${customerData.billing.last_name || ''}`.trim() || customerData.first_name + ' ' + customerData.last_name,
      street: `${customerData.billing.address_1 || ''} ${customerData.billing.address_2 || ''}`.trim(),
      city: customerData.billing.city,
      state: customerData.billing.state,
      postcode: customerData.billing.postcode,
      country: customerData.billing.country,
      phone: customerData.billing.phone,
      company: customerData.billing.company
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
      postcode: customerData.shipping.postcode,
      country: customerData.shipping.country,
      phone: customerData.shipping.phone,
      company: customerData.shipping.company
    });
  }
  
  return addresses;
}

// Method 2: WordPress user meta
async function getWordPressUserMetaAddresses(userId) {
  // Try to access WordPress user meta directly
  // This would require a custom WordPress plugin or direct database access
  const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status}`);
  }

  const userData = await response.json();
  
  // Check if user has meta data with addresses
  if (userData.meta && userData.meta.billing_address) {
    const addresses = [];
    
    if (userData.meta.billing_address) {
      addresses.push({
        id: 'billing',
        type: 'billing',
        isDefault: false,
        name: `${userData.meta.billing_address.first_name || ''} ${userData.meta.billing_address.last_name || ''}`.trim(),
        street: userData.meta.billing_address.address_1 || '',
        city: userData.meta.billing_address.city || '',
        state: userData.meta.billing_address.state || '',
        postcode: userData.meta.billing_address.postcode || '',
        country: userData.meta.billing_address.country || '',
        phone: userData.meta.billing_address.phone || '',
        company: userData.meta.billing_address.company || ''
      });
    }
    
    if (userData.meta.shipping_address) {
      addresses.push({
        id: 'shipping',
        type: 'shipping',
        isDefault: true,
        name: `${userData.meta.shipping_address.first_name || ''} ${userData.meta.shipping_address.last_name || ''}`.trim(),
        street: userData.meta.shipping_address.address_1 || '',
        city: userData.meta.shipping_address.city || '',
        state: userData.meta.shipping_address.state || '',
        postcode: userData.meta.shipping_address.postcode || '',
        country: userData.meta.shipping_address.country || '',
        phone: userData.meta.shipping_address.phone || '',
        company: userData.meta.shipping_address.company || ''
      });
    }
    
    return addresses;
  }
  
  return null;
}

// Method 3: Custom WordPress plugin endpoint
async function getCustomPluginAddresses(userId) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/eternitty/v1/user/${userId}/addresses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Custom plugin API error: ${response.status}`);
  }

  const data = await response.json();
  return data.addresses || [];
}

// Method 4: WordPress REST API with user meta
async function getWordPressRESTAddresses(userId) {
  // Try to get user data with meta fields
  const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}?context=edit`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`WordPress REST API error: ${response.status}`);
  }

  const userData = await response.json();
  
  // Check for WooCommerce customer data in meta
  if (userData.meta && (userData.meta.billing_first_name || userData.meta.shipping_first_name)) {
    const addresses = [];
    
    // Billing address from meta
    if (userData.meta.billing_first_name || userData.meta.billing_city) {
      addresses.push({
        id: 'billing',
        type: 'billing',
        isDefault: false,
        name: `${userData.meta.billing_first_name || ''} ${userData.meta.billing_last_name || ''}`.trim(),
        street: `${userData.meta.billing_address_1 || ''} ${userData.meta.billing_address_2 || ''}`.trim(),
        city: userData.meta.billing_city || '',
        state: userData.meta.billing_state || '',
        postcode: userData.meta.billing_postcode || '',
        country: userData.meta.billing_country || '',
        phone: userData.meta.billing_phone || '',
        company: userData.meta.billing_company || ''
      });
    }
    
    // Shipping address from meta
    if (userData.meta.shipping_first_name || userData.meta.shipping_city) {
      addresses.push({
        id: 'shipping',
        type: 'shipping',
        isDefault: true,
        name: `${userData.meta.shipping_first_name || ''} ${userData.meta.shipping_last_name || ''}`.trim(),
        street: `${userData.meta.shipping_address_1 || ''} ${userData.meta.shipping_address_2 || ''}`.trim(),
        city: userData.meta.shipping_city || '',
        state: userData.meta.shipping_state || '',
        postcode: userData.meta.shipping_postcode || '',
        country: userData.meta.shipping_country || '',
        phone: userData.meta.shipping_phone || '',
        company: userData.meta.shipping_company || ''
      });
    }
    
    return addresses;
  }
  
  return null;
}
