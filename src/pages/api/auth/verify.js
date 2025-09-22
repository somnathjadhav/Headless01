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

    // For now, we'll assume the user is authenticated if they have a valid user ID
    // In a real implementation, you would verify the session/token here
    return res.status(200).json({
      success: true,
      message: 'User authenticated',
      authenticated: true,
      user: {
        id: parseInt(userId),
        email: 'somnathhjadhav@gmail.com', // From WordPress profile
        name: 'Somnath Jadhav', // From WordPress profile
        first_name: 'Somnath',
        last_name: 'Jadhav',
        username: 'headless',
        role: 'customer'
      }
    });

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
