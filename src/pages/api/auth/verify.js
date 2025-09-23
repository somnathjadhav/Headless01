export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Get user ID from headers or query
    const userId = req.headers['x-user-id'] || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID required',
        authenticated: false
      });
    }

    // Verify user session and get WordPress user data
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    try {
      // Get user data from WordPress REST API
      const wpUserResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/${userId}`);
      
      if (!wpUserResponse.ok) {
        return res.status(401).json({
          success: false,
          message: 'User not found in WordPress',
          authenticated: false
        });
      }
      
      const wpUser = await wpUserResponse.json();
      
      // Determine if user is admin based on WordPress roles
      const isAdmin = wpUser.is_super_admin === true || 
                     (wpUser.capabilities && wpUser.capabilities.administrator === true) ||
                     (wpUser.roles && wpUser.roles.includes('administrator'));
      
      return res.status(200).json({
        success: true,
        message: 'User authenticated',
        authenticated: true,
        user: {
          id: parseInt(userId),
          email: wpUser.email || '',
          name: wpUser.name || '',
          first_name: wpUser.first_name || '',
          last_name: wpUser.last_name || '',
          username: wpUser.slug || '',
          role: isAdmin ? 'administrator' : 'customer',
          isAdmin: isAdmin,
          avatar: wpUser.avatar_urls ? wpUser.avatar_urls['96'] : null
        }
      });
      
    } catch (error) {
      console.error('WordPress user verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify user with WordPress',
        authenticated: false,
        error: error.message
      });
    }

  } catch (error) {
    console.error('Auth verify error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      authenticated: false,
      error: error.message
    });
  }
}
