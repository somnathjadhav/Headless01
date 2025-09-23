import { z } from 'zod';
import fs from 'fs';
import path from 'path';

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
  isDefault: z.boolean().optional()
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.headers['x-user-id'] || req.query.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getAddresses(req, res, userId);
      case 'POST':
        return await createAddress(req, res, userId);
      case 'PUT':
        return await updateAddress(req, res, userId);
      case 'DELETE':
        return await deleteAddress(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Address management error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Get user addresses
async function getAddresses(req, res, userId) {
  try {
    console.log('🔄 Getting addresses for user:', userId);
    
    // Try WooCommerce API first (like the September 19th implementation)
    const wcAddresses = await getWooCommerceAddresses(userId);
    if (wcAddresses && wcAddresses.length > 0) {
      return res.status(200).json({
        success: true,
        addresses: wcAddresses,
        source: 'woocommerce',
        message: 'Addresses loaded from WooCommerce'
      });
    }
    
    // Fallback: Try to get addresses from our persistent storage
    const storedAddresses = await getWordPressAddresses(userId);
    if (storedAddresses && storedAddresses.length > 0) {
      return res.status(200).json({
        success: true,
        addresses: storedAddresses,
        source: 'storage',
        message: 'Addresses loaded from local storage'
      });
    }
    
    // Final fallback: Create default addresses
    const defaultAddresses = createDefaultAddresses(userId);
    await saveWordPressAddresses(userId, defaultAddresses);
    
    return res.status(200).json({
      success: true,
      addresses: defaultAddresses,
      source: 'default',
      message: 'Default addresses created'
    });
  } catch (error) {
    console.error('Error getting addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get addresses',
      error: error.message
    });
  }
}

// Create new address
async function createAddress(req, res, userId) {
  let addressData;
  try {
    addressData = addressSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors
    });
  }

  try {
    console.log('🔄 Creating address for user:', userId, addressData);
    
    // Get existing addresses
    const existingAddresses = await getWordPressAddresses(userId) || [];
    
    // Check if address already exists
    const existingIndex = existingAddresses.findIndex(
      addr => addr.id === addressData.id && addr.type === addressData.type
    );
    
    if (existingIndex >= 0) {
      // Update existing address
      existingAddresses[existingIndex] = {
        ...existingAddresses[existingIndex],
        ...addressData,
        id: addressData.id || addressData.type
      };
    } else {
      // Add new address
      existingAddresses.push({
        ...addressData,
        id: addressData.id || addressData.type
      });
    }
    
    // Save to WordPress
    await saveWordPressAddresses(userId, existingAddresses);
    
    return res.status(201).json({
      success: true,
      address: addressData,
      message: 'Address created successfully',
      source: 'wordpress'
    });
  } catch (error) {
    console.error('Error creating address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
}

// Update address
async function updateAddress(req, res, userId) {
  let addressData;
  try {
    addressData = addressSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.errors
    });
  }

  if (!addressData.id) {
    return res.status(400).json({
      success: false,
      message: 'Address ID is required for updates'
    });
  }

  try {
    console.log('🔄 Updating address for user:', userId, addressData);
    
    // Try WooCommerce API first (like the September 19th implementation)
    const wcSuccess = await updateWooCommerceAddress(userId, addressData);
    if (wcSuccess) {
      return res.status(200).json({
        success: true,
        address: addressData,
        message: 'Address updated successfully in WooCommerce',
        source: 'woocommerce'
      });
    }
    
    // Fallback: Update in our persistent storage
    const existingAddresses = await getWordPressAddresses(userId) || [];
    
    // Find and update the address
    const addressIndex = existingAddresses.findIndex(
      addr => addr.id === addressData.id && addr.type === addressData.type
    );
    
    if (addressIndex >= 0) {
      existingAddresses[addressIndex] = {
        ...existingAddresses[addressIndex],
        ...addressData
      };
      
      // Save to storage
      await saveWordPressAddresses(userId, existingAddresses);
      
      return res.status(200).json({
        success: true,
        address: existingAddresses[addressIndex],
        message: 'Address updated successfully in local storage',
        source: 'storage'
      });
    } else {
      // If address not found, create it
      existingAddresses.push({
        ...addressData,
        id: addressData.id || addressData.type
      });
      
      // Save to storage
      await saveWordPressAddresses(userId, existingAddresses);
      
      return res.status(200).json({
        success: true,
        address: addressData,
        message: 'Address created successfully in local storage',
        source: 'storage'
      });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
}

// Delete address
async function deleteAddress(req, res, userId) {
  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({
      success: false,
      message: 'Address ID and type are required'
    });
  }

  try {
    console.log('🔄 Deleting address for user:', userId, { id, type });
    
    // Get existing addresses
    const existingAddresses = await getWordPressAddresses(userId) || [];
    
    // Remove the address
    const filteredAddresses = existingAddresses.filter(
      addr => !(addr.id === id && addr.type === type)
    );
    
    // Save to WordPress
    await saveWordPressAddresses(userId, filteredAddresses);
    
    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      source: 'wordpress'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
}

// Persistent file-based storage for addresses
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

// Helper function to get addresses from WooCommerce API (September 19th implementation)
async function getWooCommerceAddresses(userId) {
  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      console.log('⚠️ WooCommerce API credentials not configured');
      return null;
    }

    console.log('🔄 Fetching customer data from WooCommerce API...');
    
    // WooCommerce REST API call
    const wcResponse = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/customers/${userId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!wcResponse.ok) {
      console.log('❌ WooCommerce API response not ok:', wcResponse.status, wcResponse.statusText);
      return null;
    }

    const customerData = await wcResponse.json();
    console.log('✅ WooCommerce customer data retrieved');
    
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
  } catch (error) {
    console.log('⚠️ Could not fetch addresses from WooCommerce:', error.message);
    return null;
  }
}

