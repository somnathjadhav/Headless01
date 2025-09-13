import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { currentPassword, newPassword, userId, userEmail } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !userId) {
    return res.status(400).json({ 
      error: 'Current password, new password, and user ID are required' 
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ 
      error: 'New password must be at least 8 characters long' 
    });
  }

  // Enhanced password validation - match frontend validation
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return res.status(400).json({ 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    });
  }

  try {
    const wordpressUrl = process.env.WORDPRESS_URL || 'https://woo.local';
    
    console.log('🔐 Password change attempt:', {
      userId,
      userEmail,
      wordpressUrl,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword
    });
    
    // Method 1: Try our custom WordPress endpoint first (most reliable)
    console.log('🔄 Trying custom WordPress endpoint...');
    
    const customEndpointResponse = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        current_password: currentPassword,
        new_password: newPassword
      }),
    });

    if (customEndpointResponse.ok) {
      console.log(`✅ Password updated successfully via custom endpoint for user ${userId}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
    }

    // Log the error from custom endpoint
    const customErrorData = await customEndpointResponse.json();
    console.log('❌ Custom endpoint error:', customErrorData);
    
    // If it's an authentication error, return it immediately
    if (customEndpointResponse.status === 401) {
      return res.status(401).json({ 
        error: customErrorData.message || 'Current password is incorrect' 
      });
    }

    // Method 2: Try WooCommerce API as fallback
    console.log('🔄 Trying WooCommerce API...');
    
    try {
      const wcAuthResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!wcAuthResponse.ok) {
        return res.status(401).json({ 
          error: 'Current password is incorrect' 
        });
      }
      
      console.log('✅ WooCommerce authentication successful');
      
      // Use WooCommerce API to update password
      const wcUpdateResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword
        }),
      });

      if (!wcUpdateResponse.ok) {
        const errorData = await wcUpdateResponse.json();
        console.error('WooCommerce password update error:', errorData);
        return res.status(400).json({ 
          error: 'Failed to update password via WooCommerce. Please try again.' 
        });
      }

      console.log(`✅ Password updated successfully via WooCommerce for user ${userId}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Password updated successfully' 
      });
      
    } catch (wcError) {
      console.log('❌ WooCommerce auth also failed:', wcError.message);
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ 
      error: 'Internal server error. Please try again.' 
    });
  }
}
