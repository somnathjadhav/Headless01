import { validateWithZod } from '../../lib/zodSchemas';
import { z } from 'zod';

// Profile update schema
const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long').optional(),
  email: z.string().email('Please enter a valid email address').max(254, 'Email is too long').optional(),
  phone: z.string().max(20, 'Phone number is too long').optional(),
  company: z.string().max(100, 'Company name is too long').optional()
});

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
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

    // Validate request body
    const validation = validateWithZod(profileUpdateSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { firstName, lastName, email, phone, company } = validation.data;

    // Check if WooCommerce credentials are configured
    if (!process.env.WOOCOMMERCE_CONSUMER_KEY || !process.env.WOOCOMMERCE_CONSUMER_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'WooCommerce API credentials not configured'
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
    console.log('✅ User profile updated successfully via WooCommerce API');

    // Return updated profile data
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
      message: 'Profile updated successfully',
      source: 'woocommerce'
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