// Helper function to update address in WooCommerce API
async function updateWooCommerceAddress(userId, addressData) {
  try {
    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      console.log('⚠️ WooCommerce API credentials not configured');
      return false;
    }

    console.log('🔄 Updating address via WooCommerce API...');
    
    // Split name into first and last name
    const nameParts = addressData.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // WooCommerce customer update payload
    const customerUpdateData = {
      [addressData.type]: {
        first_name: firstName,
        last_name: lastName,
        company: addressData.company || '',
        address_1: addressData.street,
        address_2: '',
        city: addressData.city,
        state: addressData.state || '',
        postcode: addressData.postcode || '',
        country: addressData.country || '',
        phone: addressData.phone || ''
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
      return false;
    }

    console.log('✅ WooCommerce address updated successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Could not update address in WooCommerce:', error.message);
    return false;
  }
}

// Helper function to get addresses from storage
async function getWordPressAddresses(userId) {
  try {
    // Try to get from our persistent file storage first
    const allAddresses = loadAddressesFromFile();
    if (allAddresses[userId]) {
      return allAddresses[userId];
    }
    
    // If not in storage, try to get from WordPress (if the plugin exists)
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/eternitty/v1/user/${userId}/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const addresses = data.addresses || [];
      // Cache in our persistent storage
      allAddresses[userId] = addresses;
      saveAddressesToFile(allAddresses);
      return addresses;
    }
    
    return null;
  } catch (error) {
    console.log('⚠️ Could not fetch addresses from WordPress:', error.message);
    return null;
  }
}

// Helper function to save addresses to storage
async function saveWordPressAddresses(userId, addresses) {
  try {
    // Save to our persistent file storage
    const allAddresses = loadAddressesFromFile();
    allAddresses[userId] = addresses;
    saveAddressesToFile(allAddresses);
    
    // Try to save to WordPress (if the plugin exists)
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/eternitty/v1/user/${userId}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses })
    });

    if (!response.ok) {
      console.log('⚠️ Could not save addresses to WordPress, using file storage');
    }
    
    return true;
  } catch (error) {
    console.log('⚠️ Could not save addresses to WordPress:', error.message);
    return true; // Continue with file storage
  }
}

// Helper function to create default addresses
function createDefaultAddresses(userId) {
  return [
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
}
