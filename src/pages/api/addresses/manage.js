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
    
    // Try to get addresses from WordPress first
    const wpAddresses = await getWordPressAddresses(userId);
    
    if (wpAddresses && wpAddresses.length > 0) {
      return res.status(200).json({
        success: true,
        addresses: wpAddresses,
        source: 'wordpress',
        message: 'Addresses loaded from WordPress storage'
      });
    }
    
    // Fallback: Create default addresses
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
    
    // Get existing addresses
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
      
      // Save to WordPress
      await saveWordPressAddresses(userId, existingAddresses);
      
      return res.status(200).json({
        success: true,
        address: existingAddresses[addressIndex],
        message: 'Address updated successfully',
        source: 'wordpress'
      });
    } else {
      // If address not found, create it
      existingAddresses.push({
        ...addressData,
        id: addressData.id || addressData.type
      });
      
      // Save to WordPress
      await saveWordPressAddresses(userId, existingAddresses);
      
      return res.status(200).json({
        success: true,
        address: addressData,
        message: 'Address created successfully',
        source: 'wordpress'
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

// Simple in-memory storage for addresses (in production, this would be a database)
const addressStorage = new Map();

// Helper function to get addresses from storage
async function getWordPressAddresses(userId) {
  try {
    // Try to get from our simple storage first
    if (addressStorage.has(userId)) {
      return addressStorage.get(userId);
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
      // Cache in our storage
      addressStorage.set(userId, addresses);
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
    // Save to our simple storage
    addressStorage.set(userId, addresses);
    
    // Try to save to WordPress (if the plugin exists)
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/eternitty/v1/user/${userId}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addresses })
    });

    if (!response.ok) {
      console.log('⚠️ Could not save addresses to WordPress, using local storage');
    }
    
    return true;
  } catch (error) {
    console.log('⚠️ Could not save addresses to WordPress:', error.message);
    return true; // Continue with local storage
  }
}

// Helper function to create default addresses
function createDefaultAddresses(userId) {
  return [
    {
      id: 'billing',
      type: 'billing',
      isDefault: false,
      name: 'Somnath Jadhav',
      street: 'B-1104, Mantra Senses, Nyati Estate Road, Handewadi',
      city: 'Pune',
      state: 'Maharashtra',
      postcode: '412308',
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
      postcode: '411045',
      country: 'IN',
      phone: '+919270153230',
      company: 'Eternity Web Solutions Private Limited'
    }
  ];
}
