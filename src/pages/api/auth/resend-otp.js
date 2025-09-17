import { sendEmail, generateOTPWithExpiration } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and email are required' 
      });
    }

    const wordpressUrl = process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL || 'https://woo.local';
    
    // Get user data
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
    
    // Check if email is already verified
    const emailVerified = user.meta_data?.find(meta => meta.key === 'email_verified')?.value;
    if (emailVerified === 'true') {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const { otp, expiresAt } = generateOTPWithExpiration();
    
    // Update user with new OTP
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
            key: 'email_verification_otp',
            value: otp
          },
          {
            key: 'email_verification_otp_expires',
            value: expiresAt.toString()
          }
        ]
      })
    });

    if (!updateResponse.ok) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate new verification code'
      });
    }

    // Send OTP email via WordPress
    try {
      const wpEmailResponse = await fetch(`${wordpressUrl}/wp-json/headless/v1/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
          first_name: user.first_name
        })
      });

      if (wpEmailResponse.ok) {
        return res.status(200).json({
          success: true,
          message: 'New verification code sent successfully'
        });
      } else {
        // Fallback: Log OTP for testing
        console.log(`📧 OTP for ${email}: ${otp}`);
        return res.status(200).json({
          success: true,
          message: 'Verification code generated (check server logs)',
          debug: { otp: otp }
        });
      }
    } catch (wpError) {
      console.error('WordPress email error:', wpError);
      // Fallback: Log OTP for testing
      console.log(`📧 OTP for ${email}: ${otp}`);
      return res.status(200).json({
        success: true,
        message: 'Verification code generated (check server logs)',
        debug: { otp: otp }
      });
    }

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification code'
    });
  }
}
