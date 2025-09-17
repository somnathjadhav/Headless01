export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Send the authorization code to WordPress backend for processing
    const response = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/auth/google/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ code, state })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return res.status(200).json({
        success: true,
        token: data.token,
        user: data.user
      });
    } else {
      return res.status(response.status || 500).json({
        success: false,
        message: data.message || 'Google OAuth authentication failed'
      });
    }

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
