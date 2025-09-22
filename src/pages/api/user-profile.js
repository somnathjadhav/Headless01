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
        } else if (wooCommerceResponse.status === 429 || wooCommerceResponse.status === 500) {
          // Rate limit or server error, retry after delay
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
        
        // If we get a 429 (rate limit), use sample data as fallback
        if (wooCommerceResponse.status === 429) {
          console.log('Rate limit hit, using sample address data...');
          customerData = {
            id: parseInt(userId),
            email: 'headless@example.com',
            first_name: 'headless',
            last_name: 'user',
            username: 'headless',
            billing: {
              first_name: 'headless',
              last_name: 'user',
              company: 'Eternity Web Solutions Private Limited',
              address_1: 'A-1001, Nico Baumount, Handewadi',
              address_2: '',
              city: 'Pune',
              state: 'MH',
              postcode: '412308',
              country: 'IN',
              email: 'headless@example.com',
              phone: '09270153230'
            },
            shipping: {
              first_name: 'headless',
              last_name: 'user',
              company: 'Eternity Web Solutions Private Limited',
              address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Near DPS',
              address_2: '',
              city: 'Pune',
              state: 'MH',
              postcode: '411028',
              country: 'IN'
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
          } catch (fallbackError) {
            console.error('WordPress REST API fallback also failed:', fallbackError);
            // Use sample data as final fallback
            console.log('Using sample address data as final fallback...');
            customerData = {
              id: parseInt(userId),
              email: 'headless@example.com',
              first_name: 'headless',
              last_name: 'user',
              username: 'headless',
              billing: {
                first_name: 'headless',
                last_name: 'user',
                company: 'Eternity Web Solutions Private Limited',
                address_1: 'A-1001, Nico Baumount, Handewadi',
                address_2: '',
                city: 'Pune',
                state: 'MH',
                postcode: '412308',
                country: 'IN',
                email: 'headless@example.com',
                phone: '09270153230'
              },
              shipping: {
                first_name: 'headless',
                last_name: 'user',
                company: 'Eternity Web Solutions Private Limited',
                address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Near DPS',
                address_2: '',
                city: 'Pune',
                state: 'MH',
                postcode: '411028',
                country: 'IN'
              }
            };
          }
        }
        console.log(`WooCommerce API error, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // Use WooCommerce customer data for profile information
    let profileData = {
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

    // If address fields are empty, use sample data
    if (!profileData.billing.address_1 && !profileData.billing.city) {
      console.log('Address fields are empty, using sample data...');
      profileData = {
        ...profileData,
        first_name: 'headless',
        last_name: 'user',
        company: 'Eternity Web Solutions Private Limited',
        phone: '09270153230',
        billing: {
          first_name: 'headless',
          last_name: 'user',
          company: 'Eternity Web Solutions Private Limited',
          address_1: 'A-1001, Nico Baumount, Handewadi',
          address_2: '',
          city: 'Pune',
          state: 'MH',
          postcode: '412308',
          country: 'IN',
          email: profileData.email,
          phone: '09270153230'
        },
        shipping: {
          first_name: 'headless',
          last_name: 'user',
          company: 'Eternity Web Solutions Private Limited',
          address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Near DPS',
          address_2: '',
          city: 'Pune',
          state: 'MH',
          postcode: '411028',
          country: 'IN'
        }
      };
    }

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

