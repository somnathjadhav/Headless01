import { secureErrorHandler, createErrorResponse } from '../../../lib/errorHandler';
import { logger } from '../../../lib/logger';
import { createAdminSession } from '../../../lib/adminMiddleware';

async function adminAuthHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return createErrorResponse(res, 400, 'Username and password are required');
    }

    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (!wordpressUrl) {
      return createErrorResponse(res, 500, 'WordPress URL not configured');
    }

    // Authenticate with WordPress using application password or basic auth
    const authResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!authResponse.ok) {
      return createErrorResponse(res, 401, 'Invalid credentials');
    }

    const userData = await authResponse.json();

    // Check if user has admin capabilities
    const capabilitiesResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/${userData.id}?context=edit`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!capabilitiesResponse.ok) {
      return createErrorResponse(res, 403, 'Unable to verify user capabilities');
    }

    const userDetails = await capabilitiesResponse.json();
    
    // Check if user has administrator role
    const isAdmin = userDetails.roles && userDetails.roles.includes('administrator');
    
    if (!isAdmin) {
      return createErrorResponse(res, 403, 'Administrator access required');
    }

    // Create session token and store in session management
    const sessionToken = Buffer.from(`${userData.id}:${Date.now()}:${Math.random()}`).toString('base64');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    // Store session in our session management
    createAdminSession(userData.id, sessionToken, expiresAt);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          roles: userDetails.roles,
        },
        sessionToken,
        expiresAt,
      },
      message: 'Authentication successful'
    });

  } catch (error) {
    logger.error('Error in adminAuthHandler:', error);
    return createErrorResponse(res, 500, 'Internal server error during authentication', error.message);
  }
}

export default secureErrorHandler(adminAuthHandler);
