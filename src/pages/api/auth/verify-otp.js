import { validateOTP } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { otp, userId, email } = req.body;

    if (!otp || !userId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP, user ID, and email are required' 
      });
    }

    const wordpressUrl = process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL || 'https://woo.local';
    
    // Get user data to check OTP
    const userResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers/${userId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(
          `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
        ).toString('base64')}`
      }
    });

    if (!userResponse.ok) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = await userResponse.json();
    
    // Check if user has OTP in meta data
    const storedOTP = user.meta_data?.find(meta => meta.key === 'email_verification_otp')?.value;
    const otpExpires = user.meta_data?.find(meta => meta.key === 'email_verification_otp_expires')?.value;

    if (!storedOTP || !otpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found for this user'
      });
    }

    // Validate OTP
    const validation = validateOTP(otp, storedOTP, parseInt(otpExpires));

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Update user to mark email as verified and remove OTP data
    const updateResponse = await fetch(`${wordpressUrl}/wp-json/wc/v3/customers/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
        ).toString('base64')}`
      },
      body: JSON.stringify({
        meta_data: [
          ...user.meta_data.filter(meta => 
            meta.key !== 'email_verification_otp' && 
            meta.key !== 'email_verification_otp_expires'
          ),
          {
            key: 'email_verified',
            value: 'true'
          }
        ]
      })
    });

    if (!updateResponse.ok) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification'
    });
  }
}
