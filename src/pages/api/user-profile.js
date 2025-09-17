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

    // Fetch WooCommerce customer data with retry logic
    let wooCommerceResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        wooCommerceResponse = await fetch(
          `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`,
          {
            headers: {
              'Authorization': `Basic ${Buffer.from(
                `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
              ).toString('base64')}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }
        );

        if (wooCommerceResponse.ok) {
          break; // Success, exit retry loop
        } else if (wooCommerceResponse.status === 429 || wooCommerceResponse.status === 500) {
          // Rate limit or server error, retry after delay
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`WooCommerce API error ${wooCommerceResponse.status}, retrying ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
        }
        
        throw new Error(`Failed to fetch customer: ${wooCommerceResponse.status}`);
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        console.log(`WooCommerce API error, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    const customerData = await wooCommerceResponse.json();

    // Use WooCommerce customer data for profile information
    const profileData = {
      id: customerData.id,
      username: customerData.username || customerData.email,
      name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || customerData.email,
      email: customerData.email,
      first_name: customerData.first_name || '',
      last_name: customerData.last_name || '',
      company: customerData.billing?.company || '',
      phone: customerData.billing?.phone || '',
      billing: {
        first_name: customerData.billing?.first_name || customerData.first_name || '',
        last_name: customerData.billing?.last_name || customerData.last_name || '',
        company: customerData.billing?.company || '',
        address_1: customerData.billing?.address_1 || '',
        address_2: customerData.billing?.address_2 || '',
        city: customerData.billing?.city || '',
        state: customerData.billing?.state || '',
        postcode: customerData.billing?.postcode || '',
        country: customerData.billing?.country || '',
        email: customerData.billing?.email || customerData.email || '',
        phone: customerData.billing?.phone || ''
      },
      shipping: {
        first_name: customerData.shipping?.first_name || customerData.first_name || '',
        last_name: customerData.shipping?.last_name || customerData.last_name || '',
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

