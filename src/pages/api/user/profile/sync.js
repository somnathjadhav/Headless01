export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Profile data is required'
      });
    }

    console.log('🔄 Syncing profile to WordPress backend...', { userId, profile });

    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'WooCommerce API credentials not configured'
      });
    }

    // Prepare customer update data
    const customerUpdateData = {};
    
    if (profile.firstName !== undefined) {
      customerUpdateData.first_name = profile.firstName;
      customerUpdateData.billing_first_name = profile.firstName;
      customerUpdateData.shipping_first_name = profile.firstName;
    }
    
    if (profile.lastName !== undefined) {
      customerUpdateData.last_name = profile.lastName;
      customerUpdateData.billing_last_name = profile.lastName;
      customerUpdateData.shipping_last_name = profile.lastName;
    }
    
    if (profile.email !== undefined) {
      customerUpdateData.email = profile.email;
      customerUpdateData.billing_email = profile.email;
    }
    
    if (profile.phone !== undefined) {
      customerUpdateData.billing_phone = profile.phone;
    }
    
    if (profile.company !== undefined) {
      customerUpdateData.billing_company = profile.company;
      customerUpdateData.shipping_company = profile.company;
    }

    // WooCommerce API call with retry logic
    let wcResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          body: JSON.stringify(customerUpdateData)
        });

        if (wcResponse.ok) {
          break; // Success, exit retry loop
        } else if (wcResponse.status === 429 || wcResponse.status === 500) {
          // Rate limit or server error, retry after delay
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`WooCommerce API error ${wcResponse.status}, retrying ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
        }
        
        console.log('❌ WooCommerce API response not ok:', wcResponse.status, wcResponse.statusText);
        const errorData = await wcResponse.json();
        console.log('Error details:', errorData);
        
        return res.status(wcResponse.status).json({
          success: false,
          message: `WooCommerce API error: ${errorData.message || wcResponse.statusText}`,
          error: errorData.code || 'woocommerce_api_error'
        });
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        console.log(`WooCommerce API error, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    const updatedCustomerData = await wcResponse.json();
    console.log('✅ Profile synced to WordPress successfully');

    // Transform the updated data back to our profile format
    const syncedProfile = {
      id: updatedCustomerData.id,
      username: updatedCustomerData.username || updatedCustomerData.email,
      name: `${updatedCustomerData.first_name || ''} ${updatedCustomerData.last_name || ''}`.trim() || updatedCustomerData.email,
      email: updatedCustomerData.email,
      first_name: updatedCustomerData.first_name || '',
      last_name: updatedCustomerData.last_name || '',
      company: updatedCustomerData.billing?.company || '',
      phone: updatedCustomerData.billing?.phone || '',
      billing: {
        first_name: updatedCustomerData.billing?.first_name || updatedCustomerData.first_name || '',
        last_name: updatedCustomerData.billing?.last_name || updatedCustomerData.last_name || '',
        company: updatedCustomerData.billing?.company || '',
        address_1: updatedCustomerData.billing?.address_1 || '',
        address_2: updatedCustomerData.billing?.address_2 || '',
        city: updatedCustomerData.billing?.city || '',
        state: updatedCustomerData.billing?.state || '',
        postcode: updatedCustomerData.billing?.postcode || '',
        country: updatedCustomerData.billing?.country || '',
        email: updatedCustomerData.billing?.email || updatedCustomerData.email || '',
        phone: updatedCustomerData.billing?.phone || ''
      },
      shipping: {
        first_name: updatedCustomerData.shipping?.first_name || updatedCustomerData.first_name || '',
        last_name: updatedCustomerData.shipping?.last_name || updatedCustomerData.last_name || '',
        company: updatedCustomerData.shipping?.company || '',
        address_1: updatedCustomerData.shipping?.address_1 || '',
        address_2: updatedCustomerData.shipping?.address_2 || '',
        city: updatedCustomerData.shipping?.city || '',
        state: updatedCustomerData.shipping?.state || '',
        postcode: updatedCustomerData.shipping?.postcode || '',
        country: updatedCustomerData.shipping?.country || ''
      }
    };

    return res.status(200).json({
      success: true,
      profile: syncedProfile,
      message: 'Profile synced to WordPress successfully'
    });

  } catch (error) {
    console.error('Error syncing profile to WordPress:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to sync profile to WordPress',
      error: error.message
    });
  }
}
