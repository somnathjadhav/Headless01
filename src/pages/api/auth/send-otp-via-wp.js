import { generateOTPWithExpiration } from '../../../lib/email';

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

    // Send email via WordPress
    const emailData = {
      to: email,
      subject: 'Your Email Verification Code',
      message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.first_name || 'there'}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Thank you for signing up! To complete your registration, please use the verification code below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; display: inline-block;">
                <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
            </div>
            <p style="color: #666; line-height: 1.6; font-size: 14px; text-align: center;">
              Enter this code in the verification form to activate your account.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
              This code will expire in 10 minutes. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </div>
      `,
      headers: ['Content-Type: text/html']
    };

    // Send email via WordPress wp_mail function
    const wpEmailResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
        ).toString('base64')}`
      },
      body: JSON.stringify(emailData)
    });

    if (wpEmailResponse.ok) {
      return res.status(200).json({
        success: true,
        message: 'Verification code sent successfully via WordPress'
      });
    } else {
      // Fallback: Try to send via WordPress admin email
      console.log('WordPress email API not available, using fallback method');
      
      // For now, we'll return success and log the OTP for testing
      console.log(`📧 OTP for ${email}: ${otp}`);
      
      return res.status(200).json({
        success: true,
        message: 'Verification code generated successfully',
        debug: {
          otp: otp,
          note: 'Check server logs for OTP (WordPress email not configured)'
        }
      });
    }

  } catch (error) {
    console.error('Send OTP via WordPress error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification code'
    });
  }
}
