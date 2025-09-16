export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    
    if (!wordpressUrl) {
      return res.status(200).json({
        success: false,
        message: 'WordPress URL not configured'
      });
    }

    // Test WordPress API connection
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'WordPress backend is accessible',
        data: {
          url: wordpressUrl,
          status: 'online'
        }
      });
    } else {
      return res.status(200).json({
        success: false,
        message: 'WordPress backend is not accessible',
        data: {
          url: wordpressUrl,
          status: 'offline',
          statusCode: response.status
        }
      });
    }
  } catch (error) {
    console.error('WordPress status check error:', error);
    return res.status(200).json({
      success: false,
      message: 'WordPress backend connection failed',
      error: error.message
    });
  }
}
