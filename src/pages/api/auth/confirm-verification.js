export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and user ID are required' 
      });
    }

    const wordpressUrl = process.env.WORDPRESS_URL || process.env.WOOCOMMERCE_URL || 'https://woo.local';
    
    // Get user data to check verification token
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
    
    // Check if user has verification token in meta data
    const verificationToken = user.meta_data?.find(meta => meta.key === 'email_verification_token')?.value;
    const verificationExpires = user.meta_data?.find(meta => meta.key === 'email_verification_expires')?.value;

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'No verification token found for this user'
      });
    }

    if (verificationToken !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token has expired
    if (verificationExpires && Date.now() > parseInt(verificationExpires)) {
      return res.status(400).json({
        success: false,
        error: 'EXPIRED',
        message: 'Verification token has expired'
      });
    }

    // Update user to mark email as verified
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
            meta.key !== 'email_verification_token' && 
            meta.key !== 'email_verification_expires'
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
    console.error('Email verification confirmation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during verification'
    });
  }
}
