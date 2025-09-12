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

    // Fetch user data from WordPress
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const userData = await response.json();

    // Fetch WooCommerce customer data for billing/shipping addresses
    const wooCommerceResponse = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    let customerData = {};
    if (wooCommerceResponse.ok) {
      customerData = await wooCommerceResponse.json();
    }

    // Combine WordPress user data with WooCommerce customer data
    const profileData = {
      id: userData.id,
      username: userData.slug,
      name: userData.name,
      email: userData.email,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      company: customerData.billing?.company || '',
      phone: customerData.billing?.phone || '',
      billing: {
        first_name: customerData.billing?.first_name || userData.first_name || '',
        last_name: customerData.billing?.last_name || userData.last_name || '',
        company: customerData.billing?.company || '',
        address_1: customerData.billing?.address_1 || '',
        address_2: customerData.billing?.address_2 || '',
        city: customerData.billing?.city || '',
        state: customerData.billing?.state || '',
        postcode: customerData.billing?.postcode || '',
        country: customerData.billing?.country || '',
        email: customerData.billing?.email || userData.email || '',
        phone: customerData.billing?.phone || ''
      },
      shipping: {
        first_name: customerData.shipping?.first_name || userData.first_name || '',
        last_name: customerData.shipping?.last_name || userData.last_name || '',
        company: customerData.shipping?.company || '',
        address_1: customerData.shipping?.address_1 || '',
        address_2: customerData.shipping?.address_2 || '',
        city: customerData.shipping?.city || '',
        state: customerData.shipping?.state || '',
        postcode: customerData.shipping?.postcode || '',
        country: customerData.shipping?.country || ''
      }
    };

    console.log('User profile data fetched:', {
      userId,
      hasBilling: !!profileData.billing.address_1,
      hasShipping: !!profileData.shipping.address_1
    });

    return res.status(200).json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
}

