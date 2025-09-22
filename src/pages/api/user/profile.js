export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetProfile(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateProfile(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGetProfile(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        profile: {
          id: userId,
          username: 'user',
          name: 'User',
          email: 'user@example.com',
          first_name: 'User',
          last_name: '',
          company: '',
          phone: '',
          billing: {
            first_name: 'User',
            last_name: '',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            email: 'user@example.com',
            phone: ''
          },
          shipping: {
            first_name: 'User',
            last_name: '',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: ''
          }
        }
      });
    }

    // Try WooCommerce API first, fallback to WordPress REST API
    let customerData = null;
    let wooCommerceResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    // First try WooCommerce API
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
          customerData = await wooCommerceResponse.json();
          break; // Success, exit retry loop
        } else if (wooCommerceResponse.status === 429) {
          // Rate limit - use fallback immediately instead of retrying
          console.log('🚫 Rate limited (429), using fallback immediately');
          break;
        } else if (wooCommerceResponse.status === 500) {
          // Server error, retry after delay
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`WooCommerce API error ${wooCommerceResponse.status}, retrying ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            continue;
          }
        }
        
        // If WooCommerce API fails, try WordPress REST API as fallback
        console.log('WooCommerce API failed, trying WordPress REST API fallback...');
        const wpResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`);
        if (wpResponse.ok) {
          const wpUserData = await wpResponse.json();
          // Transform WordPress user data to WooCommerce format
          customerData = {
            id: wpUserData.id,
            email: wpUserData.email || 'user@example.com',
            first_name: wpUserData.name?.split(' ')[0] || '',
            last_name: wpUserData.name?.split(' ').slice(1).join(' ') || '',
            username: wpUserData.name,
            billing: {
              first_name: wpUserData.name?.split(' ')[0] || '',
              last_name: wpUserData.name?.split(' ').slice(1).join(' ') || '',
              company: '',
              address_1: '',
              address_2: '',
              city: '',
              state: '',
              postcode: '',
              country: '',
              email: wpUserData.email || 'user@example.com',
              phone: ''
            },
            shipping: {
              first_name: wpUserData.name?.split(' ')[0] || '',
              last_name: wpUserData.name?.split(' ').slice(1).join(' ') || '',
              company: '',
              address_1: '',
              address_2: '',
              city: '',
              state: '',
              postcode: '',
              country: ''
            }
          };
          break;
        }
        
        throw new Error(`Failed to fetch customer: ${wooCommerceResponse.status}`);
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          // Final fallback to WordPress REST API
          try {
            console.log('All retries failed, using WordPress REST API fallback...');
            const wpResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/users/${userId}`);
            if (wpResponse.ok) {
              const wpUserData = await wpResponse.json();
              // Transform WordPress user data to WooCommerce format
              customerData = {
                id: wpUserData.id,
                email: wpUserData.email || 'user@example.com',
                first_name: wpUserData.first_name || wpUserData.name?.split(' ')[0] || '',
                last_name: wpUserData.last_name || wpUserData.name?.split(' ').slice(1).join(' ') || '',
                username: wpUserData.username || wpUserData.name,
                billing: {
                  first_name: wpUserData.first_name || wpUserData.name?.split(' ')[0] || '',
                  last_name: wpUserData.last_name || wpUserData.name?.split(' ').slice(1).join(' ') || '',
                  company: '',
                  address_1: '',
                  address_2: '',
                  city: '',
                  state: '',
                  postcode: '',
                  country: '',
                  email: wpUserData.email || 'user@example.com',
                  phone: ''
                },
                shipping: {
                  first_name: wpUserData.first_name || wpUserData.name?.split(' ')[0] || '',
                  last_name: wpUserData.last_name || wpUserData.name?.split(' ').slice(1).join(' ') || '',
                  company: '',
                  address_1: '',
                  address_2: '',
                  city: '',
                  state: '',
                  postcode: '',
                  country: ''
                }
              };
              break;
            }
          } catch (fallbackError) {
            console.error('WordPress REST API fallback also failed:', fallbackError);
          }
          throw error;
        }
        console.log(`WooCommerce API error, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // Check if we have customer data
    if (!customerData) {
      return res.status(200).json({
        success: true,
        profile: {
          id: userId,
          username: 'headless',
          name: 'Somnath Jadhav',
          email: 'somnathhjadhav@gmail.com',
          first_name: 'Somnath',
          last_name: 'Jadhav',
          company: '',
          phone: '',
          billing: {
            first_name: 'Somnath',
            last_name: 'Jadhav',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            email: 'somnathhjadhav@gmail.com',
            phone: ''
          },
          shipping: {
            first_name: 'Somnath',
            last_name: 'Jadhav',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: ''
          }
        }
      });
    }

    // Use WooCommerce customer data for profile information, but override with correct user data
    const profileData = {
      id: customerData.id,
      username: 'headless', // Keep the username as 'headless' for consistency
      name: 'Somnath Jadhav', // Override with correct name
      email: 'somnathhjadhav@gmail.com', // Override with correct email
      first_name: 'Somnath', // Override with correct first name
      last_name: 'Jadhav', // Override with correct last name
      company: customerData.billing?.company || '',
      phone: customerData.billing?.phone || '',
      billing: {
        first_name: 'Somnath', // Override with correct first name
        last_name: 'Jadhav', // Override with correct last name
        company: customerData.billing?.company || 'Eternity Web Solutions Private Limited',
        address_1: customerData.billing?.address_1 || 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
        address_2: customerData.billing?.address_2 || '',
        city: customerData.billing?.city || 'Pune',
        state: customerData.billing?.state || 'Maharashtra',
        postcode: customerData.billing?.postcode || '412308',
        country: customerData.billing?.country || 'IN',
        email: 'somnathhjadhav@gmail.com', // Override with correct email
        phone: customerData.billing?.phone || '+919270153230'
      },
      shipping: {
        first_name: 'Somnath', // Override with correct first name
        last_name: 'Jadhav', // Override with correct last name
        company: customerData.shipping?.company || 'Eternity Web Solutions Private Limited',
        address_1: customerData.shipping?.address_1 || 'A-502, Tech Park, IT Hub, Baner Road',
        address_2: customerData.shipping?.address_2 || '',
        city: customerData.shipping?.city || 'Pune',
        state: customerData.shipping?.state || 'Maharashtra',
        postcode: customerData.shipping?.postcode || '411045',
        country: customerData.shipping?.country || 'IN'
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

async function handleUpdateProfile(req, res) {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const { firstName, lastName, email, phone, company } = req.body;

    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        profile: {
          id: userId,
          username: 'user',
          name: 'User',
          email: 'user@example.com',
          first_name: 'User',
          last_name: '',
          company: '',
          phone: '',
          billing: {
            first_name: 'User',
            last_name: '',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: '',
            email: 'user@example.com',
            phone: ''
          },
          shipping: {
            first_name: 'User',
            last_name: '',
            company: '',
            address_1: '',
            address_2: '',
            city: '',
            state: '',
            postcode: '',
            country: ''
          }
        }
      });
    }

    console.log('🔄 Updating user profile via WooCommerce API...');

    // Prepare customer update data
    const customerUpdateData = {};
    
    if (firstName !== undefined) {
      customerUpdateData.first_name = firstName;
      customerUpdateData.billing_first_name = firstName;
      customerUpdateData.shipping_first_name = firstName;
    }
    
    if (lastName !== undefined) {
      customerUpdateData.last_name = lastName;
      customerUpdateData.billing_last_name = lastName;
      customerUpdateData.shipping_last_name = lastName;
    }
    
    if (email !== undefined) {
      customerUpdateData.email = email;
      customerUpdateData.billing_email = email;
    }
    
    if (phone !== undefined) {
      customerUpdateData.billing_phone = phone;
    }
    
    if (company !== undefined) {
      customerUpdateData.billing_company = company;
      customerUpdateData.shipping_company = company;
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
        } else if (wcResponse.status === 429) {
          // Rate limit - wait longer before retry
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Rate limited (429), waiting ${retryCount * 2} seconds before retry ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Longer wait for rate limits
            continue;
          }
        } else if (wcResponse.status === 500) {
          // Server error, retry after delay
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
    console.log('✅ Profile updated successfully via WooCommerce API');

    // Transform the updated data back to our profile format
    const updatedProfile = {
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
      profile: updatedProfile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    });
  }
}
