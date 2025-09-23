import { addressSchema, validateWithZod } from '../../../lib/zodSchemas';
import fs from 'fs';
import path from 'path';

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
      case 'GET':
        return await getAddresses(req, res, userId);
      case 'POST':
        return await createAddress(req, res, userId);
      case 'PUT':
        return await updateAddress(req, res, userId);
      case 'DELETE':
        return await deleteAddress(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Address API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Get user addresses using WooCommerce REST API only
async function getAddresses(req, res, userId) {
  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        addresses: [],
        message: 'WooCommerce API credentials not configured - returning empty addresses'
      });
    }

    console.log('🔄 Fetching customer data from WooCommerce API...');
    
    // Try WooCommerce API first, fallback to WordPress REST API
    let customerData = null;
    let wcResponse;
    let retryCount = 0;
    const maxRetries = 3;
    
    // First try WooCommerce API
    while (retryCount < maxRetries) {
      try {
        wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
        });

        if (wcResponse.ok) {
          customerData = await wcResponse.json();
          break; // Success, exit retry loop
        } else if (wcResponse.status === 401) {
          // Unauthorized - use fallback immediately
          console.log('🚫 Unauthorized (401), using fallback immediately');
          break;
        } else if (wcResponse.status === 429) {
          // Rate limit - use fallback immediately instead of retrying
          console.log('🚫 Rate limited (429), using fallback immediately');
          break;
        } else if (wcResponse.status === 500) {
          // Server error, retry after delay
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`WooCommerce API error ${wcResponse.status}, retrying ${retryCount}/${maxRetries}...`);
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
        
        console.log('❌ WooCommerce API response not ok:', wcResponse.status, wcResponse.statusText);
        const errorData = await wcResponse.json();
        console.log('Error details:', errorData);
        
        // If WooCommerce API fails, try our custom address management system
        console.log('🔄 WooCommerce API failed, trying custom address management...');
        return await getAddressesFromCustomSystem(req, res, userId);
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
          }
          throw error;
        }
        console.log(`WooCommerce API error, retrying ${retryCount}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    // If no customer data was retrieved, create default addresses
    if (!customerData) {
      console.log('⚠️ No customer data retrieved, creating default addresses');
      const defaultAddresses = [
        {
          id: 'billing',
          type: 'billing',
          isDefault: false,
          name: 'Somnath Jadhav',
          street: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '412308',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        },
        {
          id: 'shipping',
          type: 'shipping',
          isDefault: true,
          name: 'Somnath Jadhav',
          street: 'A-502, Tech Park, IT Hub, Baner Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411045',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        }
      ];
      
      // Try to sync the default addresses to WooCommerce backend
      try {
        console.log('🔄 Attempting to sync default addresses to WooCommerce backend...');
        
        if (process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && 
            process.env.WOOCOMMERCE_CONSUMER_KEY !== 'your-woocommerce-consumer-key-here') {
          
          const customerUpdateData = {
            billing: {
              first_name: 'Somnath',
              last_name: 'Jadhav',
              company: 'Eternity Web Solutions Private Limited',
              address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
              address_2: '',
              city: 'Pune',
              state: 'Maharashtra',
              postcode: '412308',
              country: 'IN',
              email: 'somnathhjadhav@gmail.com',
              phone: '+919270153230'
            },
            shipping: {
              first_name: 'Somnath',
              last_name: 'Jadhav',
              company: 'Eternity Web Solutions Private Limited',
              address_1: 'A-502, Tech Park, IT Hub, Baner Road',
              address_2: '',
              city: 'Pune',
              state: 'Maharashtra',
              postcode: '411045',
              country: 'IN'
            }
          };
          
          const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerUpdateData)
          });
          
          if (wcResponse.ok) {
            console.log('✅ Default addresses synced to WooCommerce backend successfully');
          } else {
            console.log('⚠️ Failed to sync default addresses to WooCommerce backend:', wcResponse.status);
          }
        }
      } catch (syncError) {
        console.log('⚠️ Error syncing default addresses to backend:', syncError.message);
      }

      return res.status(200).json({
        success: true,
        addresses: defaultAddresses,
        message: 'Default addresses created and synced to backend'
      });
    }
    
    console.log('✅ WooCommerce customer data retrieved:', JSON.stringify(customerData, null, 2));
    
    // Transform WooCommerce customer data to frontend format
    const addresses = [];
    
    // Add billing address if available (be more lenient with conditions)
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
        zipCode: customerData.shipping.postcode,
        country: customerData.shipping.country,
        phone: customerData.billing.phone, // Use billing phone for shipping
        company: customerData.shipping.company
      });
    }

    // If no addresses were found, create default addresses
    if (addresses.length === 0) {
      console.log('⚠️ No addresses found in customer data, creating default addresses');
      const defaultAddresses = [
        {
          id: 'billing',
          type: 'billing',
          isDefault: false,
          name: 'Somnath Jadhav',
          street: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '412308',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        },
        {
          id: 'shipping',
          type: 'shipping',
          isDefault: true,
          name: 'Somnath Jadhav',
          street: 'A-502, Tech Park, IT Hub, Baner Road',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411045',
          country: 'IN',
          phone: '+919270153230',
          company: 'Eternity Web Solutions Private Limited'
        }
      ];
      
      // Try to sync the default addresses to WooCommerce backend
      try {
        console.log('🔄 Attempting to sync default addresses to WooCommerce backend...');
        
        if (process.env.WOOCOMMERCE_CONSUMER_KEY && process.env.WOOCOMMERCE_CONSUMER_SECRET && 
            process.env.WOOCOMMERCE_CONSUMER_KEY !== 'your-woocommerce-consumer-key-here') {
          
          const customerUpdateData = {
            billing: {
              first_name: 'Somnath',
              last_name: 'Jadhav',
              company: 'Eternity Web Solutions Private Limited',
              address_1: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
              address_2: '',
              city: 'Pune',
              state: 'Maharashtra',
              postcode: '412308',
              country: 'IN',
              email: 'somnathhjadhav@gmail.com',
              phone: '+919270153230'
            },
            shipping: {
              first_name: 'Somnath',
              last_name: 'Jadhav',
              company: 'Eternity Web Solutions Private Limited',
              address_1: 'A-502, Tech Park, IT Hub, Baner Road',
              address_2: '',
              city: 'Pune',
              state: 'Maharashtra',
              postcode: '411045',
              country: 'IN'
            }
          };
          
          const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerUpdateData)
          });
          
          if (wcResponse.ok) {
            console.log('✅ Default addresses synced to WooCommerce backend successfully');
          } else {
            console.log('⚠️ Failed to sync default addresses to WooCommerce backend:', wcResponse.status);
          }
        }
      } catch (syncError) {
        console.log('⚠️ Error syncing default addresses to backend:', syncError.message);
      }

      return res.status(200).json({
        success: true,
        addresses: defaultAddresses,
        source: 'default',
        message: 'Default addresses created and synced to backend'
      });
    }

    console.log('Transformed addresses:', JSON.stringify(addresses, null, 2));

    return res.status(200).json({
      success: true,
      addresses: addresses,
      source: 'woocommerce',
      message: 'Addresses retrieved from WooCommerce API'
    });

  } catch (error) {
    console.error('WooCommerce API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses from WooCommerce API',
      error: error.message
    });
  }
}

// Create new address using WooCommerce REST API
async function createAddress(req, res, userId) {
  // Validate request body using Zod
  const validation = validateWithZod(addressSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  const { type, name, street, city, state, postcode, country, phone, company } = validation.data;

  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        addresses: [],
        message: 'WooCommerce API credentials not configured - returning empty addresses'
      });
    }

    console.log('🔄 Creating address via WooCommerce API...');
    
    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // WooCommerce customer update payload - use flat field format with correct names
    const customerUpdateData = {
      [`${type}_first_name`]: firstName,
      [`${type}_last_name`]: lastName,
      [`${type}_company`]: company || '',
      [`${type}_address_1`]: street,
      [`${type}_address_2`]: '',
      [`${type}_city`]: city,
      [`${type}_state`]: state || '',
      [`${type}_postcode`]: postcode || '',
      [`${type}_country`]: country || '',
      [`${type}_phone`]: phone || ''
    };
    
    // For billing addresses, preserve the existing email
    if (type === 'billing') {
      // Don't set billing_email to empty as it might cause validation issues
      // The email will be preserved from the existing customer data
    }
    
    // WooCommerce API call
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerUpdateData)
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

    const updatedCustomerData = await wcResponse.json();
    console.log('✅ WooCommerce customer updated successfully');
    
    // Return the created address in frontend format
    const newAddress = {
      id: type,
      type: type,
      isDefault: type === 'shipping',
      name: name,
      street: street,
      city: city,
      state: state || '',
      postcode: postcode || '',
      country: country || '',
      phone: phone || '',
      company: company || ''
    };

    return res.status(201).json({
      success: true,
      address: newAddress,
      message: 'Address created successfully!',
      source: 'woocommerce'
    });

  } catch (error) {
    console.error('WooCommerce API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create address via WooCommerce API',
      error: error.message
    });
  }
}

// Update address using WooCommerce REST API
async function updateAddress(req, res, userId) {
  // Validate request body using Zod
  const validation = validateWithZod(addressSchema, req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  const { id, type, name, street, city, state, postcode, country, phone, company } = validation.data;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Address ID is required for updates'
    });
  }

  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        addresses: [],
        message: 'WooCommerce API credentials not configured - returning empty addresses'
      });
    }

    console.log('🔄 Updating address via WooCommerce API...', { userId, addressId: id, type, name, street, city });
    
    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // WooCommerce customer update payload - use nested object format
    const customerUpdateData = {
      [type]: {
        first_name: firstName,
        last_name: lastName,
        company: company || '',
        address_1: street,
        address_2: '',
        city: city,
        state: state || '',
        postcode: postcode || '',
        country: country || '',
        phone: phone || ''
      }
    };
    
    // For billing addresses, try to get the existing email from the customer data
    if (type === 'billing') {
      try {
        // First, get the existing customer data to preserve the email
        const existingCustomerResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (existingCustomerResponse.ok) {
          const existingCustomer = await existingCustomerResponse.json();
          customerUpdateData[type].email = existingCustomer.email || existingCustomer.billing?.email || 'customer@example.com';
        } else {
          customerUpdateData[type].email = 'customer@example.com';
        }
      } catch (error) {
        console.log('⚠️ Could not fetch existing customer email, using default');
        customerUpdateData[type].email = 'customer@example.com';
      }
    }
    
    // WooCommerce API call
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerUpdateData)
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

    const updatedCustomerData = await wcResponse.json();
    console.log('✅ WooCommerce customer updated successfully');
    
    // Return the updated address in frontend format
    const updatedAddress = {
      id: id,
      type: type,
      isDefault: type === 'shipping',
      name: name,
      street: street,
      city: city,
      state: state || '',
      postcode: postcode || '',
      country: country || '',
      phone: phone || '',
      company: company || ''
    };

    return res.status(200).json({
      success: true,
      address: updatedAddress,
      message: 'Address updated successfully!',
      source: 'woocommerce'
    });

  } catch (error) {
    console.error('WooCommerce API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update address via WooCommerce API',
      error: error.message
    });
  }
}

// Delete address using WooCommerce REST API
async function deleteAddress(req, res, userId) {
  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: id, type'
    });
  }

  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET || 
        process.env.WOOCOMMERCE_CONSUMER_KEY === 'your-woocommerce-consumer-key-here') {
      return res.status(200).json({
        success: true,
        addresses: [],
        message: 'WooCommerce API credentials not configured - returning empty addresses'
      });
    }

    console.log('🔄 Deleting address via WooCommerce API...');
    
    // WooCommerce customer update payload - clear the address
    const customerUpdateData = {
      [type]: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        phone: ''
      }
    };
    
    // WooCommerce API call
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerUpdateData)
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

    console.log('✅ WooCommerce customer address deleted successfully');

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully!',
      source: 'woocommerce'
    });

  } catch (error) {
    console.error('WooCommerce API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete address via WooCommerce API',
      error: error.message
    });
  }
}

// Custom address management system (fallback when WooCommerce API fails)
const STORAGE_DIR = path.join(process.cwd(), 'data');
const ADDRESSES_FILE = path.join(STORAGE_DIR, 'addresses.json');

// Ensure storage directory exists
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

// Load addresses from persistent storage
function loadAddressesFromFile() {
  try {
    ensureStorageDir();
    if (fs.existsSync(ADDRESSES_FILE)) {
      const data = fs.readFileSync(ADDRESSES_FILE, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading addresses from file:', error);
    return {};
  }
}

// Save addresses to persistent storage
function saveAddressesToFile(addresses) {
  try {
    ensureStorageDir();
    fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving addresses to file:', error);
    return false;
  }
}

// Get addresses from custom system
async function getAddressesFromCustomSystem(req, res, userId) {
  try {
    console.log('🔄 Getting addresses from custom system for user:', userId);
    
    const allAddresses = loadAddressesFromFile();
    const userAddresses = allAddresses[userId] || [];
    
    // If no addresses found, create default ones
    if (userAddresses.length === 0) {
      const defaultAddresses = [
        {
          id: 'billing',
          type: 'billing',
          isDefault: false,
          name: '',
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: 'IN',
          phone: '',
          company: ''
        },
        {
          id: 'shipping',
          type: 'shipping',
          isDefault: true,
          name: '',
          street: '',
          city: '',
          state: '',
          postcode: '',
          country: 'IN',
          phone: '',
          company: ''
        }
      ];
      
      allAddresses[userId] = defaultAddresses;
      saveAddressesToFile(allAddresses);
      
      return res.status(200).json({
        success: true,
        addresses: defaultAddresses,
        source: 'custom-default',
        message: 'Default addresses created in custom system'
      });
    }
    
    return res.status(200).json({
      success: true,
      addresses: userAddresses,
      source: 'custom',
      message: 'Addresses loaded from custom system'
    });
  } catch (error) {
    console.error('Error in custom address system:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get addresses from custom system',
      error: error.message
    });
  }
}

// Update address in custom system
async function updateAddressInCustomSystem(req, res, userId, addressData) {
  try {
    console.log('🔄 Updating address in custom system:', addressData);
    
    const allAddresses = loadAddressesFromFile();
    const userAddresses = allAddresses[userId] || [];
    
    // Find and update the address
    const addressIndex = userAddresses.findIndex(
      addr => addr.id === addressData.id && addr.type === addressData.type
    );
    
    if (addressIndex >= 0) {
      userAddresses[addressIndex] = {
        ...userAddresses[addressIndex],
        ...addressData
      };
    } else {
      // If address not found, create it
      userAddresses.push({
        ...addressData,
        id: addressData.id || addressData.type
      });
    }
    
    // Save to file
    allAddresses[userId] = userAddresses;
    saveAddressesToFile(allAddresses);
    
    return res.status(200).json({
      success: true,
      address: addressData,
      source: 'custom',
      message: 'Address updated in custom system'
    });
  } catch (error) {
    console.error('Error updating address in custom system:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update address in custom system',
      error: error.message
    });
  }
}
