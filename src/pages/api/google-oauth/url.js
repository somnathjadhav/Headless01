export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Get Google OAuth URL from WordPress backend
    const response = await fetch(`${wordpressUrl}/wp-json/eternitty/v1/auth/google/login`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.auth_url) {
      return res.status(200).json({
        success: true,
        auth_url: data.auth_url,
        state: data.state
      });
    } else {
      return res.status(response.status || 500).json({
        success: false,
        message: data.message || 'Failed to generate Google OAuth URL'
      });
    }

  } catch (error) {
    console.error('Google OAuth URL generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
