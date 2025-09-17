export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ 
        error: 'Token and email are required' 
      });
    }

    // For now, we'll implement a simple token validation
    // In a production environment, you would:
    // 1. Store tokens in a database with expiration times
    // 2. Validate against the stored tokens
    // 3. Check expiration dates
    
    // Basic validation - check if token format is valid
    if (token.length < 10) {
      return res.status(400).json({ 
        error: 'Invalid token format' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // WordPress backend URL from environment variable
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL || process.env.WORDPRESS_URL || 'https://woo.local';
    
    // Check if user exists in WordPress
    const checkUserUrl = `${wordpressUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`;
    
    const userResponse = await fetch(checkUserUrl);
    
    if (!userResponse.ok) {
      return res.status(500).json({ error: 'Failed to validate user' });
    }

    const users = await userResponse.json();
    
    if (users.length === 0) {
      return res.status(400).json({ 
        error: 'User not found' 
      });
    }

    // Token is valid (basic validation passed)
    return res.status(200).json({ 
      success: true,
      message: 'Token is valid' 
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return res.status(500).json({ 
      error: 'An error occurred while validating the token' 
    });
  }
}
