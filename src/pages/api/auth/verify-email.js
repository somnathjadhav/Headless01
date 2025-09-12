import { sendEmail, generateVerificationToken } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, userId } = req.body;

    if (!email || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and user ID are required' 
      });
    }

    const wordpressUrl = process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL || 'https://woo.local';
    
    // Generate verification token
    const verificationToken = generateVerificationToken();
    
    // Store verification token in user meta (you might want to use a database for this)
    // For now, we'll use WordPress user meta
    const updateUserMeta = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(
          `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`
        ).toString('base64')}`
      },
      body: JSON.stringify({
        meta: {
          email_verification_token: verificationToken,
          email_verification_expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        }
      })
    });

    if (!updateUserMeta.ok) {
      console.error('Failed to store verification token');
      return res.status(500).json({
        success: false,
        message: 'Failed to generate verification token'
      });
    }

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&user=${userId}`;
    
    // Send verification email
    const emailResult = await sendEmail(email, 'verification', {
      user: { email, userId },
      link: verificationLink
    });

    if (emailResult.success) {
      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification email'
    });
  }
}
